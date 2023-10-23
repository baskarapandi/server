//const fileUploadApp = require('./fileUploadServer');
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
      User.create({Name : req.body.name,EmailId :req.body.email,Password :  req.body.password});
      const response ="registered";
      console.log('registered');
      const token = jwt.sign(req.body.email, secretKeyUser);
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
      Seller.create({EmailId :req.body.email,Password :  req.body.password,Name : req.body.name});
      const response ="registered";
      console.log('registered');
      const token = jwt.sign(req.body.email, secretKeySeller);
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
      const token = jwt.sign(email, secretKeyUser);
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
      const token = jwt.sign(Email, secretKeySeller);
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
  const Email = decoded.payload;
  console.log(Email);
  const user = await SellerData.findOne({UserId:Email}).exec();
  console.log("user"+user);
  if(!user){
    console.log("i am hera");
    const newUser = await SellerData.create({UserId : Email ,products:{product:{name:Name,price:Price,url:Url,description:Description}}});
    console.log(newUser);
    res.end("saved");
  }
  else{
    console.log("else")
    const products = user.products;
    const newUser={
      ...user.toObject(),
      products : [...products,{product:{name:Name,price:Price,url:Url,description:Description}}]
    }
    console.log(newUser);
    
    const updateUser = await SellerData.findOneAndUpdate({UserId :Email },{$set:{...newUser}},{ new: true });
    console.log(updateUser)
    res.end("saved");
  }} catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
})
//inventorydata
app.post("/api/InventoryData", async (req, res,next) => {
  try{
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    var decoded = jwt.decode(token,{complete: true});
    const Email = decoded.payload;
    console.log(Email);
    console.log("inventory token " + token);
    const user =await Inventory.findOne({UserId:Email}).exec();
    console.log("user"+user);
    const product = user.products;
    console.log("product"+product)
    res.json({products:product});
  }
  catch{
    res.status(500).json({error:"internal error"});
  }

})
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});