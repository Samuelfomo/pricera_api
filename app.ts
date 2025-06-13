import express from 'express';
import cors from 'cors';

import Auth from './src/middle/auth';
import Db from './src/tools/odbc';

const app = express();
// const host = '192.168.100.103';
const host = '127.0.0.1';
const port = 3000;

app.use(cors());
app.use(express.json());

/**
 * Initialise toutes les tables de la base de données
 */
async function initializeTables() {
  try {
    console.log('🗄️  Starting database tables initialization...');

    console.log('✅ Odbc tables initialized successfully');
    return true;
  } catch (error: any) {
    console.error('❌ Failed to initialize database tables:', error);
    throw new Error(`Database initialization failed: ${error.message}`);
  }
}

/**
 * Fonction principale d'initialisation
 */
async function main() {
  try {
    console.log('🚀 Starting application initialization...');

    await initializeTables();

    console.log('✅ Odbc and models initialized successfully');
    console.log('🎯 Application ready to handle requests');

    await initializeRoutes();
  } catch (error: any) {
    console.error('❌ Failed to initialize application:', error);
    process.exit(1);
  }
}

/**
 * Initialise les routes
 */
async function initializeRoutes() {
  try {
    console.log('📍 Initializing routes...');

    app.post('/token/get', Auth.generateToken);

    app.post('/terminal/identified', async (req, res) => {
      await Auth.generateUUID(res);
    });

    // Route de santé (health check)
    app.get('/health', (req, res) => {
      res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        message: 'Server is running successfully',
      });
    });

    console.log('✅ Routes initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize routes:', error);
    throw error;
  }
}

main()
  .then(() => {
    app.listen(port, host, () => {
      console.log(`🌐 Server running on http://${host}:${port}`);
      console.log(`📊 Health check available at: http://${host}:${port}/health`);
      console.log('🎉 Server ready to handle requests!');
      // testDatabaseConnection();

      let sequelize = new Db();
      sequelize
        .getDatabaseInfos()
        .then((data) => {
          console.log(`😤 Database test connection: ${data}`);
        })
        .catch((err) => {
          console.error('❌ Erreur BDD:', err);
        });
    });
  })
  .catch((error) => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  });

// async function testDatabaseConnection() {
//   const sequelize = new Db();
//   try {
//     const data = await sequelize.getDatabaseInfos();
//     console.log(`😤 Database test connection: ${data}`);
//   } catch (err) {
//     console.error('❌ Erreur de connexion BDD :', err);
//   }
// }
