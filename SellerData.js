const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    UserId : String,
    products:[{product:{name:String,price:Number,url:String,description:String}}]
});
module.exports = mongoose.model("SellerData",userSchema);