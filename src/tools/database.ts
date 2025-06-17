import { Sequelize, Model, ModelStatic, QueryTypes } from 'sequelize';
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

  // Méthode à ajouter dans BaseModel
  private checkInitialized(): void {
    if (!this.sequelize) {
      throw new Error("BaseModel non initialisé. Appelez init() d'abord !");
    }
  }

  /**
   * Génère un GUID basé sur MAX(id) + offset
   */
  protected async getGuid(tableName: string, length: number = 6): Promise<number | null> {
    this.checkInitialized();
    try {
      const model = this.getModel(tableName);
      if (!model) {
        console.error(`❌ Modèle '${tableName}' non trouvé pour génération GUID`);
        return null;
      }

      if (length < 3) {
        console.error(`❌ Taille '${length}' non autorisé pour la génération GUID`);
        return null;
      }

      // Calculer l'offset : 10^length
      const offset = Math.pow(10, length - 1);

      // Requête SQL pour obtenir MAX(id) + 1
      const query = `SELECT COALESCE(MAX(id), 0) + 1 as next_id
                     FROM ${tableName}`;
      const [results] = (await this.sequelize.query(query, {
        type: QueryTypes.SELECT, // ✅ Corrigé
      })) as any[];

      const nextId = results?.next_id || 1;
      const guid = offset + nextId;

      console.log(
        `🔢 GUID généré pour '${tableName}': ${guid} (offset: ${offset}, next_id: ${nextId})`
      );

      return guid;
    } catch (error: any) {
      console.error(`❌ Erreur génération GUID pour '${tableName}':`, error.message);
      return null;
    }
  }

  /**
   * Génère un token basé sur timestamp + GUID
   */
  protected async getTimeBasedToken(
    tableName: string,
    length: number = 3,
    divider: string = '-',
    prefix: string = 'A'
  ): Promise<string | null> {
    this.checkInitialized();
    try {
      // Générer le timestamp: YYYYMMDDHHMMSS
      const now = new Date();
      const timestamp = [
        now.getFullYear(),
        (now.getMonth() + 1).toString().padStart(2, '0'),
        now.getDate().toString().padStart(2, '0'),
        now.getHours().toString().padStart(2, '0'),
        now.getMinutes().toString().padStart(2, '0'),
        now.getSeconds().toString().padStart(2, '0'),
      ].join('');

      // Générer le GUID
      const guid = await this.getGuid(tableName, length);
      if (!guid) {
        console.error(`❌ Impossible de générer GUID pour token basé sur le temps`);
        return null;
      }

      // Construire le token final
      const token = `${prefix}${divider}${timestamp}${divider}${guid}`;

      console.log(`🕐 Token temporel généré: ${token}`);

      return token;
    } catch (error: any) {
      console.error(`❌ Erreur génération token temporel:`, error.message);
      return null;
    }
  }

  /**
   * Génère un token UUID via PostgreSQL gen_random_uuid()
   */
  protected async getTokenUUID(tableName: string): Promise<string | null> {
    this.checkInitialized();
    try {
      const model = this.getModel(tableName);
      if (!model) {
        console.error(`❌ Modèle '${tableName}' non trouvé pour génération UUID`);
        return null;
      }

      // Utiliser gen_random_uuid() de PostgreSQL
      const query = 'SELECT gen_random_uuid()::text as uuid';
      const [results] = (await this.sequelize.query(query, {
        type: QueryTypes.SELECT, // ✅ Corrigé
      })) as any[];

      const uuid = results?.uuid;

      if (!uuid) {
        console.error(`❌ UUID non généré par PostgreSQL`);
        return null;
      }

      console.log(`🆔 UUID PostgreSQL généré: ${uuid}`);

      return uuid;
    } catch (error: any) {
      console.error(`❌ Erreur génération UUID PostgreSQL:`, error.message);

      // Fallback: Si gen_random_uuid() n'est pas disponible
      try {
        console.log(`🔄 Tentative avec uuid_generate_v4()...`);
        const fallbackQuery = 'SELECT uuid_generate_v4()::text as uuid';
        const [fallbackResults] = (await this.sequelize.query(fallbackQuery, {
          type: QueryTypes.SELECT, // ✅ Corrigé
        })) as any[];

        const fallbackUuid = fallbackResults?.uuid;
        if (fallbackUuid) {
          console.log(`🆔 UUID fallback généré: ${fallbackUuid}`);
          return fallbackUuid;
        }
      } catch (fallbackError: any) {
        console.error(
          `❌ Extension UUID non disponible. Installez: CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`,
          fallbackError.message
        );
      }

      return null;
    }
  }
}
