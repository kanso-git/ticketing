const OrderIndex = ({ orders }) => {
  return (
    <ul>
      {orders.map((o) => {
        return (
          <li key={o.id}>
            {o.ticket.title} - {o.status}
          </li>
        )
      })}
    </ul>
  )
}

OrderIndex.getInitialProps = async (context, client) => {
  const { data } = await client.get('/api/orders')

  return { orders: data }
}
export default OrderIndex
