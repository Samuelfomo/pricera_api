import { DataTypes } from 'sequelize';

import { BaseModel } from '../tools/database';
import G from '../tools/glossary';

export default class CountryModel extends BaseModel {
  public readonly db = {
    tableName: 'country',
    id: 'id',
    guid: 'guid',
    code: 'code',
    iso: 'iso',
    name: 'name',
    timezone: 'timezone',
    mobileRegex: 'mobileRegex',
    flag: 'flag',
  };

  protected id?: number;
  protected guid?: number;
  protected code?: number;
  protected iso?: string;
  protected name?: string;
  protected timezone?: string;
  protected mobileRegex?: string;
  protected flag?: string | null;

  protected constructor() {
    super();
  }

  async init(): Promise<void> {
    await super.init();
    this.initModel();
    await this.syncModel(this.db.tableName);
    console.log('✅ CountryModel initialisé');
  }

  private initModel(): void {
    const attributes = {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: 'Country ID',
      },
      guid: {
        type: DataTypes.INTEGER,
        unique: { name: 'unique-country-guid', msg: 'The guid of country must be unique' },
        allowNull: false,
        comment: 'Unique general identifier',
      },
      code: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: { name: 'unique-country-code', msg: 'Country code must be unique' },
        comment: 'Custom  country dialcode',
      },
      iso: {
        type: DataTypes.STRING(2),
        allowNull: false,
        unique: { name: 'unique-country-iso', msg: 'Country ISO must be unique' },
        comment: 'ISO Alpha-2',
      },
      name: {
        type: DataTypes.STRING(128),
        allowNull: false,
        comment: 'Country name',
      },
      timezone: {
        type: DataTypes.STRING(64),
        allowNull: false,
        comment: 'Timezone (GMT+1)',
      },
      mobileRegex: {
        type: DataTypes.STRING(256),
        allowNull: false,
        comment: 'Regex keys (mtnCM|orangeCM|blueCM)',
      },
      // mobileRegex: {
      //   type: DataTypes.JSONB,
      //   allowNull: false,
      //   comment: 'List of mobile regex keys for this country',
      // },
      flag: {
        type: DataTypes.STRING(4),
        allowNull: true,
        comment: 'Flag emoji (e.g : 🇨🇲)',
      },
    };

    this.defineModel(this.db.tableName, attributes, { timestamps: false });
  }

  protected async find(id: number): Promise<any> {
    return await this.findOne(this.db.tableName, {
      [this.db.id]: id,
    });
  }

  protected async findAllCountry(conditions: Record<string, any> = {}): Promise<any[]> {
    return await this.findAll(this.db.tableName, conditions);
  }

  protected async findByAttribut(value: any, attribut: string = this.db.guid): Promise<any> {
    return await this.findOne(this.db.tableName, { [attribut]: value });
  }

  async create(): Promise<void> {
    this.validate();
    let guid = this.guid;
    if (!guid) {
      guid = Number(this.getGuid(this.db.tableName));
    }
    if (!guid) {
      throw new Error(`guid not generated`);
    }
    console.log(`guid generated is ${guid}`);

    const dataToInsert = {
      [this.db.guid]: guid,
      [this.db.code]: this.code,
      [this.db.iso]: this.iso,
      [this.db.name]: this.name,
      [this.db.timezone]: this.timezone,
      [this.db.mobileRegex]: this.mobileRegex,
      [this.db.flag]: this.flag,
    };

    const lastID = await this.insertOne(this.db.tableName, dataToInsert);
    if (!lastID) {
      throw new Error('Failed to create Country');
    }
    this.id = lastID;
    this.guid = guid;

    console.log(`Country created is ${this}`);
  }

  async update(): Promise<void> {
    this.validate();

    if (!this.id) {
      throw new Error('Country ID is required for update');
    }
    const updateData: Record<string, any> = {};
  }

  private validate(): void {
    const iso = this.iso?.trim();
    const name = this.name?.trim();
    const tz = this.timezone?.trim();
    const regex = this.mobileRegex?.trim();
    if (!this.code || isNaN(this.code))
      throw new Error(`Country code ${G.missingRequired.message}`);
    if (!iso || iso.length !== 2) throw new Error(`Country iso ${G.missingRequired.message}`);
    if (!name || name.length < 2) throw new Error(`Country name ${G.missingRequired.message}`);
    if (!tz) throw new Error(`Country timezone ${G.missingRequired.message}`);
    if (!regex) throw new Error(`Country mobileRegex ${G.missingRequired.message}`);
  }
}
