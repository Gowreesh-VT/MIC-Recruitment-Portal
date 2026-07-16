require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function test() {
  const url = process.env.MONGO_URL || process.env.MONGODB_URI;
  await mongoose.connect(url);
  const cycle = await mongoose.connection.db.collection('recruitmentcycles').findOne({ cycleId: "2026-27" });
  console.log("Recruitment isOpen status:", cycle ? cycle.isOpen : "Not found");
  process.exit(0);
}
test();
