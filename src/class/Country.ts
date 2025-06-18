import CountryModel from '../model/CountryModel';

export default class Country extends CountryModel {
  constructor() {
    super();
  }

  private setId(id: number): Country {
    this.id = id;
    return this;
  }

  setGuid(guid: number): Country {
    this.guid = guid;
    return this;
  }

  setCode(code: number): Country {
    this.code = code;
    return this;
  }

  setIso(iso: string): Country {
    this.iso = iso;
    return this;
  }

  setName(name: string): Country {
    this.name = name;
    return this;
  }

  setTimezone(timezone: string): Country {
    this.timezone = timezone;
    return this;
  }

  setMobileRegex(mobileRegex: string): Country {
    this.mobileRegex = mobileRegex;
    return this;
  }

  setFlag(flag: string): Country {
    this.flag = flag;
    return this;
  }

  getId(): number | undefined {
    return this.id;
  }

  getGuidData(): number | undefined {
    return this.guid;
  }

  getCode(): number | undefined {
    return this.code;
  }

  getIso(): string | undefined {
    return this.iso;
  }

  getName(): string | undefined {
    return this.name;
  }

  getTimezone(): string | undefined {
    return this.timezone;
  }

  getMobileRegex(): string | undefined {
    return this.mobileRegex;
  }

  getFlag(): string | undefined | null {
    return this.flag;
  }

  // CLASS METHOD
  async save(): Promise<void> {
    try {
      this.isNew() ? await this.create() : await this.update();
    } catch (error: any) {
      console.error('❌ Erreur sauvegarde:', error);
      throw new Error(error);
    }
  }

  async load(): Promise<Country | null> {
    return null;
  }

  // UTILITAIRES
  isNew(): boolean {
    return this.guid === undefined;
  }

  toJSON(): object {
    return {
      guid: this.guid,
      code: this.code,
      iso: this.iso,
      name: this.name,
      timezone: this.timezone,
      mobileRegex: this.mobileRegex,
      flag: this.flag,
    };
  }

  private hydrateData(data: any): Country {
    this.id = data.id;
    this.guid = data.guid;
    this.code = data.code;
    this.iso = data.iso;
    this.name = data.name;
    this.timezone = data.timezone;
    this.mobileRegex = data.mobileRegex;
    this.flag = data.flag;
    return this;
  }

  private resetInstance(): void {
    this.id = undefined;
    this.guid = undefined;
    this.code = undefined;
    this.iso = undefined;
    this.name = undefined;
    this.timezone = undefined;
    this.mobileRegex = undefined;
    this.flag = undefined;
  }
}
