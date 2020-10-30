import express from 'express'
import 'express-async-errors'
import { json } from 'body-parser'
import cookieSession from 'cookie-session'
import { errorHandler, NotFoundError, currentUser } from '@kansotickets/common'

import { createChargeRouter } from './routes/new'

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
app.use(currentUser)

app.use(createChargeRouter)

//catch all not found  incoming requests
app.all('*', async (req, res) => {
  throw new NotFoundError()
})

app.use(errorHandler)

export { app }
