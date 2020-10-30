import { Publisher, Subjects, TicketCreatedEvent } from '@kansotickets/common'

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated
}
