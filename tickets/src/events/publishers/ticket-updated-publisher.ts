import { Publisher, Subjects, TicketUpdatedEvent } from '@kansotickets/common'

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated
}
