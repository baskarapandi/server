
const jwt = require('jsonwebtoken');
const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const mongoose =require('mongoose');
const User = require('./user');
const Seller = require('./seller');
const SellerData = require('./SellerData');
const Inventory = require('./Inventory');
const salesReport = require('./salesReport');
const app = express();
app.use(express.json())
app.use(cors());

const PORT = 8000;
app.use(express.json())
//app.use('/fileupload', fileUploadApp);
//secret key for json
const secretKeyUser="secretKeyUser";
const secretKeySeller="secretKeySeller";


//connect data base

mongoose.connect('mongodb://127.0.0.1:27017/testdb')
  .then(() => {
    console.log('Mongoose connected to MongoDB');
  })
  .catch((error) => {
    console.error('Mongoose connection error:', error.message);
  });
//token verification
app.post('/api/tokenVerification',async (req, res) => {
  const secretKey = (req.body.type=="seller")?"secretKeySeller":"secretKeyUser";
  const authHeader = req.headers['authorization'];
  console.log(authHeader);
  const token = authHeader && authHeader.split(' ')[1];
  console.log("hi");
  console.log(token);
  if (token === null) return res.sendStatus(401);
  else{
    jwt.verify(token, secretKey, (err, user) => {
      console.log(err);
      try{
        if (err) {
          const response = "not ok";
          return res.end(response);
        }
        else{
          console.log("ok");
          const response ="ok";
          return res.end(response);
        } 
      }  
      catch(error){
        res.status(500).json({ error: 'An error occurred' });
      }
    })
  }
    
});
// responce for register
app.post('/api/user', async (req, res,next) => {
  try {
    console.log(req.body);
    console.log(req.headers);

    const boolName = await User.exists({Name: req.body.name});
    const boolEmail = await User.exists({EmailId: req.body.email});  
    if(req.body.name=="" ||  req.body.email=="" ||req.body.password ==""){
      const response ="invalid";
      console.log("invalid");
      res.status(403).json({error:response});
    }  
    else if( boolName  || boolEmail  ){
      const response ="already exist";
      console.log("already exist");
      res.status(401).json({error:response});
    }
    else{
      const user = User.create({Name : req.body.name,EmailId :req.body.email,Password :  req.body.password});
      console.log('registered');
      const token = jwt.sign(user._id.toString(), secretKeyUser);
      res.json({token});
    }
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});
app.post('/api/seller', async (req, res,next) => {
  try {
    console.log(req.body);
    console.log(req.headers);

    const boolName = await Seller.exists({Name: req.body.name});
    const boolEmail = await Seller.exists({EmailId: req.body.email});  
    if(req.body.name=="" ||  req.body.email=="" ||req.body.password ==""){
      const response ="invalid";
      console.log("invalid");
      res.status(403).json({error:response});
    }  
    else if( boolName  || boolEmail  ){
      const response ="already exist";
      console.log("already exist");
      res.status(401).json({error:response});
      
    }
    else{
      const seller = await Seller.create({EmailId :req.body.email,Password :  req.body.password,Name : req.body.name});
      const sellerId = seller._id.toString();
      const sellerData = await SellerData.create({sellerId:sellerId,products:[]});
      const inventory = await Inventory.create({sellerId:sellerId,products:[]});
      const sales = await salesReport.create({sellerId:sellerId,products:[]});
      console.log(sellerId);
      const response ="registered";
      console.log('registered');
      const token = jwt.sign(sellerId, secretKeySeller);
      res.json({token});
    } 
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});
// responce for login

app.post('/api/loginuser', async (req, res,next) => {
  try {
    const email = await req.body.email;
    const password = await req.body.password;
    const exist =  await User.findOne({EmailId:email,Password:password}).exec(); 
    console.log(req.body);
    console.log("why am i here")
    console.log(exist);
    
    if(exist){
    /*const response ="exist";
      console.log(" exist");
      res.end(response);
    */
      const id = exist._id.toString();
      const token = jwt.sign(id, secretKeyUser);
      res.json({token});
    }
    else{
      /*
      const response ="not exist";
      console.log('not exist');
      res.end(response);
      */
      res.status(403).json({ error: 'Invalid credentials' });
    }
    
   
  } 
  catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});
app.post('/api/loginseller', async (req, res,next) => {
  try {
    console.log(req.body)
    const Email = await req.body.email;
    const Password = await req.body.password;
    const exist =  await Seller.findOne({EmailId:Email,Password:Password}).exec(); 
     
    console.log(exist);
    
    if(exist){
    /*const response ="exist";
      console.log(" exist");
      res.end(response);
    */
      const id = exist._id.toString();
      console.log(id);
      const token = jwt.sign(id, secretKeySeller);
      res.json({token});
    }
    else{
      /*
      const response ="not exist";
      console.log('not exist');
      res.end(response);
      */
      res.status(403).json({ error: 'Invalid credentials' });
    }
    
   
  } 
  catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});



//Seller Image upload
const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, callback) => {
    console.log(file.fieldname)
    callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Serve uploaded files from the 'uploads' directory
app.use('/uploads', express.static('uploads'));

// Define an endpoint for file uploads
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (req.file) {
    // Construct the URL for the uploaded file
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    // Send the URL as a response
    res.end(imageUrl);
  } else {
    res.status(400).json({ error: 'No file uploaded' });
  }
});

