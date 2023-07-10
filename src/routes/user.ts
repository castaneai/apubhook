/**
 * Based on Matchbox
 * Matchbox https://gitlab.com/acefed/matchbox Copyright (c) 2022 Acefed MIT License
 */

import { Hono } from 'hono'
import { APubHookAccount, Env, Follower } from '../types'
import { accountToActor, getServerInfo, importPrivateKey } from '../utils'
import { actorJSON } from '../apub/actor'
import { getD1Database } from '../db'
import { InboxMessage, acceptFollow } from '../apub/follow'
import { UrlString } from '../apub/common'

const app = new Hono<Env>()

app.get(':atusername', async (c) => {
  const atUsername = c.req.param('atusername')
  if (!atUsername.startsWith('@')) return c.notFound()
  const username = atUsername.substring(1)
  const server = await getServerInfo(c)
  const db = getD1Database(c)
  const actor = await db.getAccount(username)
  if (!actor) return c.notFound()

  if (!c.req.header('Accept').includes('application/activity+json')) {
    return c.text(`${actor.username}@${server.host}: ${actor.displayName}`)
  }

  const resp = actorJSON(server, actor)
  return c.json(resp, 200, { 'Content-Type': 'activity+json' })
})

app.get(':atusername/inbox', (c) => c.body(null, 405))
app.post(':atusername/inbox', async (c) => {
  const atUsername = c.req.param('atusername')
  if (!atUsername.startsWith('@')) return c.notFound()
  const username = atUsername.substring(1)
  const db = getD1Database(c)

  if (!c.req.header('Content-Type').includes('application/activity+json')) return c.body(null, 400)
  const message = await c.req.json<InboxMessage>()

  if (message.type === 'Follow') {
    const followee = await db.getAccount(username)
    if (!followee) return c.body(null, 400)

    const server = await getServerInfo(c)
    const privateKey = await importPrivateKey(c.env.PRIVATE_KEY)
    await acceptFollow(message, accountToActor(server, followee), server, privateKey)
    await db.acceptFollow(message.actor, username)
    return c.body(null)
  }

  if (y.type === 'Undo') {
    const z = y.object
    if (z.type === 'Follow') {
      await c.env.DB.prepare(`DELETE FROM follower WHERE id = ?;`).bind(y.actor).run()
      return c.body(null)
    }
  }

  return c.body(null, 500)
})

function extractUsernameFromUrl(url: UrlString): string {
  return (new URL(url).pathname).substring(1)
}

app.get(':strName/followers', async (c) => {
  const strName = c.req.param('strName')
  const strHost = new URL(c.req.url).hostname
  if (strName !== c.env.preferredUsername) return c.notFound()
  if (!c.req.header('Accept').includes('application/activity+json')) return c.body(null, 400)

  const { results } = await c.env.DB.prepare(`SELECT * FROM follower;`).all<Follower>()
  const followers = results

  const items = followers.map(({ id }) => {
    return id
  })

  const r = {
    '@context': 'https://www.w3.org/ns/activitystreams',
    id: `https://${strHost}/u/${strName}/followers`,
    type: 'OrderedCollection',
    first: {
      type: 'OrderedCollectionPage',
      totalItems: followers.length,
      partOf: `https://${strHost}/u/${strName}/followers`,
      orderedItems: items,
      id: `https://${strHost}/u/${strName}/followers?page=1`,
    },
  }

  return c.json(r, 200, { 'Content-Type': 'activity+json' })
})

export default app
