import { Request, Response, NextFunction } from 'express';

import R from '../tools/response';
import HttpStatus from '../tools/http-status';
import G from '../tools/glossary';
import { ApiKeyManager } from '../tools/api-key-manager';
import Client from '../class/Client';

// Map pour stocker les tentatives par IP
const attemptTracker: Map<string, number> = new Map();
const MAX_ATTEMPTS = 4;

export default class ApiKeyMiddleware {
  public static async validateKey(req: Request, res: Response, next: NextFunction) {
    try {
      const clientIp = req.ip || req.connection.remoteAddress || 'unknown';

      const apiKey: string | undefined =
        (req.headers['pcr-api-key'] as string) ||
        (req.headers.authorization as string)?.replace('Bearer ', '');
      const apiSignature =
        (req.headers['pcr-api-secret'] as string) ||
        (req.headers.authorization as string)?.replace('Bearer ', '');

      const token = `${apiKey || ''}.${apiSignature || ''}`;

      if (!apiKey) {
        return R.handleError(res, HttpStatus.UNAUTHORIZED, G.unauthorizedAccess);
      }

      const clientSecret = await Client.getByToken(apiKey);
      console.log(`clientSecret is:`, clientSecret?.getSecret());

      const isValid = ApiKeyManager.verify(token, clientSecret?.getSecret()!);

      if (!isValid) {
        // Incrémenter le compteur
        const attempts = attemptTracker.get(clientIp) || 0;
        attemptTracker.set(clientIp, attempts + 1);

        if (attempts + 1 >= MAX_ATTEMPTS) {
          return R.handleError(res, HttpStatus.TOO_MANY_REQUESTS, [
            `Trop de tentatives de connexion. Accès bloqué.`,
          ]);
        }

        return R.handleError(res, HttpStatus.BAD_REQUEST, G.authenticationFailed);
      }

      // Auth réussie : réinitialiser les tentatives
      attemptTracker.delete(clientIp);
      next();
    } catch (error: any) {
      return R.handleError(res, HttpStatus.INTERNAL_ERROR, error.message);
    }
  }
}
