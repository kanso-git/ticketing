import { Publisher, PaymentCreatedEvent, Subjects } from '@kansotickets/common'

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated
}
