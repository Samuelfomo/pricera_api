import { DataTypes } from 'sequelize';

import { BaseModel } from '../tools/database';

export default class LexiconModel extends BaseModel {
  public readonly db = {
    tableName: 'lexicon',
    id: 'id',
    guid: 'guid',
    portable: 'portable',
    reference: 'reference',
    english: 'english',
    french: 'french',
  } as const;

  protected id?: number;
  protected guid?: number | null;
  protected reference?: string;
  protected english?: string;
  protected french?: string;
  protected portable?: boolean;

  protected constructor() {
    super();
  }

  async init(): Promise<void> {
    await super.init(); // CRUCIAL : initialise this.sequelize AVANT tout
    this.initModel(); // Puis définit le modèle
    await this.syncModel(this.db.tableName); // Puis synchronise
    console.log('✅ LexiconModel initialisé');
  }

  private initModel() {
    const attributes = {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: 'Lexicon ID',
      },
      guid: {
        type: DataTypes.INTEGER,
        unique: { name: 'unique-country-guid', msg: 'The guid of country must be unique' },
        allowNull: false,
        comment: 'Unique general identifier',
      },
      reference: {
        type: DataTypes.STRING(128),
        allowNull: false,
        unique: {
          name: 'unique-lexicon-reference',
          msg: 'The reference of lexicon must be unique',
        },
        comment: 'Reference',
      },
      english: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      french: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'French',
      },
    };

    this.defineModel(this.db.tableName, attributes, { timestamps: false });
  }

  // MÉTHODES DE RECHERCHE
  protected async find(id: number): Promise<any> {
    return await this.findOne(this.db.tableName, { [this.db.id]: id });
  }

  protected async findByReference(reference: string): Promise<any> {
    return await this.findOne(this.db.tableName, { [this.db.reference]: reference });
  }

  protected async findAllLexicon(conditions: Record<string, any> = {}): Promise<any[]> {
    return await this.findAll(this.db.tableName, conditions);
  }

  // MÉTHODES CRUD
  async create(): Promise<void> {
    this.validate();
    let guid = this.guid;
    if (!guid) {
      guid = await this.getGuid(this.db.tableName);
    }
    if (!guid) {
      throw new Error(`guid not generated`);
    }
    console.log(`guid generated is ${guid}`);

    const dataToInsert = {
      [this.db.guid]: guid,
      [this.db.reference]: this.reference,
      [this.db.english]: this.english,
      [this.db.french]: this.french,
      [this.db.portable]: this.portable,
    };

    const lastID = await this.insertOne(this.db.tableName, dataToInsert);
    if (!lastID) {
      throw new Error('Failed to create Country');
    }
    this.id = lastID;
    this.guid = guid;

    console.log(`Country created is ${this}`);
  }

  protected async update(): Promise<void> {
    this.validate();

    if (!this.id) {
      throw new Error('Client ID is required for update');
    }

    const updateData: Record<string, any> = {};
    if (this.reference !== undefined) updateData[this.db.reference] = this.reference;
    if (this.english !== undefined) updateData[this.db.english] = this.english;
    if (this.french !== undefined) updateData[this.db.french] = this.french;

    const affected = await this.updateOne(this.db.tableName, updateData, { [this.db.id]: this.id });

    if (!affected) {
      throw new Error('Failed to update client');
    }
  }

  protected async deleted(id: number): Promise<boolean> {
    return await this.deleteOne(this.db.tableName, { [this.db.id]: id });
  }

  // VALIDATION (synchrone et simple)
  private validate(): void {}
}
