import { Hono } from 'hono'
import { accountToActor, getServerInfo, importPrivateKey } from '../utils'
import { Env } from '../types'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { getD1Database } from '../db'
import { fetchRemoteActor, getActorUrl } from '../apub/actor'
import { createNote } from '../apub/note'

const app = new Hono<Env>()

const requestSchema = z.object({
    text: z.string().nonempty()
})

app.post(
    '/:secretHookPath',
    zValidator('json', requestSchema),
    async (c) => {
        const hookPath = c.req.param('secretHookPath')
        const payload = c.req.valid('json')

        const db = getD1Database(c)
        const account = await db.getAccountBySecretHookPath(hookPath)
        if (!account) return c.notFound()

        const server = await getServerInfo(c)
        const accountActor = accountToActor(server, account)
        const privateKey = await importPrivateKey(c.env.PRIVATE_KEY)
        const postId = crypto.randomUUID()

        const followers = await db.getFollowers(account.username)
        console.log(`${account.username} posting ${JSON.stringify(payload)} to ${followers.length} followers`)
        for (const follower of followers) {
            const followerActor = await fetchRemoteActor(follower.follower)
            await createNote(postId, server, accountActor, followerActor.inbox, payload.text, privateKey)
        }
        await db.createPost(postId, account.username, payload.text)
        const actorBaseUrl = getActorUrl(server, account.username)
        return c.json({ "url": `${actorBaseUrl}/s/${postId}` })
    }
)

export default app