require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function test() {
  const url = process.env.MONGO_URL || process.env.MONGODB_URI;
  await mongoose.connect(url);
  console.log("Connected to MongoDB.");
  
  const RecruitmentCycleSchema = new mongoose.Schema(
    {
      cycleId: { type: String, required: true, unique: true },
      isOpen: { type: Boolean, default: false },
      openedAt: { type: Date, default: Date.now },
      closedAt: { type: Date },
      label: { type: String, default: "MIC Recruitment 2026–27" },
    },
    { timestamps: true }
  );
  
  const RecruitmentCycle = mongoose.models.RecruitmentCycle || mongoose.model("RecruitmentCycle", RecruitmentCycleSchema);
  
  const current = await RecruitmentCycle.findOne({ cycleId: "2026-27" });
  console.log("Current cycle:", current);

  // Try to update
  const isOpen = !current.isOpen;
  const cycle = await RecruitmentCycle.findOneAndUpdate(
    { cycleId: "2026-27" },
    {
      $set: {
        isOpen,
        ...(isOpen ? { openedAt: new Date() } : { closedAt: new Date() }),
      },
    },
    { new: true, upsert: true }
  );
  
  console.log("Updated cycle:", cycle);
  process.exit(0);
}
test();
