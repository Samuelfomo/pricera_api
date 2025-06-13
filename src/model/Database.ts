import { QueryTypes, Model, ModelStatic, Sequelize } from 'sequelize';

import Odbc from '../tools/odbc';

export default class Db {
  private dbConnection: Odbc;
  private _findOne: (table: ModelStatic<Model>, id: number) => Promise<any | null>;
  private _findAll: (table: ModelStatic<Model>) => Promise<any | []>;

  private _lastID: (table: ModelStatic<Model>) => Promise<number>;

  private _guid: (
    table: ModelStatic<Model>,
    length?: number,
    guid?: number | null
  ) => Promise<number>;

  constructor() {
    this.dbConnection = new Odbc();

    /**
     * Get one row in table using ID
     * @param table
     * @param id
     * @returns {Promise<any|null>}
     * @private
     */
    this._findOne = async (table: ModelStatic<Model>, id: number): Promise<any | null> => {
      try {
        const entry = await table.findByPk(id);
        return entry ? entry.toJSON() : null;
      } catch (error) {
        console.error('Error retrieving entry:', error);
        throw error;
      }
    };
    this._findAll = async (table: ModelStatic<Model>): Promise<any | []> => {
      try {
        const entry = await table.findAndCountAll();
        return entry.rows ? entry.rows.map((row) => row.toJSON()) : [];
      } catch (error) {
        console.error('Error retrieving entry:', error);
        throw error;
      }
    };

    /**
     * get table last autoincrement ID
     * @param table
     * @returns {Promise<number>}
     * @private
     */
    this._lastID = async (table: ModelStatic<Model>): Promise<number> => {
      const lastRecord = await table.findOne({
        order: [['id', 'DESC']],
      });
      return lastRecord ? (lastRecord.get('id') as number) : 0;
    };

    /**
     * Generate GUID from table
     * @param table
     * @param length
     * @param guid
     * @returns {Promise<number>}
     * @private
     */
    this._guid = async (
      table: ModelStatic<Model>,
      length: number = 6,
      guid: number | null = null
    ): Promise<number> => {
      if (guid === null) {
        guid = Math.pow(10, length - 1) + ((await this._lastID(table)) + 1);
      }
      const record = await table.findOne({
        where: {
          guid: guid,
        },
      });
      return record === null ? guid : await this._guid(table, length, guid + 1);
    };
  }

  /**
   * Initialiser la connexion à la base de données
   */
  async initialize(): Promise<void> {
    await this.dbConnection.initialize();
  }

  /**
   * Vérifier si la base de données est connectée
   */
  isConnected(): boolean {
    return this.dbConnection.isConnected();
  }

  /**
   * Obtenir l'instance de Sequelize
   */
  getSequelizeInstance(): Sequelize {
    return this.dbConnection.getInstance();
  }

  /**
   * Generate GUID from table
   * @param table
   * @param length
   * @returns {Promise<number>}
   */
  async generateGuid(table: ModelStatic<Model>, length: number = 6): Promise<number> {
    return await this._guid(table, length);
  }

  /**
   * Get one row in table using ID
   * @param table - Sequelize model
   * @param id - Record ID
   * @returns {Promise<any|null>}
   */
  async getById(table: ModelStatic<Model>, id: number): Promise<any | null> {
    try {
      if (!this.isConnected()) {
        throw new Error('Database connection not established');
      }
      return await this._findOne(table, id);
    } catch (error) {
      console.error('Error in getById:', error);
      throw error;
    }
  }

  async getAll(table: ModelStatic<Model>): Promise<any | null> {
    try {
      if (!this.isConnected()) {
        throw new Error('Database connection not established');
      }
      return await this._findAll(table);
    } catch (error) {
      console.error('Error in getById:', error);
      throw error;
    }
  }

  /**
   * Get table last autoincrement ID
   * @param table - Sequelize model
   * @returns {Promise<number>}
   */
  async getLastId(table: ModelStatic<Model>): Promise<number> {
    try {
      if (!this.isConnected()) {
        throw new Error('Database connection not established');
      }
      return await this._lastID(table);
    } catch (error) {
      console.error('Error in getLastId:', error);
      throw error;
    }
  }

  /**
   * Create a new record
   * @param table - Sequelize model
   * @param data - Data to insert
   * @returns {Promise<any>}
   */
  async createRecord(table: ModelStatic<Model>, data: any): Promise<any> {
    try {
      if (!this.isConnected()) {
        throw new Error('Database connection not established');
      }

      const record = await table.create(data);
      return record.toJSON();
    } catch (error) {
      console.error('Error creating record:', error);
      throw error;
    }
  }

  /**
   * Update an existing record
   * @param table - Sequelize model
   * @param data - Data to update (must include id or primary key)
   * @returns {Promise<any>}
   */
  async updateRecord(table: ModelStatic<Model>, data: any & { id: number }): Promise<any> {
    try {
      if (!this.isConnected()) {
        throw new Error('Database connection not established');
      }

      if (!data.id) {
        throw new Error('ID is required for update operation');
      }

      const [affectedCount] = await table.update(data, {
        where: { id: data.id },
        returning: true,
      });

      if (affectedCount === 0) {
        throw new Error(`No record found with id: ${data.id}`);
      }

      // Return the updated record
      return await this.getById(table, data.id);
    } catch (error) {
      console.error('Error updating record:', error);
      throw error;
    }
  }

