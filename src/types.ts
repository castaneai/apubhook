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
  id: string
}

export type Message = {
  id: string
  body: string
}
