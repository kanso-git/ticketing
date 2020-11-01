import mongoose from 'mongoose'
import { app } from './app'

const start = async () => {
  if (!process.env.JWT_KEY || !process.env.MONGO_URI) {
    throw new Error('JWT_KEY must to be defined')
  }
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    })
    console.log('Connected to MongoDb')
  } catch (err) {
    console.error(err)
  }

  app.listen(3000, () => {
    console.log(`Auth process.env.NODE_ENV:${process.env.NODE_ENV}`)
    console.log('Listening on port 3000  ! ! !')
  })
}

start()
