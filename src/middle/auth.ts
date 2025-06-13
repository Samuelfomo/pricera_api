import * as crypto from 'crypto';

import { Response, Request, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { SignOptions, JwtPayload } from 'jsonwebtoken';

import R from '../tools/response';
import HttpStatus from '../tools/http-status';
import Constant from './constant';
import G from '../tools/glossary';

interface AuthenticatedRequest extends Request {
  user?: string | JwtPayload;
}

export default class Auth {
  static async verify(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return R.handleError(res, HttpStatus.UNAUTHORIZED, G.tokenIsRequired);
    }
    const token = authHeader.split(' ')[1];
    try {
      req.user = jwt.verify(token, Constant.token.secret);

      if (!req.user) {
        return R.handleError(res, HttpStatus.UNAUTHORIZED, G.authenticationFailed);
      }

      console.log(req.user);

      next();
    } catch (error: any) {
      return R.handleError(res, HttpStatus.FORBIDDEN, { code: error.code, message: error.message });
    }
  }

  // static async verify(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  //   try {
  //     const authHeader = req.headers.authorization;
  //
  //     // Vérification de la présence du header Authorization
  //     if (!authHeader || !authHeader.startsWith('Bearer ')) {
  //       return R.handleError(
  //         res,
  //         HttpStatus.UNAUTHORIZED,
  //         `Token d'autorisation requis. Format: Bearer <token>`,
  //         `authorization_required`
  //       );
  //     }
  //
  //     // Extraction du token
  //     const token = authHeader.split(' ')[1];
  //
  //     // Vérification que le token n'est pas vide
  //     if (!token || token.trim() === '') {
  //       return R.handleError(res, HttpStatus.UNAUTHORIZED, `Token vide ou invalide`, `empty_token`);
  //     }
  //     console.log(token);
  //
  //     // Vérification et décodage du token
  //     const decoded = jwt.verify(token, Constant.token.secret as string);
  //
  //     // Vérification que le payload contient les informations nécessaires
  //     if (typeof decoded === 'object' && decoded !== null) {
  //       // Vérifier que l'UUID est présent dans le payload
  //       if (!decoded.uuid) {
  //         return R.handleError(
  //           res,
  //           HttpStatus.FORBIDDEN,
  //           `Token invalide: UUID manquant`,
  //           `invalid_token_payload`
  //         );
  //       }
  //
  //       req.user = decoded;
  //     } else {
  //       return R.handleError(
  //         res,
  //         HttpStatus.FORBIDDEN,
  //         `Format de token invalide`,
  //         `invalid_token_format`
  //       );
  //     }
  //
  //     next();
  //   } catch (error: any) {
  //     // Gestion des différents types d'erreurs JWT
  //     let errorMessage = 'Token invalide';
  //     let errorCode = 'invalid_token';
  //
  //     if (error.name === 'TokenExpiredError') {
  //       errorMessage = 'Token expiré';
  //       errorCode = 'token_expired';
  //     } else if (error.name === 'JsonWebTokenError') {
  //       errorMessage = 'Token malformé';
  //       errorCode = 'malformed_token';
  //     } else if (error.name === 'NotBeforeError') {
  //       errorMessage = 'Token pas encore valide';
  //       errorCode = 'token_not_active';
  //     }
  //
  //     return R.handleError(res, HttpStatus.FORBIDDEN, errorMessage, errorCode);
  //   }
  // }

  static async generateUUID(res: Response): Promise<void> {
    try {
      const uuid: string = crypto.randomUUID();

      if (!uuid) {
        return R.handleError(res, HttpStatus.BAD_REQUEST, G.UUIDGeneratorFailed);
      }

      return R.handleSuccess(res, { uuid: uuid });
    } catch (error: any) {
      return R.handleError(res, HttpStatus.INTERNAL_ERROR, error.message);
    }
  }

  static async generateToken(req: Request, res: Response): Promise<void> {
    if (!req.body) {
      return R.handleError(res, HttpStatus.BAD_REQUEST, G.requestBodyRequired);
    }
    const { version, name, appCode, identified } = req.body;

    try {
      if (!version || !name || !appCode || !identified) {
        return R.handleError(res, HttpStatus.BAD_REQUEST, G.missingRequired);
      }

      if (typeof name !== 'string' || !name.trim()) {
        return R.handleError(res, HttpStatus.BAD_REQUEST, G.missingRequired);
      }

      if (
        version !== Constant.config.version ||
        name.trim() !== Constant.config.name ||
        appCode !== Constant.config.appCode
      ) {
        return R.handleError(res, HttpStatus.UNAUTHORIZED, G.unauthorizedAccess);
      }

      const userData = req.body;

      const payload = {
        uuid: userData.identified,
      };

      const secret = Constant.token.secret as string;
      const options: SignOptions = {
        expiresIn: Constant.token.expiresIn,
      };

      return R.handleSuccess(res, { token: jwt.sign(payload, secret, options) });
    } catch (error: any) {
      return R.handleError(res, HttpStatus.INTERNAL_ERROR, error.message);
    }
  }
}
