const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller'
      },
    products:[{product:{name:String,price:Number,url:String,description:String}}]
});
module.exports = mongoose.model("SellerData",userSchema);