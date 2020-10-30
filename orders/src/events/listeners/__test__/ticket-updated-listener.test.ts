import { TicketUpdatedEvent } from '@kansotickets/common'
import { Message } from 'node-nats-streaming'
import mongoose from 'mongoose'
import { natsWrapper } from '../../../nats-wrapper'
import { TicketUpdatedListener } from '../ticket-updated-listener'
import { Ticket } from '../../../models/ticket'

async function setup() {
  const ticket = Ticket.build({
    price: 10,
    title: '3anzeh',
    id: mongoose.Types.ObjectId().toHexString(),
  })
  await ticket.save()

  const listener = new TicketUpdatedListener(natsWrapper.client)
  const data: TicketUpdatedEvent['data'] = {
    id: ticket.id,
    price: 100,
    title: '3anzeh100',
    userId: mongoose.Types.ObjectId().toHexString(),
    version: 1,
  }

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  }
  return { listener, data, msg }
}
it('invoks the onMessage function and creates the ticket', async () => {
  //
  const { listener, data, msg } = await setup()
  await listener.onMessage(data, msg)
  const t = await Ticket.findById(data.id)
  expect(t!.id).toBe(data.id)
  expect(t!.version).toBe(1)
})

it('aks the message', async () => {
  //
  const { listener, data, msg } = await setup()
  await listener.onMessage(data, msg)
  const t = await Ticket.findById(data.id)
  expect(t!.id).toBe(data.id)
  expect(msg.ack).toBeCalled()
})

it('does not call aks if the event has a skipped version number', async (done) => {
  //
  const { listener, data, msg } = await setup()
  data.version = 10

  try {
    await listener.onMessage(data, msg)
    throw new Error('Wrong to reach here')
  } catch (err) {
    expect(msg.ack).not.toBeCalled()
    done()
  }
})