//upload products details
app.post("/api/ProductDetails", async (req, res,next) => {
  try
  {const Name =req.body.Name;
  const Price=req.body.Price;
  const Description=req.body.Description;
  const Url=req.body.Url;
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  console.log(token);
  console.log(Name);
  console.log(Price);
  console.log(Url);
  console.log(Description);
  console.log("beforejwt")
  var decoded = jwt.decode(token,{complete: true});
  const Id = decoded.payload.toString();
  console.log(Id);
  const user = await SellerData.findOne({sellerId:Id}).exec();
  console.log("user"+user);
  if(user==null){
    console.log("i am hera");
    const newUser = await SellerData.create({sellerId : Id ,products:{product:{name:Name,price:Price,url:Url,description:Description}}});
    const id= newUser.products[0].product._id;
    const newInventory = await Inventory.create({sellerId : Id ,products:{sellerDataProductId:id,name:Name,product:{sales:0,stock:0}}});
    console.log(newUser);
    res.end("saved");
  }
  else{
    console.log("else")
    const Inventorydata =  await Inventory.findOne({sellerId : Id}).exec();
    const products = user.products;
    const inventoryProducts =Inventorydata.products;
    
    const newUser={
      ...user.toObject(),
      products : [...products,{product:{name:Name,price:Price,url:Url,description:Description}}]
    }
    console.log(newUser);
    
    const updateUser = await SellerData.findOneAndUpdate({sellerId :Id},{$set:{...newUser}},{ new: true }).exec();
    console.log(updateUser)
    const addedProduct = updateUser.products[updateUser.products.length - 1];

console.log("Added product:", addedProduct);

const sellerDataProductId = addedProduct ? addedProduct._id : null;

console.log("SellerDataProductId:", sellerDataProductId);
    const newInventory = {
      ...Inventorydata.toObject(),
      products:[...inventoryProducts,{sellerDataProductId:sellerDataProductId,name:Name,product:{sales:0,stock:0}}]
    }
    console.log("new Inventory ",newInventory)
    const updateInventory = await Inventory.findOneAndUpdate({sellerId :Id},{$set:{...newInventory}},{ new: true }).exec();
    res.end("saved");
  }} catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
})
//sellers data
app.post("/api/SellersData", async (req, res,next) => {
  try{
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    var decoded = jwt.decode(token,{complete: true});
    const Email = decoded.payload;
    const value = req.body.val;
    const sellerData = await SellerData.findOne({sellerId: Email}).exec();
    const array = sellerData.products;
    res.json({array});
  }
  catch(error){
    res.status(500).json({error:"internal error"})
  }
})
app.post("/api/SellersDataUpdate", async (req, res,next) => {
  try{
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    var decoded = jwt.decode(token,{complete: true});
    const Email = decoded.payload;
    const products = req.body.Products;
    console.log(products)
    const sellerData = await SellerData.findOne({sellerId: Email}).exec();
    const newUser={
      ...sellerData.toObject(),
      products : products
    }
    console.log("newuser"+newUser)
    const updatedUser = await SellerData.findOneAndUpdate({sellerId :Email },{$set:{...newUser}},{ new: true });
    console.log(updatedUser)
    if(updatedUser!=null){
      res.end("ok")
    }  
  }
  catch(error){
    res.status(500).json({error:"internal error"})
  }
})
//api get one sellected product for edit product page for the seller

