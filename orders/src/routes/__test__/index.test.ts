import request from 'supertest'
import { app } from '../../app'
import { Ticket } from '../../models/ticket'
import { Order } from '../../models/order'
import { UserPayload } from '../../test/setup'
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
  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin(user))
    .send({ ticketId: ticket.id })
}

it('returns the list of orders for a given user', async () => {
  const user1 = {
    id: 'user1',
    email: 'user1@test.com',
  }
  await createOrderForUser(1, user1)

  const user2 = {
    id: 'user2',
    email: 'user2@test.com',
  }
  await createOrderForUser(1, user2)
  await createOrderForUser(2, user2)

  const user3 = {
    id: 'user3',
    email: 'user3@test.com',
  }
  await createOrderForUser(1, user3)
  await createOrderForUser(2, user3)
  await createOrderForUser(3, user3)

  const res1 = await request(app)
    .get('/api/orders')
    .set('Cookie', global.signin(user1))
    .send({})

  expect(res1.status).toBe(200)
  expect(res1.body.length).toBe(1)

  const res2 = await request(app)
    .get('/api/orders')
    .set('Cookie', global.signin(user2))
    .send({})

  expect(res2.status).toBe(200)
  expect(res2.body.length).toBe(2)

  const res3 = await request(app)
    .get('/api/orders')
    .set('Cookie', global.signin(user3))
    .send({})

  expect(res3.status).toBe(200)
  expect(res3.body.length).toBe(3)
})
