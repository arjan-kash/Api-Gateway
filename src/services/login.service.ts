import * as hash from 'hash.js';
import { AES, enc } from 'crypto-js';
import { errorLog, infoLog } from '../utils/logger.util';
import { warnLog, unauthLog } from '../utils/logger.util';
import { Table } from '../dba/table';
import { ApiLogs } from '../utils/api-logs';
const Hash = require('crypto-js/pbkdf2');
const config = require('../config');
const JWTUtil = require('../utils/jwt.util');


var knex = require('../dba/knex.db');

export class LoginService {

    /**
     *
     * @param req
     * @param res
     * @param next
     */

    public apiInstance = new ApiLogs();
    public encrypt = new JWTUtil(); 

    public apiGatewayLogin(req, res, callback) {
        // console.log("Api login data printed");
        
        let data = req.body;
        if (!data.username) {
            this.apiInstance.log(402,'Parameter Missing - username.','PBXLogin','pbx')
            return res.status(402).send({ status_code: 402, error: 'Parameter Missing', message: 'Please enter the username' });
        } else if (!data.password) {
            this.apiInstance.log(402,'Parameter Missing - password.','PBXLogin','pbx')  
            return res.status(402).send({ status_code: 402, error: 'Parameter Missing', message: 'Please enter the password' });
        } else {

        }
        let sql = knex.select('*')
            .from(Table.tbl_Extension_Master + ' as ext')
            .where('ext.ext_number', '=', "" + data.username + "")
            .andWhere('ext.sip_password', '=', "" + data.password + "");
            console.log(sql.toQuery())
        sql.then((response) => {
            console.log(response);
            
            if (response.length) {
                const JWTUtil = require('../utils/jwt.util');
                const jwtUtil = new JWTUtil();
                // console.log(req.headers.type,"-------extension-----------");
                
                const jwtToken = jwtUtil.generateAccessToken(response[0].id, response[0].package_id, response[0].customer_id, response[0].ext_number,'','','6', req.headers.type);
                // callback({status_code: 200, token: jwtToken,message: 'You have successfully logged in.'})
                res.json({
                    status_code: 200,
                    token: jwtToken,
                    message: 'You have successfully logged in.',
                });
                this.apiInstance.log(200,'You have successfully logged in.','PBXLogin','pbx','',data.username);
            } else {
                res.status(202).send({ status_code: 202, error: 'User inactive / Deleted', message: 'user does not exist' });
                this.apiInstance.log(202,'user does not exist.','PBXLogin','pbx','','',JSON.stringify(data));
            }
        }).catch((err) => {
            // errorLog(err);
            res.status(400).send({
                status_code: 400,
                message: 'Bad Request'
            });
            this.apiInstance.log(400,'Bad Request: '+err.sqlMessage,'PBXLogin','pbx','','',JSON.stringify(data));
            throw err
        });
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     */

     public apiGatewayCustomerLogin(req, res, callback) {
        // console.log(req,"-------------------------yash");
        
        let data = req.body;
        let type=data.user_type;
        knex.select('api_token').from(Table.tbl_Customer)
        .where('username',data.username)
        .then((response)=>{
            // console.log(response[0]['api_token'],"--------------------->>>>>>>>>>>>>>>");
            if(response[0]['api_token'] == '1'){
                if(!data.username) {
                    this.apiInstance.log(402,'Parameter Missing - username.','PBXCustomerLogin','pbx')
                    return res.status(402).send({ status_code: 402, error: 'Parameter Missing', message: 'Please enter the username' });
                }else if (!data.password) {
                    this.apiInstance.log(402,'Parameter Missing - password.','PBXCustomerLogin','pbx');
                    return res.status(402).send({ status_code: 402, error: 'Parameter Missing', message: 'Please enter the password' });
                } else {
            
                }
        // const password = Hash(data.password, config.jwt.appSecret).toString();
                const private_cipher = this.encrypt.cipher(config.jwt.appSecret);
                const password = private_cipher(data.password);
                console.log(password);
                knex.raw('Call login_credential("' + data.username + '","' + password + '",\'' + data.password + '\' ,"' + 1 + '")')
                .then((response) => {
                const user = response[0][0][0];
                console.log("customer api login response is",user.role);
                if (response.length) {
                    const JWTUtil = require('../utils/jwt.util');
                    const jwtUtil = new JWTUtil();
                    // const jwtToken = jwtUtil.generateAccessToken(user.id,'', user.customer_id,'',user.token);
                    const jwtToken = jwtUtil.generateAccessToken(user.id,'', user.customer_id,'',user.token, user.api_token, user.role, req.headers.type);
                    // callback({status_code: 200, token: jwtToken,message: 'You have successfully logged in.'})
                    res.json({
                        status_code: 200,
                        token: jwtToken,
                        c2c_token : user.token,
                        callback_url : user.callback_url,
                        message: 'You have successfully logged in.'
                    });
                    this.apiInstance.log(200,'You have successfully logged in.','PBXCustomerLogin','pbx','',data.username)
                } else {
                    res.status(202).send({ status_code: 202, error: 'User inactive / Deleted', message: 'user does not exist' });
                    this.apiInstance.log(202,'user does not exist.','PBXCustomerLogin','pbx','','',JSON.stringify(data));
                }
            }).catch((err) => {
                errorLog(err);
                console.log(err.sqlMessage)
                res.status(400).send({
                    status_code: 400,
                    message: 'Bad Request : '+err.sqlMessage
                });
                this.apiInstance.log(400,'Bad Request: '+err.sqlMessage,'PBXCustomerLogin','pbx','','',JSON.stringify(data));
                throw err;
            });
        }else{
            this.apiInstance.log('You can not access it.','CustomerLogin','','',JSON.stringify(data));
            res.status(202).send({status_code:202,message:'api is inactive.'});
        }
    }).catch((err) => {
        errorLog(err);
        console.log(err.sqlMessage)
        res.status(400).send({
            status_code:400,
            message: 'Bad Request : '+err.sqlMessage
            }); 
        });
    }
    
    /**
    *
    * @param req
    * @param res
    * @param next
    */

    public softphoneLogin(req, res, next) {
        let data = req.body;
        if (!data.username) {
            this.apiInstance.log(402,'Parameter Missing - username.','softphoneLogin','sp')
            return res.status(402).send({ status_code: 402, error: 'Parameter Missing', message: 'Please enter the username' });
        } else if (!data.password) {
            this.apiInstance.log(402,'Parameter Missing - password.','softphoneLogin','sp')
            return res.status(402).send({ status_code: 402, error: 'Parameter Missing', message: 'Please enter the password' });
        } else {

        }
        let sql = knex.select('id', 'package_id', 'customer_id', 'ext_number', 'token','role_id', 'package_id as packageid', 'first_name as firstname', 'last_name as lastname', 'send_misscall_notification as misscallnotify', 'balance_restriction as balrestrict', 'caller_id_name as calleridname', 'email', 'mobile',
            'codec', 'voicemail', 'dnd', 'outbound', 'recording', 'speed_dial as speeddial', 'forward', 'black_list as blacklist', 'call_transfer as transfer', 'total_min_bal as minbalance', 'used_min as usedmin', 'roaming', 'outbound_sms_notification as outboundsmsnotify',
            'admin', 'ringtone', 'find_me_follow_me as fmfm', knex.raw("JSON_UNQUOTE(json_extract(favorite,'$.ext_number')) as favorite"))
            .from(Table.tbl_Extension_Master + ' as ext')
            .where('ext.ext_number', '=', "" + data.username + "")
            .andWhere('ext.sip_password', '=', "" + data.password + "");

        sql.then((response) => {
            if (response.length > 0) {
                knex(Table.tbl_SoftPhone_Logs).insert({
                    username: "" + req.body.username + "",
                    device_info: "" + req.body.device_info + "",
                    mac_address: "" + req.body.mac_address + "",
                    network_info: "" + req.body.network_info + "",
                    operator_info: "" + req.body.operator_info + "",
                    // sip_info: "" + req.body.sip_info + "",
                    latitude: "" + req.body.latitude + "",
                    longitude: "" + req.body.longitude + "",
                })
                    .then((response2) => {
                        if (response2.length > 0) {
                            let resp = response[0];
                            const JWTUtil = require('../utils/jwt.util');
                            const jwtUtil = new JWTUtil();
                            const jwtToken = jwtUtil.generateAccessToken(response[0].id, response[0].package_id, response[0].customer_id, response[0].ext_number, response[0].token, response[0].role_id, req.headers.type);
                            delete resp['id'];
                            delete resp['package_id'];
                            delete resp['customer_id'];
                            delete resp['ext_number'];
                            delete resp['token'];

                            res.json({
                                data: resp,
                                token: jwtToken,
                                status_code: 200,
                                message: 'You have successfully logged in.'
                            });
                            this.apiInstance.log(200,'You have successfully logged in.','softphoneLogin','sp','',data.username);
                        } else {
                            res.status(401).send({ error: 'Unauthorized', message: 'Softphone log Creation error' });
                            this.apiInstance.log(401,'Softphone log Creation error.','softphoneLogin','sp','','',JSON.stringify(data));
                        }
                    }).catch((err) => {
                        errorLog(err);
                        res.status(400).send({
                            status_code: 400,
                            message: 'Bad Request'
                        });
                        this.apiInstance.log(400,'Bad Request: '+err.sqlMessage,'softphoneLogin','sp','','',JSON.stringify(data));
                        throw err
                    });
            } else {
                res.status(202).send({ status_code: 202, error: 'User inactive / Deleted', message: 'user does not exist' });
                this.apiInstance.log(202,'user does not exist.','softphoneLogin','sp','','',JSON.stringify(data));
            }
        }).catch((err) => {
            errorLog(err);
            res.status(400).send({
                status_code: 400,
                message: 'Bad Request: '+err.sqlMessage
            });
            this.apiInstance.log(400,'Bad Request: '+err.sqlMessage,'SoftphoneLogin','sp','','',JSON.stringify(data));
            throw err
        });
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     */

     public softphoneCustomerLogin(req, res, callback) {
        let data = req.body;
        if (!data.username) {
            this.apiInstance.log(402,'Parameter Missing - username.','softphoneCustomerLogin','sp')
            return res.status(402).send({ status_code: 402, error: 'Parameter Missing', message: 'Please enter the username' });
        } else if (!data.password) {
            this.apiInstance.log(402,'Parameter Missing - password.','softphoneCustomerLogin','sp');
            return res.status(402).send({ status_code: 402, error: 'Parameter Missing', message: 'Please enter the password' });
        } else {

        }
        // const password = Hash(data.password, config.jwt.appSecret).toString();
        const private_cipher = this.encrypt.cipher(config.jwt.appSecret);
        const password = private_cipher(data.password);
        console.log(password);
        knex.raw('Call login_credential("' + data.username + '","' + password + '",\'' + data.password + '\' ,"' + 1 + '")')
        .then((response) => {
            const user = response[0][0][0];
            console.log(user);
            if (response.length) {
                const JWTUtil = require('../utils/jwt.util');
                const jwtUtil = new JWTUtil();
                const jwtToken = jwtUtil.generateAccessToken(user.id,'', user.customer_id,'',user.token, user.role, req.headers.type);
                // callback({status_code: 200, token: jwtToken,message: 'You have successfully logged in.'})
                res.json({
                    status_code: 200,
                    token: jwtToken,
                    message: 'You have successfully logged in.'
                });
                this.apiInstance.log(200,'You have successfully logged in.','softphoneCustomerLogin','sp','',data.username)
            } else {
                res.status(202).send({ status_code: 202, error: 'User inactive / Deleted', message: 'user does not exist' });
                this.apiInstance.log(202,'user does not exist.','softphoneCustomerLogin','sp','','',JSON.stringify(data));
            }
        }).catch((err) => {
            errorLog(err);
            console.log(err.sqlMessage)
            res.status(400).send({
                status_code: 400,
                message: 'Bad Request : '+err.sqlMessage
            });
            this.apiInstance.log(400,'Bad Request: '+err.sqlMessage,'softphoneCustomerLogin','sp','','',JSON.stringify(data));
            throw err;
        });
    }


    /**
   *
   * @param req
   * @param res
   * @param next
   */

    public softphoneForgotPassword(req, res, callback) {
        let data = req.body;
        if (!data.username) {
            this.apiInstance.log(402,'Parameter Missing - username.','softphoneForgotPassword','sp')
            return res.status(402).send({ status_code: 402, error: 'Parameter Missing', message: 'Please enter the username' });
        } else if (!data.email) {
            this.apiInstance.log(402,'Parameter Missing - email.','softphoneForgotPassword','sp')
            return res.status(402).send({ status_code: 402, error: 'Parameter Missing', message: 'Please enter the email' });
        } else {

        }
        let sql = knex.select('*')
            .from(Table.tbl_Extension_Master + ' as ext')
            .where('ext.ext_number', '=', "" + data.username + "")
        sql.then((response) => {
            if (response.length) {
                res.json({
                    status_code: 200,
                    message: 'Your reset password has been sent to a registered email.'
                });
                this.apiInstance.log(200,'Reset password.','softphoneForgotPassword','sp','',data.username);
            } else {
                res.status(202).send({ status_code: 202, error: 'User inactive / Deleted', message: 'user does not exist' });
                this.apiInstance.log(202,'user does not exist.','softphoneForgotPassword','sp','','',JSON.stringify(data));
            }
        }).catch((err) => {
            errorLog(err);
            res.status(400).send({
                status_code: 400,
                message: 'Bad Request'
            });
            this.apiInstance.log(400,'Bad Request: '+err.sqlMessage,'softphoneForgotPassword','sp','','',JSON.stringify(data));
            throw err
        });
    }

    /**
  *
  * @param req
  * @param res
  * @param next
  */

    public pbxForgotPassword(req, res, callback) {
        let data = req.body;
        if (!data.username) {
            this.apiInstance.log(402,'Parameter Missing - username.','PBXForgotPassword','pbx');
            return res.status(402).send({ status_code: 402, error: 'Parameter Missing', message: 'Please enter the username' });
        } else if (!data.email) {
            this.apiInstance.log(402,'Parameter Missing - email.','PBXForgotPassword','pbx');
            return res.status(402).send({ status_code: 402, error: 'Parameter Missing', message: 'Please enter the email' });
        } else {

        }
        let sql = knex.select('*')
            .from(Table.tbl_Extension_Master + ' as ext')
            .where('ext.ext_number', '=', "" + data.username + "")
        sql.then((response) => {
            if (response.length) {
                res.json({
                    status_code: 200,
                    message: 'Your reset password has been sent to a registered email.'
                });
                this.apiInstance.log(200,'Reset password.','pbxForgotPassword','pbx','',data.username);
            } else {
                res.status(202).send({ status_code: 202, error: 'User inactive / Deleted', message: 'user does not exist' });
                this.apiInstance.log(202,'user does not exist.','pbxForgotPassword','pbx','','',JSON.stringify(data));
            }
        }).catch((err) => {
            errorLog(err);
            res.status(400).send({
                status_code: 400,
                message: 'Bad Request'
            });
            this.apiInstance.log(400,'Bad Request: '+err.sqlMessage,'pbxForgotPassword','pbx','','',JSON.stringify(data));
            throw err
        });
    }

      /**
    *
    * @param req
    * @param res
    * @param next
    */

       public crmLogin(req, res, next) {
        let data = req.body;
        
        if (!data.username) {
            this.apiInstance.log(402,'Parameter Missing - username.','crmLogin','crm')
            return res.status(402).send({ status_code: 402, error: 'Parameter Missing', message: 'Please enter the username' });
        } else if (!data.password) {
            this.apiInstance.log(402,'Parameter Missing - password.','crmLogin','crm')
            return res.status(402).send({ status_code: 402, error: 'Parameter Missing', message: 'Please enter the password' });
        } else {

        }
        let sql
      =
        knex.select('id', 'package_id', 'customer_id', 'ext_number', 'token', 'package_id as packageid', 'first_name as firstname', 'last_name as lastname', 'send_misscall_notification as misscallnotify', 'balance_restriction as balrestrict', 'caller_id_name as calleridname', 'email', 'mobile',
            'codec', 'voicemail', 'dnd', 'outbound', 'recording', 'speed_dial as speeddial', 'forward', 'black_list as blacklist', 'call_transfer as transfer', 'total_min_bal as minbalance', 'used_min as usedmin', 'roaming', 'outbound_sms_notification as outboundsmsnotify',
            'admin', 'ringtone', 'find_me_follow_me as fmfm', knex.raw("JSON_UNQUOTE(json_extract(favorite,'$.favorite')) as favorite"))
            .from(Table.tbl_Extension_Master + ' as ext')
            .where('ext.ext_number', '=', "" + data.username + "")
            .andWhere('ext.sip_password', '=', "" + data.password + "");

        sql.then((response) => {
            
            if (response.length > 0) {
                knex(Table.tbl_SoftPhone_Logs).insert({
                    username: "" + req.body.username + "",
                    device_info: "" + req.body.device_info + "",
                    mac_address: "" + req.body.mac_address + "",
                    network_info: "" + req.body.network_info + "",
                    operator_info: "" + req.body.operator_info + "",
                    // sip_info: "" + req.body.sip_info + "",
                    latitude: "" + req.body.latitude + "",
                    longitude: "" + req.body.longitude + "",
                })
                    .then((response2) => {
                        if (response2.length > 0) {
                            let resp = response[0];
                            
                            const JWTUtil = require('../utils/jwt.util');
                            const jwtUtil = new JWTUtil();
                            const jwtToken = jwtUtil.generateAccessToken(response[0].id, response[0].package_id, response[0].customer_id, response[0].ext_number, response[0].token,'6', req.headers.type);
                            delete resp['id'];
                            delete resp['package_id'];
                            delete resp['customer_id'];
                            delete resp['ext_number'];
                            delete resp['token'];

                            res.json({
                                data: resp,
                                token: jwtToken,
                                status_code: 200,
                                message: 'You have successfully logged in.'
                            });
                            this.apiInstance.log(200,'You have successfully logged in.','crmLogin','crm','',data.username);
                        } else {
                            res.status(401).send({ error: 'Unauthorized', message: 'crm log Creation error' });
                            this.apiInstance.log(401,'crm log Creation error.','crmLogin','crm','','',JSON.stringify(data));
                        }
                    }).catch((err) => {
                        errorLog(err);
                        res.status(400).send({
                            status_code: 400,
                            message: 'Bad Request'
                        });
                        this.apiInstance.log(400,'Bad Request: '+err.sqlMessage,'crmLogin','crm','','',JSON.stringify(data));
                        throw err
                    });
            } else {
                res.status(202).send({ status_code: 202, error: 'User inactive / Deleted', message: 'user does not exist' });
                this.apiInstance.log(202,'user does not exist.','crmLogin','crm','','',JSON.stringify(data));
            }
        }).catch((err) => {
            errorLog(err);
            res.status(400).send({
                status_code: 400,
                message: 'Bad Request: '+err.sqlMessage
            });
            this.apiInstance.log(400,'Bad Request: '+err.sqlMessage,'crmLogin','crm','','',JSON.stringify(data));
            throw err
        });
    }
}


