// const router = Router();
// import { Router, Request, Response } from 'express';
//
// import G from '../src/tools/glossary';
// import R from '../src/tools/response';
//
// import Country from '../src/class/Country';
//
// // ==================== INTERFACES ====================
//
// interface CreateCountryRequest {
//   alpha2: string;
//   alpha3: string;
//   dialcode: number;
//   fr: string;
//   en: string;
//   guid?: number;
// }
//
// interface GetByAttributeRequest {
//   attribute: string;
//   value: string | number;
// }
//
// interface UpdateCountryRequest extends Partial<CreateCountryRequest> {
//   id: number;
// }
//
// interface SearchRequest {
//   name: string;
// }
//
// // ==================== VALIDATION HELPERS ====================
//
// const validateCountryData = (data: CreateCountryRequest): string[] => {
//   const errors: string[] = [];
//
//   if (!data.alpha2?.trim()) errors.push('Alpha2 code is required');
//   if (!data.alpha3?.trim()) errors.push('Alpha3 code is required');
//   if (!data.dialcode || !Number(data.dialcode) || data.dialcode <= 0)
//     errors.push('Valid dialcode is required');
//   if (!data.fr?.trim()) errors.push('French name is required');
//   if (!data.en?.trim()) errors.push('English name is required');
//
//   if (data.alpha2 && data.alpha2.trim().length !== 2) {
//     errors.push('Alpha2 code must be exactly 2 characters');
//   }
//
//   if (data.alpha3 && data.alpha3.trim().length !== 3) {
//     errors.push('Alpha3 code must be exactly 3 characters');
//   }
//
//   if (data.guid && data.guid.toString().length < 6) {
//     errors.push('GUID must be at least 6 digits');
//   }
//
//   return errors;
// };
//
// const isValidAttribute = (attribute: string): boolean => {
//   const validAttributes = ['guid', 'alpha2', 'alpha3', 'dialcode'];
//   return validAttributes.includes(attribute);
// };
//
// // ==================== ROUTES ====================
//
// /**
//  * POST /countries/add
//  * Create a new country
//  */
// router.post('/add', async (req: Request<{}, {}, CreateCountryRequest>, res: Response) => {
//   try {
//     const { alpha2, alpha3, dialcode, fr, en, guid } = req.body;
//
//     // Validation des données
//     const validationErrors = validateCountryData(req.body);
//     if (validationErrors.length > 0) {
//       return R.handleError(res, validationErrors.join('; '), 400);
//     }
//
//     // Création de l'instance Country
//     const country = Country.create({
//       alpha2: alpha2.trim(),
//       alpha3: alpha3.trim(),
//       dialcode: Number(dialcode),
//       fr: fr.trim(),
//       en: en.trim(),
//     });
//
//     // Si un GUID est fourni, on l'assigne
//     if (guid) {
//       country.data!.guid = guid;
//     }
//
//     // Sauvegarde
//     const savedCountry = await country.save();
//
//     return R.response(true, savedCountry.getDisplayInfo(), res, 201);
//   } catch (error: any) {
//     console.error('Error creating country:', error);
//     return R.handleError(res, error.message, 500);
//   }
// });
//
// /**
//  * GET /countries/all
//  * Get all countries
//  */
// router.get('/all', async (req: Request, res: Response) => {
//   try {
//     const countries = await Country.findAll();
//
//     const displayData = countries.map((country) => country.getDisplayInfo());
//
//     return R.response(true, displayData, res, 200);
//   } catch (error: any) {
//     console.error('Error fetching all countries:', error);
//     return R.handleError(res, error.message, 500);
//   }
// });
//
// /**
//  * GET /countries/:id
//  * Get country by ID
//  */
// router.get('/:id', async (req: Request<{ id: string }>, res: Response) => {
//   try {
//     const id = parseInt(req.params.id);
//
//     if (isNaN(id) || id <= 0) {
//       return R.handleError(res, 'Valid country ID is required', 400);
//     }
//
//     const country = await Country.findById(id);
//
//     if (!country) {
//       return R.response(false, G.errorId, res, 404);
//     }
//
//     return R.response(true, country.getDisplayInfo(), res, 200);
//   } catch (error: any) {
//     console.error('Error fetching country by ID:', error);
//     return R.handleError(res, error.message, 500);
//   }
// });
//
// /**
//  * PUT /countries/getByAttribute
//  * Get country by specific attribute
//  */
// router.put(
//   '/getByAttribute',
//   async (req: Request<{}, {}, GetByAttributeRequest>, res: Response) => {
//     try {
//       const { attribute, value } = req.body;
//
//       if (!attribute?.trim() || value === undefined || value === null) {
//         return R.handleError(res, G.errorMissingFields, 400);
//       }
//
//       if (!isValidAttribute(attribute)) {
//         return R.handleError(
//           res,
//           `Invalid attribute: ${attribute}. Valid attributes: guid, alpha2, alpha3, dialcode`,
//           400
//         );
//       }
//
//       let country: Country | null = null;
//
//       // Utilisation des méthodes spécialisées selon l'attribut
//       switch (attribute) {
//         case 'alpha2':
//           country = await Country.findByAlpha2(value.toString());
//           break;
//         case 'alpha3':
//           country = await Country.findByAlpha3(value.toString());
//           break;
//         case 'dialcode':
//           const countries = await Country.findByDialCode(Number(value));
//           country = countries.length > 0 ? countries[0] : null;
//           break;
//         case 'guid':
//           // Recherche par GUID via findAll et filtrage
//           const allCountries = await Country.findAll();
//           country = allCountries.find((c) => c.guid === Number(value)) || null;
//           break;
//       }
//
//       if (!country) {
//         return R.response(false, `Country not found with ${attribute}: ${value}`, res, 404);
//       }
//
//       return R.response(true, country.getDisplayInfo(), res, 200);
//     } catch (error: any) {
//       console.error('Error fetching country by attribute:', error);
//       return R.handleError(res, error.message, 500);
//     }
//   }
// );
//
// /**
//  * PUT /countries/:id
//  * Update country by ID
//  */
// router.put(
//   '/:id',
//   async (req: Request<{ id: string }, {}, UpdateCountryRequest>, res: Response) => {
//     try {
//       const id = parseInt(req.params.id);
//
//       if (isNaN(id) || id <= 0) {
//         return R.handleError(res, 'Valid country ID is required', 400);
//       }
//
//       // Rechercher le pays existant
//       const existingCountry = await Country.findById(id);
//       if (!existingCountry) {
//         return R.response(false, 'Country not found', res, 404);
//       }
//
//       // Mise à jour des champs fournis
//       const { alpha2, alpha3, dialcode, fr, en } = req.body;
//
//       if (alpha2 !== undefined) existingCountry.alpha2 = alpha2;
//       if (alpha3 !== undefined) existingCountry.alpha3 = alpha3;
//       if (dialcode !== undefined) existingCountry.dialcode = dialcode;
//       if (fr !== undefined) existingCountry.frenchName = fr;
//       if (en !== undefined) existingCountry.englishName = en;
//
//       // Sauvegarde
//       const updatedCountry = await existingCountry.save();
//
//       return R.response(true, updatedCountry.getDisplayInfo(), res, 200);
//     } catch (error: any) {
//       console.error('Error updating country:', error);
//       return R.handleError(res, error.message, 500);
//     }
//   }
// );
//
// /**
//  * DELETE /countries/:id
//  * Delete country by ID
//  */
// router.delete('/:id', async (req: Request<{ id: string }>, res: Response) => {
//   try {
//     const id = parseInt(req.params.id);
//
//     if (isNaN(id) || id <= 0) {
//       return R.handleError(res, 'Valid country ID is required', 400);
//     }
//
//     const country = await Country.findById(id);
//     if (!country) {
//       return R.response(false, 'Country not found', res, 404);
//     }
//
//     const deleted = await country.delete();
//
//     if (!deleted) {
//       return R.response(false, 'Failed to delete country', res, 500);
//     }
//
//     return R.response(true, 'Country deleted successfully', res, 200);
//   } catch (error: any) {
//     console.error('Error deleting country:', error);
//     return R.handleError(res, error.message, 500);
//   }
// });
//
// /**
//  * POST /countries/search
//  * Search countries by name
//  */
// router.post('/search', async (req: Request<{}, {}, SearchRequest>, res: Response) => {
//   try {
//     const { name } = req.body;
//
//     if (!name?.trim()) {
//       return R.handleError(res, 'Search name is required', 400);
//     }
//
//     const countries = await Country.searchByName(name.trim());
//
//     const displayData = countries.map((country) => country.getDisplayInfo());
//
//     return R.response(true, displayData, res, 200);
//   } catch (error: any) {
//     console.error('Error searching countries:', error);
//     return R.handleError(res, error.message, 500);
//   }
// });
//
// /**
//  * GET /countries/dialcode/:dialcode
//  * Get countries by dial code
//  */
// router.get('/dialcode/:dialcode', async (req: Request<{ dialcode: string }>, res: Response) => {
//   try {
//     const dialcode = parseInt(req.params.dialcode);
//
//     if (isNaN(dialcode) || dialcode <= 0) {
//       return R.handleError(res, 'Valid dial code is required', 400);
//     }
//
//     const countries = await Country.findByDialCode(dialcode);
//
//     const displayData = countries.map((country) => country.getDisplayInfo());
//
//     return R.response(true, displayData, res, 200);
//   } catch (error: any) {
//     console.error('Error fetching countries by dial code:', error);
//     return R.handleError(res, error.message, 500);
//   }
// });
//
// /**
//  * GET /countries/count
//  * Get total count of countries
//  */
// router.get('/stats/count', async (req: Request, res: Response) => {
//   try {
//     const count = await Country.count();
//
//     return R.response(true, { totalCountries: count }, res, 200);
//   } catch (error: any) {
//     console.error('Error getting countries count:', error);
//     return R.handleError(res, error.message, 500);
//   }
// });
//
// /**
//  * POST /countries/validate
//  * Validate country data without saving
//  */
// router.post('/validate', async (req: Request<{}, {}, CreateCountryRequest>, res: Response) => {
//   try {
//     const validationErrors = validateCountryData(req.body);
//
//     if (validationErrors.length > 0) {
//       return R.response(
//         false,
//         {
//           valid: false,
//           errors: validationErrors,
//         },
//         res,
//         400
//       );
//     }
//
//     // Test de création d'instance pour validation métier
//     try {
//       const country = Country.create({
//         alpha2: req.body.alpha2.trim(),
//         alpha3: req.body.alpha3.trim(),
//         dialcode: Number(req.body.dialcode),
//         fr: req.body.fr.trim(),
//         en: req.body.en.trim(),
//       });
//
//       country.validate();
//
//       return R.response(
//         true,
//         {
//           valid: true,
//           message: 'Country data is valid',
//         },
//         res,
//         200
//       );
//     } catch (validationError: any) {
//       return R.response(
//         false,
//         {
//           valid: false,
//           errors: [validationError.message],
//         },
//         res,
//         400
//       );
//     }
//   } catch (error: any) {
//     console.error('Error validating country:', error);
//     return R.handleError(res, error.message, 500);
//   }
// });
//
// export default router;