  /**
   * Delete a record by ID
   * @param table - Sequelize model
   * @param id - Record ID to delete
   * @returns {Promise<boolean>}
   */
  async deleteRecord(table: ModelStatic<Model>, id: number | string): Promise<boolean> {
    try {
      if (!this.isConnected()) {
        throw new Error('Database connection not established');
      }

      const deletedCount = await table.destroy({
        where: { id: id },
      });

      return deletedCount > 0;
    } catch (error) {
      console.error('Error deleting record:', error);
      throw error;
    }
  }

  /**
   * Execute raw SQL query
   * @param query - SQL query string
   * @param replacements - Query parameters (optional)
   * @param type - Query type (SELECT, INSERT, UPDATE, DELETE, etc.)
   * @returns {Promise<any>}
   */
  async executeQuery(
    query: string,
    replacements: Record<string, any> = {},
    type: QueryTypes = QueryTypes.SELECT
  ): Promise<any> {
    try {
      if (!this.isConnected()) {
        throw new Error('Database connection not established');
      }

      const sequelize = this.getSequelizeInstance();
      if (!sequelize) {
        throw new Error('Sequelize instance not available');
      }

      const [results] = await sequelize.query(query, {
        replacements,
        type,
      });

      return results;
    } catch (error) {
      console.error('Error executing query:', error);
      throw error;
    }
  }

  /**
   * Find all records with optional conditions
   * @param table - Sequelize model
   * @param options - Sequelize find options
   * @returns {Promise<any[]>}
   */
  async findAll(table: ModelStatic<Model>, options: Record<string, any> = {}): Promise<any[]> {
    try {
      if (!this.isConnected()) {
        throw new Error('Database connection not established');
      }

      const records = await table.findAll(options);
      return records.map((record: Model) => record.toJSON());
    } catch (error) {
      console.error('Error in findAll:', error);
      throw error;
    }
  }

  /**
   * Find one record with conditions
   * @param table - Sequelize model
   * @param options - Sequelize find options
   * @returns {Promise<any|null>}
   */
  async findOne(table: ModelStatic<Model>, options: Record<string, any> = {}): Promise<any | null> {
    try {
      if (!this.isConnected()) {
        throw new Error('Database connection not established');
      }

      const record = await table.findOne(options);
      return record ? record.toJSON() : null;
    } catch (error) {
      console.error('Error in findOne:', error);
      throw error;
    }
  }

  /**
   * Find records by a specific attribute
   * @param table - Sequelize model
   * @param attribut - Column name to search
   * @param value - Value to search for
   * @returns {Promise<any[]>}
   */
  async findByAttribut(table: ModelStatic<Model>, attribut: string, value: any): Promise<any[]> {
    try {
      if (!this.isConnected()) {
        throw new Error('Database connection not established');
      }

      const records = await table.findAll({
        where: {
          [attribut]: value,
        },
      });

      return records.map((record: Model) => record.toJSON());
    } catch (error) {
      console.error('Error in findByAttribut:', error);
      throw error;
    }
  }

  /**
   * Find one record by a specific attribute
   * @param table - Sequelize model
   * @param attribut - Column name to search
   * @param value - Value to search for
   * @returns {Promise<any|null>}
   */
  async findOneByAttribut(
    table: ModelStatic<Model>,
    attribut: string,
    value: any
  ): Promise<any | null> {
    try {
      if (!this.isConnected()) {
        throw new Error('Database connection not established');
      }

      const record = await table.findOne({
        where: {
          [attribut]: value,
        },
      });

      return record ? record.toJSON() : null;
    } catch (error) {
      console.error('Error in findOneByAttribut:', error);
      throw error;
    }
  }

  /**
   * Count records with optional conditions
   * @param table - Sequelize model
   * @param options - Sequelize count options
   * @returns {Promise<number>}
   */
  async count(table: ModelStatic<Model>, options: Record<string, any> = {}): Promise<number> {
    try {
      if (!this.isConnected()) {
        throw new Error('Database connection not established');
      }

      return await table.count(options);
    } catch (error) {
      console.error('Error in count:', error);
      throw error;
    }
  }

  /**
   * Begin transaction
   * @returns {Promise<any>}
   */
  async beginTransaction(): Promise<any> {
    try {
      if (!this.isConnected()) {
        throw new Error('Database connection not established');
      }

      const sequelize = this.getSequelizeInstance();
      if (!sequelize) {
        throw new Error('Sequelize instance not available');
      }

      return await sequelize.transaction();
    } catch (error) {
      console.error('Error beginning transaction:', error);
      throw error;
    }
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    await this.dbConnection.close();
  }

  /**
   * Reconnect to database
   */
  async reconnect(): Promise<void> {
    await this.dbConnection.reconnect();
  }

  /**
   * Get database information
   */
  async getDatabaseInfos(): Promise<string> {
    return await this.dbConnection.getDatabaseInfos();
  }
}
