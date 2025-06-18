import { Router } from 'express';

import Country from '../src/class/Country';
import G from '../src/tools/glossary';
import R from '../src/tools/response';
import HttpStatus from '../src/tools/http-status';

const router = Router();
router.post('/add', async (req, res) => {
  const { guid, code, iso, name, timezone, mobile_operator, flag } = req.body;
  if (!code || !iso || !name || !timezone || !mobile_operator || !flag) {
    return R.handleError(res, HttpStatus.BAD_REQUEST, G.missingRequired);
  }

  const countryInstance = new Country();
  await countryInstance.init();
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
});

export default router;
