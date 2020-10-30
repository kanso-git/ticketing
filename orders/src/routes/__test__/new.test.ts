import { body } from 'express-validator'
import request from 'supertest'

import { app } from '../../app'
import { Ticket } from '../../models/ticket'
import { Order } from '../../models/order'

import { natsWrapper } from '../../nats-wrapper'
import mongoose from 'mongoose'

it('has a route handler listening to /api/orders for post requests', async () => {
  const response = await request(app).post('/api/orders').send({})
  expect(response.status).not.toBe(404)
})

it('can only be accessed if the user is signed in', async () => {
  const response = await request(app).post('/api/orders').send({})
  expect(response.status).toBe(401)
})

it('return a status other than 401 if the user is signed in', async () => {
  const response = await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({})
  expect(response.status).not.toBe(401)
})

it('returns an error if an invalid ticketId is provided', async () => {
  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: 'uuewueuwu' })
    .expect(400)
})

it('returns an error if the ticket does not exist', async () => {
  // generate a valid mongoose type id
  const fakeTicketId = mongoose.Types.ObjectId().toHexString()

  const resp = await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: fakeTicketId })

  expect(resp.status).toBe(404)
})

it('returns an error if the ticket is already reserved', async () => {
  // verify that no orders in the db
  let orders = await Order.find({})
  expect(orders.length).toEqual(0)

  // create a valid ticket
  const ticket = Ticket.build({
    price: 15,
    title: '3anzeh',
    id: mongoose.Types.ObjectId().toHexString(),
  })
  await ticket.save()

  // checkout the ticket  and verify that order as been created
  const resp = await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: ticket.id })

  const order = await Order.findById(resp.body.id)
  expect(order).not.toBeNull()
  expect(resp.status).toBe(201)

  // checkout the same ticket again
  const resp2 = await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: ticket.id })

  expect(resp2.status).toBe(400)
})

it('creates an order with valid inputs', async () => {
  let orders = await Order.find({})
  expect(orders.length).toEqual(0)

  const ticket = Ticket.build({
    price: 15,
    title: '3anzeh',
    id: mongoose.Types.ObjectId().toHexString(),
  })

  await ticket.save()

  const resp = await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: ticket.id })

  const order = await Order.findById(resp.body.id)
  expect(order).not.toBeNull()
  expect(resp.status).toBe(201)
})

it('should send an event after order creation', async () => {
  const ticket = Ticket.build({
    price: 15,
    title: '3anzeh',
    id: mongoose.Types.ObjectId().toHexString(),
  })

  await ticket.save()

  const response = await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: ticket.id })

  const order = await Order.findById(response.body.id)
  expect(order).not.toBeNull()

  expect(response.status).toBe(201)
  expect(natsWrapper.client.publish).toBeCalled()
})
