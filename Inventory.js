const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    UserId :String,
    products:[{product:{name:String,stock:Number,sales:Number}}]
});
module.exports = mongoose.model("Inventory",userSchema);