import CountryModel, { CountryEntity, CountryData } from '../model/CountryModel';

export default class Country {
  private model: CountryModel;
  private data: CountryEntity | null = null;
  private isDirty: boolean = false; // Indique si les données ont été modifiées

  constructor(data?: CountryEntity) {
    this.model = CountryModel.getInstance();
    if (data) {
      this.data = { ...data } as CountryEntity;
    }
  }

  // ==================== GETTERS ====================

  get id(): number | undefined {
    return this.data?.id;
  }

  get guid(): number | undefined {
    return this.data?.guid;
  }

  get alpha2(): string | undefined {
    return this.data?.alpha2;
  }

  get alpha3(): string | undefined {
    return this.data?.alpha3;
  }

  get dialcode(): number | undefined {
    return this.data?.dialcode;
  }

  get frenchName(): string | undefined {
    return this.data?.fr;
  }

  get englishName(): string | undefined {
    return this.data?.en;
  }

  /**
   * Get all data as a read-only object
   */
  get allData(): Readonly<CountryEntity> | null {
    return this.data ? Object.freeze({ ...this.data } as CountryEntity) : null;
  }

  // ==================== SETTERS ====================

  set alpha2(value: string) {
    if (!value?.trim()) {
      throw new Error('Alpha2 code cannot be empty');
    }
    const cleanValue = value.trim().toUpperCase();
    if (cleanValue.length !== 2) {
      throw new Error('Alpha2 code must be exactly 2 characters');
    }

    if (!this.data) this.data = {} as CountryEntity;
    this.data.alpha2 = cleanValue;
    this.isDirty = true;
  }

  set alpha3(value: string) {
    if (!value?.trim()) {
      throw new Error('Alpha3 code cannot be empty');
    }
    const cleanValue = value.trim().toUpperCase();
    if (cleanValue.length !== 3) {
      throw new Error('Alpha3 code must be exactly 3 characters');
    }

    if (!this.data) this.data = {} as CountryEntity;
    this.data.alpha3 = cleanValue;
    this.isDirty = true;
  }

  set dialcode(value: number) {
    if (!value || value <= 0) {
      throw new Error('Dialcode must be a positive number');
    }

    if (!this.data) this.data = {} as CountryEntity;
    this.data.dialcode = value;
    this.isDirty = true;
  }

  set frenchName(value: string) {
    if (!value?.trim()) {
      throw new Error('French name cannot be empty');
    }

    if (!this.data) this.data = {} as CountryEntity;
    this.data.fr = value.trim();
    this.isDirty = true;
  }

  set englishName(value: string) {
    if (!value?.trim()) {
      throw new Error('English name cannot be empty');
    }

    if (!this.data) this.data = {} as CountryEntity;
    this.data.en = value.trim();
    this.isDirty = true;
  }

  // ==================== BUSINESS METHODS ====================

  /**
   * Check if this is a new country (not saved to database)
   */
  isNew(): boolean {
    return !this.data?.id;
  }

  /**
   * Check if data has been modified
   */
  hasChanges(): boolean {
    return this.isDirty;
  }

  /**
   * Validate country data
   */
  validate(): boolean {
    if (!this.data) {
      throw new Error('No data to validate');
    }

    const errors: string[] = [];

    if (!this.data.alpha2?.trim()) errors.push('Alpha2 code is required');
    if (!this.data.alpha3?.trim()) errors.push('Alpha3 code is required');
    if (!this.data.dialcode || this.data.dialcode <= 0) errors.push('Valid dialcode is required');
    if (!this.data.fr?.trim()) errors.push('French name is required');
    if (!this.data.en?.trim()) errors.push('English name is required');

    if (this.data.alpha2 && this.data.alpha2.length !== 2) {
      errors.push('Alpha2 code must be exactly 2 characters');
    }

    if (this.data.alpha3 && this.data.alpha3.length !== 3) {
      errors.push('Alpha3 code must be exactly 3 characters');
    }

    if (errors.length > 0) {
      throw new Error(errors.join('; '));
    }

    return true;
  }

  /**
   * Format dial code for display
   */
  getFormattedDialCode(): string {
    if (!this.data?.dialcode) return '';
    return `+${this.data.dialcode}`;
  }

  /**
   * Get display name in specified language
   */
  getName(language: 'fr' | 'en' = 'fr'): string {
    if (!this.data) return '';
    return language === 'fr' ? this.data.fr || '' : this.data.en || '';
  }

  /**
   * Get country info for display
   */
  getDisplayInfo(): {
    guid?: number;
    alpha2?: string;
    alpha3?: string;
    dialcode?: number;
    formattedDialcode: string;
    fr?: string;
    en?: string;
  } {
    return {
      guid: this.data?.guid,
      alpha2: this.data?.alpha2,
      alpha3: this.data?.alpha3,
      dialcode: this.data?.dialcode,
      formattedDialcode: this.getFormattedDialCode(),
      fr: this.data?.fr,
      en: this.data?.en,
    };
  }

