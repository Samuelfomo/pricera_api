import W from '../tools/watcher';
import { ApiKeyManager } from '../tools/api-key-manager';
import ClientModel from '../model/ClientModel';

export default class Client extends ClientModel {
  constructor() {
    super();
  }

  // Setters
  setName(name: string): Client {
    this.name = name;
    return this;
  }

  setSecret(secret: string): Client {
    this.secret = secret;
    return this;
  }

  setToken(token: string): Client {
    this.token = token;
    return this;
  }

  setId(id: number): Client {
    this.id = id;
    return this;
  }

  setActive(active: boolean): Client {
    this.active = active;
    return this;
  }

  // Getters
  getName(): string | undefined {
    return this.name;
  }

  getSecret(): string | undefined {
    return this.secret;
  }

  getToken(): string | undefined {
    return this.token;
  }

  getId(): number | undefined {
    return this.id;
  }

  getActive(): boolean | undefined {
    return this.active;
  }

  // Méthodes métier
  async save(): Promise<void> {
    !this.id ? await this.create() : await this.update();
  }

  async toggleStatusClient(): Promise<any> {
    if (!this.id) return null;
    try {
      return await this.toggleStatus(this.id);
    } catch (error: any) {
      console.error(`❌ Erreur lors de la désactivation:`, error);
      throw error;
    }
  }

  async delete(): Promise<boolean> {
    if (!this.id) {
      console.warn('⚠️  Impossible de supprimer : aucun ID défini');
      return false;
    }
    try {
      const success = await this.deleted(this.id);

      if (success) {
        // Réinitialiser l'instance après suppression
        this.id = undefined;
        this.name = undefined;
        this.token = undefined;
        this.secret = undefined;
        this.active = undefined;
        console.log('✅ Client supprimé et instance réinitialisée');
      }

      return success;
    } catch (error) {
      console.error(`❌ Erreur lors de la suppression:`, error);
      return false;
    }
  }

  async load(
    identifier: any,
    byToken: boolean = false,
    byName: boolean = false
  ): Promise<Client | null> {
    let data;
    if (byName) {
      data = await this.findByName(identifier);
    } else {
      data = byToken ? await this.findByToken(identifier) : await this.find(identifier);
    }
    if (!data) return null;
    return new Client()
      .setId(data.id)
      .setName(data.name)
      .setToken(data.token)
      .setSecret(data.secret)
      .setActive(data.active);
  }

  /**
   * Récupère tous les clients selon des conditions optionnelles
   */
  async findAllClients(conditions: Record<string, any> = {}) {
    try {
      const dataList = await this.findAllClient(conditions);
      console.log(`📋 ${dataList.length} client(s) trouvé(s)`);

      return dataList.map((data) => Client.fromData(data));
    } catch (error) {
      console.error('❌ Erreur lors de la recherche multiple:', error);
      return [];
    }
  }

  // Méthode pour charger depuis un objet
  static fromData(data: any): Client {
    return new Client()
      .setId(data.id)
      .setName(data.name)
      .setToken(data.token)
      .setSecret(data.secret)
      .setActive(data.active);
  }

  // Sérialisation
  toJSON(): object {
    return {
      token: this.token,
      name: this.name,
      Active: this.active,
    };
  }

  toString(): string {
    return `Client {
      id: ${this.id || 'undefined'},
      name: "${this.name || 'undefined'}",
      token: "${this.token || 'undefined'}",
      secret: "${this.secret ? '***' + this.secret.slice(-4) : 'undefined'}",
      active: "${this.active ? 'true' : 'false'}"
    }`;
  }

  // Version complète pour debug (avec secret complet)
  toStringDebug(): string {
    return `Client {
      id: ${this.id || 'undefined'},
      name: "${this.name || 'undefined'}",
      token: "${this.token || 'undefined'}",
      secret: "${this.secret || 'undefined'}",
      active: "${this.active ? 'true' : 'false'}"
    }`;
  }

  // Version pour les logs (sans secret)
  toStringSecure(): string {
    return `Client {
      id: ${this.id || 'undefined'},
      name: "${this.name || 'undefined'}",
      token: "${this.token || 'undefined'}",
      secret: "[HIDDEN]",
      active: "${this.active ? 'true' : 'false'}"
    }`;
  }

  /**
   * Vérifie si le client est valide (a un ID et des données)
   */
  isValid(): boolean {
    return !!(this.id && this.name && this.token && this.secret);
  }

  /**
   * Vérifie si le client est nouveau (pas encore sauvegardé)
   */
  isNew(): boolean {
    return this.id === undefined;
  }

  /**
   * Méthode statique pour récupérer tous les clients
   */
  static async getAllClients(): Promise<Client[]> {
    try {
      const instance = new Client();
      return await instance.findAllClients();
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de tous les clients:', error);
      return [];
    }
  }

  /**
   * Méthode statique pour trouver un client par ID
   */
  static async getById(id: number): Promise<Client | null> {
    try {
      const instance = new Client();
      return await instance.load(id);
    } catch (error) {
      console.error('❌ Erreur lors de la recherche statique par ID:', error);
      return null;
    }
  }

  /**
   * Méthode statique pour trouver un client par token
   */
  static async getByToken(token: string): Promise<Client | null> {
    try {
      const instance = new Client();
      return await instance.load(token, true);
    } catch (error) {
      console.error('❌ Erreur lors de la recherche statique par token:', error);
      return null;
    }
  }

  static async getByName(name: string): Promise<Client | null> {
    try {
      const instance = new Client();
      return await instance.load(name, false, true);
    } catch (error) {
      console.error('❌ Erreur lors de la recherche statique par nom:', error);
      return null;
    }
  }

  /**
   * Génère un token unique à partir d'un secret
   * @param secret - Le secret pour générer le token
   * @returns Promise<string | null> - Le token généré ou null en cas d'erreur
   */
  static async generateTokenData(secret: string): Promise<string | null> {
    try {
      await W.isOccur(!secret, `Secret is required for token generation`);
      await W.isOccur(secret.length < 8, `Secret must be at least 8 characters long`);

      const fullToken = ApiKeyManager.generate(secret);
      console.log(
        `🔑 Token généré - API Key: ${fullToken.split('.')[0]} | API Secret: ${fullToken.split('.')[1]}`
      );
      return fullToken.split('.')[0];
      // const apiKey = fullToken.split('.')[0];

      // // Créer une instance temporaire pour accéder aux méthodes protected
      // const instance = new Client();
      // return await instance.this.createToken(apiKey.split('.')[0], 1);
    } catch (error) {
      console.error(`❌ Erreur lors de la génération du token:`, error);
      return null;
    }
  }
}
