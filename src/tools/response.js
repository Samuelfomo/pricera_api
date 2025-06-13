'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var http_status_1 = require('./http-status');
var R = /** @class */ (function () {
  function R() {}
  /**
   * Handle successful JSON response
   */
  R.handleSuccess = function (res, structure, httpCode) {
    if (httpCode === void 0) {
      httpCode = http_status_1.default.SUCCESS;
    }
    res.status(httpCode).json({
      status: true,
      response: structure,
    });
  };
  R.handleCreated = function (res, structure) {
    this.handleSuccess(res, structure, http_status_1.default.CREATED);
  };
  /**
   * Handle error JSON response
   */
  R.handleError = function (res, httpCode, message, code) {
    res.status(httpCode).json({
      status: false,
      error: {
        code: code !== null && code !== void 0 ? code : '',
        message: message,
      },
    });
  };
  R.handleNoContent = function (res) {
    res.status(http_status_1.default.NO_CONTENT);
  };
  return R;
})();
exports.default = R;
