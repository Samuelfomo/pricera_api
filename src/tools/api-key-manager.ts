import crypto from 'crypto';

import { v4 as uuidv4 } from 'uuid';

export class ApiKeyManager {
  /**
   * Génère un UUID signé avec une signature HMAC
   * @param secret - Clé secrète pour la signature
   * @returns UUID signé au format: token.signature
   */
  public static generate(secret: string): string {
    try {
      const uuid: string = uuidv4();
      const signature: string = crypto.createHmac('sha256', secret).update(uuid).digest('hex');
      return `${uuid}.${signature}`;
    } catch (error: any) {
      return `${error.message}`;
    }
  }

  /**
   * Vérifie qu'un UUID signé a été généré avec la bonne clé secrète
   * @param signedUUID - UUID signé au format token.signature
   * @param secret - Clé secrète pour vérifier la signature
   * @returns true si la signature est valide
   */
  public static verify(signedUUID: string, secret: string): boolean {
    try {
      const parts: string[] = signedUUID.split('.');
      if (parts.length !== 2) {
        console.log(`Invalid 1🔴`);
        return false;
      }

      const [uuid, providedSignature] = parts;

      // Vérifier que l'UUID est valide (format UUID v4)
      const uuidRegex: RegExp =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(uuid)) {
        console.log(`Invalid 2🔴🔴`);
        return false;
      }

      // VALIDATION CRITIQUE : Vérifier que la signature fournie fait exactement 64 caractères (HMAC-SHA256)
      if (providedSignature.length !== 64) {
        console.log(`Invalid 3🔴🔴🔴`);
        return false;
      }

      // Vérifier que la signature ne contient que des caractères hexadécimaux
      if (!/^[0-9a-f]+$/i.test(providedSignature)) {
        console.log(`Invalid 4🔴🔴🔴🔴`);
        return false;
      }

      // Recalculer la signature avec la clé secrète
      const expectedSignature: string = crypto
        .createHmac('sha256', secret)
        .update(uuid)
        .digest('hex');

      // Vérifier que la signature attendue fait bien 64 caractères (sanity check)
      if (expectedSignature.length !== 64) {
        console.log(`Invalid 5🔴🔴🔴🔴`);
        return false;
      }

      // Comparer les signatures de manière sécurisée
      // Maintenant nous sommes sûrs que les deux buffers ont la même taille
      return crypto.timingSafeEqual(
        Buffer.from(providedSignature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );
    } catch (error: any) {
      console.error('❌ Erreur lors de la vérification de signature:', error.message);
      return false;
    }
  }
}
