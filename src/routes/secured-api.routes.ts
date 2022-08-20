/**
 * @file
 *
 * This is a route of all api urls. Can be accessed after success login. These urls need authentication.
 *
 * @author Nagender Pratap Chauhan on 13/6/21.
 */

import * as  express from 'express';
// import * as multer from 'multer';
var multer = require('multer');
import { CDRService } from '../services/cdr.service';
import { ExtensionService } from '../services/extension.service';
import { RecordingService } from '../services/recording.service';
import { warnLog, unauthLog } from '../utils/logger.util';
import { ApiLogs } from '../utils/api-logs';
import { CircleService } from '../services/circle.service';
import { MinutePlanService } from '../services/minutePlan';
import { SMSService } from '../services/sms.service';
import { PackageService } from '../services/package.service';
import { CustomerService } from '../services/customer.service';
import { DIDService } from '../services/did.service';
// import { callplans } from '../services/callplan.service';

const ROUTER = express.Router({ mergeParams: true });
/**
 * Middle ware to filter app access
 */
ROUTER.use('*', (req, res, next) => {
  console.log(req.headers);
  if (req.method == "OPTIONS") {
    next();
  } else {
    const JWTUtil = require('../utils/jwt.util');
    const jwtUtil = new JWTUtil();
    const apiInstance = new ApiLogs();
    if (!req.headers['x-access-token']) {
      unauthLog("x-access-token", req.originalUrl, req.ip, req.headers);
      res.json({ status_code: 402, message: 'Unauthenticated User - Token is missing' });
      apiInstance.log(402, 'Unauthenticated User - Token is missing.', req.originalUrl, '', '', '');
      return;
    }

    // if (!req.headers['type']) {
    //   unauthLog("type", req.originalUrl, req.ip, req.headers);
    //   res.json({ status_code: 406, message: 'Unauthorize User - Type is missing' });
    //   apiInstance.log(406, 'Unauthorize User - Type is missing.', req.originalUrl, '', '', '');
    //   return;
    // }
    // if (req.headers['type'] != 'pbx' && req.headers['type'] != 'sp' && req.headers['type'] != 'crm') {
    //   unauthLog("type", req.originalUrl, req.ip, req.headers);
    //   res.json({ status_code: 406, message: 'Unauthorize User - Type is incorrect' });
    //   apiInstance.log(406, 'Unauthorize User - Type is incorrect.', req.originalUrl, '', '', '');
    //   return;
    // } commented this code at 17-03-2022 

    // jwtUtil.verifyPreauthToken(req.headers['x-access-token'], () => {
    jwtUtil.authenticateToken(req.headers['x-access-token'], (payload) => {
      req['id'] = payload.id;
      req['package_id'] = payload.package_id;
      req['customer_id'] = payload.customer_id;
      req['ext_number'] = payload.ext_number;
      req['user_type'] = payload.user_type;
      req['app_type'] = payload.app_type;
      next();
    }, () => {
      unauthLog("x-access-token-invalid", req.originalUrl, req.ip, req.headers);
      apiInstance.log(401, 'Unauthorize User - Token is invalid.', req.originalUrl, '', '', '');
      res.json({ status_code: 401, message: 'Unauthorized User - Token is invalid' });
    });
  }
});

// ROUTER.use('*', (req, res, next) => {
//     console.log(req.headers);
//   if (req.method == "OPTIONS") {
//     next();
//   } else {
//     const Auth = require('../utils/authorize');
//     const auth = new Auth();
//     if (!req.headers['x-access-token']) {
//       unauthLog("x-access-token", req.originalUrl, req.ip, req.headers);
//       res.json({ status_code: 402, message: 'Unauthenticated User - pass the token in header' });
//       return;
//     }
//     auth.authorize(req.headers['x-access-token'], () => {
//       next();
//     }, () => {
//       unauthLog("x-access-token-invalid", req.originalUrl, req.ip, req.headers);
//       res.json({ status_code: 401, message: 'Unauthorized User - token is invalid' });
//     });
//   }
// });



