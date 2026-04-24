const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  try {
    // Get existing order structure to copy
    const existingOrder = await p.order.findFirst({
      include: { items: true, customer: true },
    });

    if (!existingOrder) {
      console.log('❌ No existing orders found');
      return;
    }

    // Create new order copying existing structure
    const newOrder = await p.order.create({
      data: {
        customerId: existingOrder.customerId,
        orderNumber: `TEST-${Date.now()}`,
        status: 'PENDING',
        subtotal: existingOrder.subtotal,
        shippingTotal: existingOrder.shippingTotal,
        taxTotal: existingOrder.taxTotal,
        discountTotal: existingOrder.discountTotal,
        grandTotal: existingOrder.grandTotal,
        currency: existingOrder.currency,
        items: {
          create: existingOrder.items.map(item => ({
            productName: item.productName,
            sku: item.sku,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          })),
        },
      },
      include: { items: true, customer: true },
    });

    console.log('\n✅ Test order created on PRODUCTION!');
    console.log(`   Order ID: ${newOrder.id}`);
    console.log(`   Order #: ${newOrder.orderNumber}`);
    console.log(`   Customer: ${newOrder.customer.firstName} ${newOrder.customer.lastName}`);
    console.log(`   Phone: ${newOrder.customer.phone}`);
    console.log(`   Total: ${newOrder.grandTotal} ${newOrder.currency}`);
    console.log(`   Items: ${newOrder.items.length}\n`);

    // Wait a bit for CallJob to be created
    await new Promise(r => setTimeout(r, 3000));

    // Check if CallJob was created
    const callJob = await p.callJob.findFirst({
      where: { orderId: newOrder.id },
    });

    if (callJob) {
      console.log('✅ CallJob automatically created!');
      console.log(`   CallJob ID: ${callJob.id}`);
      console.log(`   Status: ${callJob.status}`);
      console.log(`   Scheduled at: ${new Date(callJob.scheduledAt).toLocaleString()}`);
      console.log(`\n📞 AI call center will call in 30 seconds...`);
      console.log(`\nCheck online: https://admin.adstema.com/calls`);
    } else {
      console.log('⚠️  No CallJob found yet');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await p.$disconnect();
  }
}

main();