  /**
   * Save country (create or update)
   */
  async save(): Promise<Country> {
    try {
      this.validate();

      if (!this.data) {
        throw new Error('No data to save');
      }

      let savedData: CountryEntity;

      if (this.isNew()) {
        // Create new country
        const createData: Omit<CountryData, 'id'> = {
          guid: this.data.guid,
          alpha2: this.data.alpha2,
          alpha3: this.data.alpha3,
          dialcode: this.data.dialcode,
          fr: this.data.fr,
          en: this.data.en,
        };
        savedData = await this.model.create(createData);
      } else {
        // Update existing country
        const updateData: Partial<CountryData> = {
          alpha2: this.data.alpha2,
          alpha3: this.data.alpha3,
          dialcode: this.data.dialcode,
          fr: this.data.fr,
          en: this.data.en,
        };
        savedData = (await this.model.update(this.data.id!, updateData)) as CountryEntity;
      }

      this.data = savedData;
      this.isDirty = false;
      return this;
    } catch (error: any) {
      console.error('Error saving country:', error);
      throw error;
    }
  }

  /**
   * Delete country
   */
  async delete(): Promise<boolean> {
    try {
      if (this.isNew()) {
        throw new Error('Cannot delete unsaved country');
      }

      const deleted = await this.model.delete(this.data!.id!);
      if (deleted) {
        this.data = null;
        this.isDirty = false;
      }
      return deleted;
    } catch (error: any) {
      console.error('Error deleting country:', error);
      throw error;
    }
  }

  /**
   * Reload country data from database
   */
  async reload(): Promise<Country> {
    try {
      if (this.isNew()) {
        throw new Error('Cannot reload unsaved country');
      }

      const data = await this.model.findById(this.data!.id!);
      if (!data) {
        throw new Error('Country not found in database');
      }

      this.data = data;
      this.isDirty = false;
      return this;
    } catch (error: any) {
      console.error('Error reloading country:', error);
      throw error;
    }
  }

  /**
   * Reset changes (revert to original state)
   */
  async resetChanges(): Promise<Country> {
    if (this.isNew()) {
      this.data = null;
    } else {
      await this.reload();
    }
    this.isDirty = false;
    return this;
  }

  // ==================== STATIC METHODS ====================

  /**
   * Create new country instance
   */
  static create(data: Omit<CountryData, 'id' | 'guid'>): Country {
    const country = new Country();
    country.alpha2 = data.alpha2;
    country.alpha3 = data.alpha3;
    country.dialcode = data.dialcode;
    country.frenchName = data.fr;
    country.englishName = data.en;
    return country;
  }

  /**
   * Find country by ID
   */
  static async findById(id: number): Promise<Country | null> {
    try {
      const model = CountryModel.getInstance();
      const data = await model.findById(id);
      return data ? new Country(data) : null;
    } catch (error: any) {
      console.error('Error finding country by ID:', error);
      throw error;
    }
  }

  /**
   * Find all countries
   */
  static async findAll(): Promise<Country[]> {
    try {
      const model = CountryModel.getInstance();
      const dataList = await model.findAllCountry();
      return dataList.map((data) => new Country(data));
    } catch (error: any) {
      console.error('Error finding all countries:', error);
      throw error;
    }
  }

  /**
   * Find country by alpha2 code
   */
  static async findByAlpha2(alpha2: string): Promise<Country | null> {
    try {
      const model = CountryModel.getInstance();
      const data = await model.findByAlpha2(alpha2);
      return data ? new Country(data) : null;
    } catch (error: any) {
      console.error('Error finding country by alpha2:', error);
      throw error;
    }
  }

  /**
   * Find country by alpha3 code
   */
  static async findByAlpha3(alpha3: string): Promise<Country | null> {
    try {
      const model = CountryModel.getInstance();
      const data = await model.findByAlpha3(alpha3);
      return data ? new Country(data) : null;
    } catch (error: any) {
      console.error('Error finding country by alpha3:', error);
      throw error;
    }
  }

  /**
   * Find countries by dial code
   */
  static async findByDialCode(dialcode: number): Promise<Country[]> {
    try {
      const model = CountryModel.getInstance();
      const dataList = await model.findByDialCode(dialcode);
      return dataList.map((data) => new Country(data));
    } catch (error: any) {
      console.error('Error finding countries by dialcode:', error);
      throw error;
    }
  }

  /**
   * Search countries by name (French or English)
   */
  static async searchByName(name: string): Promise<Country[]> {
    try {
      const model = CountryModel.getInstance();
      const dataList = await model.searchByName(name);
      return dataList.map((data) => new Country(data));
    } catch (error: any) {
      console.error('Error searching countries by name:', error);
      throw error;
    }
  }

