import jwt from 'jsonwebtoken'

export class JwtUtils {
  static sign(payload: string | object | Buffer) {
    return jwt.sign(payload, process.env.JWT_KEY!)
  }

  static verify(token: string) {
    return jwt.verify(token, process.env.JWT_KEY!)
  }
}
