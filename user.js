const mongoose =require('mongoose');
const userSchema = new mongoose.Schema({
    Name:String,
    EmailId : String,
    Password : String
});
module.exports = mongoose.model("User",userSchema);