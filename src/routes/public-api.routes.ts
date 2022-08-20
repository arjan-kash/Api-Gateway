/**
 * @file
 *
 * This is a route of public api urls. Can be accessed after success login. These urls need authentication.
 *
 * @author Nagender Pratap Chauhan on 13/6/21.
 */

import * as  express from 'express';
import { ExtensionService } from '../services/extension.service';
import { LoginService } from '../services/login.service';
import { warnLog, unauthLog, infoLog } from '../utils/logger.util';
import { ApiLogs } from '../utils/api-logs';

const ROUTER = express.Router({ mergeParams: true });

ROUTER.use('*', (req, res, next) => {
  if (req.method == "OPTIONS") {
    next();
  } else {
    const { rawHeaders, httpVersion, method, url } = req;
    const { statusCode, statusMessage } = res;
    const responseHeaders = res.getHeaders();
    let arr = [rawHeaders, httpVersion, method, url, statusCode, statusMessage, responseHeaders]
    next();
  }
});

ROUTER.post('/api-gateway/:opt', (req, res, next) => {
  const loginService = new LoginService();
  const apiInstance = new ApiLogs();
  // let data=req['app_type']
  // console.log(req.body.hasOwnProperty('user_type'));
  if (req.headers.type == 'pbx') {  //api-gateway or PBX
    if (req.params.opt == 'login' && req.body['user_type']=="extension"){ console.log("Login Info");
     loginService.apiGatewayLogin(req, res, next);}
    else if (req.params.opt == 'login' && req.body.hasOwnProperty('user_type') && (req.body['user_type'] == "customer" || req.body['user_type'] == "admin")) loginService.apiGatewayCustomerLogin(req, res, next);
    else if (req.params.opt == 'forgot_password') loginService.pbxForgotPassword(req, res, next);
    else {
      res.json({ status_code: 400, message: 'Bad Request : please provide correct URL.' });
      apiInstance.log(400, 'Bad Request : please provide correct URL.', 'LoginAPI', '', '', '');
    }

  } else if (req.headers.type == 'sp') {   // softphone
    if (req.params.opt == 'login' && req.body['user_type']=="extension") loginService.softphoneLogin(req, res, next);
    else if (req.params.opt == 'login' && req.body.hasOwnProperty('user_type') && (req.body['user_type'] == "customer" || req.body['user_type'] == "admin")) loginService.softphoneCustomerLogin(req, res, next);
    else if (req.params.opt == 'forgot_password') loginService.softphoneForgotPassword(req, res, next);
  } else if (req.headers.type == 'crm') {   // CRM
    if (req.params.opt == 'login' && req.body['user_type']=="extension") loginService.crmLogin(req, res, next);
    else if(req.params.opt == 'login' && req.body.hasOwnProperty('user_type') && (req.body['user_type'] == "customer" || req.body['user_type'] == "admin")) loginService.apiGatewayCustomerLogin(req, res, next);
    // else if(req.params.opt == 'forgot_password') loginService.softphoneForgotPassword(req, res, next);
  } else {
    warnLog("Invalid parameters.");
    res.json({ status_code: 406, message: 'Not Acceptable : please provide type in headers' });
    apiInstance.log(406, 'Not Acceptable : please provide type in headers.', 'LoginAPI', '', '', '');
  }
});



module.exports = ROUTER;
