import request from 'supertest'
import { app } from '../../app'
import mongosse from 'mongoose'
import { Order, OrderStatus } from '../../models/order'
import { stripe } from '../../stripe'
import { Payment } from '../../models/payment'
import { natsWrapper } from '../../nats-wrapper'
import e from 'express'
import { PaymentCreatedEvent } from '@kansotickets/common'

it('returns 401 when user is not authenticated', async () => {
  request(app).post('/api/payments/').expect(401)
})

it('returns 400 when the order id is empty or not valid as mongo id ', async () => {
  await request(app)
    .post('/api/payments/')
    .set('Cookie', global.signin())
    .send({ orderId: '', token: 'dfdf' })
    .expect(400)

  await request(app)
    .post('/api/payments/')
    .set('Cookie', global.signin())
    .send({ orderId: 'fssds', token: 'dfdf' })
    .expect(400)
})

it('returns 400 when provided token is empty ', async () => {
  await request(app)
    .post('/api/payments/')
    .set('Cookie', global.signin())
    .send({ orderId: mongosse.Types.ObjectId().toHexString(), token: '' })
    .expect(400)
})

it('returns 404 when purchasing an order that does not exist', async () => {
  const fakeOrderId = mongosse.Types.ObjectId().toHexString()
  await request(app)
    .post('/api/payments/')
    .set('Cookie', global.signin())
    .send({ orderId: fakeOrderId, token: 'sdsdd' })
    .expect(404)
})

it('returns 401 when purchasing an order that does not belong to the user', async () => {
  const randomUserId = mongosse.Types.ObjectId().toHexString()
  const order = Order.build({
    id: mongosse.Types.ObjectId().toHexString(),
    price: 10,
    status: OrderStatus.Created,
    userId: randomUserId,
    version: 0,
  })
  await order.save()

  // signed user is user1
  await request(app)
    .post('/api/payments/')
    .set('Cookie', global.signin())
    .send({ orderId: order.id, token: 'sdsdd' })
    .expect(401)
})

it('returns 400 when purchasing a cancelled order', async () => {
  const order = Order.build({
    id: mongosse.Types.ObjectId().toHexString(),
    price: 10,
    status: OrderStatus.Cancelled,
    userId: 'user1',
    version: 0,
  })
  await order.save()

  const res = await request(app)
    .post('/api/payments/')
    .set('Cookie', global.signin())
    .send({ orderId: order.id, token: 'sdsdd' })
    .expect(400)
})

it('returns 200 when purchasing a valid order and creates a stripe charge using mock ', async () => {
  const order = Order.build({
    id: mongosse.Types.ObjectId().toHexString(),
    price: 10,
    status: OrderStatus.Created,
    userId: 'user1',
    version: 0,
  })
  await order.save()

  const res = await request(app)
    .post('/api/payments/')
    .set('Cookie', global.signin())
    .send({ orderId: order.id, token: 'tok_visa' })

  expect(res.status).toEqual(201)
  const chargeParams = (stripe.charges.create as jest.Mock).mock.calls[0][0]
  expect(chargeParams.currency).toBe('chf')
  expect(chargeParams.amount).toBe(order.price * 100)
  expect(chargeParams.source).toBe('tok_visa')

  expect(stripe.charges.create).toHaveBeenCalled()

  const payments = await Payment.findOne({ orderId: order.id })
  expect(payments!.orderId).toBe(order.id)

  expect(natsWrapper.client.publish).toHaveBeenCalled()

  const eventData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1],
  ) as PaymentCreatedEvent['data']

  expect(eventData.orderId).toBe(order.id)
})

it.todo(
  'returns 200 when purchasing a valid order and creates a real stripe charge .. ',
)

/**
 * real verion needs the below:
 * remove the mock include in the test setup so our test  will use the real stripe code
 * define the private secret as env key
 * after a successful charge creation query the stripe api and get the list of charges (limit to 50)
 * find a charge that match the price proived to stripe with order price
 * the price has to be generate randomly
 */
