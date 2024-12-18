import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';

export type Authentication = (request: Request, response: Response, next: NextFunction) => void;

export type VerifyToken = (token: string | string[]) => string | jwt.JwtPayload | false;
