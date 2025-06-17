import * as readline from 'readline';

import Client from '../src/class/Client';
import Db from '../src/tools/database';

class ClientManager {
  private rl: readline.Interface;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  private question(prompt: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(prompt, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  private async validateInput(name: string, secret: string): Promise<boolean> {
    const errors: string[] = [];

    if (!name || name.length === 0) {
      errors.push("- Le nom de l'application est requis");
    }

    if (!secret || secret.length === 0) {
      errors.push('- Le secret est requis');
    } else if (secret.length < 8) {
      errors.push('- Le secret doit contenir au moins 8 caractères');
    }

    if (errors.length > 0) {
      console.log('\n❌ Erreurs de validation:');
      errors.forEach((error) => console.log(error));
      console.log('');
      return false;
    }

    return true;
  }

  async createClient(): Promise<void> {
    console.log("📱 === Création d'un nouveau client ===\n");

    try {
      // Demander le nom de l'application
      const appName = await this.question("📝 Nom de l'application: ");

      // Demander le secret
      const secret = await this.question('🔐 Secret (min 8 caractères): ');

      // Valider les entrées
      if (!(await this.validateInput(appName, secret))) {
        const retry = await this.question('Voulez-vous réessayer? (o/n): ');
        if (retry.toLowerCase() === 'o' || retry.toLowerCase() === 'oui') {
          return await this.createClient();
        }
        return;
      }

      // Créer le client
      console.log('\n⏳ Création du client...');

      const client = new Client().setName(appName).setSecret(secret);
      await client.save();

      console.log('\n✅ Client créé avec succès!');
      console.log('📋 Détails:');
      console.log(`   - ID: ${client.getId()}`);
      console.log(`   - Nom: ${client.getName()}`);
      console.log(`   - Token: ${client.getToken()}`);

      console.log(`-`.repeat(50));
    } catch (error) {
      console.log('\n❌ Erreur:', error);
    }
  }

  async updateClient(): Promise<void> {
    console.log("\n🔄 === Mise à jour d'un client ===\n");

    try {
      // Récupérer tous les clients
      const clients = await Client.getAllClients();

      if (clients.length === 0) {
        console.log('📭 Aucun client disponible pour modification\n');
        return;
      }

      // Afficher la liste des clients
      console.log(`📊 ${clients.length} client(s) disponible(s):\n`);
      clients.forEach((client, index) => {
        console.log(`${index + 1}. 📱 ${client.getName()}`);
        // console.log(`   🆔 ID: ${client.getId()}`);
        console.log(`   🔐 Secret: ***${client.getSecret()?.slice(-4)}`);
        console.log('   ─────────────────────────────');
      });

      // Demander à l'utilisateur de choisir un client
      const choice = await this.question(
        '\n📝 Sélectionnez le numéro du client à modifier (0 pour annuler): '
      );
      const clientIndex = parseInt(choice) - 1;

      // Vérifier la validité du choix
      if (choice === '0') {
        console.log('❌ Modification annulée');
        return;
      }

      if (isNaN(clientIndex) || clientIndex < 0 || clientIndex >= clients.length) {
        console.log('❌ Sélection invalide');
        return;
      }

      // Récupérer le client sélectionné
      const selectedClient = clients[clientIndex];
      const client = await Client.getById(selectedClient.getId()!);

      if (!client) {
        console.log('❌ Erreur lors de la récupération du client');
        return;
      }

      console.log(`\n📋 Client sélectionné: ${client.getName()}`);
      // console.log(`🆔 ID: ${client.getId()}`);
      console.log(`🔑 Token actuel: ${client.getToken()}`);

      // Demander les nouvelles valeurs
      const newName = await this.question(
        `📝 Nouveau nom (actuel: "${client.getName()}", laisser vide pour ne pas changer): `
      );
      const newSecret = await this.question(
        '🔐 Nouveau secret (laisser vide pour ne pas changer): '
      );

      // Mettre à jour seulement les champs renseignés
      if (newName.trim()) {
        client.setName(newName);
      }
      if (newSecret.trim()) {
        if (newSecret.length < 8) {
          console.log('❌ Le secret doit contenir au moins 8 caractères');
          return;
        }
        client.setSecret(newSecret);

        const token = await Client.generateTokenData(newSecret);
        if (!token) {
          console.log(`💔 la generation du token à partir du secret : ${newSecret} a échouée`);
          return;
        }
        console.log(`token généré est: ${token}`);
        client.setToken(token);
      }

      if (!newName.trim() && !newSecret.trim()) {
        console.log('⚠️  Aucune modification effectuée');
        return;
      }

      console.log('\n⏳ Mise à jour du client...');
      // const result = await client.save();
      //
      // if (result) {
      //   console.log('✅ Client mis à jour avec succès!');
      //   console.log('📋 Nouvelles informations:');
      //   console.log(`   - Nom: ${client.getName()}`);
      //   console.log(`   - Token: ${client.getToken()}`);
      // } else {
      //   console.log('❌ Erreur lors de la mise à jour');
      // }
    } catch (error) {
      console.log('\n❌ Erreur:', error);
    }
  }

  async toggleActivationClient(): Promise<void> {
    console.log('\n🔄 === Changement du statut du client ===\n');

    try {
      // Récupérer tous les clients
      const clients = await Client.getAllClients();

      if (clients.length === 0) {
        console.log('📭 Aucun client disponible pour modification\n');
        return;
      }

      // Afficher la liste des clients
      console.log(`📊 ${clients.length} client(s) disponible(s):\n`);
      clients.forEach((client, index) => {
        console.log(`${index + 1}. 📱 ${client.getName()}`);
        console.log(`   🆔 Active: ${client.getActive()}`);
        // console.log(`   🔐 Secret: ***${client.getSecret()?.slice(-4)}`);
        console.log('   ─────────────────────────────');
      });

      // Demander à l'utilisateur de choisir un client
      const choice = await this.question(
        '\n📝 Sélectionnez le numéro du client à modifier (0 pour annuler): '
      );
      const clientIndex = parseInt(choice) - 1;

      // Vérifier la validité du choix
      if (choice === '0') {
        console.log('❌ Modification annulée');
        return;
      }

      if (isNaN(clientIndex) || clientIndex < 0 || clientIndex >= clients.length) {
        console.log('❌ Sélection invalide');
        return;
      }

      // Récupérer le client sélectionné
      const selectedClient = clients[clientIndex];
      const client = await Client.getById(selectedClient.getId()!);

      if (!client) {
        console.log('❌ Erreur lors de la récupération du client');
        return;
      }

      console.log(`\n📋 Client sélectionné: ${client.getName()}`);
      // console.log(`🆔 ID: ${client.getId()}`);
      console.log(`🔑 Token actuel: ${client.getToken()}`);

      client.setActive(!client.getActive());
      console.log(client.getActive());

      console.log('\n⏳ Mise à jour du client...');
      // const result = await client.save();
      //
      // if (result) {
      //   console.log('✅ Client mis à jour avec succès!');
      //   console.log('📋 Nouvelles informations:');
      //   console.log(`   - Nom: ${client.getName()}`);
      //   console.log(`   - Token: ${client.getToken()}`);
      //   console.log(`   - Statut: ${client.getActive()}`);
      // } else {
      //   console.log('❌ Erreur lors de la mise à jour');
      // }
    } catch (error) {
      console.log(`\n❌ Erreur:`, error);
    }
  }

  async deleteClient(): Promise<void> {
    console.log("\n🗑️  === Suppression d'un client ===\n");

    try {
      // Récupérer tous les clients
      const clients = await Client.getAllClients();

      if (clients.length === 0) {
        console.log('📭 Aucun client disponible pour le moment\n');
        return;
      }

      // Afficher la liste des clients
      console.log(`📊 ${clients.length} client(s) disponible(s):\n`);
      clients.forEach((client, index) => {
        console.log(`${index + 1}. 📱 ${client.getName()}`);
        console.log(`   🆔 Active: ${client.getActive()}`);
        console.log('   ─────────────────────────────');
      });

      // Demander à l'utilisateur de choisir un client
      const choice = await this.question(
        '\n📝 Sélectionnez le numéro du client à supprimer (0 pour annuler): '
      );
      const clientIndex = parseInt(choice) - 1;

      // Vérifier la validité du choix
      if (choice === '0') {
        console.log('❌ Modification annulée');
        return;
      }

      if (isNaN(clientIndex) || clientIndex < 0 || clientIndex >= clients.length) {
        console.log('❌ Sélection invalide');
        return;
      }

      // Récupérer le client sélectionné
      const selectedClient = clients[clientIndex];
      const client = await Client.getById(selectedClient.getId()!);

      if (!client) {
        console.log('❌ Erreur lors de la récupération du client');
        return;
      }
      console.log(`\n📋 Client à supprimer: ${client.getName()}`);
      console.log(`🔑 Token: ${client.getToken()}`);

      const confirmation = await this.question(
        '\n⚠️  Êtes-vous sûr de vouloir supprimer ce client? (oui/non): '
      );

      if (confirmation.toLowerCase() !== 'oui') {
        console.log('❌ Suppression annulée');
        return;
      }

      console.log('\n⏳ Suppression du client...');
      const success = await client.delete();

      if (success) {
        console.log('✅ Client supprimé avec succès!');
      } else {
        console.log('❌ Erreur lors de la suppression');
      }
    } catch (error) {
      console.log('\n❌ Erreur:', error);
    }
  }

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
        console.log(`   🔐 Secret: ***${client.getSecret()?.slice(-4)}`);
        console.log('   ─────────────────────────────');
      });

