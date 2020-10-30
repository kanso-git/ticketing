import { Ticket } from '../ticket'
import request from 'supertest'
import { app } from '../../app'

it('implmeents optimistic concurreny control ', async (done) => {
  const ticket = Ticket.build({ title: 'Bouza', price: 10, userId: 'user1' })
  await ticket.save()
  const instance1 = await Ticket.findById(ticket.id)
  const instance2 = await Ticket.findById(ticket.id)

  instance1!.price = 10
  await instance1!.save()

  try {
    instance2!.price = 13
    await instance2!.save()
  } catch (err) {
    return done()
  }
  throw new Error('SHould not reach this point')
})

it('increments the version number on multiple updates', async () => {
  const ticket = Ticket.build({ title: 'Bouza', price: 10, userId: 'user1' })
  await ticket.save()
  expect(ticket.version).toBe(0)

  const instance1 = await Ticket.findById(ticket.id)
  instance1!.price = 10
  await instance1!.save()
  expect(instance1!.version).toBe(1)

  const instance2 = await Ticket.findById(ticket.id)

  instance2!.price = 13
  await instance2!.save()
  expect(instance2!.version).toBe(2)
})
