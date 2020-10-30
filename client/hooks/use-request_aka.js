import { useState } from 'react'
import axios from 'axios'

const useRequest = (url, method, body) => {
  const [errors, setErrors] = useState([])
  const doRequest = async () => {
    try {
      await axios[method](url, body)
      setErrors([])
    } catch (error) {
      setErrors(error.response.data.errors)
      //error.response.data.errors
    }
  }
  return { doRequest, errors }
}
export { useRequest }
