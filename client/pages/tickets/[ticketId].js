import { useRequest } from '../../hooks/use-request'
import Router from 'next/router'

const TicketShow = ({ ticket }) => {
  const { doRequest, errors } = useRequest({
    url: '/api/orders/',
    method: 'post',
    body: {
      ticketId: ticket.id,
    },
    onSuccess: (data) => {
      Router.push(`/orders/${data.id}`)
    },
  })

  return (
    <div>
      <h1>{ticket.title}</h1>
      <h4>Price:{ticket.price}</h4>
      <button className="btn btn-primary" onClick={() => doRequest()}>
        Purchase
      </button>
      <br />
      <br />
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

TicketShow.getInitialProps = async (context, client) => {
  const { ticketId } = context.query
  console.log(ticketId)
  const { data } = await client.get(`/api/tickets/${ticketId}`)
  return data
}

export default TicketShow
