import React, { useState } from 'react'
import Router from 'next/router'
import { useRequest } from '../../hooks/use-request'

const SignIn = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const { doRequest, errors } = useRequest({
    url: '/api/users/signin',
    method: 'post',
    body: {
      email,
      password,
    },
    onSuccess: () => {
      Router.push('/')
    },
  })
  const handleSubmit = async (e) => {
    e.preventDefault()
    await doRequest()
  }
  return (
    <form onSubmit={handleSubmit}>
      <h1>Sign In</h1>
      <div className="form-group">
        <label>Email address</label>
        <input
          className="form-control"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        ></input>
      </div>
      <div className="form-group">
        <label>password</label>
        <input
          className="form-control"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        ></input>
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
          Sign In
        </button>
      </div>
    </form>
  )
}

export default SignIn
