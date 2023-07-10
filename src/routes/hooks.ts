import { Hono } from 'hono'
import { importPrivateKey } from '../utils'
import { Env } from '../types'
import { getInbox, createNote } from '../logic'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'

const app = new Hono<Env>()

const requestSchema = z.object({
    text: z.string()
})

app.post(
    '/:hookPath',
    zValidator('json', requestSchema),
    async (c) => {
        const hookPath = c.req.param('hookPath')
        if (hookPath !== c.env.HOOK_PATH) return c.json({error: "invalid request"}, 400)

        const message = c.req.valid('json')
        const messageId = crypto.randomUUID()

        const strHost = new URL(c.req.url).hostname
        const strName = c.env.preferredUsername

        const PRIVATE_KEY = await importPrivateKey(c.env.PRIVATE_KEY)

        const { results } = await c.env.DB.prepare(`SELECT id FROM follower;`).all<{ id: string }>()
        const followers = results

        for (const follower of followers) {
            const x = await getInbox(follower.id)
            await createNote(messageId, strName, strHost, x, message.text, PRIVATE_KEY)
        }

        await c.env.DB.prepare(`INSERT INTO message(id, body) VALUES(?, ?);`)
            .bind(messageId, message.text)
            .run()

        return c.text('OK')
    }
)

export default app