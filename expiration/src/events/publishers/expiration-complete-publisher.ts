import {
  Subjects,
  Publisher,
  ExpirationCompleteEvent,
} from '@kansotickets/common'
export class ExpirationCompletePublisher extends Publisher<
  ExpirationCompleteEvent
> {
  readonly subject = Subjects.ExpirationComplete
}
