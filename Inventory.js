const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    UserId :String,
    products:[{name:String,product:{stock:Number,sales:Number}}]
});
module.exports = mongoose.model("Inventory",userSchema);