ROUTER.get('/extension/:opt', (req, res, next) => {
   req.headers.type = req['app_type'];
  const extensionService = new ExtensionService();
  // console.log(req.headers.type,"+++++--------++++++++++");
  
  if (req.headers.type == 'pbx') {  //api-gateway or PBX
    if (req.params.opt == 'all') {

    } else if (req.params.opt == 'contacts') {
      extensionService.getAllExtesnionContacts(req, res, next);
    } else if (req.params.opt == 'sip') {
      extensionService.getAllUserExtensions(req, res, next);
    } else if (req.params.opt == 'did-mapping') {
      extensionService.getExtensionsDIDmapping(req, res, next);
    } else {
      warnLog("Invalid parameters.");
      res.json({ status_code: 406, message: 'Not Acceptables' });
    }
  } else if (req.headers.type == 'sp') {   // softphone
    if (req.params.opt == 'contacts') {
      extensionService.getAllExtesnionContacts(req, res, next);
    } else if (req.params.opt == 'sip') {
      extensionService.getAllUserExtensions(req, res, next);
    } else if (req.params.opt == 'did-mapping') {
      extensionService.getExtensionsDIDmapping(req, res, next);
    } else {
      warnLog("Invalid parameters.");
      res.json({ status_code: 406, message: 'Not Acceptable' });
    }
  } else {
    warnLog("Invalid parameters.");
    res.json({ status_code: 406, message: 'Not Acceptable' });
  }
});

ROUTER.get('/profile', (req, res, next) => {
  const extensionService = new ExtensionService();
  req.headers.type = req['app_type'];
  // console.log(req.headers.type,);
  if (req.headers.type == 'pbx') {  

    extensionService.getExtesnionProfie(req, res, next);
  } else if (req.headers.type == 'sp') {   // softphone
    extensionService.getExtesnionProfieForSP(req, res, next);
  } else {
    warnLog("Invalid parameters.");
    res.json({ status_code: 406, message: 'Not Acceptable' });
  }
});

ROUTER.get('/circle', (req, res, next) => {
  const circleService = new CircleService();
  req.headers.type = req['app_type'];
  if (req.headers.type == 'pbx') {  //api-gateway or PBX
    circleService.getCircle(req, res, next, 'pbx');
  } else if (req.headers.type == 'sp') {   // softphone
    circleService.getCircle(req, res, next, 'sp');
  } else {
    warnLog("Invalid parameters.");
    res.json({ status_code: 406, message: 'Not Acceptable' });
  }
});

ROUTER.get('/sms-plan', (req, res, next) => {
  const smsService = new SMSService();
  req.headers.type = req['app_type'];
  if (req.headers.type == 'pbx') {  //api-gateway or PBX
    smsService.getSMS(req, res, next, 'pbx');
  } else if (req.headers.type == 'sp') {   // softphone
    smsService.getSMS(req, res, next, 'sp');
  } else {
    warnLog("Invalid parameters.");
    res.json({ status_code: 406, message: 'Not Acceptable' });
  }
});

ROUTER.get('/dialout-rates', (req, res, next) => {
  const circleService = new CircleService();
  req.headers.type = req['app_type'];
  if (req.headers.type == 'pbx') {  //api-gateway or PBX
    circleService.getDialOutRates(req, res, next, 'pbx');
  } else if (req.headers.type == 'sp') {   // softphone
    circleService.getDialOutRates(req, res, next, 'sp');
  } else {
    warnLog("Invalid parameters.");
    res.json({ status_code: 406, message: 'Not Acceptable' });
  }
});

ROUTER.get('/package', (req, res, next) => {
  const packageService = new PackageService();
  req.headers.type = req['app_type'];
  if (req.headers.type == 'pbx') {  //api-gateway or PBX
    packageService.getPackage(req, res, next, 'pbx');
  } else if (req.headers.type == 'sp') {   // softphone
    packageService.getPackage(req, res, next, 'sp');
  } else {
    warnLog("Invalid parameters.");
    res.json({ status_code: 406, message: 'Not Acceptable' });
  }
});

ROUTER.get('/did', (req, res, next) => {
  const didService = new DIDService();
  req.headers.type = req['app_type'];
  if (req.headers.type == 'pbx') {  //api-gateway or PBX
    didService.getDID(req, res, next, 'pbx');
  } else if (req.headers.type == 'sp') {   // softphone
    // circleService.getCircle(req, res, next, 'sp');
  } else {
    warnLog("Invalid parameters.");
    res.json({ status_code: 406, message: 'Not Acceptable' });
  }
});

