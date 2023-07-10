import { UrlString } from "./apub/common"

export type Env = {
  Bindings: {
    DB: D1Database
    PRIVATE_KEY: string
  }
}

export type APubHookAccount = {
  username: string
  displayName: string
  secretHookPath: string
  iconUrl: string
  iconMime: string
}

export type Follower = {
  follower: UrlString
}

export type Post = {
  id: string
  body: string
  createdAt: Date
}
