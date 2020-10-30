import {
  Listener,
  NotFoundError,
  Subjects,
  TicketUpdatedEvent,
} from '@kansotickets/common'
import { Message } from 'node-nats-streaming'
import { Ticket } from '../../models/ticket'
import { queueGroupName } from './queue-group-name'

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated
  queueGroupName = queueGroupName
  async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
    console.log('TicketUpdatedListener Event data!', data)

    // logic to enforce update to be done respecting the update order
    const ticket = await Ticket.findByEvent(data)

    if (!ticket) {
      throw new NotFoundError()
    }
    const { title, price } = data
    ticket.set({ title, price })
    await ticket.save()
    msg.ack()
  }
}
