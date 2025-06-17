// import { DataTypes } from 'sequelize';
//
// import Db from '../tools/database';
// import W from '../tools/watcher';
//
// export default class CountryModel {
//   public readonly db = {
//     tableName: 'country',
//     id: 'id',
//     guid: 'guid',
//     alpha2: 'alpha2',
//     alpha3: 'alpha3',
//     dialcode: 'dialcode',
//     fr: 'fr',
//     en: 'en',
//   };
//
//   protected id?: number;
//   protected guid?: number;
//   protected alpha2?: string;
//   protected alpha3?: string;
//   protected dialcode?: number;
//   protected fr?: string;
//   protected en?: string;
//
//   // Instance de la base de données singleton
//   protected dbInstance: Db;
//
//   constructor() {
//     // Récupération de l'instance singleton au lieu de créer une nouvelle connexion
//     this.dbInstance = Db.getInstance();
//   }
//
//   async init(): Promise<void> {
//     // Initialisation de la connexion singleton si pas encore fait
//     await Db.initialize();
//     this.initModel();
//
//     await this.dbInstance.syncModel(this.db.tableName);
//   }
//
//   private initModel() {
//     const attributes = {
//       id: {
//         type: DataTypes.INTEGER,
//         primaryKey: true,
//         autoIncrement: true,
//         comment: 'Client',
//       },
//       guid: {
//         type: DataTypes.INTEGER,
//         unique: { name: 'unique-country-guid', msg: 'The guid of country must be unique' },
//         allowNull: false,
//         comment: 'Guid',
//       },
//       alpha2: {
//         type: DataTypes.STRING(2),
//         unique: { name: 'unique-country-alpha2', msg: 'The alpha2 of country must be unique' },
//         allowNull: false,
//         comment: 'Alpha2',
//       },
//       alpha3: {
//         type: DataTypes.STRING(3),
//         unique: { name: 'UNIQUE-Country-alpha3', msg: 'The alpha3 of Country must be unique' },
//         allowNull: false,
//         comment: 'Alpha3',
//       },
//       dialcode: {
//         type: DataTypes.SMALLINT,
//         allowNull: false,
//         comment: 'Dialcode',
//       },
//       fr: {
//         type: DataTypes.STRING(128),
//         allowNull: false,
//         comment: 'French version',
//       },
//       en: {
//         type: DataTypes.STRING(128),
//         allowNull: false,
//         comment: 'English version',
//       },
//     };
//
//     this.dbInstance.defineModel(this.db.tableName, attributes);
//   }
//
//   protected async find(id: number): Promise<any> {
//     return await this.dbInstance.findOne(this.db.tableName, {
//       [this.db.id]: id,
//     });
//   }
//
//   // Nouvelle méthode findAll
//   protected async findAll(conditions: Record<string, any> = {}): Promise<any[]> {
//     return await this.dbInstance.findAll(this.db.tableName, conditions);
//   }
//   protected async findByAttribut(value: any, attribut: string = this.db.guid): Promise<any> {
//     return await this.dbInstance.findOne(this.db.tableName, { [attribut]: value });
//   }
//   async create() {
//     await this.validate();
//   }
//
//   private async validate(): Promise<void> {}
// }
