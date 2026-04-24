const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding settings...');

  const settings = [
    {
      key: 'STORE_NAME',
      value: 'ADSTEMA',
      description: 'Store name displayed throughout the application',
    },
    {
      key: 'STORE_EMAIL',
      value: 'support@adstema.com',
      description: 'Primary store email for customer support',
    },
    {
      key: 'STORE_PHONE',
      value: '+381600000000',
      description: 'Store phone number',
    },
    {
      key: 'STORE_ADDRESS',
      value: 'Belgrade, Serbia',
      description: 'Store physical address',
    },
    {
      key: 'COMPANY_NAME',
      value: 'ADSTEMA LLC',
      description: 'Legal company name',
    },
    {
      key: 'STORE_LOGO_URL',
      value: '',
      description: 'URL to store logo image',
    },
    {
      key: 'NETWORK_API_KEY',
      value: 'sk_live_abc123def456ghi789jkl0123456',
      description: 'API key for network orders integration',
    },
  ];

  for (const setting of settings) {
    try {
      await prisma.setting.upsert({
        where: { key: setting.key },
        update: { value: setting.value, description: setting.description },
        create: setting,
      });
      console.log(`✓ Setting ${setting.key} seeded`);
    } catch (error) {
      console.error(`✗ Failed to seed ${setting.key}:`, error.message);
    }
  }

  console.log('Done seeding settings!');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
