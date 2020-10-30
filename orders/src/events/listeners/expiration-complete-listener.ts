import {
  Listener,
  Subjects,
  ExpirationCompleteEvent,
} from '@kansotickets/common'
import { Message } from 'node-nats-streaming'
import { Order, OrderStatus } from '../../models/order'
import { OrderCancelledPublisher } from '../publishers/order-cancelled-publisher'
import { queueGroupName } from './queue-group-name'

export class ExpirationCompleteListener extends Listener<
  ExpirationCompleteEvent
> {
  readonly subject = Subjects.ExpirationComplete
  queueGroupName = queueGroupName
  async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
    console.log('ExpirationCompleteListener Event data!', data)
    const order = await Order.findById(data.orderId).populate('ticket')
    if (!order) {
      throw new Error('Order not found')
    }
    // return early when order has a complete status
    if (order.status === OrderStatus.Complete) {
      return msg.ack()
    }
    // when times is up
    order.set({ status: OrderStatus.Cancelled })

    await order.save()

    await new OrderCancelledPublisher(this.client).publish({
      id: data.orderId,
      ticket: {
        id: order.ticket.id,
      },
      version: order.version,
    })

    msg.ack()
  }
}