      console.log('');
    } catch (error) {
      console.log('❌ Erreur lors de la récupération des clients:', error);
    }
  }

  async showMenu(): Promise<void> {
    console.log('\n🛠️  === Gestionnaire de clients ===');
    console.log('1. Créer un nouveau client');
    console.log('2. Lister tous les clients');
    // console.log('3. Voir un client spécifique');
    console.log('3. Modifier un client');
    console.log('4. Supprimer un client');
    console.log('5. Changer le statut du client');
    console.log('6. Tester la connexion DB');
    console.log('7. Quitter');

    const choice = await this.question('\nVotre choix (1-6): ');

    switch (choice) {
      case '1':
        await this.createClient();
        await this.showMenu();
        break;
      case '2':
        await this.listClients();
        await this.showMenu();
        break;
      case '3':
        await this.updateClient();
        await this.showMenu();
        break;
      case '4':
        await this.deleteClient();
        await this.showMenu();
        break;
      case '5':
        await this.toggleActivationClient();
        await this.showMenu();
        break;
      // case '6':
      //   await this.testConnection();
      //   await this.showMenu();
      //   break;
      // case '7':
      //   await this.testConnection();
      //   await this.showMenu();
      //   break;
      case '6':
        console.log('\n👋 Au revoir!');
        break;
      default:
        console.log('\n❌ Choix invalide');
        await this.showMenu();
        break;
    }
  }

  // async testConnection(): Promise<void> {
  //   console.log('\n🔌 === Test de connexion ===\n');
  //
  //   try {
  //     const db = Db.getInstance();
  //     const isConnected = await db.isConnected();
  //
  //     if (isConnected) {
  //       console.log('✅ Connexion à la base de données OK');
  //     } else {
  //       console.log('❌ Problème de connexion à la base de données');
  //     }
  //   } catch (error) {
  //     console.log('❌ Erreur lors du test de connexion:', error);
  //   }
  // }

  async start(): Promise<void> {
    try {
      // // Initialiser le modèle Client
      // const clientModel = new ClientModel();
      // await clientModel.init();

      // console.log('✅ Modèles initialisé');
      //
      // await Db.initialize();
      // console.log('✅ Connexion initialisée');

      // Afficher le menu
      await this.showMenu();
    } catch (error) {
      console.log('❌ Erreur:', error);
    } finally {
      this.rl.close();
    }
  }

  // async viewClient(): Promise<void> {
  //   console.log('\n👁️  === Voir un client ===\n');
  //
  //   try {
  //     const choice = await this.question('Rechercher par (1) ID ou (2) Token? (1/2): ');
  //
  //     let client: Client | null = null;
  //
  //     if (choice === '1') {
  //       const clientId = await this.question('📝 ID du client: ');
  //       const id = parseInt(clientId);
  //
  //       if (isNaN(id)) {
  //         console.log('❌ ID invalide');
  //         return;
  //       }
  //
  //       client = await Client.getById(id);
  //     } else if (choice === '2') {
  //       const token = await this.question('🔑 Token du client: ');
  //       client = await Client.getByToken(token);
  //     } else {
  //       console.log('❌ Choix invalide');
  //       return;
  //     }
  //
  //     if (!client) {
  //       console.log('❌ Client non trouvé');
  //       return;
  //     }
  //
  //     console.log('\n📋 === Détails du client ===');
  //     // console.log(`🆔 ID: ${client.getId()}`);
  //     console.log(`📱 Nom: ${client.getName()}`);
  //     console.log(`🔑 Token: ${client.getToken()}`);
  //     console.log(`✅ Valide: ${client.getActive() === true ? 'Oui' : 'Non'}`);
  //     // console.log(`🔐 Secret: ${client.getSecret()}`);
  //     // console.log(`✅ Valide: ${client.isValid() ? 'Oui' : 'Non'}`);
  //     // console.log(`🆕 Nouveau: ${client.isNew() ? 'Oui' : 'Non'}`);
  //     console.log('');
  //   } catch (error) {
  //     console.log('\n❌ Erreur:', error);
  //   }
  // }
}

// Gestion propre de l'arrêt du processus
process.on('SIGINT', async () => {
  console.log('\n🛑 Arrêt du processus...');
  await Db.closeConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Arrêt du processus...');
  await Db.closeConnection();
  process.exit(0);
});

// Démarrer le gestionnaire
if (require.main === module) {
  const manager = new ClientManager();
  manager.start().catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
}

export default ClientManager;
