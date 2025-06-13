'use strict';
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create((typeof Iterator === 'function' ? Iterator : Object).prototype);
    return (
      (g.next = verb(0)),
      (g['throw'] = verb(1)),
      (g['return'] = verb(2)),
      typeof Symbol === 'function' &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError('Generator is already executing.');
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y['return']
                  : op[0]
                    ? y['throw'] || ((t = y['return']) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
Object.defineProperty(exports, '__esModule', { value: true });
var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var response_1 = require('../tools/response');
var http_status_1 = require('../tools/http-status');
var constant_1 = require('./constant');
var Auth = /** @class */ (function () {
  function Auth() {}
  Auth.verify = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/];
      });
    });
  };
  Auth.generateUUID = function (res) {
    return __awaiter(this, void 0, void 0, function () {
      var uuid;
      return __generator(this, function (_a) {
        try {
          uuid = crypto.randomUUID();
          if (!uuid) {
            return [
              2 /*return*/,
              response_1.default.handleError(
                res,
                http_status_1.default.BAD_REQUEST,
                '\u00E9chec de la generation du UUID',
                'uuid_generator_failed'
              ),
            ];
          }
          return [2 /*return*/, response_1.default.handleSuccess(res, { uuid: uuid })];
        } catch (error) {
          return [
            2 /*return*/,
            response_1.default.handleError(
              res,
              http_status_1.default.INTERNAL_ERROR,
              error.message,
              'Internal_server_error'
            ),
          ];
        }
        return [2 /*return*/];
      });
    });
  };
  Auth.generateToken = function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, version, name, appCode, identified, userData, payload, secret, options;
      return __generator(this, function (_b) {
        (_a = req.body),
          (version = _a.version),
          (name = _a.name),
          (appCode = _a.appCode),
          (identified = _a.identified);
        try {
          if (!version || !name.trim() || !appCode || !identified) {
            return [
              2 /*return*/,
              response_1.default.handleError(
                res,
                http_status_1.default.NOT_FOUND,
                'Les entrees sont requises',
                'missing_required_fields'
              ),
            ];
          }
          if (
            version !== constant_1.default.config.version ||
            name !== constant_1.default.config.name ||
            appCode !== constant_1.default.config.appCode
          ) {
            return [
              2 /*return*/,
              response_1.default.handleError(
                res,
                http_status_1.default.UNAUTHORIZED,
                'Acc\u00E8s non autoris\u00E9',
                'client_authorization_refused'
              ),
            ];
          }
          userData = req.body;
          payload = {
            uuid: userData.identified,
          };
          secret = constant_1.default.token.secret;
          options = {
            expiresIn: constant_1.default.token.expiresIn,
          };
          return [
            2 /*return*/,
            response_1.default.handleSuccess(res, { token: jwt.sign(payload, secret, options) }),
          ];
        } catch (error) {
          return [
            2 /*return*/,
            response_1.default.handleError(
              res,
              http_status_1.default.INTERNAL_ERROR,
              error.message,
              'internal_server_error'
            ),
          ];
        }
        return [2 /*return*/];
      });
    });
  };
  return Auth;
})();
exports.default = Auth;
