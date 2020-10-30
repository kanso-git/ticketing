import express from 'express'
import { currentUser, requireAuth } from '@kansotickets/common'

const router = express.Router()

router.post('/api/users/signout', currentUser, requireAuth, (req, res) => {
  req.session = null
  res.status(200).send({ loggedOut: true })
})

export { router as signoutRouter }
