import { Sequelize, Model, ModelStatic } from 'sequelize';

export abstract class Db {
  private static readonly DB_NAME: string = 'priceradb25';
  private static readonly DB_PASSWORD: string = 'MonMotDePasseSecurise123!';
  private static readonly DB_USERNAME: string = 'priceradmin';
  private static readonly DB_HOST: string = '192.168.100.103';
  private static readonly DB_PORT: number = 5432;

  // Instance single
  protected static sequelize: Sequelize | null = null;

  protected sequelize: Sequelize;
  private models: Map<string, ModelStatic<Model>> = new Map();
  private static isInitialized: boolean = false;

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
  constructor() {
    // Constructeur privé pour empêcher l'instanciation directe
    if (!Db.sequelize) {
      console.log(`🔌 === CONNEXION DB SINGLETON CRÉÉE ===`);
      console.log(`🕐 Timestamp:`, new Date().toISOString());

      Db.sequelize = new Sequelize(Db.DB_NAME, Db.DB_USERNAME, Db.DB_PASSWORD, {
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
    this.sequelize = Db.sequelize;
  }

  // endregion

  // region Helpers methods

  // Méthode pour obtenir l'instance singleton
  public static getInstance(): Db {
    return new Db().instance;
  }

  // Méthode pour initialiser la base de données une seule fois
  protected static async initialize(): Promise<void> {
    if (Db.isInitialized) return;

    const instance = Db.getInstance();
    try {
      await instance.sequelize.authenticate();
      console.log('✅ Connexion à la base de données établie avec succès');
      Db.isInitialized = true;
    } catch (error) {
      console.error('❌ Impossible de se connecter à la base de données:', error);
      throw error;
    }
  }

  defineModel(tableName: string, attributes: Record<string, any>): ModelStatic<Model> {
    const model = this.sequelize.define(tableName, attributes);
    this.models.set(tableName, model);
    return model;
  }

  async syncModel(tableName: string): Promise<void> {
    const model = this.models.get(tableName);
    if (model) {
      const isDevelopment = process.env.NODE_ENV !== 'production';
      if (isDevelopment) {
        await model.sync({ alter: true });
      } else {
        await model.sync();
      }
    }
  }

  async isConnected(): Promise<boolean> {
    try {
      await this.sequelize.authenticate();
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  // endregion

  // region Database Create/Update methods

  async insertOne(tableName: string, data: Record<string, any>): Promise<number | null> {
    try {
      const model = this.models.get(tableName);
      if (!model) return null;

      const createdInstance = await model.create(data, {
        returning: ['id'],
      });
      return Number(createdInstance.get('id'));
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async updateOne(
    tableName: string,
    data: Record<string, any>,
    whereOptions: Record<string, any>
  ): Promise<any> {
    try {
      const model = this.models.get(tableName);
      if (!model) return null;

      const [affectedCount] = await model.update(data, {
        where: whereOptions,
      });

      return affectedCount > 0 ? affectedCount : null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async deleteOne(tableName: string, whereOptions: Record<string, any>): Promise<boolean> {
    try {
      const model = this.models.get(tableName);
      if (!model) return false;

      const deletedCount = await model.destroy({
        where: whereOptions,
      });
      return deletedCount > 0;
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      return false;
    }
  }

  // endregion

  async findOne(tableName: string, options: Record<string, any>): Promise<any> {
    try {
      const model = this.models.get(tableName);
      if (!model) return null;

      const result = await model.findOne({
        where: options,
      });

      return result ? result.toJSON() : null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async findAll(tableName: string, options: Record<string, any> = {}): Promise<any[]> {
    try {
      const model = this.models.get(tableName);
      if (!model) return [];

      const results = await model.findAll({
        where: options,
      });

      return results.map((result) => result.toJSON());
    } catch (error) {
      console.error('Erreur lors de la recherche multiple:', error);
      return [];
    }
  }

  // ===============================
  // NOUVELLES MÉTHODES UTILITAIRES
  // ===============================

  async init(): Promise<void> {
    // Méthode vide par défaut, surchargée dans les modèles
  }

  public static async closeConnection(): Promise<void> {
    if (Db.sequelize) {
      await Db.sequelize.close();
      console.log('🔌 Connexion à la base de données fermée');
      Db.sequelize = null;
      Db.instance = null;
      Db.isInitialized = false;
    }
  }

  async close(): Promise<void> {
    // await this.sequelize.close();
  }
}