ROUTER.get('/did-release', (req, res, next) => {
  const didService = new DIDService();
  req.headers.type = req['app_type'];
  if (req.headers.type == 'pbx') {  //api-gateway or PBX
    didService.didRelease(req, res, next, 'pbx');
  } else if (req.headers.type == 'sp') {   // softphone
    // circleService.getCircle(req, res, next, 'sp');
  } else {
    warnLog("Invalid parameters.");
    res.json({ status_code: 406, message: 'Not Acceptable' });
  }
});

ROUTER.get('/customer', (req, res, next) => {
  console.log(req.query.type);
  req.headers.type = req['app_type'];
  const customerService = new CustomerService();
  if (req.headers.type == 'pbx') {  //api-gateway or PBX
    customerService.getCustomers(req, res, next, 'pbx');
  } else if (req.headers.type == 'sp') {   // softphone
    customerService.getCustomers(req, res, next, 'sp');
  } else {
    warnLog("Invalid parameters.");
    res.json({ status_code: 406, message: 'Not Acceptable' });
  }
});

ROUTER.get('/country', (req, res, next) => {
  console.log(req.query.type);
  const countryService = new CircleService();
  req.headers.type = req['app_type'];
  if (req.headers.type == 'pbx') {  //api-gateway or PBX
    countryService.getCountries(req, res, next, 'pbx');
  } else if (req.headers.type == 'sp') {   // softphone
    countryService.getCountries(req, res, next, 'sp');
  } else {
    warnLog("Invalid parameters.");
    res.json({ status_code: 406, message: 'Not Acceptable' });
  }
});

ROUTER.get('/timezone', (req, res, next) => {
  console.log(req.query.type);
  const countryService = new CircleService();
  req.headers.type = req['app_type'];
  if (req.headers.type == 'pbx') {  //api-gateway or PBX
    countryService.getTimeZone(req, res, next, 'pbx');
  } else if (req.headers.type == 'sp') {   // softphone
    countryService.getTimeZone(req, res, next, 'sp');
  } else {
    warnLog("Invalid parameters.");
    res.json({ status_code: 406, message: 'Not Acceptable' });
  }
});

ROUTER.get('/billingType', (req, res, next) => {
  const countryService = new CircleService();
  req.headers.type = req['app_type'];
  if (req.headers.type == 'pbx') {  //api-gateway or PBX
    countryService.getBillingType(req, res, next, 'pbx');
  } else if (req.headers.type == 'sp') {   // softphone
    countryService.getBillingType(req, res, next, 'sp');
  } else {
    warnLog("Invalid parameters.");
    res.json({ status_code: 406, message: 'Not Acceptable' });
  }
});

ROUTER.get('/state', (req, res, next) => {
  console.log(req.query.type);
  const countryService = new CircleService();
  req.headers.type = req['app_type'];
  if (req.headers.type == 'pbx') {  //api-gateway or PBX
    countryService.getStates(req, res, next, 'pbx');
  } else if (req.headers.type == 'sp') {   // softphone
    countryService.getStates(req, res, next, 'sp');
  } else {
    warnLog("Invalid parameters.");
    res.json({ status_code: 406, message: 'Not Acceptable' });
  }
});

ROUTER.get('/callPlan', (req, res, next) => {
  console.log(req.query.type);
  const minutePlanService = new MinutePlanService();
  req.headers.type = req['app_type'];
  if (req.headers.type == 'pbx') {  //api-gateway or PBX
    minutePlanService.getCallPlan(req, res, next, 'pbx');
  } else if (req.headers.type == 'sp') {   // softphone
    minutePlanService.getCallPlan(req, res, next, 'sp');
  } else {
    warnLog("Invalid parameters.");
    res.json({ status_code: 406, message: 'Not Acceptable' });
  }
});

ROUTER.get('/dialoutGroup', (req, res, next) => {
  console.log(req.query.type);
  const countryService = new CircleService();
  req.headers.type = req['app_type'];
  if (req.headers.type == 'pbx') {  //api-gateway or PBX
    countryService.getDialOutGroup(req, res, next, 'pbx');
  } else if (req.headers.type == 'sp') {   // softphone
    countryService.getDialOutGroup(req, res, next, 'sp');
  } else {
    warnLog("Invalid parameters.");
    res.json({ status_code: 406, message: 'Not Acceptable' });
  }
});

