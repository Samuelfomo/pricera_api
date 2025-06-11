import crypto from 'crypto';

import { Response } from 'express';

import R from '../tools/response';
import HttpStatus from '../tools/httpStatus';

export default class Auth {
  static async verify(): Promise<void> {
    // Méthode à implémenter
  }

  static async generateUUID(res: Response): Promise<void> {
    try {
      const uuid: string = crypto.randomUUID();

      if (!uuid) {
        return R.handleError(
          res,
          HttpStatus.httpStatusBadRequest,
          'echec de la generation du UUID',
          'uuid_generator_failed'
        );
      }

      return R.handleSuccess(res, HttpStatus.httpStatusSuccess, { uuid: uuid });
    } catch (error: any) {
      return R.handleError(
        res,
        HttpStatus.httpStatusInternalError,
        error.message,
        'Internal_server_error'
      );
    }
  }

  static async generateToken(res: Response, data: Object): Promise<void> {
    try {
      if (!data) {
        return R.handleError(
          res,
          HttpStatus.httpStatusNotFound,
          'les entrees sont requises',
          'missing_required_fields'
        );
      }
    } catch (error: any) {
      return R.handleError(
        res,
        HttpStatus.httpStatusInternalError,
        error.message,
        'Internal_server_error'
      );
    }
  }
}
