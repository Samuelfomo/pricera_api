import {
    Sequelize,
    Transaction,
    Model,
    ModelStatic,
    QueryTypes,
    TransactionOptions,
} from 'sequelize';

// interface DatabaseConfig {
//   name?: string;
//   user?: string;
//   password?: string;
//   host?: string;
//   port?: number;
// }

interface ConnectionResult {
    connection: Sequelize | Transaction;
    isTransaction: boolean;
}

interface ConnectionOptions {
    connection?: Sequelize | Transaction;
    isTransaction?: boolean;
}

interface PoolStats {
    total: number;
    active: number;
    idle: number;
    pending: number;
}

interface InitializeTablesOptions {
    force?: boolean;
    alter?: boolean;
}

interface QueryOptions extends ConnectionOptions {
    replacements?: Record<string, any>;
    type?: QueryTypes;

    [key: string]: any;
}

abstract class Odbc {
    protected _sequelize: Sequelize | null = null;
    protected _connection: Sequelize | null = null;
    protected _transaction: Transaction | null = null;
    protected _isTransactionActive: boolean = false;

    constructor() {
        if (new.target === Odbc) {
            throw new Error(
                'La classe Odbc est abstraite et ne peut pas être instanciée directement.'
            );
        }

        this._init();
    }

    /**
     * Initialise la connexion Sequelize avec le pool
     */
    private _init(): void {
        this._sequelize = new Sequelize(
            process.env.DB_NAME || `priceradb25`,
            process.env.DB_USER || `priceradmin`,
            process.env.DB_PASSWORD || `MonMotDePasseSecurise123!`,
            {
                host: process.env.DB_HOST || `192.168.100.103`,
                dialect: 'postgres',
                port: parseInt(process.env.DB_PORT || `5432`),
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
                logging: process.env.NODE_ENV === 'development' ? console.log : false,
                retry: {
                    max: 3,
                },
            }
        );
    }

    /**
     * Retourne l'instance Sequelize
     */
    getInstance(): Sequelize | null {
        return this._sequelize;
    }

    /**
     * Obtient ou crée une connexion (utilise le pool)
     */
    async getConnection(options: ConnectionOptions = {}): Promise<ConnectionResult> {
        try {
            // Si une transaction est active, la retourner
            if (this._isTransactionActive && this._transaction) {
                return {
                    connection: this._transaction,
                    isTransaction: true,
                };
            }

            // Si une connexion spécifique est passée en paramètre
            if (options.connection) {
                return {
                    connection: options.connection,
                    isTransaction: options.isTransaction || false,
                };
            }

            // Utiliser le pool de connexions de Sequelize (recommandé)
            if (!this._sequelize) {
                throw new Error('Sequelize instance is not initialized');
            }

            return {
                connection: this._sequelize,
                isTransaction: false,
            };
        } catch (error) {
            console.error("Erreur lors de l'obtention de la connexion:", error);
            throw error;
        }
    }

    /**
     * Démarre une transaction
     */
    async beginTransaction(options: TransactionOptions = {}): Promise<Transaction> {
        try {
            if (this._isTransactionActive) {
                throw new Error('Une transaction est déjà active');
            }

            if (!this._sequelize) {
                throw new Error('Sequelize instance is not initialized');
            }

            this._transaction = await this._sequelize.transaction(options);
            this._isTransactionActive = true;

            console.log('🔄 Transaction démarrée');
            return this._transaction;
        } catch (error) {
            console.error('Erreur lors du démarrage de la transaction:', error);
            throw error;
        }
    }

    /**
     * Valide (commit) la transaction
     */
    async commitTransaction(): Promise<void> {
        try {
            if (!this._isTransactionActive || !this._transaction) {
                throw new Error('Aucune transaction active à valider');
            }

            await this._transaction.commit();
            this._transaction = null;
            this._isTransactionActive = false;

            console.log('✅ Transaction validée');
        } catch (error) {
            console.error('Erreur lors de la validation de la transaction:', error);
            await this.rollbackTransaction();
            throw error;
        }
    }

    /**
     * Annule (rollback) la transaction
     */
    async rollbackTransaction(): Promise<void> {
        try {
            if (this._transaction) {
                await this._transaction.rollback();
                console.log('🔄 Transaction annulée');
            }
        } catch (error) {
            console.error("Erreur lors de l'annulation de la transaction:", error);
        } finally {
            this._transaction = null;
            this._isTransactionActive = false;
        }
    }

    /**
     * Exécute une fonction dans une transaction
     */
    async executeInTransaction<T>(
        operation: (transaction: Transaction) => Promise<T>,
        options: TransactionOptions = {}
    ): Promise<T> {
        const transaction = await this.beginTransaction(options);

        try {
            const result = await operation(transaction);
            await this.commitTransaction();
            return result;
        } catch (error) {
            await this.rollbackTransaction();
            throw error;
        }
    }

