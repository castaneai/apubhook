import { btos, stob } from "../utils"
import { Actor, getActorUrl } from "./actor"
import { ServerInfo, UrlString } from "./common"

export async function signHeaders(
    res: any,
    server: ServerInfo,
    actor: Actor,
    targetInboxUrl: UrlString,
    privateKey: CryptoKey
  ) {
    const strTime = new Date().toUTCString()
    const s = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(res)))
    const s256 = btoa(btos(s))
    const sig = await crypto.subtle.sign(
      'RSASSA-PKCS1-v1_5',
      privateKey,
      stob(
        `(request-target): post ${new URL(targetInboxUrl).pathname}\n` +
          `host: ${new URL(targetInboxUrl).hostname}\n` +
          `date: ${strTime}\n` +
          `digest: SHA-256=${s256}`
      )
    )
    const b64 = btoa(btos(sig))
    const headers = {
      Host: new URL(targetInboxUrl).hostname,
      Date: strTime,
      Digest: `SHA-256=${s256}`,
      Signature:
        `keyId="${getActorUrl(server, actor.preferredUsername)}",` +
        `algorithm="rsa-sha256",` +
        `headers="(request-target) host date digest",` +
        `signature="${b64}"`,
      Accept: 'application/activity+json',
      'Content-Type': 'application/activity+json',
      'Accept-Encoding': 'gzip',
      'User-Agent': `ApubHook (+https://${server.host}/)`,
    }
    return headers
  }