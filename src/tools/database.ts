import { Sequelize, Model, ModelStatic } from 'sequelize';
import { config } from 'dotenv';
config();

export default abstract class Db {
  private static readonly DB_NAME: string = process.env.DB_NAME!;
  private static readonly DB_PASSWORD: string = process.env.DB_PASSWORD!;
  private static readonly DB_USERNAME: string = process.env.DB_USERNAME!;
  private static readonly DB_HOST: string = process.env.DB_HOST!;
  private static readonly DB_PORT: number = Number(process.env.DB_PORT!);

  // Instance singleton
  private static instance: Db | null = null;
  private static sequelizeInstance: Sequelize | null = null;
  private static isInitialized: boolean = false;
  // Instance properties
  protected readonly sequelize: Sequelize;
  private readonly models: Map<string, ModelStatic<Model>> = new Map();

  // region Constructor

  // constructor() {
  //   console.log(`🔌 === NOUVELLE CONNEXION DB CRÉÉE ===`);
  //   console.log(`🕐 Timestamp:`, new Date().toISOString());
  //   console.log(`📊 Stack trace:`, new Error().stack?.split('\n')[2]);
  //
  //   this.sequelize = new Sequelize(Db.DB_NAME, Db.DB_USERNAME, Db.DB_PASSWORD, {
  //     host: Db.DB_HOST,
  //     port: Db.DB_PORT,
  //     dialect: 'postgres',
  //     logging: false,
  //   });
  // }

  // Constructor protégé pour implémenter le pattern singleton
  protected constructor() {
    if (!Db.sequelizeInstance) {
      console.log(`🔌 === CONNEXION DB SINGLETON CRÉÉE ===`);
      console.log(`🕐 Timestamp:`, new Date().toISOString());

      Db.sequelizeInstance = new Sequelize(Db.DB_NAME, Db.DB_USERNAME, Db.DB_PASSWORD, {
        host: Db.DB_HOST,
        port: Db.DB_PORT,
        dialect: 'postgres',
        logging: false,
        // Configuration pour optimiser les connexions
        pool: {
          max: 10, // Maximum 10 connexions dans le pool
          min: 0, // Minimum 0 connexions
          acquire: 30000, // Temps max pour obtenir une connexion (30s)
          idle: 10000, // Temps max qu'une connexion peut rester inactive (10s)
        },
      });
    }
    this.sequelize = Db.sequelizeInstance;
  }

  // endregion

  // region Helpers methods

  // // Méthode pour obtenir l'instance singleton
  // public static getInstance(): Db {
  //   return new Db().instance;
  // }
  // Méthode d'initialisation
  public async initialize(): Promise<void> {
    if (Db.isInitialized) {
      console.log('✅ Base de données déjà initialisée');
      return;
    }

    try {
      await this.sequelize.authenticate();
      console.log('✅ Connexion à la base de données établie avec succès');
      Db.isInitialized = true;

      // Initialisation spécifique du modèle (méthode abstraite)
      // await this.init();
    } catch (error) {
      console.error('❌ Impossible de se connecter à la base de données:', error);
      throw new Error(`Échec de l'initialisation de la base de données: ${error}`);
    }
  }

  // Méthode pour initialiser la base de données une seule fois
  // protected static async initialize(): Promise<void> {
  //   if (Db.isInitialized) return;
  //
  //   const instance = Db.getInstance();
  //   try {
  //     await instance.sequelize.authenticate();
  //     console.log('✅ Connexion à la base de données établie avec succès');
  //     Db.isInitialized = true;
  //   } catch (error) {
  //     console.error('❌ Impossible de se connecter à la base de données:', error);
  //     throw error;
  //   }
  // }

  protected defineModel(
    tableName: string,
    attributes: Record<string, any>,
    options?: any
  ): ModelStatic<Model> {
    if (this.models.has(tableName)) {
      console.warn(`⚠️ Le modèle '${tableName}' existe déjà`);
      return this.models.get(tableName)!;
    }
    const model = this.sequelize.define(tableName, attributes, { tableName, ...options });
    this.models.set(tableName, model);
    return model;
  }