    /**
     * Teste la connexion à la base de données
     */
    async testConnection(): Promise<boolean> {
        try {
            if (!this._sequelize) {
                throw new Error('Sequelize instance is not initialized');
            }

            await this._sequelize.authenticate();
            console.log('✅ Connexion à la base de données PostgreSQL réussie.');
            return true;
        } catch (error) {
            console.error('❌ Échec de la connexion à la base de données:', error);
            throw error;
        }
    }

    /**
     * Ferme le pool de connexions (uniquement à l'arrêt de l'application)
     */
    async closePool(): Promise<void> {
        try {
            if (this._isTransactionActive) {
                await this.rollbackTransaction();
            }

            if (this._sequelize) {
                await this._sequelize.close();
                console.log('🔌 Pool de connexions fermé.');
            }
        } catch (error) {
            console.error('Erreur lors de la fermeture du pool:', error);
        }
    }

    /**
     * Get one row in table using ID
     */
    async getById<T extends Model>(
        table: ModelStatic<T>,
        id: number,
        options: ConnectionOptions = {}
    ): Promise<Record<string, any> | null> {
        try {
            const { connection } = await this.getConnection(options);

            const queryOptions: any = { where: { id } };
            if (options.isTransaction || this._isTransactionActive) {
                queryOptions.transaction = connection;
            }

            const entry = await table.findByPk(id, queryOptions);
            return entry ? entry.toJSON() : null;
        } catch (error) {
            console.error('Error retrieving entry:', error);
            throw error;
        }
    }

    /**
     * Get table last autoincrement ID
     */
    async getLastId<T extends Model>(
        table: ModelStatic<T>,
        options: ConnectionOptions = {}
    ): Promise<number> {
        try {
            const { connection } = await this.getConnection(options);

            const queryOptions: any = { order: [['id', 'DESC']] };
            if (options.isTransaction || this._isTransactionActive) {
                queryOptions.transaction = connection;
            }

            const lastRecord = await table.findOne(queryOptions);
            return lastRecord ? (lastRecord as any).id : 0;
        } catch (error) {
            console.error('Error getting last ID:', error);
            throw error;
        }
    }

    /**
     * Generate GUID from table
     */
    async generateGuid<T extends Model>(
        table: ModelStatic<T>,
        length: number = 6,
        guid: number | null = null,
        options: ConnectionOptions = {}
    ): Promise<number> {
        try {
            const { connection } = await this.getConnection(options);

            if (guid === null) {
                const lastId = await this.getLastId(table, options);
                guid = Math.pow(10, length - 1) + (lastId + 1);
            }

            const queryOptions: any = { where: { guid } };
            if (options.isTransaction || this._isTransactionActive) {
                queryOptions.transaction = connection;
            }

            const record = await table.findOne(queryOptions);

            if (record === null) {
                return guid;
            } else {
                return await this.generateGuid(table, length, guid + 1, options);
            }
        } catch (error) {
            console.error('Error generating GUID:', error);
            throw error;
        }
    }

    /**
     * Génère un code alphanumérique unique
     */
    async generateUniqueCode<T extends Model>(
        table: ModelStatic<T>,
        length: number = 6,
        options: ConnectionOptions = {}
    ): Promise<string> {
        const charset = `ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789`;

        function generateCode(length: number): string {
            let result = '';
            for (let i = 0; i < length; i++) {
                const randIndex = Math.floor(Math.random() * charset.length);
                result += charset[randIndex];
            }
            return result;
        }

        try {
            const { connection } = await this.getConnection(options);
            let code: string;
            let exists = true;

            while (exists) {
                code = generateCode(length);
                const queryOptions: any = { where: { code: code } };
                if (options.isTransaction || this._isTransactionActive) {
                    queryOptions.transaction = connection;
                }

                const existing = await table.findOne(queryOptions);
                exists = existing !== null;
            }

            return code!;
        } catch (error) {
            console.error('Erreur lors de la génération du code unique:', error);
            throw error;
        }
    }

    /**
     * Crée un enregistrement
     */
    async createRecord<T extends Model>(
        table: ModelStatic<T>,
        data: Record<string, any>,
        options: ConnectionOptions = {}
    ): Promise<Record<string, any>> {
        try {
            const { connection } = await this.getConnection(options);

            const createOptions: any = {};
            if (options.isTransaction || this._isTransactionActive) {
                createOptions.transaction = connection;
            }

            const newRecord = await table.create(data, createOptions);
            return newRecord ? newRecord.toJSON() : null;
        } catch (error) {
            console.error('Error creating record:', error);
            throw error;
        }
    }

