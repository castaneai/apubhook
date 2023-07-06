export type Env = {
  Bindings: {
    DB: D1Database
    preferredUsername: string
    name: string
    PRIVATE_KEY: string
    HOOK_PATH: string
  }
}

export type Follower = {
  id: string
}

export type Message = {
  id: string
  body: string
}
