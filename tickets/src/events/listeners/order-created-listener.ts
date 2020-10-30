import {
  Listener,
  NotFoundError,
  OrderCreatedEvent,
  OrderStatus,
  Subjects,
} from '@kansotickets/common'
import { Message } from 'node-nats-streaming'
import { Ticket } from '../../models/ticket'
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher'
import { queueGroupName } from './queue-group-name'

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated
  queueGroupName = queueGroupName
  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    // Find the ticket that the order is reserving
    const ticket = await Ticket.findById(data.ticket.id)

    // If no ticket, throw an error
    if (!ticket) {
      throw new NotFoundError()
    }

    // Mark the ticket as being reserved by setting its orderId property
    ticket.set({ orderId: data.id })

    // Save the ticket
    await ticket.save()

    // emit event ticket update to keep data i sync
    // publish en event on topic ticket:updated
    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version,
      orderId: ticket.orderId,
    })

    //ack te message
    msg.ack()
  }
}
