import { DataTypes } from 'sequelize';

import { ApiKeyManager } from '../tools/api-key-manager';
import { BaseModel } from '../tools/database';

export default class ClientModel extends BaseModel {
  public readonly db = {
    tableName: 'xf_clients',
    id: 'id',
    name: 'name',
    token: 'token',
    secret: 'secret',
    active: 'active',
  } as const;

  protected id?: number;
  protected name?: string;
  protected token?: string;
  protected secret?: string;
  protected active?: boolean;

  protected constructor() {
    super();
  }

  async init(): Promise<void> {
    await super.init(); // CRUCIAL : initialise this.sequelize AVANT tout
    this.initModel(); // Puis définit le modèle
    await this.syncModel(this.db.tableName); // Puis synchronise
    console.log('✅ ClientModel initialisé');
  }

  private initModel() {
    const attributes = {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: 'Client ID',
      },
      name: {
        type: DataTypes.STRING(128),
        unique: { name: 'unique_client_name', msg: 'app_name_is_unique' },
        allowNull: false,
        comment: 'Application name',
      },
      token: {
        type: DataTypes.STRING(64),
        unique: { name: 'unique_client_token', msg: 'The token must be unique' },
        allowNull: false,
        comment: 'API Token',
      },
      secret: {
        type: DataTypes.STRING(64),
        allowNull: false,
        comment: 'Secret key',
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Is active',
      },
    };

    this.defineModel(this.db.tableName, attributes, { timestamps: true });
  }

  // MÉTHODES DE RECHERCHE
  protected async find(id: number): Promise<any> {
    return await this.findOne(this.db.tableName, { [this.db.id]: id });
  }

  protected async findByToken(token: string): Promise<any> {
    return await this.findOne(this.db.tableName, { [this.db.token]: token });
  }

  protected async findByName(name: string): Promise<any> {
    return await this.findOne(this.db.tableName, { [this.db.name]: name });
  }

  protected async findAllClient(conditions: Record<string, any> = {}): Promise<any[]> {
    return await this.findAll(this.db.tableName, conditions);
  }

  // MÉTHODES CRUD
  protected async create(): Promise<void> {
    // console.log('🚀 Début de create()');
    this.validate(); // Synchrone maintenant

    // Générer token unique
    const fullToken = ApiKeyManager.generate(this.secret!);
    const tokenPart = fullToken.split('.')[0];

    console.log(`🔑 Token généré - API Key: ${tokenPart} | Secret: ${fullToken.split('.')[1]}`);

    // Vérifier unicité du token (rare mais possible)
    // console.log('🔍 Vérification unicité du token...');
    const existingToken = await this.findByToken(tokenPart);
    if (existingToken) {
      throw new Error('Token collision detected, please retry');
    }
    // console.log('✅ Token unique confirmé');

    // Debug : voir les données à insérer
    const dataToInsert = {
      [this.db.name]: this.name,
      [this.db.token]: tokenPart,
      [this.db.secret]: this.secret,
      [this.db.active]: true,
    };

    // console.log('📝 Données à insérer:', dataToInsert);

    // console.log('💾 Appel insertOne...');
    const lastID = await this.insertOne(this.db.tableName, dataToInsert);

    // console.log('🔍 ID retourné par insertOne:', lastID);

    if (!lastID) {
      throw new Error('Failed to create client');
    }

    this.id = lastID;
    this.token = tokenPart;
    this.active = true;

    console.log('✅ Client créé avec ID:', this.id);
  }

  protected async update(): Promise<void> {
    this.validate();

    if (!this.id) {
      throw new Error('Client ID is required for update');
    }

    const updateData: Record<string, any> = {};
    if (this.name !== undefined) updateData[this.db.name] = this.name;
    if (this.active !== undefined) updateData[this.db.active] = this.active;

    const affected = await this.updateOne(this.db.tableName, updateData, { [this.db.id]: this.id });

    if (!affected) {
      throw new Error('Failed to update client');
    }
  }

  protected async deleted(id: number): Promise<boolean> {
    return await this.deleteOne(this.db.tableName, { [this.db.id]: id });
  }

  protected async toggleStatus(id: number): Promise<void> {
    if (isNaN(id)) {
      throw new Error('Invalid client ID');
    }

    const client = await this.find(id);
    if (!client) {
      throw new Error('Client not found');
    }

    const newStatus = !client.active;
    const affected = await this.updateOne(
      this.db.tableName,
      { [this.db.active]: newStatus },
      { [this.db.id]: id }
    );

    if (!affected) {
      throw new Error('Failed to toggle client status');
    }
  }

  // VALIDATION (synchrone et simple)
  private validate(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new Error('Client name is required');
    }

    if (!this.secret || this.secret.trim().length < 8) {
      throw new Error('Client secret must be at least 8 characters');
    }
  }

  // todo supprimer une fois compris comment ça marche

  // À ajouter dans ClientModel.ts
  /**
   * Génère un GUID numérique pour ce client
   * Exemple: si MAX(id)=5 et length=6 → 1000006
   */
  async generateClientGuid(length: number = 6): Promise<number | null> {
    return await this.getGuid(this.db.tableName, length);
  }

  /**
   * Génère un token basé sur le temps
   * Exemple: A-20250617194025-1001
   */
  async generateTimeBasedClientToken(length: number = 3): Promise<string | null> {
    return await this.getTimeBasedToken(this.db.tableName, length, '', 'CLI');
  }

  /**
   * Génère un UUID PostgreSQL
   * Exemple: 550e8400-e29b-41d4-a716-446655440000
   */
  async generateUUIDClientToken(): Promise<string | null> {
    return await this.getTokenUUID(this.db.tableName);
  }
}
