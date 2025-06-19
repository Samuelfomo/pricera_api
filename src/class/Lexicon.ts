import LexiconModel from '../model/LexiconModel';

export default class Lexicon extends LexiconModel {
  constructor() {
    super();
  }

  private setId(id: number): Lexicon {
    this.id = id;
    return this;
  }

  setGuid(guid: number): Lexicon {
    this.guid = guid;
    return this;
  }

  setCode(reference: string): Lexicon {
    this.reference = reference;
    return this;
  }

  setIso(english: string): Lexicon {
    this.english = english;
    return this;
  }

  setName(french: string): Lexicon {
    this.french = french;
    return this;
  }

  setTimezone(portable: boolean): Lexicon {
    this.portable = portable;
    return this;
  }

  getId(): number | undefined {
    return this.id;
  }

  getGuidData(): number | undefined | null {
    return this.guid;
  }

  getReference(): string | undefined {
    return this.reference;
  }

  getEnglish(): string | undefined {
    return this.english;
  }

  getFrench(): string | undefined {
    return this.french;
  }

  getPortable(): boolean | undefined {
    return this.portable;
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

  async load(): Promise<Lexicon | null> {
    return null;
  }

  // UTILITAIRES
  isNew(): boolean {
    return this.guid === undefined;
  }

  toJSON(): object {
    return {
      guid: this.guid,
      reference: this.reference,
      english: this.english,
      french: this.french,
      portable: this.portable,
    };
  }

  private hydrateData(data: any): Lexicon {
    this.id = data.id;
    this.guid = data.guid;
    this.reference = data.reference;
    this.english = data.english;
    this.french = data.french;
    this.portable = data.portable;
    return this;
  }

  private resetInstance(): void {
    this.id = undefined;
    this.guid = undefined;
    this.reference = undefined;
    this.english = undefined;
    this.french = undefined;
    this.portable = undefined;
  }
}
