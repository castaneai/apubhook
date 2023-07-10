import { APubHookAccount } from "../types";
import { ServerInfo, UrlString } from "./common";

export type Actor = {
  preferredUsername: string
  inbox: UrlString
}

export function actorJSON(server: ServerInfo, actor: APubHookAccount): Actor {
    const baseUrl = getActorUrl(server, actor.username);
    // ref: https://scrapbox.io/activitypub/Actor
    return {
        '@context': ['https://www.w3.org/ns/activitystreams', 'https://w3id.org/security/v1'],
        id: baseUrl,
        type: 'Person',
        inbox: `${baseUrl}/inbox`,
        discoverable: true,
        followers: `${baseUrl}/followers`,
        preferredUsername: actor.username,
        name: actor.displayName,
        url: baseUrl,
        publicKey: {
          id: `${baseUrl}#main-key`,
          type: 'Key',
          owner: baseUrl,
          publicKeyPem: server.publicKeyPem,
        },
        icon: {
          type: 'Image',
          mediaType: actor.iconMime,
          url: convertRelativeUrl(server, actor.iconUrl),
        },
      } as Actor
}

export function getActorUrl(server: ServerInfo, username: string) {
    return `https://${server.host}/@${username}`
}

function convertRelativeUrl(server: ServerInfo, url: string) {
    return url.startsWith('http://') || url.startsWith('https://') ? url : 
        `https://${server.host}${url}`
}

export async function fetchRemoteActor(req: string): Promise<Actor> {
  const res = await fetch(req, {
    method: 'GET',
    headers: { Accept: 'application/activity+json' },
  })
  return await res.json() as Actor
}

export function followersJSON(server: ServerInfo, username: string, followerUrls: string[]) {
    const baseUrl = getActorUrl(server, username);
    return {
    '@context': 'https://www.w3.org/ns/activitystreams',
    id: `${baseUrl}/followers`,
    type: 'OrderedCollection',
    first: {
      type: 'OrderedCollectionPage',
      totalItems: followerUrls.length,
      partOf: `${baseUrl}/followers`,
      orderedItems: followerUrls,
      id: `${baseUrl}/followers?page=1`,
    },
  }
}
