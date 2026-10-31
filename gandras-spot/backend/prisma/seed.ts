import {
  PrismaClient,
  ProductKind,
  UserRole,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 10);

  const restaurant = await prisma.restaurant.upsert({
    where: { slug: 'gandras-spot' },
    update: {},
    create: {
      slug: 'gandras-spot',
      name: 'Gandras Spot',
      logoUrl: null,
      settings: {
        create: {
          primaryColor: '#FFB800',
          secondaryColor: '#1A1A1A',
          phone: '060 077 6912',
          email: 'info@gandrasspot.rs',
          address: 'Pijaca u lancima 4, Sombor 25000',
          city: 'Sombor',
          workingHours: {
            mon: '10:00-24:00',
            tue: '10:00-24:00',
            wed: '10:00-24:00',
            thu: '10:00-24:00',
            fri: '10:00-24:00',
            sat: '10:00-24:00',
            sun: '10:00-24:00',
          },
          deliveryFee: 0,
          freeDeliveryMin: 1500,
          isOpen: true,
          cashEnabled: true,
          cardEnabled: true,
          deliveryEnabled: true,
          pickupEnabled: true,
          taxRate: 0.2,
        },
      },
    },
    include: { settings: true },
  });

  await prisma.restaurantSettings.updateMany({
    where: { restaurantId: restaurant.id },
    data: {
      phone: '060 077 6912',
      address: 'Pijaca u lancima 4, Sombor 25000',
      city: 'Sombor',
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@gandrasspot.rs' },
    update: {},
    create: {
      email: 'admin@gandrasspot.rs',
      passwordHash,
      firstName: 'Admin',
      lastName: 'Gandras',
    },
  });

  await prisma.restaurantUser.upsert({
    where: {
      restaurantId_userId: {
        restaurantId: restaurant.id,
        userId: admin.id,
      },
    },
    update: { role: UserRole.OWNER },
    create: {
      restaurantId: restaurant.id,
      userId: admin.id,
      role: UserRole.OWNER,
    },
  });

  const burgersCategory = await prisma.category.upsert({
    where: { restaurantId_slug: { restaurantId: restaurant.id, slug: 'burgers' } },
    update: {},
    create: {
      restaurantId: restaurant.id,
      name: 'Burgeri',
      slug: 'burgers',
      sortOrder: 1,
    },
  });

  const burgerData = [
    {
      slug: 'classic',
      name: 'Classic Burger',
      description:
        '100% juneće meso (160 g) · Cheddar sir · Zelena salata · Svež paradajz · Crveni luk · Gandras specijal sos · Klasično burger pecivo',
      price: 690,
    },
    {
      slug: 'double-cheese',
      name: 'Double Cheese',
      description:
        '2× 100% juneće meso (2× 120 g) · Dvostruki cheddar sir · Zelena salata · Kiseli krastavci · Crveni luk · Specijalni umak · Brioche pecivo',
      price: 890,
    },
    {
      slug: 'bbq-smash',
      name: 'BBQ Smash',
      description:
        'Smash juneće meso (160 g) · Cheddar sir · Hrskava slanina · BBQ sos · Karamelizovani luk · Zelena salata · Klasično burger pecivo',
      price: 850,
    },
    {
      slug: 'chicken-crunch',
      name: 'Chicken Crunch',
      description:
        'Pohovana pileća prsa · Majonez · Zelena salata · Svež paradajz · Crveni luk · Ranch sos · Brioche pecivo',
      price: 750,
    },
  ];

  for (let i = 0; i < burgerData.length; i++) {
    const b = burgerData[i];
    await prisma.product.upsert({
      where: { restaurantId_slug: { restaurantId: restaurant.id, slug: b.slug } },
      update: { name: b.name, price: b.price, description: b.description, sortOrder: i },
      create: {
        restaurantId: restaurant.id,
        categoryId: burgersCategory.id,
        kind: ProductKind.BURGER,
        slug: b.slug,
        name: b.name,
        description: b.description,
        price: b.price,
        sortOrder: i,
      },
    });
  }

  const breads = [
    { slug: 'klasicno', name: 'Klasično testo', price: 0 },
    { slug: 'brioche', name: 'Brioche', price: 50 },
    { slug: 'integralno', name: 'Integralno', price: 30 },
  ];
  for (let i = 0; i < breads.length; i++) {
    const b = breads[i];
    await prisma.breadType.upsert({
      where: { restaurantId_slug: { restaurantId: restaurant.id, slug: b.slug } },
      update: { name: b.name, price: b.price, sortOrder: i },
      create: { restaurantId: restaurant.id, slug: b.slug, name: b.name, price: b.price, sortOrder: i },
    });
  }

  const ingredients = [
    { slug: 'iceberg', name: 'Iceberg' },
    { slug: 'kupus-jogurt', name: 'Kupus sa susamom i grčkim jogurtom' },
    { slug: 'paradajz', name: 'Paradajz' },
    { slug: 'krastavci-sargarepa', name: 'Krastavci i šargarepa' },
  ];
  for (let i = 0; i < ingredients.length; i++) {
    const ing = ingredients[i];
    await prisma.ingredient.upsert({
      where: { restaurantId_slug: { restaurantId: restaurant.id, slug: ing.slug } },
      update: { name: ing.name, sortOrder: i, isAvailable: true },
      create: { restaurantId: restaurant.id, slug: ing.slug, name: ing.name, sortOrder: i },
    });
  }
  const oldIngredients = ['zelena', 'luk', 'krastavci', 'kupus'];
  await prisma.ingredient.updateMany({
    where: { restaurantId: restaurant.id, slug: { in: oldIngredients } },
    data: { isAvailable: false },
  });

  const extras = [
    { slug: 'extra-slanina', name: 'Extra slanina', price: 150 },
    { slug: 'extra-cheddar', name: 'Extra cheddar', price: 100 },
    { slug: 'ljuti-sos', name: 'Ljuti sos', price: 80 },
  ];
  for (let i = 0; i < extras.length; i++) {
    const e = extras[i];
    await prisma.extra.upsert({
      where: { restaurantId_slug: { restaurantId: restaurant.id, slug: e.slug } },
      update: { name: e.name, price: e.price, sortOrder: i, isAvailable: true },
      create: { restaurantId: restaurant.id, slug: e.slug, name: e.name, price: e.price, sortOrder: i },
    });
  }
  const oldExtras = ['extra-sir', 'extra-meso', 'bacon', 'jalapeno', 'onion-rings', 'pomfrit'];
  await prisma.extra.updateMany({
    where: { restaurantId: restaurant.id, slug: { in: oldExtras } },
    data: { isAvailable: false },
  });

  const drinks = [
    { slug: 'coca-cola', name: 'Coca Cola', price: 180 },
    { slug: 'fanta', name: 'Fanta', price: 180 },
    { slug: 'sprite', name: 'Sprite', price: 180 },
    { slug: 'voda', name: 'Voda', price: 120 },
  ];
  for (let i = 0; i < drinks.length; i++) {
    const d = drinks[i];
    const drink = await prisma.drink.upsert({
      where: { restaurantId_slug: { restaurantId: restaurant.id, slug: d.slug } },
      update: { name: d.name, price: d.price, sortOrder: i },
      create: { restaurantId: restaurant.id, slug: d.slug, name: d.name, price: d.price, sortOrder: i },
    });

    await prisma.stockItem.upsert({
      where: { drinkId: drink.id },
      update: { name: drink.name, quantity: 50, minQuantity: 10 },
      create: {
        restaurantId: restaurant.id,
        name: drink.name,
        drinkId: drink.id,
        quantity: 50,
        minQuantity: 10,
        unit: 'kom',
      },
    });
  }

  const supplier = await prisma.supplier.upsert({
    where: { id: 'seed-supplier-coca' },
    update: { name: 'Coca-Cola HBC' },
    create: {
      id: 'seed-supplier-coca',
      restaurantId: restaurant.id,
      name: 'Coca-Cola HBC',
      phone: '011 123 456',
      note: 'Pića i gazirani sokovi',
    },
  });

  await prisma.stockItem.updateMany({
    where: { restaurantId: restaurant.id, drinkId: { not: null } },
    data: { supplierId: supplier.id },
  });

  console.log('Seed complete.');
  console.log('Restaurant:', restaurant.slug);
  console.log('Admin login: admin@gandrasspot.rs / admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
