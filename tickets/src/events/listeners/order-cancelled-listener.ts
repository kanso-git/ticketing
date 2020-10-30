import {
  Listener,
  NotFoundError,
  OrderCancelledEvent,
  Subjects,
} from '@kansotickets/common'
import { Message } from 'node-nats-streaming'
import { Ticket } from '../../models/ticket'
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher'
import { queueGroupName } from './queue-group-name'

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled
  queueGroupName = queueGroupName

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    // Find the ticket that the order is cancelling
    const ticket = await Ticket.findById(data.ticket.id)

    // If no ticket, throw an error
    if (!ticket) {
      throw new NotFoundError()
    }

    // Mark the ticket as being available  by setting its orderId property back to null
    ticket.set({ orderId: undefined })

    // Save the ticket
    await ticket.save()

    // emit event ticket update to keep data in sync
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
