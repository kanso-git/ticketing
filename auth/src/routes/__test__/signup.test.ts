import request from 'supertest'
import { app } from '../../app'

/**
 * test(name, fn, timeout)
 * Also under the alias: it(name, fn, timeout)
 */

it('returns a 201 on successful signup', async () => {
  let response = await global.signin()
  expect(response.status).toBe(201)
})

it('returns a 400 on invalid email', async () => {
  let response = await global.signin({
    email: 'test@tesom',
    password: 'password',
  })
  expect(response.status).toBe(400)
})

it('returns a 400 on invalid password', async () => {
  let response = await global.signin({
    email: 'test@tes.com',
    password: 'p',
  })
  expect(response.status).toBe(400)
})

it('returns a 400 on missing email and password', async () => {
  let response = await global.signin({
    email: '',
    password: '',
  })
  expect(response.status).toBe(400)
})

it('returns a 400 on missing email and password splited', async () => {
  let response1 = await global.signin({
    email: 'test@test.com',
    password: '',
  })
  expect(response1.status).toBe(400)

  let response2 = await global.signin({
    email: '',
    password: 'password',
  })
  expect(response2.status).toBe(400)
})

it('disallows duplicate emails', async () => {
  // singup with a user
  let response1 = await global.signin({
    email: 'test@test.com',
    password: 'password',
  })
  expect(response1.status).toBe(201)
  // rety to signup again with the same user
  let response2 = await global.signin({
    email: 'test@test.com',
    password: 'password',
  })
  expect(response2.status).toBe(400)
})

it('disallows duplicate emails with case sensitive', async () => {
  // singup with a user
  let response1 = await global.signin({
    email: 'test@test.com',
    password: 'password',
  })
  expect(response1.status).toBe(201)
  // rety to signup again with the same user with uppercase this time
  let response2 = await global.signin({
    email: 'Test@test.com',
    password: 'password',
  })
  expect(response2.status).toBe(400)
})

it('should  contain Set-Cookie response header', async () => {
  const response = await global.signin()
  expect(response.get('Set-Cookie')).toBeDefined()
  expect(response.status).toBe(201)
})
