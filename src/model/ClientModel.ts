import { DataTypes } from 'sequelize';

import { ApiKeyManager } from '../tools/api-key-manager';
import Db from '../tools/database';
import W from '../tools/watcher';

export abstract class ClientModel {
  public readonly db = {
    tableName: 'xf_client',
    id: 'id',
    name: 'name',
    token: 'token',
    secret: 'secret',
    active: 'active',
  };

  protected id?: number;
  protected name?: string;
  protected token?: string;
  protected secret?: string;
  protected active?: boolean;

  // Instance de la base de données singleton
  protected dbInstance: Db;

  constructor() {
    // Récupération de l'instance singleton au lieu de créer une nouvelle connexion
    this.dbInstance = Db.getInstance();
    this.initModel();
  }

  async init(): Promise<void> {
    // Initialisation de la connexion singleton si pas encore fait
    await Db.initialize();
    // this.initModel();
    await this.dbInstance.syncModel(this.db.tableName);
  }

  private initModel() {
    const attributes = {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: 'Client',
      },
      name: {
        type: DataTypes.STRING(128),
        unique: { name: 'unique_client_name', msg: 'The app name must be unique' },
        allowNull: false,
        comment: 'Name',
      },
      token: {
        type: DataTypes.STRING(64),
        unique: { name: 'unique_client_token', msg: 'The token must be unique' },
        allowNull: false,
        comment: 'Token',
      },
      secret: {
        type: DataTypes.STRING(64),
        allowNull: false,
        comment: 'Given Secret',
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Active',
      },
    };

    this.dbInstance.defineModel(this.db.tableName, attributes);
  }

  private async generateUUID(secret: string): Promise<string> {
    return ApiKeyManager.generate(secret);
  }

  protected async find(id: number): Promise<any> {
    return await this.dbInstance.findOne(this.db.tableName, {
      [this.db.id]: id,
    });
  }

  // Nouvelle méthode findAll
  protected async findAll(conditions: Record<string, any> = {}): Promise<any[]> {
    return await this.dbInstance.findAll(this.db.tableName, conditions);
  }

  protected async findByToken(token: string): Promise<any> {
    return await this.dbInstance.findOne(this.db.tableName, {
      [this.db.token]: token,
    });
  }

  protected async findByName(name: string): Promise<any> {
    return await this.dbInstance.findOne(this.db.tableName, { [this.db.name]: name });
  }

  // Nouvelle méthode deleted
  protected async deleted(id: number): Promise<boolean> {
    return await this.dbInstance.deleteOne(this.db.tableName, { [this.db.id]: id });
    // console.log(`🗑️  Suppression du client ID ${id}: ${deletedRows} ligne(s) supprimée(s)`);
    // return deletedRows > 0;
  }

  protected async toggleStatus(id: number): Promise<any> {
    await W.isOccur(isNaN(id), `id defined is invalid`);
    const client = await this.find(id);
    if (!client) {
      throw new Error(`No client found`);
    }
    this.active = client.active;
    return await this.dbInstance.updateOne(
      this.db.tableName,
      { [this.db.active]: !this.active },
      { [this.db.id]: id }
    );
  }

  async createToken(token: string, attempt: number = 1): Promise<string> {
    const existing = await this.findByToken(token);
    if (existing) {
      if (attempt > 10) {
        throw new Error('Trop de tentatives de génération de token');
      }

      const newToken = await this.generateUUID(this.secret ?? '');
      console.log(
        `🟢 Vos tokens API :\napi-key: ${newToken.split('.')[0]}\napi-secret:${newToken.split('.')[1]}`
      );

      return this.createToken(newToken.split('.')[0], attempt + 1);
    }
    return token;
  }

  async create(): Promise<any> {
    await this.validate();
    let token = await this.generateUUID(this.secret ?? '');
    console.log(
      `🟢 Vos tokens API :\napi-key: ${token.split('.')[0]}\napi-secret:${token.split('.')[1]}`
    );
    await W.isOccur(!token, 'Token is not generated');

    const tokenPart = await this.createToken(token.split('.')[0], 3);
    const lastID = await this.dbInstance.insertOne(this.db.tableName, {
      [this.db.name]: this.name,
      [this.db.token]: tokenPart,
      [this.db.secret]: this.secret,
    });
    console.log(`🔴 lastID inserted: ${lastID}, isCorrect: ${!lastID ? 'Pomme' : 'Orange'}`);
    if (lastID) {
      this.id = lastID;
      this.token = tokenPart;
    }
  }

  async update(): Promise<any> {
    await this.validate();
    await W.isOccur(!this.id, 'Client ID is required for update');
    const updateData: Record<string, any> = {};
    // On ne met à jour que les champs qui ont été modifiés
    if (this.name !== undefined) updateData[this.db.name] = this.name;
    if (this.secret !== undefined) updateData[this.db.secret] = this.secret;
    if (this.active !== undefined) updateData.active = this.active;
    if (this.token !== undefined) updateData.token = this.token;

    // Si le secret a changé, on régénère le token
    // if (this.secret !== undefined) {
    //   let token = await this.generateUUID(this.secret);
    //   updateData[this.db.token] = await this.createToken(token.split('.')[0], 1);
    // }
    return await this.dbInstance.updateOne(this.db.tableName, updateData, {
      [this.db.id]: this.id!,
    });
  }

  private async validate(): Promise<void> {
    const name = this.name?.trim();
    const secret = this.secret?.trim();

    await W.isOccur(!name, `Client name is required`);
    await W.isOccur(!secret, `Client secret is required`);
    await W.isOccur(!secret || secret.length < 8, `Client secret is too short`);
  }
}
