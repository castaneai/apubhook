import { Context } from "hono";
import { APubHookAccount, Env, Follower } from "./types";

export interface IDatabase {
    getAccount(username: string): Promise<APubHookAccount>
    getFollowers(username: string): Promise<Follower[]>
    acceptFollow(followeeActor: string, followerActor: string): Promise<void>
}

export class CloudflareD1Database implements IDatabase
{
    private readonly d1: D1Database

    constructor(d1: D1Database) {
        this.d1 = d1
    }

    async getAccount(username: string): Promise<APubHookAccount> {
        return await this.d1.prepare('SELECT * FROM accounts WHERE username = ?')
            .bind(username)
            .first<APubHookAccount>()
    }

    async getFollowers(username: string): Promise<Follower[]> {
        const { results } = await this.d1.prepare('SELECT * FROM followers WHERE followeeActorId = ?')
            .bind(username)
            .all<Follower>()
        return results
    }

    async acceptFollow(followeeActor: string, followerActor: string): Promise<void> {
        await this.d1.prepare('INSERT OR REPLACE INTO followers(id, followeeActorId) VALUES(?, ?)')
            .bind(followerActor, followeeActor)
            .run()
    }
}

export function getD1Database(c: Context<Env>): IDatabase {
    return new CloudflareD1Database(c.env.DB)
}