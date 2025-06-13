'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const express_1 = __importDefault(require('express'));
const cors_1 = __importDefault(require('cors'));
const auth_1 = __importDefault(require('./src/middle/auth'));
const watcher_1 = __importDefault(require('./src/tools/watcher'));
//import Db from './src/tools/odbc';
const app = (0, express_1.default)();
// const host = '192.168.100.103';
const host = '127.0.0.1';
const port = 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
/**
 * Initialise toutes les tables de la base de données
 */
async function initializeTables() {
  try {
    console.log('🗄️  Starting database tables initialization...');
    console.log('✅ Odbc tables initialized successfully');
    return true;
  } catch (error) {
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
  } catch (error) {
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
    app.post('/token/get', auth_1.default.generateToken);
    app.post('/terminal/identified', async (req, res) => {
      await auth_1.default.generateUUID(res);
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
      //let sequelize = new Db();
      watcher_1.default.isOccur(1, 'Je vois la classe W');
      //console.log(`😤 Sequelize Database connection started ${sequelize.getInstance()}`);
    });
  })
  .catch((error) => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  });
// import express from 'express';
// import cors from 'cors';
//
// import Auth from './src/middle/auth';
//
// const app = express();
// // const host = '192.168.100.103';
// const host = '127.0.0.1';
// const port = 3000;
//
// app.use(cors());
// app.use(express.json());
//
// /**
//  * Initialise toutes les tables de la base de données
//  */
// async function initializeTables() {
//   try {
//     console.log('🗄️  Starting database tables initialization...');
//
//     console.log('✅ Odbc tables initialized successfully');
//     return true;
//   } catch (error: any) {
//     console.error('❌ Failed to initialize database tables:', error);
//     throw new Error(`Odbc initialization failed: ${error.message}`);
//   }
// }
//
// /**
//  * Fonction principale d'initialisation
//  */
// async function main() {
//   try {
//     console.log('🚀 Starting application initialization...');
//
//     await initializeTables();
//
//     console.log('✅ Odbc and models initialized successfully');
//     console.log('🎯 Application ready to handle requests');
//
//     // 3. Initialiser les routes après l'initialisation complète
//     await initializeRoutes();
//   } catch (error: any) {
//     console.error('❌ Failed to initialize application:', error);
//     process.exit(1);
//   }
// }
//
// /**
//  * Initialise les routes
//  */
// async function initializeRoutes() {
//   try {
//     console.log('📍 Initializing routes...');
//
//     app.post('/token/get', Auth.generateToken());
//
//     app.post('/uuid/generate', async (req, res) => {
//       await Auth.generateUUID(res);
//     });
//
//     // app.get('/health', (req, res) => {
//     //   res.json({
//     //     status: 'OK',
//     //     timestamp: new Date().toISOString(),
//     //     uptime: process.uptime(),
//     //     database: 'Connected',
//     //   });
//     // });
//
//     console.log('✅ Routes initialized successfully');
//   } catch (error) {
//     console.error('❌ Failed to initialize routes:', error);
//     throw error;
//   }
// }
//
// main()
//   .then(() => {
//     app.listen(port, host, () => {
//       console.log(`🌐 Server running on http://${host}:${port}`);
//       console.log(`📊 Health check available at: http://${host}:${port}/health`);
//       console.log(`📈 Odbc stats available at: http://${host}:${port}/db-stats`);
//       console.log('🎉 Server ready to handle requests!');
//     });
//   })
//   .catch((error) => {
//     console.error('❌ Failed to start server:', error);
//     process.exit(1);
//   });