  protected getModel(tableName: string): ModelStatic<Model> | null {
    const model = this.models.get(tableName);

    if (!model) {
      console.error(`❌ Modèle '${tableName}' non trouvé`);
      return null;
    }
    return model;
  }

  protected async syncModel(tableName: string, force: boolean = false): Promise<void> {
    const model = this.getModel(tableName);
    if (!model) {
      throw new Error(`Impossible de synchroniser le modèle '${tableName}': modèle non trouvé`);
    }
    try {
      const isDevelopment = process.env.NODE_ENV !== 'production';
      if (force) {
        await model.sync({ force: true });
        console.log(`🔄 Modèle '${tableName}' synchronisé avec force`);
      } else if (isDevelopment) {
        await model.sync({ alter: true });
        console.log(`🔄 Modèle '${tableName}' synchronisé avec alter`);
      } else {
        await model.sync();
        console.log(`🔄 Modèle '${tableName}' synchronisé`);
      }
    } catch (error) {
      console.error(`❌ Erreur lors de la synchronisation du modèle '${tableName}':`, error);
      throw error;
    }
  }

  public async isConnected(): Promise<boolean> {
    try {
      await this.sequelize.authenticate();
      return true;
    } catch (error) {
      console.error(`❌ Vérification de connexion échouée:`, error);
      return false;
    }
  }

  // endregion

  // region Database Create/Update methods

  protected async insertOne(tableName: string, data: Record<string, any>): Promise<number | null> {
    try {
      const model = this.getModel(tableName);
      if (!model) return null;

      const createdInstance = await model.create(data, {
        returning: ['id'],
      });
      return Number(createdInstance.get('id'));
    } catch (error) {
      console.error(error);
      throw error;
      // return null;
    }
  }

  protected async updateOne(
    tableName: string,
    data: Record<string, any>,
    whereOptions: Record<string, any>
  ): Promise<number | null> {
    try {
      const model = this.getModel(tableName);
      if (!model) return null;

      const [affectedCount] = await model.update(data, {
        where: whereOptions,
      });

      return affectedCount > 0 ? affectedCount : null;
    } catch (error) {
      console.error(`❌ Erreur lors de la mise à jour dans '${tableName}':`, error);
      throw error;
    }
  }

  protected async deleteOne(
    tableName: string,
    whereOptions: Record<string, any>
  ): Promise<boolean> {
    try {
      const model = this.getModel(tableName);
      if (!model) return false;

      const deletedCount = await model.destroy({
        where: whereOptions,
      });
      return deletedCount > 0;
    } catch (error) {
      console.error(`❌ Erreur lors de la suppression dans '${tableName}':`, error);
      return false;
    }
  }

  // endregion

  protected async findOne(tableName: string, options: Record<string, any>): Promise<any> {
    try {
      const model = this.getModel(tableName);
      if (!model) return null;

      const result = await model.findOne({
        where: options,
      });

      return result ? result : null;
    } catch (error) {
      console.error(`❌ Erreur lors de la recherche dans '${tableName}':`, error);
      return null;
    }
  }

  protected async findAll(tableName: string, options: Record<string, any> = {}): Promise<any[]> {
    try {
      const model = this.getModel(tableName);
      if (!model) return [];

      const results = await model.findAll({
        where: options,
      });

      return results.map((result) => result);
    } catch (error) {
      console.error(`❌ Erreur lors de la recherche multiple dans '${tableName}':`, error);
      return [];
    }
  }

  protected async count(
    tableName: string,
    whereOptions: Record<string, any> = {}
  ): Promise<number> {
    const model = this.getModel(tableName);
    if (!model) return 0;

    try {
      return await model.count({ where: whereOptions });
    } catch (error) {
      console.error(`❌ Erreur lors du comptage dans '${tableName}':`, error);
      return 0;
    }
  }

