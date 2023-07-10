CREATE TABLE accounts (
  username TEXT PRIMARY KEY,
  displayName TEXT,
  secretHookPath TEXT UNIQUE,
  iconUrl TEXT,
  iconMime TEXT
);

CREATE TABLE followers (
  followee TEXT NOT NULL,
  follower TEXT NOT NULL,
  UNIQUE(followee, follower) ON CONFLICT REPLACE
);

CREATE TABLE posts (
  id TEXT PRIMARY KEY,
  authorId TEXT,
  body TEXT
);
