import request from 'supertest'
import { app } from '../../app'

it('should return the current user after successful login', async () => {
  let response = await global.signin()

  console.log(response.get('Set-Cookie'))
  const resp = await request(app)
    .get('/api/users/currentUser')
    .set('Cookie', response.get('Set-Cookie'))
    .send({})
    .expect(300)

  expect(resp.body.currentUser.email).toBe('test@test.com')
})

it('should return currentUser null wehn not authneticated', async () => {
  const resp = await request(app)
    .get('/api/users/currentUser')
    .send({})
    .expect(200)

  expect(resp.body.currentUser).toBeNull()
})
