const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const prisma = new PrismaClient();

function parseGenerationDate(dateStr) {
  // E.g., '15-05-2020 00:00'
  const parts = dateStr.trim().split(' ');
  if (parts.length !== 2) return new Date();
  const datePart = parts[0];
  const timePart = parts[1];
  const dateParts = datePart.split('-');
  const timeParts = timePart.split(':');
  
  if (dateParts.length === 3 && timeParts.length >= 2) {
    const day = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1; // 0-indexed
    const year = parseInt(dateParts[2], 10);
    const hour = parseInt(timeParts[0], 10);
    const minute = parseInt(timeParts[1], 10);
    return new Date(Date.UTC(year, month, day, hour, minute, 0));
  }
  return new Date();
}

function parseWeatherDate(dateStr) {
  // E.g., '2020-05-15 00:00:00'
  return new Date(dateStr.trim().replace(' ', 'T') + 'Z'); 
}

const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
};

async function main() {
  try {
    console.log("Seeding data. This may take a couple of minutes...");

    let user = await prisma.user.findFirst({ where: { email: "admin@solar.com" } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkUserId: "dummy_clerk_id_" + Date.now(),
          email: "admin@solar.com",
          name: "Admin"
        }
      });
      console.log("Created dummy user:", user.id);
    }

    let project = await prisma.project.findFirst({ where: { name: "Plant 1" } });
    if (!project) {
      project = await prisma.project.create({
        data: {
          userId: user.id,
          name: "Plant 1",
          location: "India",
          capacityKW: 5000
        }
      });
      console.log("Created Project Plant 1:", project.id);
    }

    console.log("Reading Weather Data...");
    const weatherRows = await parseCSV(path.join(__dirname, '../dataset/Plant_1_Weather_Sensor_Data.csv'));
    const weatherData = weatherRows.filter(r => r.DATE_TIME).map(row => ({
      projectId: project.id,
      timestamp: parseWeatherDate(row.DATE_TIME),
      ambientTemp: parseFloat(row.AMBIENT_TEMPERATURE) || 0,
      moduleTemp: parseFloat(row.MODULE_TEMPERATURE) || 0,
      irradiation: parseFloat(row.IRRADIATION) || 0
    }));
    
    console.log(`Inserting ${weatherData.length} weather readings...`);
    for (let i = 0; i < weatherData.length; i += 1000) {
       const batch = weatherData.slice(i, i + 1000);
       await prisma.weatherReading.createMany({ data: batch, skipDuplicates: true });
    }
    console.log("Weather data inserted successfully.");

    console.log("Reading Generation Data...");
    const genRows = await parseCSV(path.join(__dirname, '../dataset/Plant_1_Generation_Data.csv'));
    const genData = genRows.filter(r => r.DATE_TIME).map(row => ({
      projectId: project.id,
      timestamp: parseGenerationDate(row.DATE_TIME),
      sourceKey: row.SOURCE_KEY,
      dcPower: parseFloat(row.DC_POWER) || 0,
      acPower: parseFloat(row.AC_POWER) || 0,
      dailyYield: parseFloat(row.DAILY_YIELD) || 0,
      totalYield: parseFloat(row.TOTAL_YIELD) || 0
    }));

    console.log(`Inserting ${genData.length} generation readings. Ingesting in batches of 5000...`);
    for (let i = 0; i < genData.length; i += 5000) {
       const batch = genData.slice(i, i + 5000);
       await prisma.generationReading.createMany({ data: batch, skipDuplicates: true });
       console.log(`...inserted lines ${i} to ${i + batch.length}`);
    }
    console.log("Generation data inserted successfully!");

  } catch (error) {
    console.error("Error during seeding:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
