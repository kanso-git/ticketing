import mongoose from 'mongoose'
import request from 'supertest'
import { app } from '../../app'

it('retuns a 404 NOT FOUND when ticket is not found', async () => {
  await request(app)
    .get(`/api/tickets/${mongoose.Types.ObjectId().toHexString()}`)
    .send({})
    .expect(404)
})

it('returns the ticket if you search an existing ticket', async () => {
  const title = 'A dog'
  const price = 10

  const res = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ title, price })

  expect(res.status).toBe(201)

  const res2 = await request(app)
    .get(`/api/tickets/${res.body.ticket.id}`)
    .send({})

  expect(res2.body.ticket.title).toBe(title)
  expect(res2.body.ticket.price).toBe(price)
})
