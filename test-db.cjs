const mongoose = require('mongoose');

const MONGODB_URI = "mongodb://Naura:nits*1@ac-iu4xhjc-shard-00-00.rtvv59d.mongodb.net:27017,ac-iu4xhjc-shard-00-01.rtvv59d.mongodb.net:27017,ac-iu4xhjc-shard-00-02.rtvv59d.mongodb.net:27017/?ssl=true&replicaSet=atlas-rubm05-shard-0&authSource=admin&appName=Naura";

async function testConnection() {
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(MONGODB_URI, { 
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000 
    });
    console.log('Connected successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Connection failed:', err.message);
    process.exit(1);
  }
}

testConnection();
