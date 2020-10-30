import { OrderCreatedListener } from './events/listeners/order-created-listener'
import { natsWrapper } from './nats-wrapper'

const start = async () => {
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

    // add my listeners
    new OrderCreatedListener(natsWrapper.client).listen()
  } catch (err) {
    console.error(err)
  }
}

start()
