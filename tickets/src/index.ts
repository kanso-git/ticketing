import mongoose from 'mongoose'
import { app } from './app'
import { OrderCancelledListener } from './events/listeners/order-cancelled-listener'
import { OrderCreatedListener } from './events/listeners/order-created-listener'
import { natsWrapper } from './nats-wrapper'

const start = async () => {
  if (!process.env.JWT_KEY || !process.env.MONGO_URI) {
    throw new Error('JWT_KEY or MONGO_URI  must be all defined')
  }
  if (
    !process.env.NATS_CLUSTER_ID ||
    !process.env.NATS_CLIENT_ID ||
    !process.env.NATS_URL
  ) {
    throw new Error(
      'NATS_CLUSTER_ID or NATS_CLIENT_ID or NATS_URL must be all defined',
    )
  }
  try {
    console.log(`
      NATS_CLUSTER_ID:${process.env.NATS_CLUSTER_ID}
      NATS_CLIENT_ID:${process.env.NATS_CLIENT_ID}
      NATS_URL:${process.env.NATS_URL}
    `)

    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL,
    )

    // on client close event recevied when SIGTERM OR SIGINT occured
    natsWrapper.client.on('close', () => {
      console.log('NATS connection closed!')
      process.exit()
    })

    // when ending the listener for any reason
    process.on('SIGINT', () => natsWrapper.client.close())
    process.on('SIGTERM', () => natsWrapper.client.close())

    new OrderCreatedListener(natsWrapper.client).listen()
    new OrderCancelledListener(natsWrapper.client).listen()

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
    console.log('Listening on port 3000!!!!!')
  })
}

start()
