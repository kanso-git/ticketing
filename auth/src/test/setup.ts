import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import request from 'supertest'
import { app } from '../app'

let mongo: any

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
      signin(user?: {
        email: string
        password: string
      }): Promise<request.Response>
    }
  }
}
/**
 * global functions that signin the user and returns the cookie
 */
global.signin = async (user?: { email: string; password: string }) => {
  const user0 = {
    email: 'test@test.com',
    password: 'password',
  }
  return await request(app)
    .post('/api/users/signup')
    .send(user ? user : user0)
}
