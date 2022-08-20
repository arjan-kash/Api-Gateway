/**
 * @file
 *
 * This is a Circle controller of private api urls. Can be accessed after success login. These urls need authentication.
 *
 * @author Nagender Pratap Chauhan on 22/6/21.
 */

 import { errorLog, infoLog } from '../utils/logger.util';
 import { Table } from '../dba/table';
 import { ApiLogs } from '../utils/api-logs';
 import  { Validation } from '../utils/validation.util';
 import { resolve } from 'path';
 import { ResponseCall } from '../utils/response.util';
 var knex = require('../dba/knex.db');

 export class CircleService {
 
     public apiInstance = new ApiLogs();
     public validateInstance = new Validation();
     public responseInstance = new ResponseCall();

   /**
   *
   * @param req
   * @param res
   * @param next
   */

     public getCircle(req, res, next, type) {
         let isAdmin = req.user_type ? req.user_type : 1;
         if (isAdmin == '0') {
             let sql = knex.from(Table.tbl_circle + ' as c')
                 .select('c.*',
                     knex.raw('GROUP_CONCAT(p.name) as package_name'),
                     knex.raw('GROUP_CONCAT(p.id) as package_id'))
                 .leftJoin(Table.tbl_Features + ' as f', 'f.circle_id', 'c.id')
                 .leftJoin(Table.tbl_Package + ' as p', 'p.feature_id', 'f.id')
                 .groupBy('c.id')
             sql.then((response) => {
                 if (response.length) {
                     let data = [] = response ? JSON.parse(JSON.stringify(response)) : [];
                     data.map(element => {
                         let managedArray = [];
                         let id = element['package_id'] ? element['package_id'].split(',') : [];
                         let packages = element['package_name'] ? element['package_name'].split(',') : [];
                         delete element['package_id'];
                         delete element['package_name'];
                         id.forEach((key1, i) => {
                             packages.forEach((key2, j) => {
                                 if (i === j) { managedArray.push({ 'id': Number(key1), 'name': key2 }) }
                             });
                         });
                         element['packages'] = managedArray
                     })
                     res.json({
                         status_code: 200,
                         message: 'Circle Listing.',
                         data: data
                     });
                     this.apiInstance.log(200, 'Circle Listing Info.', 'getCircle', type, '', '');
                 } else {
                     res.status(201).send({ status_code: 201, message: 'No Data found' });
                     this.apiInstance.log(201, 'No Data found.', 'getCircle', type, '', '', '');
                 }
             }).catch((err) => {
                 errorLog(err);
                 res.status(400).send({
                     status_code: 400,
                     message: 'Bad Request'
                 });
                 this.apiInstance.log(400, 'Bad Request: ' + err.sqlMessage, 'getCircle', type, '', '', '');
                 throw err
             });
         } else {
             this.apiInstance.log(403, 'Forbidden - User has no permission for perform this action.', 'getCircle', type, '', '', '');
             res.status(403).send({ status_code: 403, error: 'Forbidden', message: 'User has no permission for perform this action' });
         }
     }

     /**
     *
     * @param req
     * @param res
     * @param next
     */

     public getDialOutRates(req, res, next, type) {
         let isAdmin = req.user_type ? req.user_type : 1;
         if (isAdmin == '0') {
             let sql = knex.select('cp.id', 'cp.name','c.name as circle_name', 
              knex.raw('GROUP_CONCAT(cr.dial_prefix) as dial_prefix'),
            //    knex.raw('GROUP_CONCAT(cr.talktime_minutes) as talktime_minutes'),
               knex.raw('GROUP_CONCAT(cr.buying_rate) as buying_rate'),
               knex.raw('GROUP_CONCAT(cr.selling_rate) as selling_rate'),
               knex.raw('GROUP_CONCAT(p.provider) as gateway_name'),
               knex.raw("IF (cp.lc_type = '0','LCR - According to the buyer price','LCD - According to the seller price') as lcTypeDisplay")
              )
                 .from(Table.tbl_Call_Plan + ' as cp')
                 .leftJoin(Table.tbl_Call_Plan_Rates + ' as cr', 'cr.call_plan_id', 'cp.id')
                 .leftJoin(Table.tbl_circle + ' as c', 'c.id', 'cp.circle_id')
                 .leftJoin(Table.tbl_Gateway + ' as g', 'g.id', 'cr.gateway_id')
                 .leftJoin(Table.tbl_Provider + ' as p', 'p.id', 'g.provider_id')
                 .where('cp.status', '=', "1")
                 .andWhere('cp.is_minute_plan', '=', '0')
                 .groupBy('cp.id')
                 .orderBy('cp.name');
             sql.then((response) => {
                 if (response.length) {
                    let arrMap = response ? response : [];
                    arrMap = arrMap.map(item => {
                        let res = item;
                        let destination = [];
                        let buying_rate = item['buying_rate'] ? item['buying_rate'].split(',') : [];
                        let selling_rate = item['selling_rate'] ? item['selling_rate'].split(',') : [];
                        let gateway_name = item['gateway_name'] ? item['gateway_name'].split(',') : [];
                        let dial_prefix = item['dial_prefix'] ? item['dial_prefix'].split(',') : [];
                        buying_rate.forEach((elementi, i) => {
                            dial_prefix.forEach((elementj, j) => {
                                selling_rate.forEach((elementk, k) => {
                                    gateway_name.forEach((elementl, l) => {
                                        if (i === j && j === k && k === l ) {
                                            destination.push({ 'dial_prefix': elementj, 'buying_rate': elementi, 'selling_rate':elementk , 'gateway_name':elementl  })
                                        }
                                    });
                                });
                            });
                        });
                        item['destination'] = destination;
                        delete res['id'];
                        delete res['buying_rate'];
                        delete res['selling_rate'];
                        delete res['gateway_name'];
                        delete res['dial_prefix'];
                        return res;
                    });
                     res.json({
                         status_code: 200,
                         message: 'DialOut Rates Listing.',
                         data: response
                     });
                     this.apiInstance.log(200, 'DialOut Rates Listing Info.', 'getDialOutRates', type, '', '');
                 } else {
                     res.status(201).send({ status_code: 201, message: 'No Data found' });
                     this.apiInstance.log(201, 'No Data found.', 'getDialOutRates', type, '', '', '');
                 }
             }).catch((err) => {
                 errorLog(err);
                 res.status(400).send({
                     status_code: 400,
                     message: 'Bad Request'
                 });
                 this.apiInstance.log(400, 'Bad Request: ' + err.sqlMessage, 'getDialOutRates', type, '', '', '');
                 throw err
             });
         } else {
             this.apiInstance.log(403, 'Forbidden - User has no permission for perform this action.', 'getDialOutRates', type, '', '', '');
             res.status(403).send({ status_code: 403, error: 'Forbidden', message: 'User has no permission for perform this action' });
         }
     }

     /**
   *
   * @param req
   * @param res
   * @param next
   */

      public getCountries(req, res, next, type) {
        let isAdmin = req.user_type ? req.user_type : 1;
        if (isAdmin == '0') {
            let sql = knex.from(Table.tbl_Country + ' as c')
                .select('c.*');
            sql.then((response) => {
                if (response.length) {
                    res.json({
                        status_code: 200,
                        message: 'Country Listing.',
                        data: response
                    });
                    this.apiInstance.log(200, 'Country Listing Info.', 'getCountries', type, '', '');
                } else {
                    res.status(201).send({ status_code: 201, message: 'No Data found' });
                    this.apiInstance.log(201, 'No Data found.', 'getCountries', type, '', '', '');
                }
            }).catch((err) => {
                errorLog(err);
                res.status(400).send({
                    status_code: 400,
                    message: 'Bad Request'
                });
                this.apiInstance.log(400, 'Bad Request: ' + err.sqlMessage, 'getCountries', type, '', '', '');
                throw err
            });
        } else {
            this.apiInstance.log(403, 'Forbidden - User has no permission for perform this action.', 'getCountries', type, '', '', '');
            res.status(403).send({ status_code: 403, error: 'Forbidden', message: 'User has no permission for perform this action' });
        }
    }


     /**
   *
   * @param req
   * @param res
   * @param next
   */

      public getStates(req, res, next, type) {
        let isAdmin = req.user_type ? req.user_type : 1;
        if (isAdmin == '0') {
            let sql = knex.from(Table.tbl_States + ' as s')
                .select('s.*');
            sql.then((response) => {
                if (response.length) {
                    // let responseData = JSON.parse(JSON.stringify(response));
                    // responseData = responseData.map(item=>{
                    //   let a =  Object.keys(item).re
                    // })
                    res.json({
                        status_code: 200,
                        message: 'States Listing.',
                        data: response
                    });
                    this.apiInstance.log(200, 'States Listing Info.', 'getStates', type, '', '');
                } else {
                    res.status(201).send({ status_code: 201, message: 'No Data found' });
                    this.apiInstance.log(201, 'No Data found.', 'getStates', type, '', '', '');
                }
            }).catch((err) => {
                errorLog(err);
                res.status(400).send({
                    status_code: 400,
                    message: 'Bad Request'
                });
                this.apiInstance.log(400, 'Bad Request: ' + err.sqlMessage, 'getStates', type, '', '', '');
                throw err
            });
        } else {
            this.apiInstance.log(403, 'Forbidden - User has no permission for perform this action.', 'getStates', type, '', '', '');
            res.status(403).send({ status_code: 403, error: 'Forbidden', message: 'User has no permission for perform this action' });
        }
    }

     /**
  *
  * @param req
  * @param res
  * @param next
  */

     public getDialOutGroup(req, res, next, type) {
         let isAdmin = req.user_type ? req.user_type : 1;
         if (isAdmin == '0') {
             let sql = knex.from(Table.tbl_Dialout_Group).select('id', 'name', 'description');
             sql.orderBy('name', 'asc')
             sql.then((response) => {
                 if (response.length) {
                     res.json({
                         status_code: 200,
                         message: 'DialOutGroup Listing.',
                         data: response
                     });
                     this.apiInstance.log(200, 'DialOutGroup Listing Info.', 'getDialOutGroup', type, '', '');
                 } else {
                     res.status(201).send({ status_code: 201, message: 'No Data found' });
                     this.apiInstance.log(201, 'No Data found.', 'getDialOutGroup', type, '', '', '');
                 }
             }).catch((err) => {
                 errorLog(err);
                 res.status(400).send({
                     status_code: 400,
                     message: 'Bad Request'
                 });
                 this.apiInstance.log(400, 'Bad Request: ' + err.sqlMessage, 'getDialOutGroup', type, '', '', '');
                 throw err
             });
         } else {
             this.apiInstance.log(403, 'Forbidden - User has no permission for perform this action.', 'getDialOutGroup', type, '', '', '');
             res.status(403).send({ status_code: 403, error: 'Forbidden', message: 'User has no permission for perform this action' });
         }
     }

    /**
   *
   * @param req
   * @param res
   * @param next
   */

        public getTimeZone(req, res, next, type) {
            let isAdmin = req.user_type ? req.user_type : 1;
            if (isAdmin == '0') {
                let sql = knex.from(Table.tbl_TimeZone + ' as c')
                    .select('c.*');
                sql.then((response) => {
                    if (response.length) {
                        res.json({
                            status_code: 200,
                            message: 'TimeZone Listing.',
                            data: response
                        });
                        this.apiInstance.log(200, 'TimeZone Listing Info.', 'getTimeZone', type, '', '');
                    } else {
                        res.status(201).send({ status_code: 201, message: 'No Data found' });
                        this.apiInstance.log(201, 'No Data found.', 'getTimeZone', type, '', '', '');
                    }
                }).catch((err) => {
                    errorLog(err);
                    res.status(400).send({
                        status_code: 400,
                        message: 'Bad Request'
                    });
                    this.apiInstance.log(400, 'Bad Request: ' + err.sqlMessage, 'getTimeZone', type, '', '', '');
                    throw err
                });
            } else {
                this.apiInstance.log(403, 'Forbidden - User has no permission for perform this action.', 'getTimeZone', type, '', '', '');
                res.status(403).send({ status_code: 403, error: 'Forbidden', message: 'User has no permission for perform this action' });
            }
        }

     /**
   *
   * @param req
   * @param res
   * @param next
   */

     public getBillingType(req, res, next, type) {
        let isAdmin = req.user_type ? req.user_type : 1;
        if (isAdmin == '0') {
                 let response = [];
                 response.push({id:1,name : "Prepaid"});
                 response.push({id:2,name : "Postpaid"});
                    res.json({
                        status_code: 200,
                        message: 'Billing Type Listing.',
                        data: response
                    });
                    this.apiInstance.log(200, 'Billing Type Listing Info.', 'getBillingType', type, '', '');
               
        } else {
            this.apiInstance.log(403, 'Forbidden - User has no permission for perform this action.', 'getBillingType', type, '', '', '');
            res.status(403).send({ status_code: 403, error: 'Forbidden', message: 'User has no permission for perform this action' });
        }
    }

  /**
   *
   * @param req
   * @param res
   * @param next
   */

     public getPackageType(req, res, next, type) {
         let isAdmin = req.user_type ? req.user_type : 1;
         if (isAdmin == '0') {
             let response = [];
             response.push({ id: 1, name: "Standard" });
             response.push({ id: 3, name: "Enterprise bucket" });
             res.json({
                 status_code: 200,
                 message: 'Package Type Listing.',
                 data: response
             });
             this.apiInstance.log(200, 'Billing Type Listing Info.', 'getPackageType', type, '', '');

         } else {
             this.apiInstance.log(403, 'Forbidden - User has no permission for perform this action.', 'getPackageType', type, '', '', '');
             res.status(403).send({ status_code: 403, error: 'Forbidden', message: 'User has no permission for perform this action' });
         }
     }

     /**
   *
   * @param req
   * @param res
   * @param next
   */

      public getProductType(req, res, next, type) {
        let isAdmin = req.user_type ? req.user_type : 1;
        if (isAdmin == '0') {
            let sql = knex.from(Table.tbl_Product + ' as c')
                .select('c.id','c.name')
                .where('c.status', '=', "1");
            sql.then((response) => {
                if (response.length) {
                    res.json({
                        status_code: 200,
                        message: 'Product Type Listing.',
                        data: response
                    });
                    this.apiInstance.log(200, 'Product Type Listing Info.', 'getProductType', type, '', '');
                } else {
                    res.status(201).send({ status_code: 201, message: 'No Data found' });
                    this.apiInstance.log(201, 'No Data found.', 'getProductType', type, '', '', '');
                }
            }).catch((err) => {
                errorLog(err);
                res.status(400).send({
                    status_code: 400,
                    message: 'Bad Request'
                });
                this.apiInstance.log(400, 'Bad Request: ' + err.sqlMessage, 'getProductType', type, '', '', '');
                throw err
            });
        } else {
            this.apiInstance.log(403, 'Forbidden - User has no permission for perform this action.', 'getProductType', type, '', '', '');
            res.status(403).send({ status_code: 403, error: 'Forbidden', message: 'User has no permission for perform this action' });
        }


       
    }
    


// Created by Yash kashyap-------15/07/22 ---------get provider
    /**
    *
    * @param req
    * @param res
    * @param next
    */

     public getProvider(req, res, next, type) {
         let isAdmin = req.user_type ? req.user_type : 1;
         if (isAdmin == '0') {
             let sql = knex.from(Table.tbl_Provider + ' as c')
                 .select('c.id', 'c.provider as name');
             sql.then((response) => {
                 if (response.length) {
                     res.json({
                         status_code: 200,
                         message: 'Provider Listing.',
                         data: response
                     });
                     this.apiInstance.log(200, 'Provider Listing Info.', 'getProvider', type, '', '');
                 } else {
                     res.status(201).send({ status_code: 201, message: 'No Data found' });
                     this.apiInstance.log(201, 'No Data found.', 'getProvider', type, '', '', '');
                 }
             }).catch((err) => {
                 errorLog(err);
                 res.status(400).send({
                     status_code: 400,
                     message: 'Bad Request'
                 });
                 this.apiInstance.log(400, 'Bad Request: ' + err.sqlMessage, 'getProvider', type, '', '', '');
                 throw err
             });
         } else {
             this.apiInstance.log(403, 'Forbidden - User has no permission for perform this action.', 'getProvider', type, '', '', '');
             res.status(403).send({ status_code: 403, error: 'Forbidden', message: 'User has no permission for perform this action' });
         }

     }

    /**
 *
 * @param req
 * @param res
 * @param next
 */

     public getGateway(req, res, next, type) {
        let isAdmin = req.user_type ? req.user_type : 1;
        if (isAdmin == '0') {
            knex.raw("Call pbx_get_gateway(" + null + "," + null + "," + null + "," + null + ")")
                .then((response) => {
                    if (response.length) {
                        res.json({
                            status_code: 200,
                            message: 'Gateway Listing.',
                            data: response[0][0]
                        });
                        this.apiInstance.log(200, 'Gateway Listing Info.', 'getGateway', type, '', '');
                    } else {
                        res.status(201).send({ status_code: 201, message: 'No Data found' });
                        this.apiInstance.log(201, 'No Data found.', 'getGateway', type, '', '', '');
                    }
                }).catch((err) => {
                    errorLog(err);
                    res.status(400).send({
                        status_code: 400,
                        message: 'Bad Request'
                    });
                    this.apiInstance.log(400, 'Bad Request: ' + err.sqlMessage, 'getGateway', type, '', '', '');
                    throw err;
                });
        } else {
            this.apiInstance.log(403, 'Forbidden - User has no permission for perform this action.', 'getGateway', type, '', '', '');
            res.status(403).send({ status_code: 403, error: 'Forbidden', message: 'User has no permission for perform this action' });
        }  
    }

    /**
     * @param req 
     * @param res
     * @param next
     */
    
    public async createGateway(req,res,next){
        let isAdmin = req.user_type ? req.user_type : 1;
        let data = req.body;
        let validateProvider;
        if(isAdmin == "0"){             
            if(!data.provider_name){
                this.apiInstance.log(402,"Parameter Missing",'','','createGateway');
                res.status(402).send({ status_code : 402, error: 'Parameter Missing.', message: 'Please enter the provider name.'});
                // this.responseInstance.responses(402, 'Please enter the provider name.', 'Parameter Missing.', 'create Gateway.', '','')
            }
            if(typeof(data.provider_name) != "string"){
                 this.apiInstance.log(402,'Inavlid Data.', '','','createProvider');
                return res.status(402).send({ status_code: 402, error: 'Inavlid data format.', message: 'please enter only valid data.'});
            }
            validateProvider = await this.validateInstance.validateProviderExist(data.provider_name);
            if(validateProvider == false){
                this.apiInstance.log(402,'Provider Exist.','','create Gateway.');
                return res.status(402).send({status_code : 402, error : 'Invalid provider.', message : 'please provide valid provider.'});
            }
            if(!data.ip && !data.domain){
                this.apiInstance.log(402,'Parameter-Missing.','','create Gateway.');
                return res.status(402).send({ status_code : 402, error : 'parameter Missing',message : 'please provide one either ip or domain.'});
            }
            if(data.ip && data.domain){
                this.apiInstance.log(402,'please provide only one','','create Gateway.');
                return res.status(402).send({ status_code : 402, error : 'parameter exceed.',message : 'please provide only one either ip and domain.'});
            }
            // if((data.ip != 1) && (data.domain != 1)){
            //     this.apiInstance.log(402,'Invalid Value.','','please provide only 1');
            //     return res.status(402).send({status_code : 402, error : 'Invalid value.', message : ' please provide only 1'})
            // }
            if(data.domain){
                if(!data.port){
                    this.apiInstance.log(402,'Parameter Missing.','','create gateway.');
                    return res.status(402).send({status_code : 402, error: 'Parameter Missing.', message : 'please provide the port value.'});;
                }
            }
            if(data.transport_type){
                if(data.transport_type !='0' && data.transport_type !='1' && data.transport_type !='2'){
                    this.apiInstance.log(402,'Invaid Value.','','','create Gateway.');
                    res.status(402).send({status_code : '402', error : 'Invalid value.', message : 'transport type should be 0, 1 & 2'});
                }
            }
            if(data.dtmf){
                if(data.dtmf != '0' && data.dtmf != '1' && data.dtmf != '2' && data.dtmf != '3' && data.dtmf != '4'){
                    this.apiInstance.log(402,'Invalid Value', '','','create Gateway.');
                    res.status(402).send({status_code : 402, error : 'Invalid Value.', message : 'dtmf type should be 0, 1, 2, 3 & 4'});
                }
            }
            if(data.profile){
                if(data.profile != '0' && data.profile != '1' && data.profile != '2'){
                    this.apiInstance.log(402,'Invalid value','','create Gateway.');
                    return res.status(402).send({status_code : 402, error : 'Invalid profile.', message : 'please provide valid value for profile.'});
                }
            }
            if(data.callerid){
                if(typeof(data.callerid) == "string"){
                    this.apiInstance.log(402,'Invalid Value','','create Gateway.');
                    res.status(402).send({status_code : 402, error : 'Invalid data.', message : 'only number allowed.'});
                }
            }
            if(data.contactParam){
                if((data.contactParam).toString().length > 20){
                    this.apiInstance.log(400,'Length exceed.','','create Gateway.');
                    return res.status(400).send({status_code : 400, error : 'Invalid length.', message : 'please provide valid length.'})
                }
            }
            if(data.is_fromDomain){
                if(data.is_fromDomain != '0' && data.is_fromDomain != '1'){
                    this.apiInstance.log(402,'Invalid value.','','create Gateway.');
                    res.status(402).send({ status_code : 402, error : 'Invalid data.', message : 'from domain should be either 0 or 1'});
                }
                if(data.is_fromDomain == '1'){
                    if(data.fromDomain){
                        this.apiInstance.log(402,'Invalid value.','','create Gateway.');
                        res.status(402).send({status_code : 402, error : 'Access denied.', message : 'please disable from-Domain befor access it.'});
                    }
                }
            }
            if(data.is_register_proxy){
                if(data.is_register_proxy != '0' && data.is_register_proxy != '1'){
                    this.apiInstance.log(402,'Invalid value.','','create Gateway.');
                    res.status(402).send({ status_code : 402, error : 'Invalid data.', message : 'register proxy should be either 0 or 1'});
                }
                if(data.is_register_proxy == '1'){
                    if(data.registerProxy){
                        this.apiInstance.log(402,'Invalid value.','','create Gateway.');
                        res.status(402).send({status_code : 402, error : 'Access denied.', message : 'please disable register proxy befor access it.'});
                    }
                }
            }
            if(data.simultaneous_call){
                if((data.simultaneousCall).toString().length > 3){
                    this.apiInstance.log(400,'Length exceed.','','','create Gateway.');
                    res.status(400).send({status_code : 400, error : 'Invalid length.', message : 'Parameter length exceed.'});
                }
            }
            
            
            if(data.status){
                if(data.status != '0' && data.status != '1'){
                    this.apiInstance.log(402,'invalid Parameter.','','create Gateway.');
                    return res.status(402).send({status_code : 400, error : 'invalid data.', message : 'please provide valid value for status.'});
                }
            }

            if(data.isrealm){
                if(data.isrealm != 0 && data.isrealm != 1){
                    this.apiInstance.log(402,'invalid value.','','create Gateway.');
                    return res.status(402).send({status_code : 402, error : 'invalid value.', message : 'is realm should be 0 or 1.'});
                }
            }

            if(data.prepend_digitin_dial){
                if(data.prepend_digitin_dial == "string"){
                    this.apiInstance.log(402,'invalid value.','','create Gateway.');
                    return res.status(402).send({status_code : 402, error : 'invalid value.', message : 'prepend didit in dial should be number.'});
                }
                if((data.prepend_digitin_dial).toString().length > 5){
                    this.apiInstance.log(400,'Length exceed.','','','create Gateway.');
                    return res.status(400).send({status_code : 400, error : 'Invalid length.', message : 'Parameter Length exceed.'});
                }
            }
            if(data.striped_digitin_dial){
                if(data.striped_digitin_dial == "string"){
                    this.apiInstance.log(402,'invalid value.','','create Gateway.');
                    return res.status(402).send({status_code : 402, error : 'invalid value.', message : 'striped didit in dial should be number.'});
                }
                if((data.striped_digitin_dial).toString().length > 5){
                    this.apiInstance.log(400,'Length exceed.','','','create Gateway.');
                    return res.status(400).send({status_code : 400, error : 'Length exceed.', message : 'Parameter Length exceed.'});
                }
            }
            if(data.striped_digitin_caller){
                if(data.striped_digitin_caller == "string"){
                    this.apiInstance.log(402,'invalid value.','','create Gateway.');
                    return res.status(402).send({status_code : 402, error : 'invalid value.', message : 'striped didit in dial should be number.'});
                }
                if((data.striped_digitin_caller).toString().length > 5){
                    this.apiInstance.log(400,'Length exceed.','','','create Gateway.');
                    return res.status(400).send({status_code : 400, error : 'Invalid length.', message : 'Parameter Length exceed.'});
                }
            }
            if(data.prepend_digitin_caller){
                if(data.prepend_digitin_caller == "string"){
                    this.apiInstance.log(402,'invalid value.','','create Gateway.');
                    return res.status(402).send({status_code : 402, error : 'invalid value.', message : 'prepend didit in dial should be number.'});
                }
                if((data.prepend_digitin_caller).toString().length > 5){
                    this.apiInstance.log(400,'Length exceed.','','','create Gateway.');
                    return res.status(400).send({status_code : 400, error : 'Invalid length.', message : 'Parameter Length exceed.'});
                }
            }
            if(data.caller_value_different){
                if(data.caller_value_different != '0' && data.caller_value_different != '1'){
                    this.apiInstance.log(402,'invalid Parameter.','','create Gateway.');
                    return res.status(402).send({status_code : 400, error : 'invalid data.', message : 'status should be 0 or 1'});
                }
                if(data.caller_value_different == '1'){
                    if(data.calleridvalue){
                        // if(data.prepend_digitin_caller == "string"){
                        //     this.apiInstance.log(402,'invalid value.','','create Gateway.');
                        //     return res.status(402).send({status_code : 402, error : 'invalid value.', message : 'caller id header value should be number.'});
                        // }
                        // console.log((data.calleridvalue).toString().length,"--------------callerid -----------");                        
                        if((data.calleridvalue).toString().length > 15){
                            this.apiInstance.log(402,'Length exceed.','','','create Gateway.');
                            return res.status(402).send({status_code : 402, error : 'Length exceed.', message : 'Parameter Length exceed.'});
                        }
                    }
                    if(data.calleridtype){
                        if(data.calleridtype != '0' && data.calleridtype != '1' && data.calleridtype != '2'){
                            this.apiInstance.log(402,'invalid Parameter.','','create Gateway.');
                            return res.status(402).send({status_code : 400, error : 'invalid data.', message : 'caller id header type should be 0 1 & 2'});
                        }
                    }
                }
            }
            let validatecodec; 
            if(data.codec){
                validatecodec = await this.validateInstance.validateCodec(data.codec);
                if(validatecodec == false){
                    this.apiInstance.log(402,'does not exist.','','create Gateway.');
                    return res.status(402).send({status_code : 402, error : 'invalid codec.', message : 'please provide valid codec.'});
                }     
            }
            data.ip = data.ip ? data.ip : 0;
            data.domain = data.domain ? data.domain : '';
            data.contactParam = data.contactParam ? data.contactParam : '';
            data.transport_type = data.transport_type ? data.transport_type : '0';
            data.isSign = data.isSign ? data.isSign : '0';
            data.fromUser = data.fromUser ? data.fromUser : '';
            data.dtmf = data.dtmf ? data.dtmf : '0';
            data.is_register_proxy = data.is_register_proxy ? data.is_register_proxy : '0';
            data.registerProxy = data.registerProxy ? data.registerProxy : '';
            data.status = data.status ? data.status : '0';
            data.isrealm = data.isrealm ? data.isrealm : '0';
            data.realm = data.realm ? data.realm : '';
            data.profile = data.profile ? data.profile : '1';
            data.simultaneousCall = data.simultaneousCall ? data.simultaneousCall : '';    
            data.prepend_digitin_dial = data.prepend_digitin_dial ? data.prepend_digitin_dial : '';
            data.prepend_digitin_caller = data.prepend_digitin_caller ? data.prepend_digitin_caller : '';
            data.striped_digitin_caller = data.striped_digitin_caller ? data.striped_digitin_caller : '';
            data.striped_digitin_dial = data.striped_digitin_dial ? data.striped_digitin_dial : '';
            data.callerid = data.callerid ? data.callerid : '';
            data.calleridvalue = data.calleridvalue ? data.calleridvalue : '';
            data.codec = data.codec ? data.codec : 'PCMA,PCMU';
            data.fromDomain = data.fromDomain ? data.fromDomain : '';
            data.authname = data.authname ? data.authname : '0';
            data.password = data.password ? data.password : '0';
            data.expirysec = data.expirysec ? data.expirysec : 3600;
            data.ping = data.ping ? data.ping : 60;
            data.retrysec = data.retrysec ? data.retrysec : 30;
            if(data.register == '1'){
                data.authname = data.authname ? data.authname : '0';
                data.password = data.password ? data.password : '0';
                data.expirysec = data.expirysec ? data.expirysec : 3600;
                data.ping = data.ping ? data.ping : 60;
                data.retrysec = data.retrysec ? data.retrysec : 30;
            }
            
            let sql = knex(Table.tbl_Gateway).where('ip',data.ip)
                        .select('id');
                sql.then((response1) =>{
                    console.log(response1,"------response--------");
                    if(response1.length > 0){
                        this.apiInstance.log(400,'Duplicate entry.','','create gateway.');
                        return res.status(400).send({status_code : 400, error : 'Duplicate entry.', message : 'Gateway already exist.'});
                    }else{                    
                        let sql0 = knex(Table.tbl_Gateway).insert({provider_id : ""+ validateProvider +"", ip : ""+ data.ip +"", port : ""+ data.port +"", from_user : ""+ data.fromUser +"",
                                auth_username : ""+ data.authname +"", password : ""+ data.password +"", register : ""+ data.register +"", expiry_sec : ""+ data.expirysec +"", ping : ""+ data.ping +"",
                                retry_sec : ""+ data.retrysec +"", prependDigit_dialnumber : ""+ data.prepend_digitin_dial +"", prependDigit__callerID : ""+ data.prepend_digitin_caller +"", strip_clr_id : ""+ data.striped_digitin_caller +"",
                                strip_clr_num : ""+ data.striped_digitin_dial +"", is_sign : ""+ data.isSign +"", callerID : ""+ data.callerid +"", callerID_headertype : ""+ data.calleridtype +"", callerID_headervalue : ""+ data.calleridvalue +"",
                                codec : ""+ validatecodec +"", transport_type : ""+ data.transport_type +"", dtmf_type : ""+ data.dtmf +"", simultaneous_call : ""+ data.simultaneousCall +"", 	calling_profile : ""+ data.contactParam +"",
                                sofia_id : ""+ '1' +"", realm : ""+ data.realm +"", domain : ""+ data.domain +"", subnet : ""+ '1' +"", status : ""+ data.status +"", outbound_proxy : ""+ data.fromDomain +"", register_proxy : ""+ data.registerProxy +"",
                                is_outbound_proxy : ""+ data.is_fromDomain +"", is_register_proxy : ""+ data.is_register_proxy +"", sofia_profile :  ""+ data.profile +"", is_realm : ""+ data.isrealm +""});
                        sql0.then((response)=>{
                            // console.log(response,"========");                    
                            if(response != 0){
                                this.apiInstance.log(200,'Gateway Created Successfully.','','create Gateway.');
                                return res.status(200).send({status_code : 200, message : 'Gateway Created Successfully.'});                     
                            }
                        }).catch((err)=>{
                            errorLog(err);
                            this.apiInstance.log(400,'Bad Request.','','create Gateway.');
                            return res.status(400).send({status_code : 400, error : 'Bad Request.'});
                        });
                    }                    
                }).catch((err)=>{
                    errorLog(err);
                    this.apiInstance.log(400,'Bad Request.','','create Gateway.');
                    return res.status(400).send({status_code : 400, error : 'Bad Request.'});
                });
        }
    }
 }