const { db: prisma } = require('./lib/prisma');

async function testAction() {
  try {
    const latestGen = await prisma.generationReading.findFirst({
      orderBy: { timestamp: 'desc' },
      select: { timestamp: true }
    });

    if (!latestGen) return console.log("No data");

    const latestDateStr = latestGen.timestamp.toISOString().split('T')[0]; 
    const startOfDay = new Date(`${latestDateStr}T00:00:00.000Z`);
    const endOfDay = new Date(`${latestDateStr}T23:59:59.999Z`);
    
    const generationToday = await prisma.generationReading.findMany({
      where: { timestamp: { gte: startOfDay, lte: endOfDay } }
    });

    const weatherToday = await prisma.weatherReading.findMany({
      where: { timestamp: { gte: startOfDay, lte: endOfDay } }
    });

    const hourlyMap = {};

    generationToday.forEach(record => {
      const hour = record.timestamp.getUTCHours();
      const timeKey = `${hour === 0 ? 12 : hour > 12 ? hour - 12 : hour}${hour >= 12 ? 'PM' : 'AM'}`;
      if (!hourlyMap[timeKey]) hourlyMap[timeKey] = { time: timeKey, power: 0, irradiance: 0, temp: 0, count: 0, weatherCount: 0 };
      hourlyMap[timeKey].power += (record.dcPower || record.acPower || 0);
      hourlyMap[timeKey].count += 1;
    });

    weatherToday.forEach(record => {
      const hour = record.timestamp.getUTCHours();
      const timeKey = `${hour === 0 ? 12 : hour > 12 ? hour - 12 : hour}${hour >= 12 ? 'PM' : 'AM'}`;
      if (hourlyMap[timeKey]) {
         hourlyMap[timeKey].irradiance += (record.irradiation || 0);
         hourlyMap[timeKey].temp += ((record.ambientTemp + record.moduleTemp) / 2 || 0);
         hourlyMap[timeKey].weatherCount += 1;
      }
    });

    Object.values(hourlyMap).forEach(h => {
      const totalIntervals = h.count / 22 || 1;
      h.power = parseFloat((h.power / totalIntervals / 1000).toFixed(2));
      if (h.weatherCount > 0) {
        h.irradiance = parseFloat((h.irradiance / h.weatherCount * 1000).toFixed(2));
        h.temp = parseFloat((h.temp / h.weatherCount).toFixed(2));
      }
    });

    const sortedHours = [6,7,8,9,10,11,12,13,14,15,16,17,18];
    const hourlyData = sortedHours.map(h => {
      const timeKey = `${h === 0 ? 12 : h > 12 ? h - 12 : h}${h >= 12 ? 'PM' : 'AM'}`;
      return hourlyMap[timeKey] || { time: timeKey, power: 0, irradiance: 0, temp: 0 };
    });

    const latestTimestampRecords = await prisma.generationReading.findMany({
      where: { timestamp: latestGen.timestamp }
    });
    
    const totalEnergyProduced = latestTimestampRecords.reduce((sum, r) => sum + (r.totalYield || 0), 0);
    const energyToday = latestTimestampRecords.reduce((sum, r) => sum + (r.dailyYield || 0), 0);

    const dailyEnergy = [
      { day: "Mon", energy: parseFloat((energyToday * 0.8).toFixed(1)) }
    ];

    const forecastData = hourlyData.map(h => ({
      hour: h.time,
      actual: h.power,
      predicted: parseFloat((h.power * (1 + (Math.random() * 0.2 - 0.1))).toFixed(2)) 
    }));

    console.log("DONE NO ERRORS");
  } catch (err) {
    console.error("CAUGHT ERROR:", err);
  } finally {
    await prisma.$disconnect();
  }
}
testAction();
