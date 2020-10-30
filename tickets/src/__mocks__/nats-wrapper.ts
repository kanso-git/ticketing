const natsWrapper = {
  client: {
    publish: jest
      .fn()
      .mockImplementation((s: string, d: string, f: Function) => {
        f()
      }),
  },
}

export { natsWrapper }
