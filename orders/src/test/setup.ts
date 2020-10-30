import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { JwtUtils } from '../services/jwt-utils'

let mongo: any
export interface UserPayload {
  id: string
  email: string
}

jest.mock('../nats-wrapper')
beforeAll(async () => {
  process.env.JWT_KEY = 'sdsds'
  //process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
  mongo = new MongoMemoryServer()
  const mongoUri = await mongo.getUri()
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
})

// reset data before each test
beforeEach(async () => {
  jest.clearAllMocks()
  const collections = await mongoose.connection.db.collections()
  for (let collection of collections) {
    await collection.deleteMany({})
  }
})

afterAll(async () => {
  await mongo.stop()
  await mongoose.connection.close()
})

declare global {
  namespace NodeJS {
    interface Global {
      signin(userPayload?: UserPayload): string[]
    }
  }
}
/**
 * global functions that signin the user and returns the cookie
 */
global.signin = (userPayload) => {
  // some payload
  const payload = userPayload || {
    id: 'user1',
    email: 'user1@test.com',
  }
  // Generate JWT
  const token = JwtUtils.sign(payload)

  // Build session Object. { jwt: MY_JWT }
  const session = { jwt: token }

  // Turn that session into JSON
  const sessionJSON = JSON.stringify(session)

  // Take JSON and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString('base64')

  // return a string thats the cookie with the encoded data
  return [`express:sess=${base64}`]
}
