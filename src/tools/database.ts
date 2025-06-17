// src/tools/database.ts - Version simplifiée et nettoyée
import { Sequelize, Model, ModelStatic } from 'sequelize';
import { config } from 'dotenv';

config();

export default class Db {
  private static readonly DB_NAME: string = process.env.DB_NAME!;
  private static readonly DB_PASSWORD: string = process.env.DB_PASSWORD!;
  private static readonly DB_USERNAME: string = process.env.DB_USERNAME!;
  private static readonly DB_HOST: string = process.env.DB_HOST!;
  private static readonly DB_PORT: number = Number(process.env.DB_PORT!);

  // VRAI singleton - une seule instance
  private static instance: Sequelize | null = null;
  private static isInitialized: boolean = false;

  // Méthode statique pour obtenir l'instance unique
  public static async getInstance(): Promise<Sequelize> {
    if (!Db.instance) {
      console.log('🔌 Création connexion DB singleton');

      Db.instance = new Sequelize(Db.DB_NAME, Db.DB_USERNAME, Db.DB_PASSWORD, {
        host: Db.DB_HOST,
        port: Db.DB_PORT,
        dialect: 'postgres',
        logging: console.log, // Active les logs SQL pour debug
        dialectOptions: {
          // Force IPv4
          family: 4,
        },
        pool: {
          max: 10,
          min: 0,
          acquire: 30000,
          idle: 10000,
        },
      });

      try {
        await Db.instance.authenticate();
        Db.isInitialized = true;
        console.log('✅ Connexion DB établie');
      } catch (error) {
        console.error('❌ Erreur connexion DB:', error);
        throw error;
      }
    }
    return Db.instance;
  }

  public static async closeConnection(): Promise<void> {
    if (Db.instance) {
      await Db.instance.close();
      Db.instance = null;
      Db.isInitialized = false;
      console.log('🔌 Connexion DB fermée');
    }
  }

  public static isConnected(): boolean {
    return Db.isInitialized;
  }
}

// Classe de base pour les modèles (remplace l'ancien Db)
export abstract class BaseModel {
  protected sequelize!: Sequelize;
  // FIX : Map statique partagée entre TOUTES les instances
  protected static sharedModels: Map<string, ModelStatic<Model>> = new Map();

  protected constructor() {
    // Constructor vide - initialisation dans init()
  }

  // IMPORTANT : Cette méthode DOIT être appelée avant toute opération
  protected async init(): Promise<void> {
    this.sequelize = await Db.getInstance();
    console.log('🔗 BaseModel initialisé avec connexion DB');
  }

  protected defineModel(
    tableName: string,
    attributes: Record<string, any>,
    options?: any
  ): ModelStatic<Model> {
    // Utilise la Map statique partagée
    if (BaseModel.sharedModels.has(tableName)) {
      // console.log(`⚠️ Le modèle '${tableName}' existe déjà dans la Map partagée`);
      return BaseModel.sharedModels.get(tableName)!;
    }

    console.log(`🏗️ Création du modèle '${tableName}'`);
    const model = this.sequelize.define(tableName, attributes, { tableName, ...options });
    BaseModel.sharedModels.set(tableName, model);

    // console.log(`✅ Modèle '${tableName}' ajouté à la Map partagée. Taille:`, BaseModel.sharedModels.size);
    // console.log(`🔍 Clés dans la Map partagée:`, Array.from(BaseModel.sharedModels.keys()));

    return model;
  }

  protected getModel(tableName: string): ModelStatic<Model> | null {
    // Debug uniquement si modèle pas trouvé
    const model = BaseModel.sharedModels.get(tableName);

    if (!model) {
      console.log(`🔍 Recherche du modèle '${tableName}' dans la Map partagée`);
      console.log(`📊 Taille actuelle de la Map partagée:`, BaseModel.sharedModels.size);
      console.log(`🗝️ Clés disponibles:`, Array.from(BaseModel.sharedModels.keys()));
      console.error(`❌ Modèle '${tableName}' non trouvé dans la Map partagée !`);
      return null;
    }

    return model;
  }

  protected async syncModel(tableName: string, force: boolean = false): Promise<void> {
    const model = this.getModel(tableName);
    if (!model) throw new Error(`Modèle '${tableName}' non trouvé`);

    try {
      const isDevelopment = process.env.NODE_ENV !== 'production';
      await model.sync(force ? { force: true } : isDevelopment ? { alter: true } : {});
      console.log(`🔄 Modèle '${tableName}' synchronisé`);
    } catch (error) {
      console.error(`❌ Erreur sync '${tableName}':`, error);
      throw error;
    }
  }

  // Gardez vos méthodes CRUD existantes
  protected async insertOne(tableName: string, data: Record<string, any>): Promise<number | null> {
    try {
      const model = this.getModel(tableName);
      if (!model) return null;

      const created = await model.create(data, { returning: ['id'] });
      return Number(created.get('id'));
    } catch (error: any) {
      throw error.message;
    }
  }

  protected async updateOne(
    tableName: string,
    data: Record<string, any>,
    where: Record<string, any>
  ): Promise<number | null> {
    try {
      const model = this.getModel(tableName);
      if (!model) return null;

      const [affectedCount] = await model.update(data, { where });
      return affectedCount > 0 ? affectedCount : null;
    } catch (error) {
      console.error('❌ Erreur mise à jour:', error);
      throw error;
    }
  }

  protected async deleteOne(tableName: string, where: Record<string, any>): Promise<boolean> {
    try {
      const model = this.getModel(tableName);
      if (!model) return false;

      const deletedCount = await model.destroy({ where });
      return deletedCount > 0;
    } catch (error) {
      console.error('❌ Erreur suppression:', error);
      return false;
    }
  }

  protected async findOne(tableName: string, where: Record<string, any>): Promise<any> {
    try {
      const model = this.getModel(tableName);
      if (!model) return null;

      const result = await model.findOne({ where });
      return result ? result.get() : null;
    } catch (error) {
      console.error('❌ Erreur recherche:', error);
      return null;
    }
  }

  protected async findAll(tableName: string, where: Record<string, any> = {}): Promise<any[]> {
    try {
      const model = this.getModel(tableName);
      if (!model) return [];

      const results = await model.findAll({ where });
      return results.map((result) => result.get());
    } catch (error) {
      console.error('❌ Erreur recherche multiple:', error);
      return [];
    }
  }
}
