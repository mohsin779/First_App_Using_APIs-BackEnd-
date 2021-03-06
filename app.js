const express=require('express'); //npm install --save-dev nodemon
const mongoose = require('mongoose');
const feedRoutes=require('./routes/feed');
const authRoutes=require('./routes/auth');
const bodyParser=require('body-parser');
const path=require('path');
const multer=require('multer'); //npm install --save multer
const  createServer = require("http");
const  Server =require("socket.io");

const app=express();

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'images');
    },
    filename: (req, file, cb) => {
      // cb(null, new Date().toISOString() + '-' + file.originalname);
      const uniqueSuffix = Date.now() + '-' + file.originalname;
      cb(null, file.fieldname + '-' + uniqueSuffix)
    }
  });
  
  const fileFilter = (req, file, cb) => {
    if (
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/jpeg'
    ) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  };

// app.use(bodyParser.urlencoded())//x-www-form-urlencoded <form>
app.use(bodyParser.json());//application/json
app.use(multer({ storage:fileStorage,fileFilter:fileFilter }).single('image'));
app.use('/images',express.static(path.join(__dirname, 'images')));

app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Methods','GET,POST,PUT,PATCH,DELETE');
    res.setHeader('Access-Control-Allow-Headers','Content-Type,Authorization');
    next();
});

app.use('/feed',feedRoutes);
app.use('/auth',authRoutes);


app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data=error.data;
    res.status(status).json({ message: message });


});

mongoose
  .connect('mongodb+srv://Mohsin:9844@cluster0.k2jhm.mongodb.net/messages?retryWrites=true&w=majority')
  .then(result => {

    const httpServer = createServer();
    const io = new Server(httpServer, {
      cors: {
        origin: "https://localhost:3000",
        allowedHeaders: ["my-custom-header"],
        credentials: true
      }
    });
    // const server = app.listen(8080);

    // const io=require('./socket').init(server,{
    //   cors: {
    //     origin: '*',
    //     methods:'GET,POST,PUT,PATCH,DELETE',
    //     redential:true

    //   }
    // }); //npm install --save socket.io
    // io.on('connection',socket=>{
    //   console.log('client connected');
    // });
  })
  .catch(err => {
    console.log(err);
  });