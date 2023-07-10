import { Actor, getActorUrl } from "./actor"
import { ServerInfo, postToRemoteInbox } from "./common"
import { signHeaders } from "./sign"

export async function createNote(
	postId: string,
	server: ServerInfo,
	actor: Actor,
	targetInboxUrl: string,
	content: string,
	privateKey: CryptoKey
) {
	const actorBaseUrl = getActorUrl(server, actor.preferredUsername)
	const strTime = new Date().toISOString().substring(0, 19) + 'Z'
	const res = {
		'@context': 'https://www.w3.org/ns/activitystreams',
		id: `${actorBaseUrl}/s/${postId}/activity`,
		type: 'Create',
		actor: actorBaseUrl,
		published: strTime,
		to: ['https://www.w3.org/ns/activitystreams#Public'],
		cc: [`${actorBaseUrl}/followers`],
		object: {
			id: `${actorBaseUrl}/s/${postId}`,
			type: 'Note',
			attributedTo: actorBaseUrl,
			content: content,
			url: `${actorBaseUrl}/s/${postId}`,
			published: strTime,
			to: ['https://www.w3.org/ns/activitystreams#Public'],
			cc: [`${actorBaseUrl}/followers`],
		},
	}
	const headers = await signHeaders(res, server, actor, targetInboxUrl, privateKey)
	await postToRemoteInbox(targetInboxUrl, res, headers)
}
