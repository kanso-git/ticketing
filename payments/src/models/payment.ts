import mongosse, { Mongoose } from 'mongoose'
import Stripe from 'stripe'

interface PaymentAttrs {
  orderId: string
  stripeId: string
}

interface PaymentDoc extends mongosse.Document {
  orderId: string
  stripeId: string
}

interface PaymentModel extends mongosse.Model<PaymentDoc> {
  build(attrs: PaymentAttrs): PaymentDoc
}

const paymentSchema = new mongosse.Schema(
  {
    orderId: {
      required: true,
      type: String,
    },
    stripeId: {
      required: true,
      type: String,
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

paymentSchema.statics.build = (attrs: PaymentAttrs) => {
  return new Payment(attrs)
}

const Payment = mongosse.model<PaymentDoc, PaymentModel>(
  'Payment',
  paymentSchema,
)

export { Payment }
