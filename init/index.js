const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

<<<<<<< HEAD
const MONGO_URL = "mongodb://127.0.0.1:27017/Wanderlust";
=======
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
>>>>>>> 59e553cfc8d0195a1ae85d49435cad6265e2f87a

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await Listing.deleteMany({});
  await Listing.insertMany(initData.data);
  console.log("data was initialized");
};

initDB();
