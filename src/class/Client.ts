import ClientModel from '../model/ClientModel';

export default class Client extends ClientModel {
  constructor() {
    super();
  }

  // SETTERS FLUIDES (garde ton style)
  setName(name: string): Client {
    this.name = name;
    return this;
  }

  setSecret(secret: string): Client {
    this.secret = secret;
    return this;
  }

  private setId(id: number): Client {
    this.id = id;
    return this;
  }

  setActive(active: boolean): Client {
    this.active = active;
    return this;
  }

  // GETTERS SIMPLES
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

  // MÉTHODES MÉTIER (garde ta logique existante)
  async save(): Promise<void> {
    try {
      if (this.isNew()) {
        await this.create();
      } else {
        await this.update();
      }
    } catch (error: any) {
      console.error('❌ Erreur sauvegarde:', error);
      throw new Error(error);
    }
  }

  async delete(): Promise<boolean> {
    if (!this.id) {
      console.warn('⚠️ Impossible de supprimer : aucun ID défini');
      return false;
    }

    try {
      const success = await this.deleted(this.id);
      if (success) {
        this.resetInstance();
        console.log('✅ Client supprimé');
      }
      return success;
    } catch (error: any) {
      console.error('❌ Erreur suppression:', error.message);
      return false;
    }
  }

  async toggleStatusClient(): Promise<void> {
    if (!this.id) {
      throw new Error('Impossible de changer le statut : aucun ID défini');
    }

    try {
      await this.toggleStatus(this.id);
      this.active = !this.active; // Met à jour l'instance locale
      console.log(`✅ Statut changé: ${this.active ? 'actif' : 'inactif'}`);
    } catch (error: any) {
      console.error('❌ Erreur changement statut:', error.message);
      throw error;
    }
  }

  // CHARGEMENT DES DONNÉES
  async load(identifier: any, byToken: boolean = false): Promise<Client | null> {
    try {
      const data = byToken ? await this.findByToken(identifier) : await this.find(identifier);

      if (!data) return null;

      return this.populateFromData(data);
    } catch (error: any) {
      console.error('❌ Erreur chargement:', error.message);
      return null;
    }
  }

  async findAllClients(conditions: Record<string, any> = {}): Promise<Client[]> {
    try {
      const dataList = await this.findAllClient(conditions);
      return dataList.map((data) => Client.createFromData(data));
    } catch (error: any) {
      console.error('❌ Erreur recherche multiple:', error.message);
      return [];
    }
  }

  // MÉTHODES STATIQUES (fixées pour l'initialisation)
  static async getById(id: number): Promise<Client | null> {
    const instance = new Client();
    await instance.init(); // TOUJOURS nécessaire pour this.sequelize
    return await instance.load(id);
  }

  static async getByToken(token: string): Promise<Client | null> {
    const instance = new Client();
    await instance.init(); // TOUJOURS nécessaire pour this.sequelize
    return await instance.load(token, true);
  }

  // static async getByName(name: string): Promise<Client | null> {
  //   const instance = new Client();
  //   await instance.init(); // TOUJOURS nécessaire pour this.sequelize
  //   return await instance.load(name, false, true);
  // }

  static async getAllClients(): Promise<Client[]> {
    const instance = new Client();
    await instance.init(); // TOUJOURS nécessaire pour this.sequelize
    return await instance.findAllClients();
  }

  static createFromData(data: any): Client {
    return new Client().setId(data.id).setName(data.name).setActive(data.active);
  }

  // UTILITAIRES
  isNew(): boolean {
    return this.id === undefined;
  }

  isValid(): boolean {
    return !!(this.name && this.secret);
  }

  toJSON(): object {
    return {
      name: this.name,
      token: this.token,
      active: this.active,
    };
  }

  toString(): string {
    return `Client { id: ${this.id}, name: "${this.name}", active: ${this.active} }`;
  }

  // PRIVÉES
  private populateFromData(data: any): Client {
    this.id = data.id;
    this.name = data.name;
    this.token = data.token;
    this.secret = data.secret;
    this.active = data.active;
    return this;
  }

  private resetInstance(): void {
    this.id = undefined;
    this.name = undefined;
    this.token = undefined;
    this.secret = undefined;
    this.active = undefined;
  }
}
