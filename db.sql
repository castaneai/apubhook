CREATE TABLE accounts (
  username TEXT PRIMARY KEY,
  displayName TEXT,
  secretHookPath TEXT UNIQUE,
  iconUrl TEXT,
  iconMime TEXT
);
CREATE INDEX accountsSecretHookPath ON accounts(secretHookPath);

CREATE TABLE followers (
  followee TEXT NOT NULL,
  follower TEXT NOT NULL,
  UNIQUE(followee, follower) ON CONFLICT REPLACE
);

CREATE TABLE posts (
  id TEXT PRIMARY KEY,
  authorUsername TEXT NOT NULL,
  body TEXT NOT NULL,
  createdAt DATE NOT NULL
);
CREATE INDEX postsAuthor ON posts(authorUsername);
