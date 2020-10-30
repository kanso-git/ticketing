import { Publisher, Subjects, OrderCreatedEvent } from '@kansotickets/common'

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated
}
