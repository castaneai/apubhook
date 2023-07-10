import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-workers'
import { logger } from 'hono/logger'
import webfinger from './routes/webfinger'
import user from './routes/user'
import hooks from './routes/hooks'

const app = new Hono()

app.use('*', logger())

app.get('/static/*', serveStatic({ root: './' }))

app.get('/', (c) => c.text('apubhook'))
app.route('/.well-known/webfinger', webfinger)
app.route('/', user)
app.route('/hooks', hooks)

app.showRoutes()

export default app