app.post("/api/getProduct", async (req, res,next) => {
  try{
    console.log("getproduct")
    const id = req.body.productId;
    console.log(id)
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    var decoded = jwt.decode(token,{complete: true});
    const Email = decoded.payload;
    console.log(Email)
     SellerData.findOne(
      { sellerId: Email, "products._id": id },
      { "products.$": 1}
    ).then((sellerData) => {
      if (!sellerData) {
        console.log('No document found with the specified criteria');
      } else {
        console.log(sellerData)
        const array = sellerData.products;
        console.log(array)
        console.log(array[0])
        res.json({products:array[0]});
        console.log("return "+array[0]) 
      }
    })
    .catch((error) => {
      console.error('An error occurred:', error);
    });
    
    
  }
  catch(error){
    res.status(500).json({error:"internal error"})
  }
})
//get produst paggination
app.post('/api/productsPaggination', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  var decoded = jwt.decode(token,{complete: true});
  const Email = decoded.payload;
  const { page = 1, limit = 1 } = req.query; // Default to page 1 and 10 items per page
  console.log("page and limit = "+page+" "+limit);
  const skip = (page - 1) * limit;

  const endIndex = page*limit;
  console.log(skip);
  console.log(endIndex);
  const results={}
  try {
    const sellerData = await SellerData.findOne({ sellerId: Email }).exec();
    console.log(sellerData);
    if(sellerData){const totalProducts = sellerData.products.length;

    const paginatedProducts = sellerData.products.slice(skip, endIndex);
    console.log(paginatedProducts);
    results.products=paginatedProducts;
    results.total ={totalPage : ((totalProducts/limit) + ((totalProducts%limit)>0?1:0))}
    if(endIndex<totalProducts){
      results.next={
        page:page+1,
        limit:limit
      }
    }
    if(skip>0){
      results.prev={
        page:page-1,
        limit:limit
      }
    }}
    else{
      results.products=[];
      results.totalPage=0;
    }
    res.json(results);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
//update the edited product
app.post("/api/updateProduct", async (req, res,next) => {
  try{
    console.log("updateproduct")
    const updatedProduct = req.body.newProduct;
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    var decoded = jwt.decode(token,{complete: true});
    const Email = decoded.payload;
    const sellerData = await SellerData.updateOne(
      {
        sellerId: Email,
        "products._id": updatedProduct._id
      },
      {
        $set: {
          "products.$": updatedProduct
        }
      }
    ).exec();
    
    res.end("saved");
    console.log(sellerData);
    console.log("saved");
  }
  catch(error){
    res.status(500).json({error:"internal error"})
  }
})
//delete product

app.post("/api/deleteProduct", async (req, res,next) => {
  try{
    console.log("deleteproduct")
    const ProductId = req.body.productId;
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    var decoded = jwt.decode(token,{complete: true});
    const Email = decoded.payload;
    console.log("ProductId"+ProductId)
    const sellerData = await SellerData.updateOne(
      {
        sellerId: Email,
      },
      {
        $pull: {
          products:{_id:ProductId}
        }
      }
    ).exec();
    
    res.end("saved");
    console.log(sellerData);
    console.log("saved");
  }
  catch(error){
    res.status(500).json({error:"internal error"})
  }
})
//inventorydata
app.post("/api/InventoryData", async (req, res,next) => {
  try{
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    var decoded = jwt.decode(token,{complete: true});
    const sellerId = decoded.payload;
    console.log(sellerId);
    console.log("inventory token " + token);
    const user =await Inventory.findOne({sellerId:sellerId}).exec();
    console.log("user"+user);
    const product = user.products;
    console.log("product"+product)
    res.json({products:product});
  }
  catch{
    res.status(500).json({error:"internal error"});
  }

})
app.post("/api/salesReport", async (req, res,next) => {
  try{
    console.log("api request");
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    var decoded = jwt.decode(token,{complete: true});
    const sellerId = decoded.payload;
    console.log("email"+sellerId)
    const data =await salesReport.findOne({sellerId:sellerId}).exec();
    console.log(data.products);
    res.json({sales:data.products});
  }
  catch{
    res.status(500).json({error:"internal error"});
  }
  
})

// api request for search
app.post("/api/Search", async (req, res,next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  var decoded = jwt.decode(token,{complete: true});
  const Email = decoded.payload;
  const value = req.body.val;
  const sellerData = await Inventory.findOne({sellerId: Email}).exec();
  const array = sellerData.products;
  console.log("products"+array)
  console.log(array);
  const reply = [];
  var index=0;
  for(var i=0;i<array.length;i+=1){
    const Name = array[i].name;
    console.log(Name+"name")
    const re = Name.toLowerCase().includes(value);
    console.log(re)
    if(re){
      reply[index]=Name;
      index+=1;
    }
    
  }
  console.log("[]"+reply);
  res.json({key:reply});
})
app.post("/api/editStock", async (req, res,next) => {
  const Name = req.body.name;
  const Stock = req.body.stock;
  console.log(Name);
  console.log(Stock);
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  var decoded = jwt.decode(token,{complete: true});
  const Email = decoded.payload;
  console.log(Email);
  console.log("inventory token " + token);
  const user =await Inventory.findOne({sellerId:Email}).exec();
  //console.log("user"+user);
  const products = user.products;
  console.log("product    "+products)
  const newProduct = products.map((prod)=>{
    console.log("name inside "+Name)
    console.log("name inside "+Stock)
    if(prod.name==Name){
      const array =prod.product.sales;
      const n = prod.name;
      console.log("array"+ array)
      return ({
        name:Name,
        product : {sales:array,stock:Stock}});
    }
    else return prod;
  })
  console.log("new product"+newProduct+"end");
  const newUser = {
    ...user.toObject(),
    products:[...newProduct]
  }

  const updateUser = await Inventory.findOneAndUpdate({sellerId :Email },{$set:{...newUser}},{ new: true });
 // console.log(updateUser)
  console.log(updateUser.products[0].product.stock)
  res.end("done")
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});