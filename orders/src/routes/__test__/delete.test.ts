import request from 'supertest'
import { app } from '../../app'
import { Ticket } from '../../models/ticket'
import { Order, OrderStatus } from '../../models/order'
import { UserPayload } from '../../test/setup'
import { natsWrapper } from '../../nats-wrapper'
import mongoose from 'mongoose'

function randomIntFromInterval(min: number, max: number) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min)
}

async function createOrderForUser(i: number, user: UserPayload) {
  const ticket = Ticket.build({
    price: randomIntFromInterval(1, 100),
    title: `ticket#${i + 1}`,
    id: mongoose.Types.ObjectId().toHexString(),
  })
  await ticket.save()
  const order = await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin(user))
    .send({ ticketId: ticket.id })
  return order
}

it('returns bad request error when provided orderId is empty', async () => {
  await request(app)
    .delete('/api/orders/')
    .set('Cookie', global.signin())
    .send()
    .expect(400)
})

it('returns bad request error when provided orderId is not valid', async () => {
  await request(app)
    .delete('/api/orders/invalidOrderId')
    .set('Cookie', global.signin())
    .send()
    .expect(400)
})

it('returns not found error when there is no associated order for the provided orderId ', async () => {
  const fakeOrderId = mongoose.Types.ObjectId().toHexString()
  await request(app)
    .delete(`/api/orders/${fakeOrderId}`)
    .set('Cookie', global.signin())
    .send()
    .expect(404)
})

it('returns not authorized error when the associated order does not belong to the logged user ', async () => {
  const resp = await createOrderForUser(1, {
    email: 'test1@test.com',
    id: 'sdsdsds',
  })
  await request(app)
    .delete(`/api/orders/${resp.body.id}`)
    .set('Cookie', global.signin())
    .send()
    .expect(401)
})

it('returns the associated order for the provided orderId with a cancelled status', async () => {
  const user1 = {
    id: 'user1',
    email: 'user1@test.com',
  }
  const {
    body: { id },
  } = await createOrderForUser(1, user1)

  const resp = await request(app)
    .delete(`/api/orders/${id}`)
    .set('Cookie', global.signin(user1))
    .send({})

  expect(resp.status).toBe(204)
  const order = await Order.findById(id)

  expect(order!.id).toBe(id)
  expect(order!.status).toBe(OrderStatus.Cancelled)
})

it('emits an order cancelled event', async () => {
  const ticket = Ticket.build({
    price: 15,
    title: '3anzeh',
    id: mongoose.Types.ObjectId().toHexString(),
  })

  await ticket.save()

  const expiration = new Date()
  expiration.setSeconds(expiration.getSeconds() + 200)

  // Build the order and save it to the database
  const order = Order.build({
    userId: 'user1',
    expiresAt: expiration,
    status: OrderStatus.Created,
    ticket: ticket,
  })

  await order.save()

  const response2 = await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', global.signin())
    .send()

  expect(response2.status).toBe(204)
  expect(natsWrapper.client.publish).toBeCalled()
})
