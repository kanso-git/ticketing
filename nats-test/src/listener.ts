import nats from 'node-nats-streaming'
import { randomBytes } from 'crypto'
import { TicketCreatedListener } from './events/ticket-created-listener'

console.clear()
const stan = nats.connect('ticketing', randomBytes(4).toString('hex'), {
  url: 'http://localhost:4222',
})

stan.on('connect', () => {
  console.log('Listener connected to NATS')

  // on client close event recevied when SIGTERM OR SIGINT occured
  stan.on('close', () => {
    console.log('NATS connection closed!')
    process.exit()
  })
  new TicketCreatedListener(stan).listen()
})

// when ending the listener for any reason
process.on('SIGINT', () => stan.close())
process.on('SIGTERM', () => stan.close())
