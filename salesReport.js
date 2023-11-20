const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller'
      },
    products:[{productName:String,sales:[Number]}]
});
module.exports = mongoose.model("SalesReport",userSchema);