    /**
     * Met à jour un enregistrement
     */
    async updateRecord<T extends Model>(
        table: ModelStatic<T>,
        id: number,
        data: Record<string, any>,
        options: ConnectionOptions = {}
    ): Promise<Record<string, any> | null> {
        try {
            const { connection } = await this.getConnection(options);

            const updateOptions: any = { where: { id } };
            if (options.isTransaction || this._isTransactionActive) {
                updateOptions.transaction = connection;
            }

            const [updatedRowsCount] = await table.update(data, updateOptions);

            if (updatedRowsCount > 0) {
                return await this.getById(table, id, options);
            }

            return null;
        } catch (error) {
            console.error('Error updating record:', error);
            throw error;
        }
    }

    /**
     * Supprime un enregistrement
     */
    async deleteRecord<T extends Model>(
        table: ModelStatic<T>,
        id: number,
        options: ConnectionOptions = {}
    ): Promise<boolean> {
        try {
            const { connection } = await this.getConnection(options);

            const deleteOptions: any = { where: { id } };
            if (options.isTransaction || this._isTransactionActive) {
                deleteOptions.transaction = connection;
            }

            const deletedRowsCount = await table.destroy(deleteOptions);
            return deletedRowsCount > 0;
        } catch (error) {
            console.error('Error deleting record:', error);
            throw error;
        }
    }

    /**
     * Exécute une requête personnalisée
     */
    async executeQuery(query: string, options: QueryOptions = {}): Promise<any> {
        try {
            const { connection } = await this.getConnection(options);

            const queryOptions = { ...options };
            if (options.isTransaction || this._isTransactionActive) {
                queryOptions.transaction = connection;
            }

            if (!this._sequelize) {
                throw new Error('Sequelize instance is not initialized');
            }

            return await this._sequelize.query(query, queryOptions);
        } catch (error) {
            console.error('Error executing query:', error);
            throw error;
        }
    }

    /**
     * Obtient les statistiques du pool de connexions
     */
    getPoolStats(): PoolStats {
        if (
            this._sequelize &&
            (this._sequelize as any).connectionManager &&
            (this._sequelize as any).connectionManager.pool
        ) {
            const pool = (this._sequelize as any).connectionManager.pool;
            return {
                total: pool.size || 0,
                active: pool.using || 0,
                idle: pool.available || 0,
                pending: pool.pending || 0,
            };
        }
        return { total: 0, active: 0, idle: 0, pending: 0 };
    }

    /**
     * Initialise les tables de la base de données (méthode statique)
     */
    static async initializeTables(
        models: ModelStatic<Model>[] = [],
        options: InitializeTablesOptions = {}
    ): Promise<void> {
        // Créer une instance temporaire pour accéder à la configuration
        const tempInstance = Object.create(Odbc.prototype);
        tempInstance._init();

        const sequelize: Sequelize = tempInstance._sequelize;
        let transaction: Transaction | null = null;

        try {
            // Tester la connexion
            await sequelize.authenticate();
            console.log("✅ Connexion établie pour l'initialisation des tables");

            // Démarrer une transaction
            transaction = await sequelize.transaction();
            console.log("🔄 Transaction d'initialisation démarrée");

            const syncOptions: any = {
                transaction: transaction,
                force: options.force || false,
                alter: options.alter || false,
            };

            // Synchroniser les modèles si fournis
            if (models && models.length > 0) {
                console.log(`📋 Synchronisation de ${models.length} modèle(s)...`);

                for (const model of models) {
                    if (model && typeof model.sync === 'function') {
                        await model.sync(syncOptions);
                        console.log(`✅ Table ${model.tableName || model.name} synchronisée`);
                    } else {
                        console.warn(`⚠️  Modèle invalide ignoré:`, model);
                    }
                }
            } else {
                // Synchroniser toutes les tables définies
                console.log('📋 Synchronisation de toutes les tables...');
                await sequelize.sync(syncOptions);
            }

            // Valider la transaction
            await transaction.commit();
            console.log('✅ Initialisation des tables terminée avec succès');
        } catch (error) {
            console.error("❌ Erreur lors de l'initialisation des tables:", error);

            // Annuler la transaction en cas d'erreur
            if (transaction) {
                try {
                    await transaction.rollback();
                    console.log("🔄 Transaction d'initialisation annulée");
                } catch (rollbackError) {
                    console.error("❌ Erreur lors de l'annulation de la transaction:", rollbackError);
                }
            }

            throw error;
        } finally {
            // Fermer la connexion
            if (sequelize) {
                try {
                    await sequelize.close();
                    console.log('🔌 Connexion fermée');
                } catch (closeError) {
                    console.error('❌ Erreur lors de la fermeture de la connexion:', closeError);
                }
            }
        }
    }
}

export default class DB extends Odbc {
    constructor() {
        super();
    }
}

export { Odbc, DB };
export type {
    // DatabaseConfig,
    ConnectionResult,
    ConnectionOptions,
    PoolStats,
    InitializeTablesOptions,
    QueryOptions,
};
