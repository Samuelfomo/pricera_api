'use strict';
var __extends =
  (this && this.__extends) ||
  (function () {
    var extendStatics = function (d, b) {
      extendStatics =
        Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array &&
          function (d, b) {
            d.__proto__ = b;
          }) ||
        function (d, b) {
          for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
        };
      return extendStatics(d, b);
    };
    return function (d, b) {
      if (typeof b !== 'function' && b !== null)
        throw new TypeError('Class extends value ' + String(b) + ' is not a constructor or null');
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype = b === null ? Object.create(b) : ((__.prototype = b.prototype), new __());
    };
  })();
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
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
exports.DB = exports.Odbc = void 0;
var sequelize_1 = require('sequelize');
var Odbc = /** @class */ (function () {
  function Odbc() {
    var _newTarget = this.constructor;
    this._sequelize = null;
    this._connection = null;
    this._transaction = null;
    this._isTransactionActive = false;
    if (_newTarget === Odbc) {
      throw new Error('La classe Odbc est abstraite et ne peut pas être instanciée directement.');
    }
    this._init();
  }
  /**
   * Initialise la connexion Sequelize avec le pool
   */
  Odbc.prototype._init = function () {
    this._sequelize = new sequelize_1.Sequelize(
      process.env.DB_NAME || 'priceradb25',
      process.env.DB_USER || 'priceradmin',
      process.env.DB_PASSWORD || 'MonMotDePasseSecurise123!',
      {
        host: process.env.DB_HOST || '192.168.100.103',
        dialect: 'postgres',
        port: parseInt(process.env.DB_PORT || '5432'),
        pool: {
          max: 20,
          min: 5,
          acquire: 60000,
          idle: 10000,
          evict: 1000,
        },
        timezone: '+01:00',
        dialectOptions: {
          timezone: 'Africa/Douala',
        },
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        retry: {
          max: 3,
        },
      }
    );
  };
  /**
   * Retourne l'instance Sequelize
   */
  Odbc.prototype.getInstance = function () {
    return this._sequelize;
  };
  /**
   * Obtient ou crée une connexion (utilise le pool)
   */
  Odbc.prototype.getConnection = function () {
    return __awaiter(this, arguments, void 0, function (options) {
      if (options === void 0) {
        options = {};
      }
      return __generator(this, function (_a) {
        try {
          // Si une transaction est active, la retourner
          if (this._isTransactionActive && this._transaction) {
            return [
              2 /*return*/,
              {
                connection: this._transaction,
                isTransaction: true,
              },
            ];
          }
          // Si une connexion spécifique est passée en paramètre
          if (options.connection) {
            return [
              2 /*return*/,
              {
                connection: options.connection,
                isTransaction: options.isTransaction || false,
              },
            ];
          }
          // Utiliser le pool de connexions de Sequelize (recommandé)
          if (!this._sequelize) {
            throw new Error('Sequelize instance is not initialized');
          }
          return [
            2 /*return*/,
            {
              connection: this._sequelize,
              isTransaction: false,
            },
          ];
        } catch (error) {
          console.error("Erreur lors de l'obtention de la connexion:", error);
          throw error;
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Démarre une transaction
   */
  Odbc.prototype.beginTransaction = function () {
    return __awaiter(this, arguments, void 0, function (options) {
      var _a, error_1;
      if (options === void 0) {
        options = {};
      }
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            if (this._isTransactionActive) {
              throw new Error('Une transaction est déjà active');
            }
            if (!this._sequelize) {
              throw new Error('Sequelize instance is not initialized');
            }
            _a = this;
            return [4 /*yield*/, this._sequelize.transaction(options)];
          case 1:
            _a._transaction = _b.sent();
            this._isTransactionActive = true;
            console.log('🔄 Transaction démarrée');
            return [2 /*return*/, this._transaction];
          case 2:
            error_1 = _b.sent();
            console.error('Erreur lors du démarrage de la transaction:', error_1);
            throw error_1;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Valide (commit) la transaction
   */
  Odbc.prototype.commitTransaction = function () {
    return __awaiter(this, void 0, void 0, function () {
      var error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 4]);
            if (!this._isTransactionActive || !this._transaction) {
              throw new Error('Aucune transaction active à valider');
            }
            return [4 /*yield*/, this._transaction.commit()];
          case 1:
            _a.sent();
            this._transaction = null;
            this._isTransactionActive = false;
            console.log('✅ Transaction validée');
            return [3 /*break*/, 4];
          case 2:
            error_2 = _a.sent();
            console.error('Erreur lors de la validation de la transaction:', error_2);
            return [4 /*yield*/, this.rollbackTransaction()];
          case 3:
            _a.sent();
            throw error_2;
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Annule (rollback) la transaction
   */
  Odbc.prototype.rollbackTransaction = function () {
    return __awaiter(this, void 0, void 0, function () {
      var error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, 4, 5]);
            if (!this._transaction) return [3 /*break*/, 2];
            return [4 /*yield*/, this._transaction.rollback()];
          case 1:
            _a.sent();
            console.log('🔄 Transaction annulée');
            _a.label = 2;
          case 2:
            return [3 /*break*/, 5];
          case 3:
            error_3 = _a.sent();
            console.error("Erreur lors de l'annulation de la transaction:", error_3);
            return [3 /*break*/, 5];
          case 4:
            this._transaction = null;
            this._isTransactionActive = false;
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Exécute une fonction dans une transaction
   */
  Odbc.prototype.executeInTransaction = function (operation_1) {
    return __awaiter(this, arguments, void 0, function (operation, options) {
      var transaction, result, error_4;
      if (options === void 0) {
        options = {};
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.beginTransaction(options)];
          case 1:
            transaction = _a.sent();
            _a.label = 2;
          case 2:
            _a.trys.push([2, 5, , 7]);
            return [4 /*yield*/, operation(transaction)];
          case 3:
            result = _a.sent();
            return [4 /*yield*/, this.commitTransaction()];
          case 4:
            _a.sent();
            return [2 /*return*/, result];
          case 5:
            error_4 = _a.sent();
            return [4 /*yield*/, this.rollbackTransaction()];
          case 6:
            _a.sent();
            throw error_4;
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Teste la connexion à la base de données
   */
  Odbc.prototype.testConnection = function () {
    return __awaiter(this, void 0, void 0, function () {
      var error_5;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            if (!this._sequelize) {
              throw new Error('Sequelize instance is not initialized');
            }
            return [4 /*yield*/, this._sequelize.authenticate()];
          case 1:
            _a.sent();
            console.log('✅ Connexion à la base de données PostgreSQL réussie.');
            return [2 /*return*/, true];
          case 2:
            error_5 = _a.sent();
            console.error('❌ Échec de la connexion à la base de données:', error_5);
            throw error_5;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Ferme le pool de connexions (uniquement à l'arrêt de l'application)
   */
  Odbc.prototype.closePool = function () {
    return __awaiter(this, void 0, void 0, function () {
      var error_6;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, , 6]);
            if (!this._isTransactionActive) return [3 /*break*/, 2];
            return [4 /*yield*/, this.rollbackTransaction()];
          case 1:
            _a.sent();
            _a.label = 2;
          case 2:
            if (!this._sequelize) return [3 /*break*/, 4];
            return [4 /*yield*/, this._sequelize.close()];
          case 3:
            _a.sent();
            console.log('🔌 Pool de connexions fermé.');
            _a.label = 4;
          case 4:
            return [3 /*break*/, 6];
          case 5:
            error_6 = _a.sent();
            console.error('Erreur lors de la fermeture du pool:', error_6);
            return [3 /*break*/, 6];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get one row in table using ID
   */
  Odbc.prototype.getById = function (table_1, id_1) {
    return __awaiter(this, arguments, void 0, function (table, id, options) {
      var connection, queryOptions, entry, error_7;
      if (options === void 0) {
        options = {};
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, this.getConnection(options)];
          case 1:
            connection = _a.sent().connection;
            queryOptions = { where: { id: id } };
            if (options.isTransaction || this._isTransactionActive) {
              queryOptions.transaction = connection;
            }
            return [4 /*yield*/, table.findByPk(id, queryOptions)];
          case 2:
            entry = _a.sent();
            return [2 /*return*/, entry ? entry.toJSON() : null];
          case 3:
            error_7 = _a.sent();
            console.error('Error retrieving entry:', error_7);
            throw error_7;
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get table last autoincrement ID
   */
  Odbc.prototype.getLastId = function (table_1) {
    return __awaiter(this, arguments, void 0, function (table, options) {
      var connection, queryOptions, lastRecord, error_8;
      if (options === void 0) {
        options = {};
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, this.getConnection(options)];
          case 1:
            connection = _a.sent().connection;
            queryOptions = { order: [['id', 'DESC']] };
            if (options.isTransaction || this._isTransactionActive) {
              queryOptions.transaction = connection;
            }
            return [4 /*yield*/, table.findOne(queryOptions)];
          case 2:
            lastRecord = _a.sent();
            return [2 /*return*/, lastRecord ? lastRecord.id : 0];
          case 3:
            error_8 = _a.sent();
            console.error('Error getting last ID:', error_8);
            throw error_8;
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Generate GUID from table
   */
  Odbc.prototype.generateGuid = function (table_1) {
    return __awaiter(this, arguments, void 0, function (table, length, guid, options) {
      var connection, lastId, queryOptions, record, error_9;
      if (length === void 0) {
        length = 6;
      }
      if (guid === void 0) {
        guid = null;
      }
      if (options === void 0) {
        options = {};
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 8, , 9]);
            return [4 /*yield*/, this.getConnection(options)];
          case 1:
            connection = _a.sent().connection;
            if (!(guid === null)) return [3 /*break*/, 3];
            return [4 /*yield*/, this.getLastId(table, options)];
          case 2:
            lastId = _a.sent();
            guid = Math.pow(10, length - 1) + (lastId + 1);
            _a.label = 3;
          case 3:
            queryOptions = { where: { guid: guid } };
            if (options.isTransaction || this._isTransactionActive) {
              queryOptions.transaction = connection;
            }
            return [4 /*yield*/, table.findOne(queryOptions)];
          case 4:
            record = _a.sent();
            if (!(record === null)) return [3 /*break*/, 5];
            return [2 /*return*/, guid];
          case 5:
            return [4 /*yield*/, this.generateGuid(table, length, guid + 1, options)];
          case 6:
            return [2 /*return*/, _a.sent()];
          case 7:
            return [3 /*break*/, 9];
          case 8:
            error_9 = _a.sent();
            console.error('Error generating GUID:', error_9);
            throw error_9;
          case 9:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Génère un code alphanumérique unique
   */
  Odbc.prototype.generateUniqueCode = function (table_1) {
    return __awaiter(this, arguments, void 0, function (table, length, options) {
      function generateCode(length) {
        var result = '';
        for (var i = 0; i < length; i++) {
          var randIndex = Math.floor(Math.random() * charset.length);
          result += charset[randIndex];
        }
        return result;
      }
      var charset, connection, code, exists, queryOptions, existing, error_10;
      if (length === void 0) {
        length = 6;
      }
      if (options === void 0) {
        options = {};
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            _a.label = 1;
          case 1:
            _a.trys.push([1, 6, , 7]);
            return [4 /*yield*/, this.getConnection(options)];
          case 2:
            connection = _a.sent().connection;
            code = void 0;
            exists = true;
            _a.label = 3;
          case 3:
            if (!exists) return [3 /*break*/, 5];
            code = generateCode(length);
            queryOptions = { where: { code: code } };
            if (options.isTransaction || this._isTransactionActive) {
              queryOptions.transaction = connection;
            }
            return [4 /*yield*/, table.findOne(queryOptions)];
          case 4:
            existing = _a.sent();
            exists = existing !== null;
            return [3 /*break*/, 3];
          case 5:
            return [2 /*return*/, code];
          case 6:
            error_10 = _a.sent();
            console.error('Erreur lors de la génération du code unique:', error_10);
            throw error_10;
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Crée un enregistrement
   */
  Odbc.prototype.createRecord = function (table_1, data_1) {
    return __awaiter(this, arguments, void 0, function (table, data, options) {
      var connection, createOptions, newRecord, error_11;
      if (options === void 0) {
        options = {};
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, this.getConnection(options)];
          case 1:
            connection = _a.sent().connection;
            createOptions = {};
            if (options.isTransaction || this._isTransactionActive) {
              createOptions.transaction = connection;
            }
            return [4 /*yield*/, table.create(data, createOptions)];
          case 2:
            newRecord = _a.sent();
            return [2 /*return*/, newRecord ? newRecord.toJSON() : null];
          case 3:
            error_11 = _a.sent();
            console.error('Error creating record:', error_11);
            throw error_11;
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Met à jour un enregistrement
   */
  Odbc.prototype.updateRecord = function (table_1, id_1, data_1) {
    return __awaiter(this, arguments, void 0, function (table, id, data, options) {
      var connection, updateOptions, updatedRowsCount, error_12;
      if (options === void 0) {
        options = {};
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, , 6]);
            return [4 /*yield*/, this.getConnection(options)];
          case 1:
            connection = _a.sent().connection;
            updateOptions = { where: { id: id } };
            if (options.isTransaction || this._isTransactionActive) {
              updateOptions.transaction = connection;
            }
            return [4 /*yield*/, table.update(data, updateOptions)];
          case 2:
            updatedRowsCount = _a.sent()[0];
            if (!(updatedRowsCount > 0)) return [3 /*break*/, 4];
            return [4 /*yield*/, this.getById(table, id, options)];
          case 3:
            return [2 /*return*/, _a.sent()];
          case 4:
            return [2 /*return*/, null];
          case 5:
            error_12 = _a.sent();
            console.error('Error updating record:', error_12);
            throw error_12;
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Supprime un enregistrement
   */
  Odbc.prototype.deleteRecord = function (table_1, id_1) {
    return __awaiter(this, arguments, void 0, function (table, id, options) {
      var connection, deleteOptions, deletedRowsCount, error_13;
      if (options === void 0) {
        options = {};
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, this.getConnection(options)];
          case 1:
            connection = _a.sent().connection;
            deleteOptions = { where: { id: id } };
            if (options.isTransaction || this._isTransactionActive) {
              deleteOptions.transaction = connection;
            }
            return [4 /*yield*/, table.destroy(deleteOptions)];
          case 2:
            deletedRowsCount = _a.sent();
            return [2 /*return*/, deletedRowsCount > 0];
          case 3:
            error_13 = _a.sent();
            console.error('Error deleting record:', error_13);
            throw error_13;
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Exécute une requête personnalisée
   */
  Odbc.prototype.executeQuery = function (query_1) {
    return __awaiter(this, arguments, void 0, function (query, options) {
      var connection, queryOptions, error_14;
      if (options === void 0) {
        options = {};
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, this.getConnection(options)];
          case 1:
            connection = _a.sent().connection;
            queryOptions = __assign({}, options);
            if (options.isTransaction || this._isTransactionActive) {
              queryOptions.transaction = connection;
            }
            if (!this._sequelize) {
              throw new Error('Sequelize instance is not initialized');
            }
            return [4 /*yield*/, this._sequelize.query(query, queryOptions)];
          case 2:
            return [2 /*return*/, _a.sent()];
          case 3:
            error_14 = _a.sent();
            console.error('Error executing query:', error_14);
            throw error_14;
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Obtient les statistiques du pool de connexions
   */
  Odbc.prototype.getPoolStats = function () {
    if (
      this._sequelize &&
      this._sequelize.connectionManager &&
      this._sequelize.connectionManager.pool
    ) {
      var pool = this._sequelize.connectionManager.pool;
      return {
        total: pool.size || 0,
        active: pool.using || 0,
        idle: pool.available || 0,
        pending: pool.pending || 0,
      };
    }
    return { total: 0, active: 0, idle: 0, pending: 0 };
  };
  /**
   * Initialise les tables de la base de données (méthode statique)
   */
  Odbc.initializeTables = function () {
    return __awaiter(this, arguments, void 0, function (models, options) {
      var tempInstance,
        sequelize,
        transaction,
        syncOptions,
        _i,
        models_1,
        model,
        error_15,
        rollbackError_1,
        closeError_1;
      if (models === void 0) {
        models = [];
      }
      if (options === void 0) {
        options = {};
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            tempInstance = Object.create(Odbc.prototype);
            tempInstance._init();
            sequelize = tempInstance._sequelize;
            transaction = null;
            _a.label = 1;
          case 1:
            _a.trys.push([1, 13, 18, 23]);
            // Tester la connexion
            return [4 /*yield*/, sequelize.authenticate()];
          case 2:
            // Tester la connexion
            _a.sent();
            console.log("✅ Connexion établie pour l'initialisation des tables");
            return [4 /*yield*/, sequelize.transaction()];
          case 3:
            // Démarrer une transaction
            transaction = _a.sent();
            console.log("🔄 Transaction d'initialisation démarrée");
            syncOptions = {
              transaction: transaction,
              force: options.force || false,
              alter: options.alter || false,
            };
            if (!(models && models.length > 0)) return [3 /*break*/, 9];
            console.log(
              '\uD83D\uDCCB Synchronisation de '.concat(models.length, ' mod\u00E8le(s)...')
            );
            (_i = 0), (models_1 = models);
            _a.label = 4;
          case 4:
            if (!(_i < models_1.length)) return [3 /*break*/, 8];
            model = models_1[_i];
            if (!(model && typeof model.sync === 'function')) return [3 /*break*/, 6];
            return [4 /*yield*/, model.sync(syncOptions)];
          case 5:
            _a.sent();
            console.log(
              '\u2705 Table '.concat(model.tableName || model.name, ' synchronis\u00E9e')
            );
            return [3 /*break*/, 7];
          case 6:
            console.warn('\u26A0\uFE0F  Mod\u00E8le invalide ignor\u00E9:', model);
            _a.label = 7;
          case 7:
            _i++;
            return [3 /*break*/, 4];
          case 8:
            return [3 /*break*/, 11];
          case 9:
            // Synchroniser toutes les tables définies
            console.log('📋 Synchronisation de toutes les tables...');
            return [4 /*yield*/, sequelize.sync(syncOptions)];
          case 10:
            _a.sent();
            _a.label = 11;
          case 11:
            // Valider la transaction
            return [4 /*yield*/, transaction.commit()];
          case 12:
            // Valider la transaction
            _a.sent();
            console.log('✅ Initialisation des tables terminée avec succès');
            return [3 /*break*/, 23];
          case 13:
            error_15 = _a.sent();
            console.error("❌ Erreur lors de l'initialisation des tables:", error_15);
            if (!transaction) return [3 /*break*/, 17];
            _a.label = 14;
          case 14:
            _a.trys.push([14, 16, , 17]);
            return [4 /*yield*/, transaction.rollback()];
          case 15:
            _a.sent();
            console.log("🔄 Transaction d'initialisation annulée");
            return [3 /*break*/, 17];
          case 16:
            rollbackError_1 = _a.sent();
            console.error("❌ Erreur lors de l'annulation de la transaction:", rollbackError_1);
            return [3 /*break*/, 17];
          case 17:
            throw error_15;
          case 18:
            if (!sequelize) return [3 /*break*/, 22];
            _a.label = 19;
          case 19:
            _a.trys.push([19, 21, , 22]);
            return [4 /*yield*/, sequelize.close()];
          case 20:
            _a.sent();
            console.log('🔌 Connexion fermée');
            return [3 /*break*/, 22];
          case 21:
            closeError_1 = _a.sent();
            console.error('❌ Erreur lors de la fermeture de la connexion:', closeError_1);
            return [3 /*break*/, 22];
          case 22:
            return [7 /*endfinally*/];
          case 23:
            return [2 /*return*/];
        }
      });
    });
  };
  return Odbc;
})();
exports.Odbc = Odbc;
var DB = /** @class */ (function (_super) {
  __extends(DB, _super);
  function DB() {
    return _super.call(this) || this;
  }
  return DB;
})(Odbc);
exports.DB = DB;
exports.default = DB;
