import Client from '../src/class/Client';

async function testTokenGenerators() {
  console.log('🧪 === Test des générateurs de tokens ===\n');

  try {
    // Initialiser un client
    const client = new Client();
    await client.init();

    console.log('✅ Client initialisé\n');

    // Test 1: GUID numérique
    console.log('🔢 === Test GUID numérique ===');
    const guid6 = await client.generateClientGuid(6);
    const guid3 = await client.generateClientGuid(3);
    const guid8 = await client.generateClientGuid(8);

    console.log(`GUID longueur 6: ${guid6} (format: 1xxxxxx)`);
    console.log(`GUID longueur 3: ${guid3} (format: 1xxx)`);
    console.log(`GUID longueur 8: ${guid8} (format: 1xxxxxxxx)`);
    console.log('');

    // Test 2: Token basé sur le temps
    console.log('🕐 === Test Token temporel ===');
    const timeToken1 = await client.generateTimeBasedClientToken(6);

    // Attendre 1 seconde pour voir la différence
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const timeToken2 = await client.generateTimeBasedClientToken(6);

    console.log(`Token temporel 1: ${timeToken1}`);
    console.log(`Token temporel 2: ${timeToken2}`);
    console.log('Format: CLI-YYYYMMDDHHMMSS-GUID');
    console.log('');

    // Test 3: UUID PostgreSQL
    console.log('🆔 === Test UUID PostgreSQL ===');
    const uuid1 = await client.generateUUIDClientToken();
    const uuid2 = await client.generateUUIDClientToken();
    const uuid3 = await client.generateUUIDClientToken();

    console.log(`UUID 1: ${uuid1}`);
    console.log(`UUID 2: ${uuid2}`);
    console.log(`UUID 3: ${uuid3}`);
    console.log('Format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx');
    console.log('');

    // Test 4: Comparaison des performances
    console.log('⚡ === Test de performance ===');

    const startTime = Date.now();

    // Générer 10 de chaque type
    console.log('Génération de 10 tokens de chaque type...');

    const guidPromises = Array.from({ length: 10 }, () => client.generateClientGuid(6));
    const timePromises = Array.from({ length: 10 }, () => client.generateTimeBasedClientToken(4));
    const uuidPromises = Array.from({ length: 10 }, () => client.generateUUIDClientToken());

    const [guids, times, uuids] = await Promise.all([
      Promise.all(guidPromises),
      Promise.all(timePromises),
      Promise.all(uuidPromises),
    ]);

    const endTime = Date.now();

    console.log(`✅ 30 tokens générés en ${endTime - startTime}ms`);
    console.log(`📊 GUID: ${guids.filter((g) => g !== null).length}/10 réussis`);
    console.log(`📊 Time: ${times.filter((t) => t !== null).length}/10 réussis`);
    console.log(`📊 UUID: ${uuids.filter((u) => u !== null).length}/10 réussis`);
    console.log('');

    // Test 5: Unicité
    console.log("🔒 === Test d'unicité ===");
    const uniqueTest = new Set();

    for (let i = 0; i < 100; i++) {
      const token = await client.generateTimeBasedClientToken(5);
      if (token) {
        uniqueTest.add(token);
      }
    }

    console.log(`✅ 100 tokens temporels générés, ${uniqueTest.size} uniques`);
    console.log(
      `${uniqueTest.size === 100 ? '🎉 Tous uniques !' : '⚠️ Quelques doublons détectés'}`
    );
  } catch (error: any) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Démarrage du test
if (require.main === module) {
  testTokenGenerators()
    .then(() => {
      console.log('\n🏁 Tests terminés');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur fatale:', error);
      process.exit(1);
    });
}

export default testTokenGenerators;
