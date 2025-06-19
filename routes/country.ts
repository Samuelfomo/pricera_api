import { Router } from 'express';

import Country from '../src/class/Country';
import G from '../src/tools/glossary';
import R from '../src/tools/response';
import HttpStatus from '../src/tools/http-status';

const router = Router();

router.post('/add', async (req: any, res) => {
  const { guid, code, iso, name, timezone, mobile_operator, flag } = req.body;

  if (!code || !iso || !name || !timezone || !mobile_operator || !flag) {
    return R.handleError(res, HttpStatus.BAD_REQUEST, G.missingRequired);
  }

  try {
    // Utiliser l'instance partagée depuis app.ts
    const baseCountryModel = req.countryModel as Country;

    // Créer une nouvelle instance pour cette requête
    const countryInstance = new Country();
    await countryInstance.init(); // Réutilise la connexion existante

    countryInstance
      .setGuid(guid)
      .setCode(code)
      .setIso(iso)
      .setName(name)
      .setMobileRegex(mobile_operator)
      .setTimezone(timezone)
      .setFlag(flag);

    await countryInstance.save();

    return R.handleCreated(res, countryInstance.toJSON());
  } catch (error: any) {
    console.error('❌ Erreur création pays:', error);
    return R.handleError(res, HttpStatus.INTERNAL_ERROR, {
      message: 'Erreur lors de la création du pays',
      error: error.message,
    });
  }
});

export default router;
