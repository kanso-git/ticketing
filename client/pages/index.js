import Link from 'next/link'

const LandingPage = ({ currentUser, tickets }) => {
  const ticketList = tickets.map((t) => (
    <tr key={t.id}>
      <td>{t.title}</td>
      <td>{t.price}</td>
      <td>
        <Link href={`/tickets/${t.id}`}>
          <a>View</a>
        </Link>
      </td>
    </tr>
  ))

  return (
    <div>
      <h1>Tickets</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>{ticketList}</tbody>
      </table>
    </div>
  )
}
LandingPage.getInitialProps = async (ctx, client, currentUser) => {
  console.log(`HomePage.getInitialProps function body the foufoun ...  `)
  const { data } = await client.get('/api/tickets')
  return data
}

export default LandingPage
