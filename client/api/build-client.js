import axios from 'axios'

// baseURL: 'http://ingress-nginx.ingress-nginx.svc.cluster.local',
//  baseURL: 'http://ingress-nginx-controller.kube-system.svc.cluster.local',
export default ({ req }) => {
  if (typeof window === 'undefined') {
    // We must be on the server
    return axios.create({
      baseURL: 'http://ingress-nginx.ingress-nginx.svc.cluster.local',
      headers: req.headers,
    })
  } else {
    // We must be on the browser
    return axios.create({
      baseURL: '/',
    })
  }
}
