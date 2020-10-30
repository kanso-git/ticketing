import { Listener, Subjects, TicketCreatedEvent } from '@kansotickets/common'
import { Message } from 'node-nats-streaming'
import { Ticket } from '../../models/ticket'
import { queueGroupName } from './queue-group-name'

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated
  queueGroupName = queueGroupName
  async onMessage(data: TicketCreatedEvent['data'], msg: Message) {
    console.log('TicketCreatedListener Event data!', data)

    const ticket = Ticket.build({
      price: data.price,
      title: data.title,
      id: data.id,
    })
    await ticket.save()
    msg.ack()
  }
}
