import { OrderStatus } from '@kansotickets/common'
import { updateIfCurrentPlugin } from 'mongoose-update-if-current'
import mongoose from 'mongoose'

// Group Order and OrderStatus together
export { OrderStatus }

interface OrderAttrs {
  id: string
  status: OrderStatus
  version: number
  userId: string
  price: number
}

// An interface that describes the properties that a Order Document has
interface OrderDoc extends mongoose.Document {
  status: OrderStatus
  version: number
  userId: string
  price: number
}

// An interface that describes the properties
// that a Order Model has
interface OrderModel extends mongoose.Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc
  findByEvent(event: { id: string; version: number }): Promise<OrderDoc | null>
}

// the version will be controlled by the plugin updateIfCurrentPlugin
const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String, // this is a string constructor
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Created,
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

/**
 * setup to wire the plugin that controls the version
 */
orderSchema.plugin(updateIfCurrentPlugin)
orderSchema.set('versionKey', 'version')

// implement defined model methods
orderSchema.statics.findByEvent = (event: { id: string; version: number }) => {
  return Order.findOne({
    _id: event.id,
    version: event.version - 1,
  })
}
/**
 * we need to override the _id so the provided id will be considered
 * @param attrs
 */
orderSchema.statics.build = (attrs: OrderAttrs) => {
  return new Order({
    _id: attrs.id,
    status: attrs.status,
    version: attrs.version,
    userId: attrs.userId,
    price: attrs.price,
  })
}

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema)

export { Order }
