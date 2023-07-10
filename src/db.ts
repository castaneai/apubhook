import { Context } from "hono";
import { APubHookAccount, Env, Follower, Post } from "./types";
import { UrlString } from "./apub/common";

export interface IDatabase {
    getAccount(username: string): Promise<APubHookAccount>
    getAccountBySecretHookPath(secretHookPath: string): Promise<APubHookAccount>
    getFollowers(username: string): Promise<Follower[]>
    acceptFollow(followerUrl: UrlString, followeeUsername: string): Promise<void>
    removeFollow(followerUrl: UrlString, followeeUsername: string): Promise<void>
    getPost(postId: string): Promise<Post>
    createPost(postId: string, username: string, body: string): Promise<void>
    deletePost(username: string, postId: string): Promise<void>
}

export class CloudflareD1Database implements IDatabase {
    private readonly d1: D1Database

    constructor(d1: D1Database) {
        this.d1 = d1
    }

    async getAccount(username: string): Promise<APubHookAccount> {
        return await this.d1.prepare('SELECT * FROM accounts WHERE username = ?')
            .bind(username)
            .first<APubHookAccount>()
    }

    async getAccountBySecretHookPath(secretHookPath: string): Promise<APubHookAccount> {
        return await this.d1.prepare('SELECT * FROM accounts WHERE secretHookPath = ?')
            .bind(secretHookPath)
            .first<APubHookAccount>()
    }

    async getFollowers(username: string): Promise<Follower[]> {
        const { results } = await this.d1.prepare('SELECT * FROM followers WHERE followee = ?')
            .bind(username)
            .all<Follower>()
        return results
    }

    async acceptFollow(followerUrl: UrlString, followeeUsername: string): Promise<void> {
        await this.d1.prepare('INSERT OR REPLACE INTO followers(follower, followee) VALUES(?, ?)')
            .bind(followerUrl, followeeUsername)
            .run()
    }

    async removeFollow(followerUrl: string, followeeUsername: string): Promise<void> {
        await this.d1.prepare('DELETE FROM followers WHERE followee = ? AND follower = ?')
            .bind(followeeUsername, followerUrl)
            .run()
    }

    async getPost(postId: string): Promise<Post> {
        return await this.d1.prepare('SELECT * FROM posts WHERE id = ?')
            .bind(postId)
            .first<Post>()
    }

    async createPost(postId: string, username: string, body: string): Promise<void> {
        await this.d1.prepare('INSERT INTO posts(id, authorUsername, body, createdAt) VALUES(?, ?, ?, ?)')
            .bind(postId, username, body, (new Date()).toISOString())
            .run()
    }

    async deletePost(username: string, postId: string): Promise<void> {
        await this.d1.prepare('DELETE FROM posts WHERE id = ?')
            .bind(postId)
            .run()
    }

}

export function getD1Database(c: Context<Env>): IDatabase {
    return new CloudflareD1Database(c.env.DB)
}