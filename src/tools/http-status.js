'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var HttpStatus = /** @class */ (function () {
  function HttpStatus() {}
  HttpStatus.SUCCESS = 200;
  HttpStatus.CREATED = 201;
  HttpStatus.NO_CONTENT = 204;
  HttpStatus.NOT_FOUND = 404;
  HttpStatus.INTERNAL_ERROR = 500;
  HttpStatus.BAD_REQUEST = 400;
  HttpStatus.UNAUTHORIZED = 401;
  HttpStatus.FORBIDDEN = 403;
  HttpStatus.CONFLICT = 409;
  HttpStatus.NOT_IMPLEMENTED = 501;
  HttpStatus.SERVER_UNAVAILABLE = 503;
  return HttpStatus;
})();
exports.default = HttpStatus;
