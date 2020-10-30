import { useState } from 'react'
import Router from 'next/router'
import { useRequest } from '../../hooks/use-request'

const NewTicket = () => {
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')

  const handleOnBlur = () => {
    const value = parseFloat(price)
    if (isNaN(value)) {
      return
    }
    setPrice(value.toFixed(2))
  }

  const { doRequest, errors } = useRequest({
    url: '/api/tickets',
    method: 'post',
    body: {
      title,
      price,
    },
    onSuccess: (ticket) => {
      console.log(ticket)
      Router.push('/')
    },
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    await doRequest()
  }
  return (
    <div>
      <h1> Create a Ticket</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input
            value={title}
            className="form-control"
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Price</label>
          <input
            value={price}
            className="form-control"
            onBlur={handleOnBlur}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        <div>
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
          <button type="submit" className="btn btn-primary">
            Submit
          </button>
        </div>
      </form>
    </div>
  )
}
export default NewTicket
