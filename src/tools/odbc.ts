import { QueryTypes, Sequelize } from 'sequelize';

export default class Db {
  private static readonly DB_NAME: string = 'priceradb25';
  private static readonly DB_PASSWORD: string = 'MonMotDePasseSecurise123!';
  private static readonly DB_USERNAME: string = 'priceradmin';
  private static readonly DB_HOST: string = '192.168.100.103';
  // private static readonly DB_HOST: string = 'localhost';
  private static readonly DB_PORT: number = 5432;

  private readonly _sequelize: Sequelize;
  private _isConnected: boolean = false;

  constructor() {
    this._sequelize = new Sequelize(Db.DB_NAME, Db.DB_USERNAME, Db.DB_PASSWORD, {
      host: Db.DB_HOST,
      dialect: 'postgres',
      port: Db.DB_PORT,
      pool: {
        max: 20,
        min: 5,
        acquire: 60000,
        idle: 10000,
        evict: 1000,
      },
      timezone: '+01:00',
      dialectOptions: {
        timezone: 'Africa/Douala',
      },
      retry: {
        max: 3,
      },
      logging: false, // Désactive les logs SQL par défaut
    });

    // Vérifier la connexion lors de l'initialisation
    this.testConnection();
  }

  /**
   * Get Sequelize instance
   */
  getInstance(): Sequelize {
    // if (!this._isConnected) {
    //   console.warn("⚠️  Attention: La connexion à la base de données n'est pas établie");
    //   return false;
    // }
    return this._sequelize;
  }

  /**
   * Teste la connexion à la base de données
   */
  private async testConnection(): Promise<void> {
    try {
      await this._sequelize.authenticate();
      this._isConnected = true;
      console.log('✅ Connexion à la base de données PostgreSQL établie avec succès');
    } catch (error) {
      this._isConnected = false;
      console.error('❌ Erreur de connexion à la base de données:', error);
      throw new Error(`Échec de la connexion à la base de données: ${error}`);
    }
  }

  /**
   * Initialise la connexion de manière asynchrone (à utiliser si nécessaire)
   */
  async initialize(): Promise<void> {
    if (!this._isConnected) {
      await this.testConnection();
    }
  }

  /**
   * Vérifie si la connexion est active
   */
  isConnected(): boolean {
    return this._isConnected;
  }

  /**
   * Reconnecter à la base de données
   */
  async reconnect(): Promise<void> {
    try {
      await this._sequelize.close();
      await this.testConnection();
    } catch (error) {
      console.error('Erreur lors de la reconnexion:', error);
      throw error;
    }
  }

  /**
   * Fermer la connexion à la base de données
   */
  async close(): Promise<void> {
    try {
      await this._sequelize.close();
      this._isConnected = false;
      console.log('🔐 Connexion à la base de données fermée');
    } catch (error) {
      console.error('Erreur lors de la fermeture de la connexion:', error);
      throw error;
    }
  }

  async getDatabaseInfos(): Promise<string> {
    await this.testConnection();
    if (!this._isConnected) {
      throw new Error('Connexion à la base de données non établie');
    }

    try {
      const [results] = await this._sequelize.query('SELECT * FROM pca_user', {
        type: QueryTypes.SELECT,
      });

      return JSON.stringify(results);
    } catch (error) {
      console.error("Erreur lors de l'exécution de la requête:", error);
      throw error;
    }
  }
}
