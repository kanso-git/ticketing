import { body } from 'express-validator'
import request from 'supertest'

import { app } from '../../app'
import { Ticket } from '../../models/ticket'

import { natsWrapper } from '../../nats-wrapper'

it('has a route handler listening to /api/tickets for post requests', async () => {
  const response = await request(app).post('/api/tickets').send({})
  expect(response.status).not.toBe(404)
})

it('can only be accessed if the user is signed in', async () => {
  const response = await request(app).post('/api/tickets').send({})
  expect(response.status).toBe(401)
})

it('return a status other than 401 if the user is signed in', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({})
  expect(response.status).not.toBe(401)
})

it('returns an error if an invalid title is provided', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ title: '', price: 19 })
    .expect(400)
})

it('returns an error is an invalid price is provided', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ title: 'Bouza', price: -10 })

  expect(response.status).toBe(400)
})

it('creates a ticket with valid inputs', async () => {
  let tickets = await Ticket.find({})
  expect(tickets.length).toEqual(0)

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ title: 'Bouza', price: 10 })

  tickets = await Ticket.find({})
  expect(tickets.length).toEqual(1)
  expect(response.status).toBe(201)
})

it('should send an event after ticket creation', async () => {
  let tickets = await Ticket.find({})
  expect(tickets.length).toEqual(0)

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ title: 'Bouza', price: 10 })

  tickets = await Ticket.find({})

  expect(tickets.length).toEqual(1)
  expect(response.status).toBe(201)
  expect(natsWrapper.client.publish).toBeCalled()
})
