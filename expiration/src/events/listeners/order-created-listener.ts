import { Listener, OrderCreatedEvent, Subjects } from '@kansotickets/common'
import { Message } from 'node-nats-streaming'
import { expirationQueue } from '../../queues/expiration-queue'

import { queueGroupName } from './queue-group-name'

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated
  queueGroupName = queueGroupName
  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime() // returns the  expiresAt time in ms than substract from it the current time in ms
    console.log('waiting this many milliseconds to process the job:', delay)
    // adding a job with a delay, after delay passed the expirationQueue will process the this event
    await expirationQueue.add(
      {
        orderId: data.id,
      },
      {
        delay,
      },
    )
    //ack te message
    msg.ack()
  }
}
