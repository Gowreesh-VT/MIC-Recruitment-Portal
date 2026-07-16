const mongoose = require("mongoose");
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/mic-recruitment");
const Application = require("./src/models/Application").default;

async function check() {
  const apps = await mongoose.connection.collection("applications").find().toArray();
  console.log(JSON.stringify(apps, null, 2));
  process.exit(0);
}
check();
