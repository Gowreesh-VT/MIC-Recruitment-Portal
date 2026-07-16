const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/mic-portal').then(async () => {
  const apps = await mongoose.connection.collection('applications').find({}).toArray();
  console.log("Applications:", JSON.stringify(apps, null, 2));
  process.exit(0);
});
