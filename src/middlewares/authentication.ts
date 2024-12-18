import jwt, { JsonWebTokenError } from 'jsonwebtoken';

import { config } from '../config';
import { Authentication, VerifyToken } from '../types/Authentication';

const authentication: Authentication = (request, response, next) => {
  const token = request.headers.authorization;
  jwt.verify(token, config.JWT_SECRET, (error: JsonWebTokenError, _: never) => {
    if (error) {
      response.json(' Token not provided!');
    } else {
      next();
    }
  });
};

export const verifyToken: VerifyToken = (token) => {
  const parsedToken = Array.isArray(token) ? token[0] : token;
  try {
    const decoded = jwt.verify(parsedToken, config.JWT_SECRET);
    return decoded;
  } catch (error) {
    return false;
  }
};

export default authentication;
