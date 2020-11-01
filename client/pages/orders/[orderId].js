import { useState, useEffect } from 'react'
import Router from 'next/router'
import StripeCheckout from 'react-stripe-checkout'
import { useRequest } from '../../hooks/use-request'

const OrderShow = ({ order, currentUser }) => {
  const [time, setTime] = useState(0)

  const { doRequest, errors } = useRequest({
    url: '/api/payments',
    method: 'post',
    body: {
      orderId: order.id,
    },
    onSuccess: (data) => {
      console.log(data)
      Router.push('/orders')
    },
  })

  const renderPaymentBlock = () => {
    if (time > 0) {
      return (
        <div>
          <h4> ${time} seconds until order expires</h4>
          <StripeCheckout
            token={({ id }) => doRequest({ token: id })}
            amount={order.ticket.price * 100}
            email={currentUser.email}
            stripeKey={process.env.NEXT_PUBLIC_STRIPE_KEY}
          />
          {errors.length > 0 && (
            <div className="alert alert-danger">
              <h4>Ooops ...</h4>
              <ul className="my-0">
                {errors.map((e) => (
                  <li key={e.message}> {e.message}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )
    }
    return <label>Sorry order has been expired</label>
  }

  useEffect(() => {
    const msLeft = () => {
      setTime(Math.round((new Date(order.expiresAt) - new Date()) / 1000))
    }
    msLeft()
    const timerId = setInterval(msLeft, 1000)
    return () => {
      clearInterval(timerId)
    }
  }, [])

  return (
    <div>
      <h1>Purchasing : {order.ticket.title}</h1>
      <h4>Price:{order.ticket.price}</h4>
      {renderPaymentBlock()}
    </div>
  )
}

OrderShow.getInitialProps = async (context, client) => {
  const { orderId } = context.query
  console.log(orderId)
  const { data } = await client.get(`/api/orders/${orderId}`)
  return { order: data }
}

export default OrderShow
