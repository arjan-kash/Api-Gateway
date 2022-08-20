/**
 * @file
 *
 * This is a route of file uploads.
 *
 * @author Nagender Pratap Chauhan
 */

 import * as express from 'express';
 import * as multer from 'multer';
 import * as path from 'path';
 import * as bodyParser from 'body-parser';
 import {errorLog, infoLog, unauthLog, warnLog} from '../utils/logger.util';

// import * as express from 'express';
// import * as multer from 'multer';

 
// const express = require('express')
// //const multer  = require('multer')
// const UPLOAD_PATH = '../assets';
// const upload = multer({ dest: `${UPLOAD_PATH}/` }); // multer configuration
//  const app = express();
 const ROUTER = express.Router();
// public express;
// constructor(
//         private upload = new multer({ dest: 'c:\\upload' }),
//     ) {
//         this.start();
//     }

// private start() {
//   this.express = express();
//   //  Allow body parsing
//   this.express.use(bodyParser.json());
//   this.express.use(bodyParser.urlencoded({ extended: true }));
//   //  Allow form-data parsing
//   this.express.use(this.upload.any());
// }

// this.express = express();
  //  Allow body parsing
  ROUTER.use(bodyParser.json());
  ROUTER.use(bodyParser.urlencoded({ extended: false }));
  //  Allow form-data parsing
  // ROUTER.use(upload.any());

// const router = express.Router();
// console.log("=-------hello--------");
// //app.all('/', (req, res) => { res.redirect('/upload'); });
// ROUTER.post('/profiles',
//             upload.single('file'), 
//             (req, res) => {
//                 console.log(req.body);
                
//                 res.status(200).send('Hello there!');
//             });

//  app.use(function (req, res, next) {
//     res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3100');
//     res.setHeader('Access-Control-Allow-Methods', 'POST');
//     res.setHeader('Access-Control-Allow-Headers', 'multipart/form-data');
//     res.setHeader('Access-Control-Allow-Credentials', 'true');
//     next();
// });

//  var DIR = '';
//  var fileName = '';
// let storage = multer.diskStorage({
//     destination: (req, file, cb) => {      
//         // DIR = path.join(__dirname, '../app/assets/', 'uploads/'); //for live
//          DIR = path.join(__dirname, './'); //for localhost
//         cb(null, DIR);
//     },
//     filename: (req, file, cb) => {
//         fileName = 'profile_' + Date.now()+ '_'  + file.originalname;
//         console.log('fileName',fileName);
        
//         cb(null, fileName);
//     }
// });

 
        
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any

 // const ROUTER = express.Router();

//   const imageStorage = multer.diskStorage({
//     // Destination to store image     
//     destination: '../assets/', 
//       filename: (req, file, cb) => {
//           cb(null, file.fieldname + '_' + Date.now() 
//              + path.extname(file.originalname))
//             // file.fieldname is name of the field (image)
//             // path.extname get the uploaded file extension
//     }
// });

//   const imageUpload = multer({
//     storage: imageStorage,
//     limits: {
//       fileSize: 1000000 // 1000000 Bytes = 1 MB
//     },
//     fileFilter(req, file, cb) {
//       if (!file.originalname.match(/\.(png|jpg)$/)) { 
//          // upload only png and jpg format
//          return cb(new Error('Please upload a Image'))
//        }
//      cb(undefined, true)
//   }
// }) 

// For Single image upload
// ROUTER.post('/profile', imageUpload.single('image'), (req, res) => {
//     res.send(req.file);
// }, (error, req, res, next) => {
//     res.status(400).send({ error: error.message })
// })
// const multer  = require('multer')
// const upload = multer({ dest: './public/data/uploads/' })


//  const app = express();
//  app.use(bodyParser.json());
//  app.use(bodyParser.urlencoded({ extended: true }));
//  app.use(express.json({ type: "application/json" }));
//  app.use(express.urlencoded({ extended: false }));




// //  const upload = multer({ dest: '../assets/uploads/' })
// // const upload = multer({ dest: './public/data/uploads/' })

 var DIR = '';
 var fileName = '';
let storage = multer.diskStorage({
    destination: (req, file, cb) => {      
        // DIR = path.join(__dirname, '../app/assets/', 'uploads/'); //for live
         DIR = path.join(__dirname, '../assets/', 'uploads/'); //for localhost
        cb(null, DIR);
    },
    filename: (req, file, cb) => {
        fileName = 'profile_' + Date.now()+ '_'  + file.originalname;
        cb(null, fileName);
    }
});

let upload = multer({ storage: storage });



ROUTER.post('/profile', upload.single('file'), function (req, res) {
  res.setHeader('Content-Type','multipart/form-data; boundary=XXX')
    console.log(req.body)
    console.log(req['file'])

         if (!req.files) {
                 console.log("No file received");
                 var final_path = DIR+'/'+fileName;
                 console.log(final_path);
                return res.send({
                    success: false
                });
            } else {
                var final_path = DIR+'/'+fileName;
                console.log(final_path);
                return res.send({
                    success: true,
                    file: fileName 
                  })
            }
            
//     // req.file is the `avatar` file
//     // req.body will hold the text fields, if there were any
  })

  module.exports = ROUTER;
