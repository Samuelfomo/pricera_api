// scripts/manageClient.ts - Version nettoyée
import * as readline from 'readline';

import Client from '../src/class/Client';
import Db from '../src/tools/database';

class ClientManager {
  private rl: readline.Interface;
  private client: Client;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    this.client = new Client();
  }

  private question(prompt: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(prompt, (answer) => resolve(answer.trim()));
    });
  }

  // INITIALISATION
  async init(): Promise<void> {
    try {
      console.log("⏳ Initialisation de l'application...");
      await this.client.init(); // Initialise d'abord l'instance existante
      console.log('✅ Application initialisée');
    } catch (error: any) {
      console.error('❌ Erreur initialisation:', error.message);
      throw error;
    }
  }

  // CRÉATION CLIENT (fix : réutilise l'instance initialisée)
  async createClient(): Promise<void> {
    console.log("📱 === Création d'un nouveau client ===\n");

    try {
      const name = await this.question("📝 Nom de l'application: ");
      const secret = await this.question('🔐 Secret (min 8 caractères): ');

      // Validation simple
      if (!name.trim()) {
        console.log('❌ Le nom est requis');
        return;
      }
      if (secret.length < 8) {
        console.log('❌ Le secret doit faire au moins 8 caractères');
        return;
      }

      console.log('\n⏳ Création du client...');

      // Créer une nouvelle instance pour éviter les conflits
      const newClient = new Client();
      await newClient.init();
      newClient.setName(name).setSecret(secret);
      await newClient.save();

      console.log('\n✅ Client créé avec succès!');
      console.log(`   - ID: ${newClient.getId()}`);
      console.log(`   - Nom: ${newClient.getName()}`);
      console.log(`   - Token: ${newClient.getToken()}`);
    } catch (error: any) {
      console.log('\n❌ Erreur:', this.getFriendlyErrorMessage(error.message));

      // Proposer des solutions
      if (error.message.includes('unique') || error.message.includes('existe déjà')) {
        console.log('\n💡 Solutions possibles:');
        console.log("   - Choisir un autre nom d'application");
        console.log('   - Vérifier les clients existants (option 2)');
      }
    }
  }

  // Méthode utilitaire pour des messages d'erreur user-friendly
  private getFriendlyErrorMessage(errorMessage: string): string {
    if (errorMessage.includes('unique')) {
      return "Ce nom d'application existe déjà. Choisissez un autre nom.";
    }
    if (errorMessage.includes('must be unique')) {
      return "Ce nom d'application est déjà utilisé. Choisissez un autre nom.";
    }
    if (errorMessage.includes('connection')) {
      return 'Problème de connexion à la base de données. Vérifiez que PostgreSQL est démarré.';
    }
    if (errorMessage.includes('validation')) {
      return 'Les données saisies ne sont pas valides. Vérifiez le format.';
    }
    return errorMessage; // Message original si pas de correspondance
  }

  // LISTE DES CLIENTS
  async listClients(): Promise<void> {
    console.log('\n📋 === Liste des clients ===\n');

    try {
      const clients = await Client.getAllClients();

      if (clients.length === 0) {
        console.log('📭 Aucun client trouvé\n');
        return;
      }

      console.log(`📊 ${clients.length} client(s) trouvé(s):\n`);
      clients.forEach((client, index) => {
        console.log(`${index + 1}. 📱 ${client.getName()}`);
        console.log(`   🆔 ID: ${client.getId()}`);
        console.log(`   ✅ Actif: ${client.getActive() ? 'Oui' : 'Non'}`);
        console.log('   ─────────────────────────────');
      });
    } catch (error: any) {
      console.log('❌ Erreur:', error.message);
    }
  }

  // SÉLECTION D'UN CLIENT
  private async selectClient(action: string): Promise<Client | null> {
    const clients = await Client.getAllClients();

    if (clients.length === 0) {
      console.log('📭 Aucun client disponible\n');
      return null;
    }

    console.log(`📊 ${clients.length} client(s) disponible(s):\n`);
    clients.forEach((client, index) => {
      console.log(
        `${index + 1}. 📱 ${client.getName()} (${client.getActive() ? 'Actif' : 'Inactif'})`
      );
    });

    const choice = await this.question(
      `\n📝 Sélectionnez le client à ${action} (0 pour annuler): `
    );
    const clientIndex = parseInt(choice) - 1;

    if (choice === '0') {
      console.log('❌ Action annulée');
      return null;
    }

    if (isNaN(clientIndex) || clientIndex < 0 || clientIndex >= clients.length) {
      console.log('❌ Sélection invalide');
      return null;
    }

    return await Client.getById(clients[clientIndex].getId()!);
  }

  // MODIFICATION CLIENT
  async updateClient(): Promise<void> {
    console.log("\n🔄 === Modification d'un client ===\n");

    try {
      const client = await this.selectClient('modifier');
      if (!client) return;

      console.log(`\n📋 Client sélectionné: ${client.getName()}`);

      const newName = await this.question(
        `📝 Nouveau nom (actuel: "${client.getName()}", vide = pas de changement): `
      );

      if (newName.trim()) {
        client.setName(newName);
        await client.save();
        console.log('✅ Client modifié avec succès!');
      } else {
        console.log('⚠️ Aucune modification effectuée');
      }
    } catch (error: any) {
      console.log('\n❌ Erreur:', error.message);
    }
  }

  // CHANGEMENT DE STATUT
  async toggleClientStatus(): Promise<void> {
    console.log('\n🔄 === Changement de statut ===\n');

    try {
      const client = await this.selectClient('modifier');
      if (!client) return;

      console.log(`\n📋 Client: ${client.getName()}`);
      console.log(`📊 Statut actuel: ${client.getActive() ? 'Actif' : 'Inactif'}`);

      const confirm = await this.question('Changer le statut? (o/n): ');
      if (confirm.toLowerCase() !== 'o') {
        console.log('❌ Action annulée');
        return;
      }

      await client.toggleStatusClient();
      console.log(`✅ Nouveau statut: ${client.getActive() ? 'Actif' : 'Inactif'}`);
    } catch (error: any) {
      console.log('\n❌ Erreur:', error.message);
    }
  }

  // SUPPRESSION CLIENT
  async deleteClient(): Promise<void> {
    console.log("\n🗑️ === Suppression d'un client ===\n");

    try {
      const client = await this.selectClient('supprimer');
      if (!client) return;

      console.log(`\n⚠️ Client à supprimer: ${client.getName()}`);

      const confirmation = await this.question('Confirmer la suppression? (oui/non): ');
      if (confirmation.toLowerCase() !== 'oui') {
        console.log('❌ Suppression annulée');
        return;
      }

      const success = await client.delete();
      if (success) {
        console.log('✅ Client supprimé avec succès!');
      } else {
        console.log('❌ Erreur lors de la suppression');
      }
    } catch (error: any) {
      console.log('\n❌ Erreur:', error.message);
    }
  }

  // TEST CONNEXION
  async testConnection(): Promise<void> {
    console.log('\n🔌 === Test de connexion ===\n');

    try {
      const isConnected = Db.isConnected();
      if (isConnected) {
        console.log('✅ Connexion à la base de données OK');
      } else {
        console.log('❌ Problème de connexion à la base de données');
      }
    } catch (error: any) {
      console.log('❌ Erreur:', error.message);
    }
  }

  // MENU PRINCIPAL
  async showMenu(): Promise<void> {
    console.log('\n🛠️ === Gestionnaire de clients ===');
    console.log('1. Créer un nouveau client');
    console.log('2. Lister tous les clients');
    console.log('3. Modifier un client');
    console.log("4. Changer le statut d'un client");
    console.log('5. Supprimer un client');
    console.log('6. Tester la connexion DB');
    console.log('7. Quitter');

    const choice = await this.question('\nVotre choix (1-7): ');

    switch (choice) {
      case '1':
        await this.createClient();
        break;
      case '2':
        await this.listClients();
        break;
      case '3':
        await this.updateClient();
        break;
      case '4':
        await this.toggleClientStatus();
        break;
      case '5':
        await this.deleteClient();
        break;
      case '6':
        await this.testConnection();
        break;
      case '7':
        console.log('\n👋 Au revoir!');
        return;
      default:
        console.log('\n❌ Choix invalide');
    }

    await this.showMenu(); // Reboucle
  }

  async start(): Promise<void> {
    try {
      await this.init();
      await this.showMenu();
    } catch (error: any) {
      console.error('❌ Erreur fatale:', error);
    } finally {
      this.rl.close();
    }
  }
}

// Gestion propre de l'arrêt
process.on('SIGINT', async () => {
  console.log('\n🛑 Arrêt...');
  await Db.closeConnection();
  process.exit(0);
});

// Démarrage
if (require.main === module) {
  const manager = new ClientManager();
  manager.start().catch(console.error);
}

export default ClientManager;
