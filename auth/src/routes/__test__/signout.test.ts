import request from 'supertest'
import { app } from '../../app'

it('clears the cookie after signing out', async () => {
  let response = await global.signin()
  expect(response.status).toBe(201)

  const response2 = await request(app)
    .post('/api/users/signout')
    .set('Cookie', response.get('Set-Cookie'))
    .send({})
    .expect(200)

  expect(response2.get('Set-Cookie')[0]).toEqual(
    'express:sess=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly',
  )
})
