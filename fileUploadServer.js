const express = require('express');
const multer = require('multer');
const path = require('path');
const fileUploadApp = express();

// Set up the storage for uploaded files
const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, callback) => {
    callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Serve uploaded files from the 'uploads' directory
fileUploadApp.use('/uploads', express.static('uploads'));

// Define an endpoint for file uploads
fileUploadApp.post('/upload', upload.single('image'), (req, res) => {
  if (req.file) {
    // Construct the URL for the uploaded file
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    // Send the URL as a response
    res.status(200).json({ imageUrl });
  } else {
    res.status(400).json({ error: 'No file uploaded' });
  }
});

module.exports = fileUploadApp;
