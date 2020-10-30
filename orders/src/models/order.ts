import { OrderStatus } from '@kansotickets/common'
import { updateIfCurrentPlugin } from 'mongoose-update-if-current'
import mongoose from 'mongoose'
import { TicketDoc } from './ticket'

// Group Order and OrderStatus together
export { OrderStatus }

interface OrderAttrs {
  userId: string
  status: OrderStatus
  expiresAt: Date
  ticket: TicketDoc
}

// An interface that describes the properties that a Order Document has
interface OrderDoc extends mongoose.Document {
  userId: string
  version: number
  status: OrderStatus
  expiresAt: Date
  ticket: TicketDoc
}

// An interface that describes the properties
// that a Order Model has
interface OrderModel extends mongoose.Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc
}

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String, // this is a string constructor
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Created,
    },
    expiresAt: {
      type: mongoose.Schema.Types.Date,
      required: false,
    },
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
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

orderSchema.plugin(updateIfCurrentPlugin)
orderSchema.set('versionKey', 'version')

orderSchema.statics.build = (attrs: OrderAttrs) => {
  return new Order(attrs)
}

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema)

export { Order }