ROUTER.get('/callPlanRate', (req, res, next) => {
  console.log(req.query.type);
  const minutePlanService = new MinutePlanService();
  req.headers.type = req['app_type'];
  if (req.headers.type == 'pbx') {  //api-gateway or PBX
    minutePlanService.getCallPlanRates(req, res, next, 'pbx');
  } else if (req.headers.type == 'sp') {   // softphone
    minutePlanService.getCallPlanRates(req, res, next, 'sp');
  } else {
    warnLog("Invalid parameters.");
    res.json({ status_code: 406, message: 'Not Acceptable' });
  }
});

ROUTER.get('/packageType', (req, res, next) => {
  const countryService = new CircleService();
  req.headers.type = req['app_type'];
  if (req.headers.type == 'pbx') {  //api-gateway or PBX
    countryService.getPackageType(req, res, next, 'pbx');
  } else if (req.headers.type == 'sp') {   // softphone
    countryService.getPackageType(req, res, next, 'sp');
  } else {
    warnLog("Invalid parameters.");
    res.json({ status_code: 406, message: 'Not Acceptable' });
  }
});

ROUTER.get('/productType', (req, res, next) => {
  const countryService = new CircleService();
  req.headers.type = req['app_type'];
  if (req.headers.type == 'pbx') {  //api-gateway or PBX
    countryService.getProductType(req, res, next, 'pbx');
  } else if (req.headers.type == 'sp') {   // softphone
    countryService.getProductType(req, res, next, 'sp');
  } else {
    warnLog("Invalid parameters.");
    res.json({ status_code: 406, message: 'Not Acceptable' });
  }
});

ROUTER.get('/provider', (req, res, next) => {
  const countryService = new CircleService();
  req.headers.type = req['app_type'];
  if (req.headers.type == 'pbx') {  //api-gateway or PBX
    countryService.getProvider(req, res, next, 'pbx');
  } else if (req.headers.type == 'sp') {   // softphone
    countryService.getProvider(req, res, next, 'sp');
  } else {
    warnLog("Invalid parameters.");
    res.json({ status_code: 406, message: 'Not Acceptable' });
  }
});

ROUTER.get('/gateway',(req,res,next)=>{
  const circleservice = new CircleService();
  req.headers.type = req['app_type'];
  if(req.headers.type == 'pbx'){
  circleservice.getGateway(req,res,next,'pbx');
  }else if(req.headers.type == 'crm'){
    circleservice.getGateway(req,res,next,'crm');
  }
});


// ROUTER.get('/is-circle',(req,res,next)=>{
//   // var req_data=req.body;
//   const CircleFlagId =new CircleService();
//   req.headers.type = req['app_type'];
//   if(req.headers.type=="pbx"){
//     CircleFlagId.getis_circle(req,res,next,'pbx');
//   }else if(req.headers.type=="sp"){
//     CircleFlagId.getis_circle(req,res,next,'pbx')
//   }else{
//     warnLog("Invalid parameter.");
//     res.json({
//       status_code: 406,
//       message: "Not Acceptable"
//     });
//   }
// })

// ROUTER.get('/call-plan',(req,res,next)=>{
//   // var req_data=req.body;
//   const CircleFlagId =new CircleService();
//   req.headers.type = req['app_type'];
//   if(req.headers.type=="pbx"){
//     CircleFlagId.getis_circle(req,res,next,'pbx');
//   }else if(req.headers.type=="sp"){
//     CircleFlagId.getis_circle(req,res,next,'pbx')
//   }else{
//     warnLog("Invalid parameter.");
//     res.json({
//       status_code: 406,
//       message: "Not Acceptable"
//     });
//   }
// })

ROUTER.post('/extension/:opt/:id', (req, res, next) => {
  const extensionService = new ExtensionService();
  if (req.params.opt == 'location') {
    extensionService.saveExtesnionLocation(req, res, next);
  } else {
    warnLog("Invalid parameters.");
    res.json({ 'message': 'OptIn yydghf.' });
  }
});

