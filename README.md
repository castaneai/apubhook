# APubHook

Incoming WebHook-like server for ActivityPub.

You can post messages to Fediverse like Incoming WebHook in Slack with the command `curl -X POST -d '{"text": "hello"}' ...` 

## Configuration

APubHook works on [Cloudflare Workers](https://workers.cloudflare.com/); use [Wrangler]() to configure and deploy.

```
cp wrangler.sample.toml wrangler.toml
pnpm install
```

Fill the values:

* `preferredUsername` - Your account name on Fediverse. eg. `testbot`
* `name` - Your long name. eg. `Test BOT`
* `HOOK_PATH` - Secret string like Slack-incoming WebHook URL parameter

Pick up the value of `PRIVATE_KEY` from the files generated by `ssh-keygen`:

```
ssh-keygen -b 4096 -m PKCS8 -t rsa -N '' -f id_rsa
```

You can also use the value as "Secret variables" in Cloudflare Workers.

## Setup Database

```
pnpm wrangler d1 create apubhook
pnpm wrangler d1 execute apubhook --file db.sql
```

## Deploy

```
pnpm run deploy
```

## Usage

You can follow a account: `${preferredUserName}@apubhook.<USERNAME>.workers.dev` on Fediverse (Alternatively, you could use a custom domain for Workers).

And you can post messages with HTTP POST request with JSON payload to `/hooks/${HOOK_PATH}`.

```sh
# Sending 'hello' to Fediverse!
curl -X POST -d '{"text": "hello"}' "https://apubhook.<USERNAME>.workers.dev/hooks/${HOOK_PATH}"
```

You can see the post on Fediverse!

![](./example.webp)


## License

MIT

And using a lot of code in Matchbox and inspired by Minidon and Express ActivityPub Server.

Minidon
https://github.com/yusukebe/minidon
Copyright (c) 2023 Yusuke Wada. Licensed under the MIT license.

Matchbox
https://gitlab.com/acefed/matchbox
Copyright (c) 2022 Acefed MIT License

Express ActivityPub Server
https://github.com/dariusk/express-activitypub
Copyright (c) 2018 Darius Kazemi. Licensed under the MIT license.