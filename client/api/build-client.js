import axios from 'axios'

//  baseURL: 'http://ingress-nginx-controller.kube-system.svc.cluster.local', //local machine
//  baseURL: 'http://www.kanso-lab.xyz/', //digital ocean
export default ({ req }) => {
  if (typeof window === 'undefined') {
    // We must be on the server
    return axios.create({
      baseURL: 'http://www.kanso-lab.xyz/',
      headers: req.headers,
    })
  } else {
    // We must be on the browser
    return axios.create({
      baseURL: '/',
    })
  }
}
