import { postToRemoteInbox } from "./apub/common"
import { signHeaders } from "./apub/sign"

export async function getInbox(req: string) {
  const res = await fetch(req, {
    method: 'GET',
    headers: { Accept: 'application/activity+json' },
  })
  return res.json()
}

export async function createNote(
  strId: string,
  strName: string,
  strHost: string,
  x: any,
  y: string,
  privateKey: CryptoKey
) {
  const strTime = new Date().toISOString().substring(0, 19) + 'Z'
  const strInbox = x.inbox
  const res = {
    '@context': 'https://www.w3.org/ns/activitystreams',
    id: `https://${strHost}/u/${strName}/s/${strId}/activity`,
    type: 'Create',
    actor: `https://${strHost}/u/${strName}`,
    published: strTime,
    to: ['https://www.w3.org/ns/activitystreams#Public'],
    cc: [`https://${strHost}/u/${strName}/followers`],
    object: {
      id: `https://${strHost}/u/${strName}/s/${strId}`,
      type: 'Note',
      attributedTo: `https://${strHost}/u/${strName}`,
      content: y,
      url: `https://${strHost}/u/${strName}/s/${strId}`,
      published: strTime,
      to: ['https://www.w3.org/ns/activitystreams#Public'],
      cc: [`https://${strHost}/u/${strName}/followers`],
    },
  }
  const headers = await signHeaders(res, strName, strHost, strInbox, privateKey)
  await postToRemoteInbox(strInbox, res, headers)
}

export async function deleteNote(
  strName: string,
  strHost: string,
  x: any,
  y: string,
  privateKey: CryptoKey
) {
  const strId = crypto.randomUUID()
  const strInbox = x.inbox
  const res = {
    '@context': 'https://www.w3.org/ns/activitystreams',
    id: `https://${strHost}/u/${strName}/s/${strId}/activity`,
    type: 'Delete',
    actor: `https://${strHost}/u/${strName}`,
    object: {
      id: y,
      type: 'Note',
    },
  }
  const headers = await signHeaders(res, strName, strHost, strInbox, privateKey)
  await postInbox(strInbox, res, headers)
}
