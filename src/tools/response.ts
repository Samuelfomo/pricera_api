import { Response } from 'express';

import HttpStatus from './httpStatus';

export default class R {
  /**
   * Handle successful JSON response
   */
  static handleSuccess(res: Response, httpCode: number, structure: object): void {
    res.status(httpCode).json({
      status: true,
      response: structure,
    });
  }

  /**
   * Handle error JSON response
   */
  static handleError(res: Response, httpCode: number, message: string, code: string | null): void {
    res.status(httpCode).json({
      status: false,
      error: {
        code: code ?? '',
        message: message,
      },
    });
  }

  static noContent(res: Response): void {
    res.status(HttpStatus.httpStatusNoContent);
  }
}
