const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    UserId :String,
    Sales:[Number]
});
module.exports = mongoose.model("SalesReport",userSchema);