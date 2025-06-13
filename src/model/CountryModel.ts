import { DataTypes, Model, ModelStatic, Sequelize } from 'sequelize';

import Database from './Database';

// Sequelize Entity (structure de la table)
export class CountryEntity extends Model {
  public id!: number;
  public guid!: number;
  public alpha2!: string;
  public alpha3!: string;
  public dialcode!: number;
  public fr!: string;
  public en!: string;
}

// Interface pour les données d'entrée
export interface CountryData {
  id?: number;
  guid?: number;
  alpha2: string;
  alpha3: string;
  dialcode: number;
  fr: string;
  en: string;
}

export default class CountryModel extends Database {
  private readonly model: ModelStatic<CountryEntity>;
  private static instance: CountryModel;

  constructor() {
    super();
    this.model = this._initModel();
  }

  // Singleton pattern pour éviter la réinitialisation multiple
  public static getInstance(): CountryModel {
    if (!CountryModel.instance) {
      CountryModel.instance = new CountryModel();
    }
    return CountryModel.instance;
  }

  private _initModel(): ModelStatic<CountryEntity> {
    const sequelize: Sequelize = this.getSequelizeInstance();
    if (!sequelize) {
      throw new Error('Sequelize instance not available');
    }

    return sequelize.define(
      'Country',
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          comment: 'Country ID',
        },
        guid: {
          type: DataTypes.INTEGER,
          unique: { name: 'UNIQUE-Country-GUID', msg: 'The GUID of Country must be unique' },
          allowNull: false,
          comment: 'GUID',
        },
        alpha2: {
          type: DataTypes.STRING(2),
          unique: { name: 'UNIQUE-Country-alpha2', msg: 'The alpha2 must be unique' },
          allowNull: false,
          comment: 'ISO Alpha2 code',
        },
        alpha3: {
          type: DataTypes.STRING(3),
          unique: { name: 'UNIQUE-Country-alpha3', msg: 'The alpha3 must be unique' },
          allowNull: false,
          comment: 'ISO Alpha3 code',
        },
        dialcode: {
          type: DataTypes.SMALLINT,
          allowNull: false,
          comment: 'Country dial code',
        },
        fr: {
          type: DataTypes.STRING(128),
          allowNull: false,
          comment: 'French name',
        },
        en: {
          type: DataTypes.STRING(128),
          allowNull: false,
          comment: 'English name',
        },
      },
      {
        tableName: 'country',
        timestamps: false,
        hooks: {
          beforeSave: async (instance: CountryEntity) => {
            await this._dataControl(instance);
          },
        },
      }
    ) as ModelStatic<CountryEntity>;
  }

  public getModel(): ModelStatic<CountryEntity> {
    if (!this.model) throw new Error(`Model not initialized`);
    return this.model;
  }

  private async _dataControl(instance: CountryEntity): Promise<void> {
    const { Op } = require('sequelize');
    const errors: string[] = [];

    // Validation des champs requis
    if (!instance.guid) errors.push(`GUID is required`);
    if (!instance.alpha2?.trim()) errors.push(`Code alpha2 is required`);
    if (!instance.alpha3?.trim()) errors.push(`Code alpha3 is required`);
    if (!instance.dialcode) errors.push(`Dialcode is required`);
    if (!instance.fr?.trim()) errors.push(`French name is required`);
    if (!instance.en?.trim()) errors.push(`English name is required`);

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

    // Vérification de l'unicité du GUID
    if (instance.guid) {
      const exists = await this.model.findOne({
        where: { guid: instance.guid, id: { [Op.ne]: instance.id ?? 0 } },
      });
      if (exists) errors.push(`GUID already exists`);
    }

    if (errors.length > 0) {
      throw new Error(errors.join('; '));
    }
  }

  /**
   * Find by ID
   */
  async findById(id: number): Promise<CountryEntity | null> {
    if (!id) throw new Error(`ID is required`);
    try {
      return (await this.getById(this.model, id)) || null;
    } catch (error: any) {
      console.error(`Error finding country by ID:`, error);
      throw error;
    }
  }

  /**
   * Find all countries
   */
  async findAllCountry(): Promise<CountryEntity[]> {
    try {
      return (await this.findAll(this.model)) || [];
    } catch (error: any) {
      console.error(`Error finding all countries:`, error);
      throw error;
    }
  }

  /**
   * Create a new country
   */
  async create(countryData: Omit<CountryData, 'id'>): Promise<CountryEntity> {
    if (!countryData) throw new Error(`Country data is required`);

    try {
      // Nettoyer et formater les données
      const cleanData = {
        ...countryData,
        alpha2: countryData.alpha2.trim().toUpperCase(),
        alpha3: countryData.alpha3.trim().toUpperCase(),
        fr: countryData.fr.trim(),
        en: countryData.en.trim(),
      };

      // Générer un GUID si non fourni
      if (!cleanData.guid) {
        cleanData.guid = await this.generateGuid(this.model);
      }

      return await this.createRecord(this.model, cleanData);
    } catch (error: any) {
      console.error(`Error creating country:`, error);
      throw error;
    }
  }

  /**
   * Update an existing country
   */
  async update(id: number, countryData: Partial<CountryData>): Promise<CountryEntity | null> {
    if (!id) throw new Error(`Country ID is required for update`);

    try {
      // Nettoyer et formater les données si elles sont présentes
      const cleanData: any = { ...countryData, id };

      if (countryData.alpha2) cleanData.alpha2 = countryData.alpha2.trim().toUpperCase();
      if (countryData.alpha3) cleanData.alpha3 = countryData.alpha3.trim().toUpperCase();
      if (countryData.fr) cleanData.fr = countryData.fr.trim();
      if (countryData.en) cleanData.en = countryData.en.trim();

      return await this.updateRecord(this.model, cleanData);
    } catch (error: any) {
      console.error(`Error updating country:`, error);
      throw error;
    }
  }

  /**
   * Delete a country
   */
  async delete(id: number): Promise<boolean> {
    if (!id) throw new Error(`Country ID is required for deletion`);

    try {
      return await this.deleteRecord(this.model, id);
    } catch (error: any) {
      console.error(`Error deleting country:`, error);
      throw error;
    }
  }

  /**
   * Find by attribute
   */
  async findByAttribute(attribute: string, value: any): Promise<CountryEntity | null> {
    if (!attribute) throw new Error(`Attribute name is required`);

    try {
      return (await this.findOneByAttribut(this.model, attribute, value)) || null;
    } catch (error: any) {
      console.error(`Error finding country by ${attribute}:`, error);
      throw error;
    }
  }

  /**
   * Find all by attribute
   */
  async findAllByAttribute(attribute: string, value: any): Promise<CountryEntity[]> {
    if (!attribute) throw new Error(`Attribute name is required`);

    try {
      return (await this.findByAttribut(this.model, attribute, value)) || [];
    } catch (error: any) {
      console.error(`Error finding countries by ${attribute}:`, error);
      throw error;
    }
  }

  /**
   * Find by alpha2 code
   */
  async findByAlpha2(alpha2: string): Promise<CountryEntity | null> {
    if (!alpha2?.trim()) throw new Error(`Alpha2 code is required`);
    return this.findByAttribute('alpha2', alpha2.trim().toUpperCase());
  }

  /**
   * Find by alpha3 code
   */
  async findByAlpha3(alpha3: string): Promise<CountryEntity | null> {
    if (!alpha3?.trim()) throw new Error(`Alpha3 code is required`);
    return this.findByAttribute('alpha3', alpha3.trim().toUpperCase());
  }

  /**
   * Find by dial code
   */
  async findByDialCode(dialcode: number): Promise<CountryEntity[]> {
    if (!dialcode || dialcode <= 0) throw new Error(`Valid dial code is required`);
    return this.findAllByAttribute('dialcode', dialcode);
  }

  /**
   * Search by name (French or English)
   */
  async searchByName(name: string): Promise<CountryEntity[]> {
    if (!name?.trim()) throw new Error(`Search name is required`);

    try {
      const searchTerm = name.trim();
      const { Op } = require('sequelize');

      const results = await this.model.findAll({
        where: {
          [Op.or]: [
            { fr: { [Op.iLike]: `%${searchTerm}%` } },
            { en: { [Op.iLike]: `%${searchTerm}%` } },
          ],
        },
      });

      return results.map((result) => result.toJSON());
    } catch (error: any) {
      console.error(`Error searching countries by name:`, error);
      throw error;
    }
  }

  /**
   * Count total countries
   */
  async countAll(): Promise<number> {
    try {
      return await this.count(this.model);
    } catch (error: any) {
      console.error(`Error counting countries:`, error);
      throw error;
    }
  }
}

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
