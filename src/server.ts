/**
 * @file
 *
 * This file is application start up file. It contains all module declarations.
 */
import * as express from 'express';
import * as path from 'path';
import * as morgan from 'morgan'; 
import * as fileUpload from 'express-fileupload';
import {debugLog, errorLog, infoLog, traceLog} from "./utils/logger.util";
import * as bodyParser from 'body-parser';
import { ApiLogs } from './utils/api-logs';




const app = express();

// config
const config = require('./config');
app.set('config', config);

// models
// app.set('models', require('./dba'));

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'pug');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('view engine', 'ejs');
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
if (config.production) {
  console.log = (msg:any) => traceLog(msg);
  console.debug = (msg:any) => debugLog(msg);
  app.use(morgan('common', {
    stream: {
      write: str => {
        traceLog(str);
      }
    }
  }));
} else {
  app.use(morgan('dev'));
}
//app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));
app.use(express.json({ type: "application/json" }));
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public'), {
  index: false
}));
// app.use(express.static(path.join(__dirname, 'public/angular'), {
//   index: false
// }));

app.use(fileUpload());

// add cors
app.use(function (req, res, next) {
  if (!config.production) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Cache-Control,x-auth-token,x-access-token');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
  }
  next();
});

// add paths

// app.use('/token', require('./routes/token.routes'));
 app.use('/', require('./routes/public-api.routes'));
 app.use('/api-gateway', require('./routes/secured-api.routes')); 
 app.use('/upload', require('./routes/upload.routes'));
// app.use('/print', require('./routes/print.routes'));
// app.use('/contact', require('./routes/contact.routes'));

// app.get('*', (req, res, next) => {
//   res.sendFile(path.resolve(__dirname, 'public/angular/index.html'));
// });

app.disable('x-powered-by');

// catch 404 and forward to error handler
app.use((req, res, next) => {
  //var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const err: any = new Error('404: Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err : any, req : any, res : any, next: any) => {
  let  apiInstance = new ApiLogs();
  const message = err.message || 'Internal Server Error';
  errorLog(message);
  if (err.status && err.status == 404) {
    errorLog("404 - " + req.url);
  } else {
    errorLog(err);
  }
  //apiInstance.log(err.status, 'Bad Request: '+ message, req.originalUrl,'','',''); 
  res.json({status_codes: err.status || 500, message: message + req.url});
});

infoLog("Server init is done");

module.exports = app;