ROUTER.post('/extension/:opt', (req, res, next) => {
  console.log(req.params.opt, 'req.params.opt');
  let apiInstance = new ApiLogs();
  const extensionService = new ExtensionService();
  const recordingService = new RecordingService();
  req.headers.type = req['app_type'];
  if (req.params.opt == 'sip') {
    extensionService.getIndividualExtesnionInfo(req, res, next);
  } else if (req.params.opt == 'recording' && !req.body.hasOwnProperty('user_type') && req.headers.type == 'crm') {
    recordingService.getCRMRecording(req, res, next);
  } else if (req.params.opt == 'recording' && !req.body.hasOwnProperty('user_type')) {
    recordingService.getExtensionRecording(req, res, next);
  } else if (req.params.opt == 'recording') {
    recordingService.getCustomerRecording(req, res, next);
  } else if (req.params.opt == 'voicemail-recording') {
    recordingService.getExtensionVoicemailRecording(req, res, next);
  } else if (req.params.opt == 'c2c' && req.headers.type == 'crm') {
    extensionService.getCRMExtensionCall2Call(req, res, next);
  } else if (req.params.opt == 'c2c') {
    extensionService.getExtensionCall2Call(req, res, next);
  } else if (req.params.opt == 'add') {
    extensionService.extensionCreation(req, res, next);
  } else if (req.params.opt == 'features-update') {
    extensionService.updateExtensionFeatures(req, res, next);
  }else {
    warnLog("Invalid parameters.");
    apiInstance.log(406, 'Not Acceptable : Invalid parameters', req.originalUrl, '', '', '');
    res.json({ status_code: 406, message: 'Not Acceptable : Invalid parameters' });
  }
});

ROUTER.post('/extensions/favorite/:opt', (req, res, next) => {
  const extensionService = new ExtensionService();
  if (req.params.opt == 'add') {
    extensionService.makeExtensionContactAsFavorite(req, res, next);
  } else if (req.params.opt == 'delete') {
    extensionService.makeExtensionContactAsUnFavorite(req, res, next);
  } else if (req.params.opt == 'all' || req.params.opt == '') {
    extensionService.getAllFavoriteExtesnionContact(req, res, next);
  } else {
    warnLog("Invalid parameters.");
    res.json({ status_code: 406, message: 'Not Acceptable' });
  }
});

ROUTER.post('/extensions/:opt1/:opt2', (req, res, next) => {
  console.log(req.params.opt1, 'req.params.opt');
  console.log(req.params.opt2, 'req.params.opt2');
  const extensionService = new ExtensionService();
  if (req.params.opt1 == 'c2c' && req.params.opt2 == 'update' && req.headers.type == 'crm') {
    extensionService.getCRMC2Cstatus(req, res, next);
  } else if (req.params.opt1 == 'c2c' && req.params.opt2 == 'update') {
    extensionService.getC2Cstatus(req, res, next);
  } else {
    warnLog("Invalid parameters.");
    res.json({ status_code: 406, message: 'Not Acceptable' });
  }
});

ROUTER.post('/minutePlan/:opt', (req, res, next) => {
  let apiInstance = new ApiLogs();
  const minutePlanService = new MinutePlanService();
  if (req.params.opt == 'list') {
    minutePlanService.getMinutePlanForAdmin(req, res, next);
  } else {
    warnLog("Invalid parameters.");
    apiInstance.log(406, 'Not Acceptable : Invalid parameters', req.originalUrl, '', '', '');
    res.json({ status_code: 406, message: 'Not Acceptable : Invalid parameters' });
  }
});

ROUTER.post('/callPlan/:opt', (req, res, next) => {
  let apiInstance = new ApiLogs();
  const minutePlanService = new MinutePlanService();
  if (req.params.opt == 'add') {
    minutePlanService.callPlanCreation(req, res, next);
  } else {
    warnLog("Invalid parameters.");
    apiInstance.log(406, 'Not Acceptable : Invalid parameters', req.originalUrl, '', '', '');
    res.json({ status_code: 406, message: 'Not Acceptable : Invalid parameters' });
  }
});

ROUTER.post('/provider/:opt', (req, res, next) => {
  let apiInstance = new ApiLogs();
  const minutePlanService = new MinutePlanService();
  if (req.params.opt == 'add') {
    minutePlanService.providerCreation(req, res, next);
  } else {
    warnLog("Invalid parameters.");
    apiInstance.log(406, 'Not Acceptable : Invalid parameters', req.originalUrl, '', '', '');
    res.json({ status_code: 406, message: 'Not Acceptable : Invalid parameters' });
  }
});

