import express from 'express'
import 'express-async-errors'
import { json } from 'body-parser'
import cookieSession from 'cookie-session'
import { errorHandler, NotFoundError, currentUser } from '@kansotickets/common'

import { showOrdersRouter } from './routes/index'
import { deleteOrderRouter } from './routes/delete'
import { showOrderRouter } from './routes/show'
import { createOrderRouter } from './routes/new'

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

//  currentUser middleware adds the currentUser the req.currentUser, alternatively null if user not authenticated
//  currentUser: {id: string, email: string}

app.use(currentUser)
app.use(showOrdersRouter)
app.use(deleteOrderRouter)
app.use(showOrderRouter)
app.use(createOrderRouter)

//catch all not found  incoming requests
app.all('*', async (req, res) => {
  throw new NotFoundError()
})

app.use(errorHandler)

export { app }
