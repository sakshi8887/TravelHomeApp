const mongoose = require('mongoose');
const initData=require('./data.js');
const Listing=require('../models/listing.js');
const MONGO_URL = 'mongodb://127.0.0.1:27017/travelhomeapp';

main().then(()=>{
    console.log("Connected to MongoDB");
}).catch((err)=>{
    console.error("Error connecting to MongoDB:", err);
});
async function main(){
    await mongoose.connect(MONGO_URL);
}

const initDB= async ()=>{
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj)=>({...obj, owner:'69e08821afb4077a60acdb97'}));
    await Listing.insertMany(initData.data);
    console.log("Database initialized with sample data");
};

initDB();