const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testAction() {
  try {
    const latestGen = await prisma.generationReading.findFirst({
      orderBy: { timestamp: 'desc' },
      select: { timestamp: true }
    });

    if (!latestGen) {
        console.log("No gen found");
      return;
    }

    const latestDateStr = latestGen.timestamp.toISOString().split('T')[0]; 
    const startOfDay = new Date(`${latestDateStr}T00:00:00.000Z`);
    const endOfDay = new Date(`${latestDateStr}T23:59:59.999Z`);
    
    const generationToday = await prisma.generationReading.findMany({
      where: { timestamp: { gte: startOfDay, lte: endOfDay } }
    });

    const weatherToday = await prisma.weatherReading.findMany({
      where: { timestamp: { gte: startOfDay, lte: endOfDay } }
    });
    
    console.log("generationToday len", generationToday.length);
    console.log("weatherToday len", weatherToday.length);

    console.log("Success! Data is good.");
  } catch (e) {
    console.error("Action error:", e);
  } finally {
    await prisma.$disconnect();
  }
}
testAction();
