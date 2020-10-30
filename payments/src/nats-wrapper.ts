import nats, { Stan } from 'node-nats-streaming'

//This class used to simulate the behavior of mango client
class NatsWrapper {
  private _client?: Stan

  get client() {
    if (!this._client) {
      throw new Error('Cannot access NATS client before connecting ')
    }
    return this._client
  }
  connect(clusterId: string, clientName: string, url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this._client = nats.connect(clusterId, clientName, {
        url: url,
      })

      // we should  wait to connect
      this._client!.on('connect', async () => {
        console.log('Publisher connected to NATS')
        resolve()
      })
      this._client!.on('error', function (error) {
        console.log('Erro to connect stan', error)
        reject(error)
      })
    })
  }
}
const natsWrapper = new NatsWrapper()

export { natsWrapper }

/*

  // This class used to make sure only one instance of Stan is available
 
 export class NatsClient {
  private static instance: Stan

  static getInstance(): Promise<Stan> {
    return new Promise((resolve, reject) => {
      if (!NatsClient.instance) {
        const stan = nats.connect('ticketing', 'abc', {
          url: 'http://localhost:4222',
        })

        // we should  wait to connect
        stan.on('connect', async () => {
          console.log('Publisher connected to NATS')
          NatsClient.instance = stan
          resolve(stan)
        })
        stan.on('error', function (error) {
          console.log('Erro to connect stan', error)
        })
      }
      return resolve(NatsClient.instance)
    })
  }
}
*/
