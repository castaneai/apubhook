export type UrlString = string

export type ServerInfo = {
    host: string
    publicKeyPem: string
}

export async function postToRemoteInbox(inboxUrl: UrlString, data: any, headers: { [key: string]: string }) {
    console.log(`post to ${inboxUrl}`, data)
    const res = await fetch(inboxUrl, { method: 'POST', body: JSON.stringify(data), headers })
    if (!res.ok) {
        console.error('failed to post remote inbox', res.status, res.statusText)
    }
    return res
}
