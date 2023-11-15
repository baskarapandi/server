const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    UserId :String,
    products:[{productName:String,sales:[Number]}]
});
module.exports = mongoose.model("SalesReport",userSchema);