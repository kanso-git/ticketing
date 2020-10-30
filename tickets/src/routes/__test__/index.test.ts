import request from 'supertest'
import { app } from '../../app'

it('returns the list of existing tickets', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'ticket#1',
      price: 5,
    })
    .expect(201)

  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'ticket#2',
      price: 6,
    })
    .expect(201)

  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'ticket#3',
      price: 7,
    })
    .expect(201)

  const res = await request(app).get('/api/tickets').send({})

  expect(res.status).toBe(200)
  expect(res.body.tickets.length).toBe(3)
})