ROUTER.post('/customer/:opt', (req, res, next) => {
  let apiInstance = new ApiLogs();
  const customerService = new CustomerService();
  if (req.params.opt == 'add') {
    customerService.customerCreation(req, res, next);
  }else if (req.params.opt == 'purchase-did') {
    customerService.didPurchase(req, res, next, 'pbx');
  } else {
    warnLog("Invalid parameters.");
    apiInstance.log(406, 'Not Acceptable : Invalid parameters', req.originalUrl, '', '', '');
    res.json({ status_code: 406, message: 'Not Acceptable : Invalid parameters' });
  }
});


// Yash Kashyap---------23/07/2022
ROUTER.post('/package/:opt',(req, res, next) => {
  let apiInstance = new ApiLogs();
  const packageService = new PackageService();
  if(req.params.opt == 'add'){
    packageService.PackageCreation(req, res, next);
  }else{
    warnLog("Invalid parameters.");
    apiInstance.log(406, 'Not Acceptable : Invalid parameters', req.originalUrl, '', '', '');
    res.json({ status_code: 406, message: 'Not Acceptable : Invalid parameters' });
  }
});


ROUTER.put('/:opt/update', (req, res, next) => {
  const extensionService = new ExtensionService();
  req.headers.type = req['app_type'];
  let apiInstance = new ApiLogs();
  if (req.headers.type == 'pbx') {  //api-gateway or PBX
    if (req.params.opt == 'profile') {
      extensionService.updateExtensionProfile(req, res, next, 'pbx');
    } else {
      warnLog("Invalid parameters.");
      apiInstance.log(406, 'Not Acceptable : Invalid parameters', req.originalUrl, '', '', '');
      res.json({ status_code: 406, message: 'Not Acceptable' });
    }

  } else if (req.headers.type == 'sp') {   // softphone
    if (req.params.opt == 'profile') {
      extensionService.updateExtensionProfile(req, res, next, 'sp');
    } else {
      warnLog("Invalid parameters.");
      apiInstance.log(406, 'Not Acceptable : Invalid parameters', req.originalUrl, '', '', '');
      res.json({ status_code: 406, message: 'Not Acceptable.' });
    }
  } else {
    warnLog("Invalid parameters.");
    apiInstance.log(406, 'Not Acceptable : Invalid parameters', req.originalUrl, '', '', '');
    res.json({ status_code: 406, message: 'Not Acceptable' });
  }
});


ROUTER.patch('/cdr', (req, res, next) => {
  const cdrService = new CDRService();
  let apiInstance = new ApiLogs();
  req.headers.type = req['app_type'];
  req.body.type = req['user_type']
  if (req.headers.type == 'pbx') {  // PBX
    
    if (req.body.type == '6') {
      cdrService.getExtensionCDR(req, res, next);
    }
    if(req.body.type == '1') cdrService.getCustomerCDR(req, res, next);
    else if(req.body.type == '0') cdrService.getAdminCDR(req,res,next)
  } else if (req.headers.type == 'sp') {   // softphone
    apiInstance.log(406, 'Not Acceptable : Invalid parameters', req.originalUrl, '', '', '');
    res.json({ status_code: 406, message: 'Type Not Acceptable' });
  } else if (req.headers.type == 'crm') { 
      // crm 
      if(req.body.type == '6'){
        cdrService.getCRMCDR(req, res, next);
      }else if(req.body.type == '1'){
        cdrService.getCustomerCDR(req,res,next)
      }else if(req.body.type == '0'){ 
        cdrService.getAdminCDR(req,res,next);
      }   
  } else {
    warnLog("Invalid parameters.");
    apiInstance.log(406, 'Not Acceptable : Invalid parameters', req.originalUrl, '', '', '');
    res.json({ status_code: 406, message: 'Type Not Acceptable' });
  }

  // let type = req.body.user_type;
  // if (type === 'exten') {
  //   cdrService.getExtensionCDR(req, res, next);
  // } else if (type === 'customer') {
  //   cdrService.getCustomerCDR(req, res, next);
  // } else if (type === 'crm') {
  //   cdrService.getCRMCDR(req, res, next);
  // } else {
  //   warnLog("Invalid parameters.");
  //   res.json({ status_code: 406, message: 'Type Not Acceptable' });
  // }

});


