"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var sequelize_1 = require("sequelize");
var odbc_1 = require("../tools/odbc");
var Db = /** @class */ (function () {
    function Db() {
        var _this = this;
        this.dbConnection = new odbc_1.default();
        /**
         * Get one row in table using ID
         * @param table
         * @param id
         * @returns {Promise<any|null>}
         * @private
         */
        this._findOne = function (table, id) { return __awaiter(_this, void 0, void 0, function () {
            var entry, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, table.findByPk(id)];
                    case 1:
                        entry = _a.sent();
                        return [2 /*return*/, entry ? entry.toJSON() : null];
                    case 2:
                        error_1 = _a.sent();
                        console.error('Error retrieving entry:', error_1);
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        this._findAll = function (table) { return __awaiter(_this, void 0, void 0, function () {
            var entry, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, table.findAndCountAll()];
                    case 1:
                        entry = _a.sent();
                        return [2 /*return*/, entry.rows ? entry.rows.map(function (row) { return row.toJSON(); }) : []];
                    case 2:
                        error_2 = _a.sent();
                        console.error('Error retrieving entry:', error_2);
                        throw error_2;
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * get table last autoincrement ID
         * @param table
         * @returns {Promise<number>}
         * @private
         */
        this._lastID = function (table) { return __awaiter(_this, void 0, void 0, function () {
            var lastRecord;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, table.findOne({
                            order: [['id', 'DESC']],
                        })];
                    case 1:
                        lastRecord = _a.sent();
                        return [2 /*return*/, lastRecord ? lastRecord.get('id') : 0];
                }
            });
        }); };
        /**
         * Generate GUID from table
         * @param table
         * @param length
         * @param guid
         * @returns {Promise<number>}
         * @private
         */
        this._guid = function (table_1) {
            var args_1 = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args_1[_i - 1] = arguments[_i];
            }
            return __awaiter(_this, __spreadArray([table_1], args_1, true), void 0, function (table, length, guid) {
                var _a, record, _b;
                if (length === void 0) { length = 6; }
                if (guid === void 0) { guid = null; }
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            if (!(guid === null)) return [3 /*break*/, 2];
                            _a = Math.pow(10, length - 1);
                            return [4 /*yield*/, this._lastID(table)];
                        case 1:
                            guid = _a + ((_c.sent()) + 1);
                            _c.label = 2;
                        case 2: return [4 /*yield*/, table.findOne({
                                where: {
                                    guid: guid,
                                },
                            })];
                        case 3:
                            record = _c.sent();
                            if (!(record === null)) return [3 /*break*/, 4];
                            _b = guid;
                            return [3 /*break*/, 6];
                        case 4: return [4 /*yield*/, this._guid(table, length, guid + 1)];
                        case 5:
                            _b = _c.sent();
                            _c.label = 6;
                        case 6: return [2 /*return*/, _b];
                    }
                });
            });
        };
    }
    /**
     * Initialiser la connexion à la base de données
     */
    Db.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.dbConnection.initialize()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Vérifier si la base de données est connectée
     */
    Db.prototype.isConnected = function () {
        return this.dbConnection.isConnected();
    };
    /**
     * Obtenir l'instance de Sequelize
     */
    Db.prototype.getSequelizeInstance = function () {
        return this.dbConnection.getInstance();
    };
    /**
     * Generate GUID from table
     * @param table
     * @param length
     * @returns {Promise<number>}
     */
    Db.prototype.generateGuid = function (table_1) {
        return __awaiter(this, arguments, void 0, function (table, length) {
            if (length === void 0) { length = 6; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._guid(table, length)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Get one row in table using ID
     * @param table - Sequelize model
     * @param id - Record ID
     * @returns {Promise<any|null>}
     */
    Db.prototype.getById = function (table, id) {
        return __awaiter(this, void 0, void 0, function () {
            var error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!this.isConnected()) {
                            throw new Error('Database connection not established');
                        }
                        return [4 /*yield*/, this._findOne(table, id)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_3 = _a.sent();
                        console.error('Error in getById:', error_3);
                        throw error_3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    Db.prototype.getAll = function (table) {
        return __awaiter(this, void 0, void 0, function () {
            var error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!this.isConnected()) {
                            throw new Error('Database connection not established');
                        }
                        return [4 /*yield*/, this._findAll(table)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_4 = _a.sent();
                        console.error('Error in getById:', error_4);
                        throw error_4;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get table last autoincrement ID
     * @param table - Sequelize model
     * @returns {Promise<number>}
     */
    Db.prototype.getLastId = function (table) {
        return __awaiter(this, void 0, void 0, function () {
            var error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!this.isConnected()) {
                            throw new Error('Database connection not established');
                        }
                        return [4 /*yield*/, this._lastID(table)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_5 = _a.sent();
                        console.error('Error in getLastId:', error_5);
                        throw error_5;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create a new record
     * @param table - Sequelize model
     * @param data - Data to insert
     * @returns {Promise<any>}
     */
    Db.prototype.createRecord = function (table, data) {
        return __awaiter(this, void 0, void 0, function () {
            var record, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!this.isConnected()) {
                            throw new Error('Database connection not established');
                        }
                        return [4 /*yield*/, table.create(data)];
                    case 1:
                        record = _a.sent();
                        return [2 /*return*/, record.toJSON()];
                    case 2:
                        error_6 = _a.sent();
                        console.error('Error creating record:', error_6);
                        throw error_6;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update an existing record
     * @param table - Sequelize model
     * @param data - Data to update (must include id or primary key)
     * @returns {Promise<any>}
     */
    Db.prototype.updateRecord = function (table, data) {
        return __awaiter(this, void 0, void 0, function () {
            var affectedCount, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        if (!this.isConnected()) {
                            throw new Error('Database connection not established');
                        }
                        if (!data.id) {
                            throw new Error('ID is required for update operation');
                        }
                        return [4 /*yield*/, table.update(data, {
                                where: { id: data.id },
                                returning: true,
                            })];
                    case 1:
                        affectedCount = (_a.sent())[0];
                        if (affectedCount === 0) {
                            throw new Error("No record found with id: ".concat(data.id));
                        }
                        return [4 /*yield*/, this.getById(table, data.id)];
                    case 2: 
                    // Return the updated record
                    return [2 /*return*/, _a.sent()];
                    case 3:
                        error_7 = _a.sent();
                        console.error('Error updating record:', error_7);
                        throw error_7;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Delete a record by ID
     * @param table - Sequelize model
     * @param id - Record ID to delete
     * @returns {Promise<boolean>}
     */
    Db.prototype.deleteRecord = function (table, id) {
        return __awaiter(this, void 0, void 0, function () {
            var deletedCount, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!this.isConnected()) {
                            throw new Error('Database connection not established');
                        }
                        return [4 /*yield*/, table.destroy({
                                where: { id: id },
                            })];
                    case 1:
                        deletedCount = _a.sent();
                        return [2 /*return*/, deletedCount > 0];
                    case 2:
                        error_8 = _a.sent();
                        console.error('Error deleting record:', error_8);
                        throw error_8;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Execute raw SQL query
     * @param query - SQL query string
     * @param replacements - Query parameters (optional)
     * @param type - Query type (SELECT, INSERT, UPDATE, DELETE, etc.)
     * @returns {Promise<any>}
     */
    Db.prototype.executeQuery = function (query_1) {
        return __awaiter(this, arguments, void 0, function (query, replacements, type) {
            var sequelize, results, error_9;
            if (replacements === void 0) { replacements = {}; }
            if (type === void 0) { type = sequelize_1.QueryTypes.SELECT; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!this.isConnected()) {
                            throw new Error('Database connection not established');
                        }
                        sequelize = this.getSequelizeInstance();
                        if (!sequelize) {
                            throw new Error('Sequelize instance not available');
                        }
                        return [4 /*yield*/, sequelize.query(query, {
                                replacements: replacements,
                                type: type,
                            })];
                    case 1:
                        results = (_a.sent())[0];
                        return [2 /*return*/, results];
                    case 2:
                        error_9 = _a.sent();
                        console.error('Error executing query:', error_9);
                        throw error_9;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Find all records with optional conditions
     * @param table - Sequelize model
     * @param options - Sequelize find options
     * @returns {Promise<any[]>}
     */
    Db.prototype.findAll = function (table_1) {
        return __awaiter(this, arguments, void 0, function (table, options) {
            var records, error_10;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!this.isConnected()) {
                            throw new Error('Database connection not established');
                        }
                        return [4 /*yield*/, table.findAll(options)];
                    case 1:
                        records = _a.sent();
                        return [2 /*return*/, records.map(function (record) { return record.toJSON(); })];
                    case 2:
                        error_10 = _a.sent();
                        console.error('Error in findAll:', error_10);
                        throw error_10;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Find one record with conditions
     * @param table - Sequelize model
     * @param options - Sequelize find options
     * @returns {Promise<any|null>}
     */
    Db.prototype.findOne = function (table_1) {
        return __awaiter(this, arguments, void 0, function (table, options) {
            var record, error_11;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!this.isConnected()) {
                            throw new Error('Database connection not established');
                        }
                        return [4 /*yield*/, table.findOne(options)];
                    case 1:
                        record = _a.sent();
                        return [2 /*return*/, record ? record.toJSON() : null];
                    case 2:
                        error_11 = _a.sent();
                        console.error('Error in findOne:', error_11);
                        throw error_11;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Find records by a specific attribute
     * @param table - Sequelize model
     * @param attribut - Column name to search
     * @param value - Value to search for
     * @returns {Promise<any[]>}
     */
    Db.prototype.findByAttribut = function (table, attribut, value) {
        return __awaiter(this, void 0, void 0, function () {
            var records, error_12;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        if (!this.isConnected()) {
                            throw new Error('Database connection not established');
                        }
                        return [4 /*yield*/, table.findAll({
                                where: (_a = {},
                                    _a[attribut] = value,
                                    _a),
                            })];
                    case 1:
                        records = _b.sent();
                        return [2 /*return*/, records.map(function (record) { return record.toJSON(); })];
                    case 2:
                        error_12 = _b.sent();
                        console.error('Error in findByAttribut:', error_12);
                        throw error_12;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Find one record by a specific attribute
     * @param table - Sequelize model
     * @param attribut - Column name to search
     * @param value - Value to search for
     * @returns {Promise<any|null>}
     */
    Db.prototype.findOneByAttribut = function (table, attribut, value) {
        return __awaiter(this, void 0, void 0, function () {
            var record, error_13;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        if (!this.isConnected()) {
                            throw new Error('Database connection not established');
                        }
                        return [4 /*yield*/, table.findOne({
                                where: (_a = {},
                                    _a[attribut] = value,
                                    _a),
                            })];
                    case 1:
                        record = _b.sent();
                        return [2 /*return*/, record ? record.toJSON() : null];
                    case 2:
                        error_13 = _b.sent();
                        console.error('Error in findOneByAttribut:', error_13);
                        throw error_13;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Count records with optional conditions
     * @param table - Sequelize model
     * @param options - Sequelize count options
     * @returns {Promise<number>}
     */
    Db.prototype.count = function (table_1) {
        return __awaiter(this, arguments, void 0, function (table, options) {
            var error_14;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!this.isConnected()) {
                            throw new Error('Database connection not established');
                        }
                        return [4 /*yield*/, table.count(options)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_14 = _a.sent();
                        console.error('Error in count:', error_14);
                        throw error_14;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Begin transaction
     * @returns {Promise<any>}
     */
    Db.prototype.beginTransaction = function () {
        return __awaiter(this, void 0, void 0, function () {
            var sequelize, error_15;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!this.isConnected()) {
                            throw new Error('Database connection not established');
                        }
                        sequelize = this.getSequelizeInstance();
                        if (!sequelize) {
                            throw new Error('Sequelize instance not available');
                        }
                        return [4 /*yield*/, sequelize.transaction()];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_15 = _a.sent();
                        console.error('Error beginning transaction:', error_15);
                        throw error_15;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Close database connection
     */
    Db.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.dbConnection.close()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Reconnect to database
     */
    Db.prototype.reconnect = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.dbConnection.reconnect()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get database information
     */
    Db.prototype.getDatabaseInfos = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.dbConnection.getDatabaseInfos()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return Db;
}());
exports.default = Db;
