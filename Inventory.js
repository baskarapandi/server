const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller'
      },
    products:[{sellerDataProductId:mongoose.Schema.Types.ObjectId,name:String,product:{stock:Number,sales:Number}}]
});
module.exports = mongoose.model("Inventory",userSchema);