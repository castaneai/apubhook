CREATE TABLE accounts (
  username TEXT PRIMARY KEY,
  displayName TEXT,
  secretHookPath TEXT UNIQUE,
  iconUrl TEXT,
  iconMime TEXT
);

CREATE TABLE followers (
  follower TEXT NOT NULL,
  followee TEXT NOT NULL,
  UNIQUE(follower, followee) ON CONFLICT REPLACE
);

CREATE TABLE posts (
  id TEXT PRIMARY KEY,
  authorId TEXT,
  body TEXT
);
