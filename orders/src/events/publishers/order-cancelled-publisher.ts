import { Publisher, Subjects, OrderCancelledEvent } from '@kansotickets/common'

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled
}
