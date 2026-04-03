const dns = require('dns');
const mongoose = require('mongoose');

// Force Google DNS to see if it bypasses the local blockage
dns.setServers(['8.8.8.8', '8.8.4.4']);

const uri = "mongodb+srv://Naura:nits*1@naura.rtvv59d.mongodb.net/?appName=Naura";

async function test() {
  try {
    console.log("DNS Servers:", dns.getServers());
    console.log("Connecting to MongoDB via SRV with custom DNS...");
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log("Connected successfully!");
    await mongoose.connection.close();
  } catch (err) {
    console.error("Connection failed:", err);
  } finally {
    process.exit();
  }
}

test();
