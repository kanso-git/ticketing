/**
 * the goal is to create a mok for await stripe.charges.create
 */

const stripe = {
  charges: {
    create: jest.fn().mockImplementation(() =>
      Promise.resolve({
        id: `ch_${Math.floor(Math.random() * 100000)}`,
      }),
    ), //jest.fn().mockResolvedValue({}),
  },
}

export { stripe }