  /**
   * Get total count of countries
   */
  static async count(): Promise<number> {
    try {
      const model = CountryModel.getInstance();
      return await model.countAll();
    } catch (error: any) {
      console.error('Error counting countries:', error);
      throw error;
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Convert to JSON (for API responses)
   */
  toJSON(): CountryEntity | null {
    return this.data ? ({ ...this.data } as CountryEntity) : null;
  }

  /**
   * Convert to string representation
   */
  toString(): string {
    if (!this.data) return 'Empty Country';
    return `${this.data.fr} (${this.data.alpha2}) ${this.getFormattedDialCode()}`;
  }
  /**
   * Convert to display format (public data only) - Excludes sensitive data like ID
   */
  toDisplay(): {
    guid?: number;
    alpha2?: string;
    alpha3?: string;
    dialcode?: number;
    formattedDialcode: string;
    fr?: string;
    en?: string;
  } | null {
    if (!this.data) return null;

    return {
      guid: this.data.guid,
      alpha2: this.data.alpha2,
      alpha3: this.data.alpha3,
      dialcode: this.data.dialcode,
      formattedDialcode: this.getFormattedDialCode(),
      fr: this.data.fr,
      en: this.data.en,
    };
  }

  /**
   * Compare with another country
   */
  equals(other: Country): boolean {
    if (!this.data || !other.data) return false;
    return this.data.id === other.data.id;
  }

  // /**
  //  * Clone this country
  //  */
  // clone(): Country {
  //     return new Country(this.data ? { ...this.data } : undefined);
  // }
}

// import CountryModel, {CountryEntity} from '../model/CountryModel';
//
// export default class Country {
//     #model: CountryModel;
//
//     constructor(data?: CountryEntity) {
//         this.#model = new CountryModel(data);
//     }
//
//     // Getters
//     get id(): number | undefined {
//         return this.#model.id;
//     }
//
//     get guid(): number | undefined {
//         return Number(this.#model.guid);
//     }
//
//     get alpha2(): string {
//         return this.#model.alpha2.toString();
//     }
//
//     get alpha3(): string {
//         return this.#model.alpha3.toString();
//     }
//
//     get dialcode(): number {
//         return Number(this.#model.dialcode);
//     }
//
//     get frenchName(): string {
//         return this.#model.fr.toString();
//     }
//
//     get englishName(): string {
//         return this.#model.en.toString();
//     }
//
//     get data(): CountryEntity {
//         return {...this.#model} as CountryEntity;
//     }
//
//     // Setters
//     set alpha2(value: string) {
//         if (!value?.trim()) {
//             throw new Error('Alpha2 code cannot be empty');
//         }
//         this.#model.alpha2 = value.trim().toUpperCase();
//     }
//
//     set alpha3(value: string) {
//         if (!value?.trim()) {
//             throw new Error('Alpha3 code cannot be empty');
//         }
//         this.#model.alpha3 = value.trim().toUpperCase();
//     }
//
//     set dialcode(value: number) {
//         if (!value || value <= 0) {
//             throw new Error('Dialcode must be a positive number');
//         }
//         this.#model.dialcode = value;
//     }
//
//     set frenchName(value: string) {
//         if (!value?.trim()) {
//             throw new Error('French name cannot be empty');
//         }
//         this.#model.fr = value.trim();
//     }
//
//     set englishName(value: string) {
//         if (!value?.trim()) {
//             throw new Error('English name cannot be empty');
//         }
//         this.#model.en = value.trim();
//     }
//
//     // Méthodes métier
//
//     /**
//      * Validate country data
//      */
//     validate(): boolean {
//         const errors: string[] = [];
//
//         if (!this.#model.alpha2?.trim()) errors.push('Alpha2 code is required');
//         if (!this.#model.alpha3?.trim()) errors.push('Alpha3 code is required');
//         if (!this.#model.dialcode || this.#model.dialcode <= 0)
//             errors.push('Valid dialcode is required');
//         if (!this.#model.fr?.trim()) errors.push('French name is required');
//         if (!this.#model.en?.trim()) errors.push('English name is required');
//
//         if (this.#model.alpha2 && this.#model.alpha2.length !== 2) {
//             errors.push('Alpha2 code must be exactly 2 characters');
//         }
//
//         if (this.#model.alpha3 && this.#model.alpha3.length !== 3) {
//             errors.push('Alpha3 code must be exactly 3 characters');
//         }
//
//         if (errors.length > 0) {
//             throw new Error(errors.join('; '));
//         }
//
//         return true;
//     }
//
//     /**
//      * Format dial code for display
//      */
//     getFormattedDialCode(): string {
//         return `+${this.#model.dialcode}`;
//     }
//
//     /**
//      * Save country (create or update)
//      */
//     async save(): Promise<Country> {
//         try {
//             // await this.#model.initialize();
//             this.validate();
//
//             await (this.#model.id ? this.#model.update() ? this.#model.create())
//             return this;
//         } catch (error: any) {
//             console.error('Error saving country:', error);
//             throw error;
//         }
//     }
//
//     /**
//      * Delete country
//      */
//     async delete(): Promise<boolean> {
//         try {
//             if (!this.#model.id) {
//                 throw new Error('Cannot delete country without ID');
//             }
//             return await this.#model.delete(this.#model.id);
//         } catch (error: any) {
//             console.error('Error deleting country:', error);
//             throw error;
//         }
//     }
//
//     /**
//      * Reload country data from database
//      */
//     async reload(): Promise<Country> {
//         try {
//             if (!this.#model.id) {
//                 throw new Error('Cannot reload country without ID');
//             }
//             const data = await this.#model.find(this.#model.id);
//
//             if (!data) {
//                 throw new Error('Country not found');
//             }
//             return new Country(data);
//         } catch (error: any) {
//             console.error('Error reloading country:', error);
//             throw error;
//         }
//     }
//
//     // Méthodes statiques pour les requêtes
//
//     /**
//      * Find country by ID
//      */
//     static async findById(id: number): Promise<Country | null> {
//         try {
//             const model = new CountryModel();
//             const data = await model.find(id);
//             return data ? new Country(data) : null;
//         } catch (error: any) {
//             console.error('Error finding country by ID:', error);
//             throw error;
//         }
//     }
//
//     /**
//      * Find all countries
//      */
//     static async findAll(): Promise<Country[]> {
//         try {
//             const model = new CountryModel();
//
//             const dataList = await model.findAllCountry();
//             return dataList.map((data) => new Country(data));
//         } catch (error: any) {
//             console.error('Error finding all countries:', error);
//             throw error;
//         }
//     }
//
//     /**
//      * Find country by alpha2 code
//      */
//     static async findByAlpha2(alpha2: string): Promise<Country | null> {
//         try {
//             const model = new CountryModel();
//
//             const data = await model.findByAttribute('alpha2', alpha2.toUpperCase());
//             return data ? new Country(data) : null;
//         } catch (error: any) {
//             console.error('Error finding country by alpha2:', error);
//             throw error;
//         }
//     }
//
//     /**
//      * Find country by alpha3 code
//      */
//     static async findByAlpha3(alpha3: string): Promise<Country | null> {
//         try {
//             const model = new CountryModel();
//
//             const data = await model.findByAttribute('alpha3', alpha3.toUpperCase());
//             return data ? new Country(data) : null;
//         } catch (error: any) {
//             console.error('Error finding country by alpha3:', error);
//             throw error;
//         }
//     }
//
//     /**
//      * Find countries by dial code
//      */
//     static async findByDialCode(dialcode: number): Promise<Country[]> {
//         try {
//             const model = new CountryModel();
//
//             const dataList = await model.findAllByAttribute('dialcode', dialcode);
//             return dataList.map((data) => new Country(data));
//         } catch (error: any) {
//             console.error('Error finding countries by dialcode:', error);
//             throw error;
//         }
//     }
//
//     /**
//      * Search countries by name (French or English)
//      */
//     static async searchByName(name: string): Promise<Country[]> {
//         try {
//             const model = new CountryModel();
//
//             // Search in both French and English names
//             const [frenchResults, englishResults] = await Promise.all([
//                 model.findAllByAttribute('fr', name),
//                 model.findAllByAttribute('en', name),
//             ]);
//
//             // Combine and deduplicate results
//             const allResults = [...frenchResults, ...englishResults];
//             const uniqueResults = allResults.filter(
//                 (country, index, self) => index === self.findIndex((c) => c.id === country.id)
//             );
//
//             return uniqueResults.map((data) => new Country(data));
//         } catch (error: any) {
//             console.error('Error searching countries by name:', error);
//             throw error;
//         }
//     }
//
//     /**
//      * Create new country instance
//      */
//     static create(data: Omit<CountryEntity, 'id' | 'guid'>): Country {
//         return new Country(data) as Country;
//     }
//
//     /**
//      * Convert to JSON
//      */
//     toJSON(): CountryEntity {
//         return {...this.#model} as CountryEntity;
//     }
//
//     /**
//      * Convert to string representation
//      */
//     toString(): string {
//         return `${this.#model.fr} (${this.#model.alpha2}) +${this.#model.dialcode}`;
//     }
//     toDisplay(): object {
//         return {
//             // ...this.#model,
//             guid: this.#model.guid,
//             alpha2: this.#model.alpha2,
//             alpha3: this.#model.alpha3,
//             dialcode: this.#model.dialcode,
//             fr: this.#model.fr,
//             en: this.#model.en
//         }
//     }
// }
