import Axios from 'axios'
import Router from 'next/router'
import React, { useEffect } from 'react'

const SignedOut = () => {
  useEffect(() => {
    const handleSignOut = async (e) => {
      try {
        await Axios.post('/api/users/signout', {})
        Router.push('/')
      } catch (e) {
        console.log(e.message)
      }
    }
    handleSignOut()
    return () => {}
  }, [])
  return <div> you are signed out ....</div>
}

export default SignedOut
