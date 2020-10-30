import mongoose from 'mongoose'
import request from 'supertest'
import { app } from '../../app'
import { Ticket } from '../../models/ticket'
import { natsWrapper } from '../../nats-wrapper'

it('Returns a 404 if ticket is not found', async () => {
  const id = mongoose.Types.ObjectId().toHexString()
  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.signin())
    .send({ title: 'new title', price: 9 })
    .expect(404)
})

it('Returns a 401 if user is not authenticated', async () => {
  const id = mongoose.Types.ObjectId().toHexString()
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({ title: 'new title', price: 9 })
    .expect(401)
})

it('Returns a 401 if the user does not own the ticket', async () => {
  const res = await request(app)
    .post(`/api/tickets`)
    .set(
      'Cookie',
      global.signin({
        id: 'user2',
        email: 'user2@test.com',
      }),
    )
    .send({ title: 'new title', price: 9 })
    .expect(201)

  await request(app)
    .put(`/api/tickets/${res.body.ticket.id}`)
    .set('Cookie', global.signin())
    .send({ title: 'new title', price: 9 })
    .expect(401)
})

it('Returns a 400 if user provide an invalid title or price', async () => {
  const res = await request(app)
    .post(`/api/tickets`)
    .set('Cookie', global.signin())
    .send({ title: 'new title', price: 9 })
    .expect(201)

  await request(app)
    .put(`/api/tickets/${res.body.ticket.id}`)
    .set('Cookie', global.signin())
    .send({ title: '', price: -9 })
    .expect(400)

  await request(app)
    .put(`/api/tickets/${res.body.ticket.id}`)
    .set('Cookie', global.signin())
    .send({ title: 'new title', price: -9 })
    .expect(400)
})

it('It rejects update is ticket is reserved', async () => {
  const res = await request(app)
    .post(`/api/tickets`)
    .set('Cookie', global.signin())
    .send({ title: 'new title', price: 9 })
    .expect(201)

  //reserve the ticket
  const ticket = await Ticket.findById(res.body.ticket.id)
  ticket!.set({ orderId: mongoose.Types.ObjectId().toHexString() })
  await ticket!.save()

  const res2 = await request(app)
    .put(`/api/tickets/${res.body.ticket.id}`)
    .set('Cookie', global.signin())
    .send({ title: 'updated title', price: 19 })

  expect(res2.status).toBe(400)
})

it('It update ticket if the user provide valid title and price', async () => {
  const res = await request(app)
    .post(`/api/tickets`)
    .set('Cookie', global.signin())
    .send({ title: 'new title', price: 9 })
    .expect(201)

  const res2 = await request(app)
    .put(`/api/tickets/${res.body.ticket.id}`)
    .set('Cookie', global.signin())
    .send({ title: 'updated title', price: 19 })

  expect(res2.status).toBe(200)

  const res3 = await request(app)
    .get(`/api/tickets/${res.body.ticket.id}`)
    .send({})

  expect(res3.body.ticket.title).toEqual('updated title')
  expect(res3.body.ticket.price).toEqual(19)
})

it('should send an event after ticket update', async () => {
  const res = await request(app)
    .post(`/api/tickets`)
    .set('Cookie', global.signin())
    .send({ title: 'new title', price: 9 })
    .expect(201)

  const res2 = await request(app)
    .put(`/api/tickets/${res.body.ticket.id}`)
    .set('Cookie', global.signin())
    .send({ title: 'updated title', price: 19 })

  expect(res2.status).toBe(200)

  const res3 = await request(app)
    .get(`/api/tickets/${res.body.ticket.id}`)
    .send({})

  expect(res3.body.ticket.title).toEqual('updated title')
  expect(res3.body.ticket.price).toEqual(19)
  expect(natsWrapper.client.publish).toBeCalled()
})