// Yash Kashyap----------20/06/22
ROUTER.put('/:opt/updates',(req,res,next)=>{
  const UpdateCustomer =new CustomerService();
  const apiInstance = new ApiLogs();
  req.headers.type = req['app_type'];    
    if(req.params.opt == 'customer'){
      UpdateCustomer.UpdateCustomerDetail(req,res,next);
    }else{
    warnLog("Invalid parameters.");
    apiInstance.log(406,'Not Acceptable : Invalid parameters',req.originalUrl,'','');
    res.json({status_code : 406, message: 'Not Acceptable.'})
  }
});


// Package Update -------- 23/06/22---------Yash Kashyap //
ROUTER.patch("/:opt/update",(req,res,next)=>{
  const packageupdate = new PackageService();
  let apiInstance = new ApiLogs();
  req.headers.type = req['app_type'];
  if(req.params.opt == 'package'){
    packageupdate.packageUpdate(req,res,next);
  }else{
    warnLog("Invalid parameters.");
    apiInstance.log(406,'Not Acceptable : Invalid parameters',req.originalUrl,'','');
    res.json({status_code : 406, message: 'Not Acceptable.'})
  }
});


// Yash Kashyap--------17/07/22
ROUTER.get('/provider', (req,res,next) =>{
  const minutePlanService = new MinutePlanService();
  req.headers.type = req['app_type'];
  if(req.headers.type == 'pbx'){
    minutePlanService.getProvider(req,res,next)
  }else if(req.headers.type == 'crm'){
    minutePlanService.getProvider(req,res,next)
  }else{
    warnLog("Invalid parameters.");
    res.json({ status_code: 406, message: 'Not Acceptable' });
  }
});

// Yash kashyap--------19/07/22
ROUTER.patch('/assign/:opt',(req,res,next)=>{
  const didService = new DIDService();
  const apiInstance = new ApiLogs();
  if(req.params.opt == 'did'){
  didService.didAssign(req,res,next);
  }else{
    warnLog("Invalid parameters.");
    apiInstance.log(406,'Not Acceptable : Invalid parameters',req.originalUrl,'','');
    res.json({status_code : 406, message: 'Not Acceptable.'});
  }
});

// Yash kashyap-----------19/07/22
ROUTER.post('/gateway/:opt',(req,res,next) =>{
  const circleservice = new CircleService();
  const apiInstance = new ApiLogs();
  req.headers.type = req['app_type']
  // console.log(req.headers.type,"-----------typr-------")  
  if(req.headers.type == 'pbx' && req.params.opt == 'add'){
  circleservice.createGateway(req,res,next);
  }else{
    warnLog("Invalid parameters.");
    apiInstance.log(406,'Not Acceptable : Invalid parameters',req.originalUrl,'','');
    res.json({status_code : 406, message: 'Not Acceptable.'});
  }
});

// Yash Kashyap----------20/07/22
ROUTER.post('/did/:opt',(req,res,next)=>{
  const didservice = new DIDService();
  const apiInstance = new ApiLogs();
  req.headers.type = req['app_type'];
  if(req.headers.type == 'pbx' && req.params.opt == 'add'){
    didservice.createDID(req,res,next);
  }else{
    warnLog("Invalid parameters.");
    apiInstance.log(406,'Not Acceptable : Invalid parameters',req.originalUrl,'','');
    res.json({status_code : 406, message: 'Not Acceptable.'});
  }
});

// Yash kashyap----------22/07/22
ROUTER.post('/callPlanRate/:opt',(req,res,next)=>{
  const minutePlan = new MinutePlanService();
  const apiInstance = new ApiLogs();
  if(req.params.opt == 'add'){
    minutePlan.CreateCallRate(req,res,next);
  }else{
    warnLog("Invalid parameters.");
    apiInstance.log(406,'Not Acceptable : Invalid parameters',req.originalUrl,'','');
    res.json({status_code : 406, message: 'Not Acceptable.'});
  }
});
module.exports = ROUTER;