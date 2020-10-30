import { useState } from 'react'
import axios from 'axios'

// method get post patch delete
const useRequest = ({ url, method, body, onSuccess }) => {
  const [errors, setErrors] = useState([])

  const doRequest = async (props = {}) => {
    try {
      setErrors([])
      const response = await axios[method](url, {
        ...body,
        ...props,
      })
      if (onSuccess) {
        onSuccess(response.data)
      }
      return response.data
    } catch (error) {
      setErrors(error.response.data.errors)
    }
  }
  return { doRequest, errors }
}
export { useRequest }
