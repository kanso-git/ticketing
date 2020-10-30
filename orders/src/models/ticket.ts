import mongoose from 'mongoose'
import { updateIfCurrentPlugin } from 'mongoose-update-if-current'
import { Order, OrderStatus } from './order'

interface TicketAttrs {
  title: string
  price: number
  id: string
}

export interface TicketDoc extends mongoose.Document {
  title: string
  price: number
  isReserved(): Promise<boolean>
  version: number
}

interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc
  findByEvent(event: { id: string; version: number }): Promise<TicketDoc | null>
}

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id
        delete ret._id
      },
    },
  },
)

ticketSchema.set('versionKey', 'version')
ticketSchema.plugin(updateIfCurrentPlugin)

// implement defined model methods
ticketSchema.statics.findByEvent = (event: { id: string; version: number }) => {
  return Ticket.findOne({
    _id: event.id,
    version: event.version - 1,
  })
}
ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket({ _id: attrs.id, title: attrs.title, price: attrs.price })
}

//(reserved means it has been asociated with an order and the order is not cancelled)
// Run query to look at all orders. find an order where the ticket
// is the ticket we just found *and* the order status is  *not* cancelled
// If we found an order from that means the ticket *is* reserved
ticketSchema.methods.isReserved = async function (): Promise<boolean> {
  // this === the ticket document that we just called 'isReserved' on
  const reservedOrder = await Order.findOne({
    ticket: this,
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Complete,
      ],
    },
  })
  // if reservedOrder *is* null (no reserved order is found) then the !!(null) results *to*  false
  // if reservedOrder *is* not null (at least a reserved order is found) then the !!(!null) results *to*  true
  return !!reservedOrder
}
const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema)

export { Ticket }
