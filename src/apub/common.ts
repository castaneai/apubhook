export type UrlString = string

export type ServerInfo = {
    host: string
    publicKeyPem: string
}

export async function postToRemoteInbox(inboxUrl: UrlString, data: any, headers: { [key: string]: string }) {
    const res = await fetch(inboxUrl, { method: 'POST', body: JSON.stringify(data), headers })
    return res
}
