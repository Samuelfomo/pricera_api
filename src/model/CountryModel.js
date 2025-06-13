"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CountryEntity = void 0;
var sequelize_1 = require("sequelize");
var Database_1 = require("./Database");
// Sequelize Entity (structure de la table)
var CountryEntity = /** @class */ (function (_super) {
    __extends(CountryEntity, _super);
    function CountryEntity() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return CountryEntity;
}(sequelize_1.Model));
exports.CountryEntity = CountryEntity;
var CountryModel = /** @class */ (function (_super) {
    __extends(CountryModel, _super);
    function CountryModel() {
        var _this = _super.call(this) || this;
        _this.model = _this._initModel();
        return _this;
    }
    // Singleton pattern pour éviter la réinitialisation multiple
    CountryModel.getInstance = function () {
        if (!CountryModel.instance) {
            CountryModel.instance = new CountryModel();
        }
        return CountryModel.instance;
    };
    CountryModel.prototype._initModel = function () {
        var _this = this;
        var sequelize = this.getSequelizeInstance();
        if (!sequelize) {
            throw new Error('Sequelize instance not available');
        }
        return sequelize.define('Country', {
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                comment: 'Country ID',
            },
            guid: {
                type: sequelize_1.DataTypes.INTEGER,
                unique: { name: 'UNIQUE-Country-GUID', msg: 'The GUID of Country must be unique' },
                allowNull: false,
                comment: 'GUID',
            },
            alpha2: {
                type: sequelize_1.DataTypes.STRING(2),
                unique: { name: 'UNIQUE-Country-alpha2', msg: 'The alpha2 must be unique' },
                allowNull: false,
                comment: 'ISO Alpha2 code',
            },
            alpha3: {
                type: sequelize_1.DataTypes.STRING(3),
                unique: { name: 'UNIQUE-Country-alpha3', msg: 'The alpha3 must be unique' },
                allowNull: false,
                comment: 'ISO Alpha3 code',
            },
            dialcode: {
                type: sequelize_1.DataTypes.SMALLINT,
                allowNull: false,
                comment: 'Country dial code',
            },
            fr: {
                type: sequelize_1.DataTypes.STRING(128),
                allowNull: false,
                comment: 'French name',
            },
            en: {
                type: sequelize_1.DataTypes.STRING(128),
                allowNull: false,
                comment: 'English name',
            },
        }, {
            tableName: 'country',
            timestamps: false,
            hooks: {
                beforeSave: function (instance) { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, this._dataControl(instance)];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); },
            },
        });
    };
    CountryModel.prototype.getModel = function () {
        if (!this.model)
            throw new Error("Model not initialized");
        return this.model;
    };
    CountryModel.prototype._dataControl = function (instance) {
        return __awaiter(this, void 0, void 0, function () {
            var Op, errors, exists;
            var _a;
            var _b, _c, _d, _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        Op = require('sequelize').Op;
                        errors = [];
                        // Validation des champs requis
                        if (!instance.guid)
                            errors.push("GUID is required");
                        if (!((_b = instance.alpha2) === null || _b === void 0 ? void 0 : _b.trim()))
                            errors.push("Code alpha2 is required");
                        if (!((_c = instance.alpha3) === null || _c === void 0 ? void 0 : _c.trim()))
                            errors.push("Code alpha3 is required");
                        if (!instance.dialcode)
                            errors.push("Dialcode is required");
                        if (!((_d = instance.fr) === null || _d === void 0 ? void 0 : _d.trim()))
                            errors.push("French name is required");
                        if (!((_e = instance.en) === null || _e === void 0 ? void 0 : _e.trim()))
                            errors.push("English name is required");
                        // Validation du format
                        if (instance.alpha2 && instance.alpha2.length !== 2) {
                            errors.push('Alpha2 code must be exactly 2 characters');
                        }
                        if (instance.alpha3 && instance.alpha3.length !== 3) {
                            errors.push('Alpha3 code must be exactly 3 characters');
                        }
                        if (instance.dialcode && instance.dialcode <= 0) {
                            errors.push('Dialcode must be a positive number');
                        }
                        if (!instance.guid) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.model.findOne({
                                where: { guid: instance.guid, id: (_a = {}, _a[Op.ne] = (_f = instance.id) !== null && _f !== void 0 ? _f : 0, _a) },
                            })];
                    case 1:
                        exists = _g.sent();
                        if (exists)
                            errors.push("GUID already exists");
                        _g.label = 2;
                    case 2:
                        if (errors.length > 0) {
                            throw new Error(errors.join('; '));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Find by ID
     */
    CountryModel.prototype.findById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!id)
                            throw new Error("ID is required");
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.getById(this.model, id)];
                    case 2: return [2 /*return*/, (_a.sent()) || null];
                    case 3:
                        error_1 = _a.sent();
                        console.error("Error finding country by ID:", error_1);
                        throw error_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Find all countries
     */
    CountryModel.prototype.findAllCountry = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.findAll(this.model)];
                    case 1: return [2 /*return*/, (_a.sent()) || []];
                    case 2:
                        error_2 = _a.sent();
                        console.error("Error finding all countries:", error_2);
                        throw error_2;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create a new country
     */
    CountryModel.prototype.create = function (countryData) {
        return __awaiter(this, void 0, void 0, function () {
            var cleanData, _a, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!countryData)
                            throw new Error("Country data is required");
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 5, , 6]);
                        cleanData = __assign(__assign({}, countryData), { alpha2: countryData.alpha2.trim().toUpperCase(), alpha3: countryData.alpha3.trim().toUpperCase(), fr: countryData.fr.trim(), en: countryData.en.trim() });
                        if (!!cleanData.guid) return [3 /*break*/, 3];
                        _a = cleanData;
                        return [4 /*yield*/, this.generateGuid(this.model)];
                    case 2:
                        _a.guid = _b.sent();
                        _b.label = 3;
                    case 3: return [4 /*yield*/, this.createRecord(this.model, cleanData)];
                    case 4: return [2 /*return*/, _b.sent()];
                    case 5:
                        error_3 = _b.sent();
                        console.error("Error creating country:", error_3);
                        throw error_3;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update an existing country
     */
    CountryModel.prototype.update = function (id, countryData) {
        return __awaiter(this, void 0, void 0, function () {
            var cleanData, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!id)
                            throw new Error("Country ID is required for update");
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        cleanData = __assign(__assign({}, countryData), { id: id });
                        if (countryData.alpha2)
                            cleanData.alpha2 = countryData.alpha2.trim().toUpperCase();
                        if (countryData.alpha3)
                            cleanData.alpha3 = countryData.alpha3.trim().toUpperCase();
                        if (countryData.fr)
                            cleanData.fr = countryData.fr.trim();
                        if (countryData.en)
                            cleanData.en = countryData.en.trim();
                        return [4 /*yield*/, this.updateRecord(this.model, cleanData)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        error_4 = _a.sent();
                        console.error("Error updating country:", error_4);
                        throw error_4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Delete a country
     */
    CountryModel.prototype.delete = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!id)
                            throw new Error("Country ID is required for deletion");
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.deleteRecord(this.model, id)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        error_5 = _a.sent();
                        console.error("Error deleting country:", error_5);
                        throw error_5;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Find by attribute
     */
    CountryModel.prototype.findByAttribute = function (attribute, value) {
        return __awaiter(this, void 0, void 0, function () {
            var error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!attribute)
                            throw new Error("Attribute name is required");
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.findOneByAttribut(this.model, attribute, value)];
                    case 2: return [2 /*return*/, (_a.sent()) || null];
                    case 3:
                        error_6 = _a.sent();
                        console.error("Error finding country by ".concat(attribute, ":"), error_6);
                        throw error_6;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Find all by attribute
     */
    CountryModel.prototype.findAllByAttribute = function (attribute, value) {
        return __awaiter(this, void 0, void 0, function () {
            var error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!attribute)
                            throw new Error("Attribute name is required");
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.findByAttribut(this.model, attribute, value)];
                    case 2: return [2 /*return*/, (_a.sent()) || []];
                    case 3:
                        error_7 = _a.sent();
                        console.error("Error finding countries by ".concat(attribute, ":"), error_7);
                        throw error_7;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Find by alpha2 code
     */
    CountryModel.prototype.findByAlpha2 = function (alpha2) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!(alpha2 === null || alpha2 === void 0 ? void 0 : alpha2.trim()))
                    throw new Error("Alpha2 code is required");
                return [2 /*return*/, this.findByAttribute('alpha2', alpha2.trim().toUpperCase())];
            });
        });
    };
    /**
     * Find by alpha3 code
     */
    CountryModel.prototype.findByAlpha3 = function (alpha3) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!(alpha3 === null || alpha3 === void 0 ? void 0 : alpha3.trim()))
                    throw new Error("Alpha3 code is required");
                return [2 /*return*/, this.findByAttribute('alpha3', alpha3.trim().toUpperCase())];
            });
        });
    };
    /**
     * Find by dial code
     */
    CountryModel.prototype.findByDialCode = function (dialcode) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!dialcode || dialcode <= 0)
                    throw new Error("Valid dial code is required");
                return [2 /*return*/, this.findAllByAttribute('dialcode', dialcode)];
            });
        });
    };
    /**
     * Search by name (French or English)
     */
    CountryModel.prototype.searchByName = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            var searchTerm, Op, results, error_8;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (!(name === null || name === void 0 ? void 0 : name.trim()))
                            throw new Error("Search name is required");
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 3, , 4]);
                        searchTerm = name.trim();
                        Op = require('sequelize').Op;
                        return [4 /*yield*/, this.model.findAll({
                                where: (_a = {},
                                    _a[Op.or] = [
                                        { fr: (_b = {}, _b[Op.iLike] = "%".concat(searchTerm, "%"), _b) },
                                        { en: (_c = {}, _c[Op.iLike] = "%".concat(searchTerm, "%"), _c) },
                                    ],
                                    _a),
                            })];
                    case 2:
                        results = _d.sent();
                        return [2 /*return*/, results.map(function (result) { return result.toJSON(); })];
                    case 3:
                        error_8 = _d.sent();
                        console.error("Error searching countries by name:", error_8);
                        throw error_8;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Count total countries
     */
    CountryModel.prototype.countAll = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.count(this.model)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_9 = _a.sent();
                        console.error("Error counting countries:", error_9);
                        throw error_9;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return CountryModel;
}(Database_1.default));
exports.default = CountryModel;
// import { DataTypes, Model, ModelStatic, Sequelize } from 'sequelize';
//
// import Database from './Database';
//
// // Modèle Sequelize (structure de la table)
// export class CountryEntity extends Model {
//   public id!: number;
//   public guid!: number;
//   public alpha2!: string;
//   public alpha3!: string;
//   public dialcode!: number;
//   public fr!: string;
//   public en!: string;
// }
//
// export class CountryModel extends Database {
//   // private model: ModelStatic<CountryEntity> = CountryEntity;
//   private model: ModelStatic<CountryEntity>;
//   // private data: CountryEntity;
//   public id: number;
//   public guid: number;
//   public alpha2: string;
//   public alpha3: string;
//   public dialcode: number;
//   public fr: string;
//   public en: string;
//
//   constructor(data?: CountryEntity) {
//     super();
//     this.model = this._initModel();
//     this.id = data.id;
//     this.guid = data.guid;
//     this.alpha2 = data.alpha2;
//     this.alpha3 = data.alpha3;
//     this.dialcode = data.dialcode;
//     this.fr = data.fr;
//     this.en = data.en;
//   }
//
//   private _initModel() {
//     const sequelize: Sequelize | null = this.getSequelizeInstance();
//     if (!sequelize) {
//       throw new Error('Sequelize instance not available');
//     }
//
//     return sequelize.define(
//       'Country',
//       {
//         id: {
//           type: DataTypes.INTEGER,
//           primaryKey: true,
//           autoIncrement: true,
//           comment: 'Country',
//         },
//         guid: {
//           type: DataTypes.INTEGER,
//           unique: { name: 'UNIQUE-Country-GUID', msg: 'The GUID of Country must be unique' },
//           allowNull: false,
//           comment: 'GUID',
//         },
//         alpha2: {
//           type: DataTypes.STRING(128),
//           unique: { name: 'UNIQUE-Country-alpha2', msg: 'The alpha2 must be unique' },
//           allowNull: false,
//           comment: 'alpha2',
//         },
//         alpha3: {
//           type: DataTypes.STRING(128),
//           unique: { name: 'UNIQUE-Country-alpha3', msg: 'The alpha3 must be unique' },
//           allowNull: false,
//           comment: 'alpha3',
//         },
//         dialcode: {
//           type: DataTypes.SMALLINT,
//           allowNull: false,
//           comment: 'dialcode',
//         },
//         fr: {
//           type: DataTypes.STRING(128),
//           allowNull: false,
//           comment: 'fr',
//         },
//         en: {
//           type: DataTypes.STRING(128),
//           allowNull: false,
//           comment: 'en',
//         },
//       },
//       {
//         tableName: 'country',
//         timestamps: false,
//         hooks: {
//           beforeSave: async (instance: CountryEntity) => {
//             await this._dataControl(instance);
//           },
//         },
//       }
//     );
//   }
//
//   public getModel(): ModelStatic<CountryEntity> {
//     if (!this.model) throw new Error(`Model not initialized`);
//     return this.model;
//   }
//
//   private async _dataControl(instance: CountryEntity) {
//     const { Op } = require('sequelize');
//     const errors: string[] = [];
//
//     if (!instance.guid) errors.push(`GUID is required`);
//     if (!instance.alpha2?.trim()) errors.push(`Code alpha2 is required`);
//     if (!instance.alpha3?.trim()) errors.push(`Code alpha3 is required`);
//     if (!instance.dialcode) errors.push(`Dialcode is required`);
//     if (!instance.fr?.trim()) errors.push(`French name is required`);
//     if (!instance.en?.trim()) errors.push(`English name is required`);
//
//     if (instance.guid) {
//       const exists = await this.model!.findOne({
//         where: { guid: instance.guid, id: { [Op.ne]: instance.id ?? 0 } },
//       });
//       if (exists) errors.push(`GUID already exists`);
//     }
//
//     if (errors.length > 0) {
//       throw new Error(errors.join('; '));
//     }
//   }
//
//   /**
//    * Find by ID
//    * @param id
//    */
//   async find(id: number): Promise<CountryEntity | null> {
//     if (!id) throw new Error(`id is required`);
//     try {
//       return (await this.getById(this.model, id)) || null;
//     } catch (error: any) {
//       console.error(`Erreur lors de la recherche par ID:`, error);
//       throw error;
//     }
//   }
//
//   /**
//    * findAll country
//    */
//   async findAllCountry(): Promise<CountryEntity[]> {
//     try {
//       return (await this.findAll(this.model)) || [];
//     } catch (error: any) {
//       console.error(`Erreur lors de la recherche:`, error);
//       throw error;
//     }
//   }
//
//   /**
//    *
//    * @param id
//    */
//   async delete(id: number): Promise<boolean> {
//     try {
//       return await this.deleteRecord(this.model, id);
//     } catch (error: any) {
//       console.error(`an error occurred when deleting the country:`, error);
//       throw error;
//     }
//   }
//
//   /**
//    *
//    * @param countryData
//    */
//   async create(countryData: CountryEntity): Promise<CountryEntity> {
//     if (!countryData) throw new Error(`Unable to find data for the country you want to create`);
//     try {
//       if (!countryData.guid) {
//         countryData.guid = await this.generateGuid(this.model);
//       }
//       return await this.createRecord(this.model, countryData);
//     } catch (error: any) {
//       console.error(`Error during country creation`, error);
//       throw error;
//     }
//   }
//
//   /**
//    *
//    * @param id
//    * @param countryData
//    */
//   async update(id: number, countryData: CountryEntity): Promise<CountryEntity | null> {
//     if (!id) throw new Error(`the country for which you wish to update is not defined`);
//     try {
//       const dataWithId = { ...countryData, id };
//       return await this.updateRecord(this.model, dataWithId);
//     } catch (error: any) {
//       console.error(`Error during update:`, error);
//       throw error;
//     }
//   }
//
//   async findByAttribute(attribut: string, value: any): Promise<CountryEntity | null> {
//     if (!attribut) return null;
//     try {
//       return (await this.findOneByAttribut(this.model, attribut, value)) || null;
//     } catch (error: any) {
//       console.error(`Error during findByAttribute`, error);
//       throw error;
//     }
//   }
//
//   async findAllByAttribute(attribut: string, value: any): Promise<CountryEntity[]> {
//     if (!attribut) return [];
//     try {
//       return (await this.findByAttribut(this.model, attribut, value)) || [];
//     } catch (error: any) {
//       console.error(`Error during findAllByAttribute`, error);
//       throw error;
//     }
//   }
// }
//
// export default CountryModel;
