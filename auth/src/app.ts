import express from 'express'
import 'express-async-errors'
import { json } from 'body-parser'
import cookieSession from 'cookie-session'

import { currentUserRouter } from './routes/current-user'
import { signinRouter } from './routes/signin'
import { signoutRouter } from './routes/signout'
import { signupRouter } from './routes/signup'
import { errorHandler } from '@kansotickets/common'
import { NotFoundError } from '@kansotickets/common'

const app = express()

// tell express to be aware of proxy is forwarding requests
app.set('trust proxy', true)
app.use(json())

app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV === 'production',
  }),
)

app.use(currentUserRouter)
app.use(signinRouter)
app.use(signoutRouter)
app.use(signupRouter)

app.all('*', async (req, res) => {
  throw new NotFoundError()
})

app.use(errorHandler)

export { app }
