process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
const BASE_URL = '192.168.99.102'
const axios = require('axios')

const cookie =
  'express:sess=eyJqd3QiOiJleUpoYkdjaU9pSklVekkxTmlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKcFpDSTZJalZtT1RNM016UmxOVGxsTm1OaU1EQXhNVEZqT0RBME55SXNJbVZ0WVdsc0lqb2lkR1Z6ZEVCMFpYTjBMbU52YlNJc0ltbGhkQ0k2TVRZd016VTNNakV6TW4wLkhTZC1fOGxfcERjRW5vUEpHU1JCVUxld0ZBZjJjQ25Kai1lR0JBaFlYNlUifQ=='

const doRequest = async () => {
  const { data } = await axios.post(
    `https://${BASE_URL}/api/tickets`,
    { title: 'ticket', price: 5 },
    {
      headers: { cookie },
    },
  )
  console.log(data)
  await axios.put(
    `https://${BASE_URL}/api/tickets/${data.ticket.id}`,
    { title: 'ticket', price: 10 },
    {
      headers: { cookie },
    },
  )

  axios.put(
    `https://${BASE_URL}/api/tickets/${data.ticket.id}`,
    { title: 'ticket', price: 15 },
    {
      headers: { cookie },
    },
  )

  console.log('Request complete')
}

;(async () => {
  for (let i = 0; i < 200; i++) {
    doRequest()
  }
})()
