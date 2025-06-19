import express from 'express';

import Db from './src/tools/database';
import countryRouter from './routes/country';
import Middle from './src/middle/api-key-auth';
import Country from './src/class/Country';

class App {
  private server: any;
  private app: express.Application;
  private readonly port: number;
  private readonly countryModel: Country; // Instance globale

  constructor(port: number = 3000) {
    this.port = port;
    this.app = express();
    this.countryModel = new Country(); // Instance partagée
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Middleware pour injecter l'instance Country dans req
    this.app.use((req: any, res, next) => {
      req.countryModel = this.countryModel;
      next();
    });
  }

  private setupRoutes(): void {
    this.app.use('/country', Middle.validateKey, countryRouter);
    this.app.get('/health', (req, res) => {
      res.json({ status: 'OK', timestamp: new Date().toISOString() });
    });

    this.app.get('/', (req, res) => {
      res.json({ message: 'API Server is running' });
    });
  }

  async start(): Promise<void> {
    try {
      // Initialiser la connexion singleton
      console.log('🔌 Connecting to database...');
      await Db.getInstance();
      console.log('✅ Database connected');

      // Initialiser les modèles UNE SEULE FOIS
      console.log('📋 Initializing models...');
      await this.countryModel.init();
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
