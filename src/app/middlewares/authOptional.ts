import { NextFunction, Request, Response } from 'express';
import { Secret } from 'jsonwebtoken';
import config from '../../config';
import { jwtHelper } from '../../helpers/jwtHelper';

const authOptional = () => async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tokenWithBearer = req.headers.authorization;
    if (tokenWithBearer && tokenWithBearer.startsWith('Bearer')) {
      const token = tokenWithBearer.split(' ')[1];

      try {
        // verify token
        const verifyUser = jwtHelper.verifyToken(token, config.jwt.jwt_secret as Secret);
        // set user to req.user
        req.user = verifyUser;
      } catch (error) {
        // If token invalid, just proceed without req.user
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};

export default authOptional;
