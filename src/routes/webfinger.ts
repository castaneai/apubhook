import { Hono } from 'hono'
import { getActorUrl } from '../apub/actor'
import { getServerInfo } from '../utils'
import { Env } from '../types'
import { getD1Database } from '../db'

const app = new Hono<Env>()

app.get('/', async (c) => {
  const resource = c.req.query('resource')
  const m = resource.match(/acct:(?<username>[^\@]+)\@(?<host>.+)/)
  if (!m) return c.notFound();

  const username = m.groups['username']
  const host = m.groups['host']

  const server = await getServerInfo(c)
  if (host !== server.host) return c.notFound();

  const db = getD1Database(c)
  const account = await db.getAccount(username)
  if (!account || username !== account.username) return c.notFound()

  const actorUrl = getActorUrl(server, username);
  const r = {
    subject: resource,
    links: [
      {
        rel: 'self',
        type: 'application/activity+json',
        href: actorUrl,
      },
    ],
  }
  return c.json(r, 200, { 'Content-Type': 'jrd+json' })
})

export default app
