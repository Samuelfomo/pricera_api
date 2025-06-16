import express from 'express';

import ClientModel from './src/model/ClientModel';
import Db from './src/tools/database';

class App {
  private server: any;
  private app: express.Application;
  private port: number;
  private clientModel: ClientModel;

  constructor(port: number = 3000) {
    this.port = port;
    this.app = express();
    this.clientModel = new ClientModel();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private setupRoutes(): void {
    this.app.get('/health', (req, res) => {
      res.json({ status: 'OK', timestamp: new Date().toISOString() });
    });

    this.app.get('/', (req, res) => {
      res.json({ message: 'API Server is running' });
    });
  }

  async start(): Promise<void> {
    try {
      // // Initialiser la base de données
      // console.log('🔌 Connecting to database...');
      // const isConnected = await this.clientModel.isConnected();
      // if (!isConnected) {
      //   throw new Error('Database connection failed');
      // }
      // Initialiser la connexion singleton
      await Db.initialize();
      console.log('✅ Database connected');

      // Initialiser les modèles
      console.log('📋 Initializing models...');
      await this.clientModel.init();
      console.log('✅ Models initialized');

      // Démarrer le serveur
      console.log(`🚀 Starting server on port ${this.port}...`);
      this.server = this.app.listen(this.port, () => {
        console.log(`✅ Server running on http://localhost:${this.port}`);
      });

      // Gérer l'arrêt propre
      this.setupGracefulShutdown();
    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }

  private setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      console.log(`\n📡 Received ${signal}. Starting graceful shutdown...`);

      if (this.server) {
        console.log('🔌 Closing HTTP server...');
        this.server.close(() => {
          console.log('✅ HTTP server closed');
        });
      }

      try {
        console.log('💾 Closing database connection...');
        // await this.clientModel.close();
        // console.log('✅ Database connection closed');

        // Fermer proprement la connexion singleton
        await Db.closeConnection();
        console.log('🔌 Connexion fermée proprement');
      } catch (error) {
        console.error('❌ Error closing database:', error);
      }

      console.log('👋 Goodbye!');
      process.exit(0);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  }
}

// Démarrer l'application
if (require.main === module) {
  const app = new App(process.env.PORT ? parseInt(process.env.PORT) : 3000);
  app.start().catch((error) => {
    console.error('❌ Application failed to start:', error);
    process.exit(1);
  });
}

export default App;