  // Gestion des transactions
  protected async transaction<T>(callback: (transaction: any) => Promise<T>): Promise<T | null> {
    const transaction = await this.sequelize.transaction();

    try {
      const result = await callback(transaction);
      await transaction.commit();
      console.log('✅ Transaction validée avec succès');
      return result;
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Transaction annulée:', error);
      return null;
    }
  }

  // Méthodes de fermeture
  public async close(): Promise<void> {
    // Méthode instance pour fermer proprement
    console.log('🔌 Fermeture de la connexion...');
  }
  public static async closeConnection(): Promise<void> {
    if (Db.sequelizeInstance) {
      try {
        await Db.sequelizeInstance.close();
        console.log('✅ Connexion à la base de données fermée avec succès');
      } catch (error) {
        console.error('❌ Erreur lors de la fermeture de la connexion:', error);
      } finally {
        Db.sequelizeInstance = null;
        Db.instance = null;
        Db.isInitialized = false;
      }
    }
  }

  // ===============================
  // NOUVELLES MÉTHODES UTILITAIRES
  // ===============================

  async init(): Promise<void> {
    // Méthode vide par défaut, surchargée dans les modèles
  }
}

// import { Sequelize, Model, ModelStatic } from 'sequelize';
//
// export abstract class Db {
//   private static readonly DB_NAME: string = 'priceradb25';
//   private static readonly DB_PASSWORD: string = 'MonMotDePasseSecurise123!';
//   private static readonly DB_USERNAME: string = 'priceradmin';
//   private static readonly DB_HOST: string = '192.168.100.103';
//   private static readonly DB_PORT: number = 5432;
//
//   // Instance single
//   protected static sequelize: Sequelize | null = null;
//
//   protected sequelize: Sequelize;
//   private models: Map<string, ModelStatic<Model>> = new Map();
//   private static isInitialized: boolean = false;
//
//   // region Constructor
//
//   // constructor() {
//   //   console.log(`🔌 === NOUVELLE CONNEXION DB CRÉÉE ===`);
//   //   console.log(`🕐 Timestamp:`, new Date().toISOString());
//   //   console.log(`📊 Stack trace:`, new Error().stack?.split('\n')[2]);
//   //
//   //   this.sequelize = new Sequelize(Db.DB_NAME, Db.DB_USERNAME, Db.DB_PASSWORD, {
//   //     host: Db.DB_HOST,
//   //     port: Db.DB_PORT,
//   //     dialect: 'postgres',
//   //     logging: false,
//   //   });
//   // }
//   constructor() {
//     // Constructeur privé pour empêcher l'instanciation directe
//     if (!Db.sequelize) {
//       console.log(`🔌 === CONNEXION DB SINGLETON CRÉÉE ===`);
//       console.log(`🕐 Timestamp:`, new Date().toISOString());
//
//       Db.sequelize = new Sequelize(Db.DB_NAME, Db.DB_USERNAME, Db.DB_PASSWORD, {
//         host: Db.DB_HOST,
//         port: Db.DB_PORT,
//         dialect: 'postgres',
//         logging: false,
//         // Configuration pour optimiser les connexions
//         pool: {
//           max: 10, // Maximum 10 connexions dans le pool
//           min: 0, // Minimum 0 connexions
//           acquire: 30000, // Temps max pour obtenir une connexion (30s)
//           idle: 10000, // Temps max qu'une connexion peut rester inactive (10s)
//         },
//       });
//     }
//     this.sequelize = Db.sequelize;
//   }
//
//   // endregion
//
//   // region Helpers methods
//
//   // Méthode pour obtenir l'instance singleton
//   public static getInstance(): Db {
//     return new Db().instance;
//   }
//
//   // Méthode pour initialiser la base de données une seule fois
//   protected static async initialize(): Promise<void> {
//     if (Db.isInitialized) return;
//
//     const instance = Db.getInstance();
//     try {
//       await instance.sequelize.authenticate();
//       console.log('✅ Connexion à la base de données établie avec succès');
//       Db.isInitialized = true;
//     } catch (error) {
//       console.error('❌ Impossible de se connecter à la base de données:', error);
//       throw error;
//     }
//   }
//
//   defineModel(tableName: string, attributes: Record<string, any>): ModelStatic<Model> {
//     const model = this.sequelize.define(tableName, attributes);
//     this.models.set(tableName, model);
//     return model;
//   }
//
//   async syncModel(tableName: string): Promise<void> {
//     const model = this.models.get(tableName);
//     if (model) {
//       const isDevelopment = process.env.NODE_ENV !== 'production';
//       if (isDevelopment) {
//         await model.sync({ alter: true });
//       } else {
//         await model.sync();
//       }
//     }
//   }
//
//   async isConnected(): Promise<boolean> {
//     try {
//       await this.sequelize.authenticate();
//       return true;
//     } catch (error) {
//       console.error(error);
//       return false;
//     }
//   }
//
//   // endregion
//
//   // region Database Create/Update methods
//
//   async insertOne(tableName: string, data: Record<string, any>): Promise<number | null> {
//     try {
//       const model = this.models.get(tableName);
//       if (!model) return null;
//
//       const createdInstance = await model.create(data, {
//         returning: ['id'],
//       });
//       return Number(createdInstance.get('id'));
//     } catch (error) {
//       console.error(error);
//       return null;
//     }
//   }
//
//   async updateOne(
//     tableName: string,
//     data: Record<string, any>,
//     whereOptions: Record<string, any>
//   ): Promise<any> {
//     try {
//       const model = this.models.get(tableName);
//       if (!model) return null;
//
//       const [affectedCount] = await model.update(data, {
//         where: whereOptions,
//       });
//
//       return affectedCount > 0 ? affectedCount : null;
//     } catch (error) {
//       console.error(error);
//       return null;
//     }
//   }
//
//   async deleteOne(tableName: string, whereOptions: Record<string, any>): Promise<boolean> {
//     try {
//       const model = this.models.get(tableName);
//       if (!model) return false;
//
//       const deletedCount = await model.destroy({
//         where: whereOptions,
//       });
//       return deletedCount > 0;
//     } catch (error) {
//       console.error('Erreur lors de la suppression:', error);
//       return false;
//     }
//   }
//
//   // endregion
//
//   async findOne(tableName: string, options: Record<string, any>): Promise<any> {
//     try {
//       const model = this.models.get(tableName);
//       if (!model) return null;
//
//       const result = await model.findOne({
//         where: options,
//       });
//
//       return result ? result.toJSON() : null;
//     } catch (error) {
//       console.error(error);
//       return null;
//     }
//   }
//
//   async findAll(tableName: string, options: Record<string, any> = {}): Promise<any[]> {
//     try {
//       const model = this.models.get(tableName);
//       if (!model) return [];
//
//       const results = await model.findAll({
//         where: options,
//       });
//
//       return results.map((result) => result.toJSON());
//     } catch (error) {
//       console.error('Erreur lors de la recherche multiple:', error);
//       return [];
//     }
//   }
//
//   // ===============================
//   // NOUVELLES MÉTHODES UTILITAIRES
//   // ===============================
//
//   async init(): Promise<void> {
//     // Méthode vide par défaut, surchargée dans les modèles
//   }
//
//   public static async closeConnection(): Promise<void> {
//     if (Db.sequelize) {
//       await Db.sequelize.close();
//       console.log('🔌 Connexion à la base de données fermée');
//       Db.sequelize = null;
//       Db.instance = null;
//       Db.isInitialized = false;
//     }
//   }
//
//   async close(): Promise<void> {
//     // await this.sequelize.close();
//   }
// }
