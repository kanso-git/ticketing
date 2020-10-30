import nats from 'node-nats-streaming'
import { TicketCreatedPublisher } from './events/ticket-created-publisher'

// create a client // stan is the convension
const stan = nats.connect('ticketing', 'abc', {
  url: 'http://localhost:4222',
})

// we should  wait to connect
stan.on('connect', async () => {
  console.log('Publisher connected to NATS')
  const ticketCreatedPublisher = new TicketCreatedPublisher(stan)
  const data = {
    id: '123',
    title: 'concert',
    price: 20,
    userId: 'sds',
  }
  try {
    await ticketCreatedPublisher.publish(data)
  } catch (err) {
    console.log(err)
  }
})
