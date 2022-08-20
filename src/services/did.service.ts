/**
 * @file
 *
 * This is a DID controller of private api urls. Can be accessed after success login. These urls need authentication.
 *
 * @author Nagender Pratap Chauhan on 22/6/21.
 */

 import { errorLog, infoLog } from '../utils/logger.util';
 import { Table } from '../dba/table';
 import { ApiLogs } from '../utils/api-logs';
 import  { Validation } from '../utils/validation.util';
import { response } from 'express';
 var knex = require('../dba/knex.db');

 export class DIDService {
 
     public apiInstance = new ApiLogs();
     public validateInstance = new Validation();

   /**
   *
   * @param req
   * @param res
   * @param next
   */

     public getDID(req, res, next, type) {
         let userType = req.user_type ? req.user_type : 1;
        //  console.log(userType,"-------------------------");
         
         let product_type = type == 'pbx' ? 1 : 0 ;
         if (userType == '0') { // Admin
            knex.select('d.id', 'pro.provider','d.product_id as productid', 'c.name as country', 'd.activated', 'd.reserved', 'd.customer_id as customerid', 'd.did', knex.raw('CONCAT((CONCAT("+",c.phonecode)), \' \',d.did) as didDisplay'), 'd.secondusedreal',
        'd.billingtype', 'd.fixrate', 'd.connection_charge as connectioncharge', 'd.selling_rate as sellingrate', 'd.max_concurrent as maxconcurrent',knex.raw('IF (d.did_group = "0","General", IF (d.did_group = "1","Premium", IF (d.did_group = "2","Private","Parked"))) as didgroup'), knex.raw('IF (d.did_type = "1","DID Number", IF (d.did_type = "2","DID Number","Tollfree Number")) as didtype'),
        knex.raw('IF (d.status = "0","Inactive","Active") as status'), 'u.company_name as company','af.active_feature as activefeature','dest.active_feature_id as activefeatureid').from(Table.tbl_DID + ' as d')
        .leftJoin(Table.tbl_Provider + ' as pro', 'pro.id', 'd.provider_id')
        .leftJoin(Table.tbl_Country + ' as c', 'c.id', 'd.country_id')
        .leftJoin(Table.tbl_Customer + ' as u', 'u.id', 'd.customer_id')
        .leftJoin(Table.tbl_DID_Destination + ' as dest', 'd.id', 'dest.did_id')
        .leftJoin(Table.tbl_DID_active_feature + ' as af', 'dest.active_feature_id', 'af.id')
        .where('d.status', '!=', "2")
        .orderBy('d.id', 'desc')
        .then((response) => {
            if (response.length) {
                res.json({
                    status_code: 200,
                    message: 'DID Listing.',
                    data: response
                });
                this.apiInstance.log(200, 'DID Listing Info.', 'getDID', type, '', '');
            } else {
                res.status(201).send({ status_code: 201, message: 'No Data found' });
                this.apiInstance.log(201, 'No Data found.', 'getDID', type, '', '', '');
            }
        }).catch((err) => {
            errorLog(err);
            res.status(400).send({
                status_code: 400,
                message: 'Bad Request'
            });
            this.apiInstance.log(400, 'Bad Request: ' + err.sqlMessage, 'getDID', type, '', '', '');
            throw err;
        });
         } else if (userType == '1') {  // Customer
             let id = req.query.country_id ? parseInt(req.query.country_id) : 99; // default for india
             let sql = knex.select('d.id', 'd.did','d.fixrate',
            //  'pro.id as providerid', 'c.id as countryid', 'd.activated', 'd.reserved',  knex.raw('CONCAT((CONCAT("+",c.phonecode)), \' \',d.did) as didDisplay'), 'd.secondusedreal',
            //      'd.billingtype',  'd.connection_charge as connectioncharge', 'd.selling_rate as sellingrate', 'd.max_concurrent as maxconcurrent', 'd.did_type as didtype', knex.raw('IF (d.did_group = "0","General", IF (d.did_group = "1","Premium", IF (d.did_group = "2","Private","Parked"))) as didgroup'),
                 'd.status').from(Table.tbl_DID + ' as d')
                 .leftJoin(Table.tbl_Provider + ' as pro', 'pro.id', 'd.provider_id')
                 .leftJoin(Table.tbl_Country + ' as c', 'c.id', 'd.country_id')
                 .where('d.status', '=', "1")
                 .andWhere('d.country_id', '=', id)
                 .andWhere('d.reserved', '=', '0')
                 .orderBy('d.id', 'desc');
             console.log(sql.toQuery());
             sql.then((response) => {
                 if (response.length) {
                     res.json({
                         status_code: 200,
                         message: 'DID Listing.',
                         data: response
                     });
                     this.apiInstance.log(200, 'DID Listing Info.', 'getDID', type, '', '');
                 } else {
                     res.status(201).send({ status_code: 201, message: 'No Data found' });
                     this.apiInstance.log(201, 'No Data found.', 'getDID', type, '', '', '');
                 }
             }).catch((err) => {
                 errorLog(err);
                 res.status(400).send({
                     status_code: 400,
                     message: 'Bad Request'
                 });
                 this.apiInstance.log(400, 'Bad Request: ' + err.sqlMessage, 'getDID', type, '', '', '');
                 throw err
             });
         } else { // Not Allowed
             this.apiInstance.log(403, 'Forbidden - User has no permission for perform this action.', 'getDID', type, '', '', '');
             res.status(403).send({ status_code: 403, error: 'Forbidden', message: 'User has no permission for perform this action' });
         }
     }

     /**
   *
   * @param req
   * @param res
   * @param next
   */

     public didRelease(req, res, next, type) {
         let userType = req.user_type ? req.user_type : 1;
         let customer_id = req.user_type ? req.customer_id : 0;
         let id = req.query.did_id ? parseInt(req.query.did_id) : 0; // default for india
         let product_type = type == 'pbx' ? 1 : 0;
          if (userType == '1') {  // Customer
           knex.select('d.*')
           .from(Table.tbl_DID + ' as d')
           .where('d.id',id)
           .andWhere('d.customer_id',customer_id)
           .then((response) => {
            if (response.length) {
                let data  = response[0];
                console.log(data);
                
                let lastUses_id = '';
                var reservation_month : any = '';
                let now:any = new Date();
                let did_id = data.id;
                let user_id = data.customer_id;
                let fixrate : any = parseFloat(data.fixrate);
                var currentMonth = parseInt(now.getMonth() + 1);
                const product_id = data.product_id;
                let did_num = data.did;
                let did_country = req.country_id;
                console.log(req.body);
                // get resevation month
                var sql = knex.from(Table.tbl_Uses).where('did_id', "" + did_id + "")
                    .select(knex.raw('DATE_FORMAT(`reservation_date`, "%m") as month'), 'id')
                    .andWhere('customer_id', "" + user_id + "")
                    .first()
                    .orderBy('id', 'desc');
                sql.then((response) => {
                    console.log('response',response)
                    reservation_month = parseInt(response.month);
                    lastUses_id = response.id;
                    if (fixrate > 0 && currentMonth != reservation_month) {
                        var totalDays :any  = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
                        var oneDayPrice : any = Number(fixrate / totalDays);
                        var usedDays = now.getDate();
                        var totalBill = Number(oneDayPrice * usedDays);
                        var sql = knex(Table.tbl_Charge).insert({
                            did_id: did_id, customer_id: user_id, amount: totalBill,
                            charge_type: "1", description: 'Payment adjusment for DID - ' + did_num + '- ' + did_country, charge_status: 0,
                            invoice_status: 0, product_id :product_id
                        });
                        sql.then((resp) => {
                            if (resp) {
                                knex(Table.tbl_DID).where('id', '=', did_id)
                                    .update({
                                        reserved: '0', customer_id: '0', activated: '0'
                                    }).then((respo) => {
                                        if (respo) {
                                            knex(Table.tbl_Uses).where('id', '=', lastUses_id)
                                                .update({
                                                    release_date: knex.raw('CURRENT_TIMESTAMP()')
                                                }).then((response) => {
                                                    if (response) {
                                                        let sql = knex.from(Table.tbl_DID_Destination).where('did_id', "" + did_id + "")
                                                            .select('id');
                                                        sql.then((resp) => {
                                                            if (resp.length > 0) {
                                                                knex(Table.tbl_DID_Destination).where('did_id', '=', did_id)
                                                                    .del().then((respons) => {
                                                                        if (respons) {
                                                                            res.json({
                                                                                status_code: 200,
                                                                                message: 'DID Release.',
                                                                                data: response
                                                                            });
                                                                        } else {
                                                                            res.json({
                                                                                status_code: 401,
                                                                                message: 'Unable to Release DID ...something went wrong while delete did destination',
                                                                            });
                                                                        }
                                                                    }).catch((err) => { 
                                                                        res.status(400).send({
                                                                            status_code: 400,
                                                                            message: 'Bad Request' +err.sqlMessage
                                                                        });
                                                                        this.apiInstance.log(400, 'Bad Request: ' + err.sqlMessage, 'didRelease', type, '', '', '');
                                                                        throw err;
                                                                     });
                                                            } else {
                                                                res.json({
                                                                    status_code: 401,
                                                                    message: 'Something went wrong while Fetch data from DID_Destination',
                                                                });
                                                            }
                                                        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.sqlMessage }); throw err });
                                                    } else {
                                                        // res.status(401).send({ error: 'error', message: 'DB Error' });
                                                        res.json({
                                                            status_code: 401,
                                                            message: 'Unable to update DID_uses ...something went wrong while update DID_uses',
                                                        });
                                                    }
                                                }).catch((err) => { 
                                                    res.status(400).send({
                                                        status_code: 400,
                                                        message: 'Bad Request' +err.sqlMessage
                                                    });
                                                    this.apiInstance.log(400, 'Bad Request: ' + err.sqlMessage, 'didRelease', type, '', '', '');
                                                    throw err;
                                                 });
                                        }else{
                                            res.json({
                                                status_code: 401,
                                                message: 'Unable to update DID ...something went wrong while update did table',
                                            });
                                        }
                                    }).catch((err) => { 
                                        res.status(400).send({
                                            status_code: 400,
                                            message: 'Bad Request' + err.sqlMessage
                                        });
                                        this.apiInstance.log(400, 'Bad Request: ' + err.sqlMessage, 'didRelease', type, '', '', '');
                                        throw err;
                                    });
                            } else {
                                res.json({
                                    status_code: 401,
                                    message: 'Error: something went wrong while insert data into charge table',
                                });
                            }
                        }).catch((err) => { 
                            res.status(400).send({
                                status_code: 400,
                                message: 'Bad Request' + err.sqlMessage
                            });
                         });
                    } else {
                        knex(Table.tbl_DID).where('id', '=', did_id)
                            .update({
                                reserved: '0', customer_id: '0', activated: '0'
                            }).then((respo) => {
                                if (respo) {
                                    knex(Table.tbl_Uses).where('id', '=', lastUses_id)
                                        .update({
                                            release_date: knex.raw('CURRENT_TIMESTAMP()')
                                        }).then((response) => {
                                            if (response) {
                                                let sql = knex.from(Table.tbl_DID_Destination).where('did_id', "" + did_id + "")
                                                    .select('id');
                                                sql.then((resp) => {
                                                    if (resp.length > 0) {
                                                        knex(Table.tbl_DID_Destination).where('did_id', '=', did_id)
                                                            .del().then((respons) => {
                                                                if (respons) {
                                                                    this.apiInstance.log(200, 'DID Release - ' + did_num, 'didRelease', type, '', '', '');
                                                                    res.json({
                                                                        status_code: 200,
                                                                        message: 'DID Release.',
                                                                    });
                                                                } else {
                                                                    this.apiInstance.log(400, 'Bad Request: Unable to Release DID', 'didRelease', type, '', '', '');
                                                                    res.json({
                                                                        status_code: 400,
                                                                        message: 'Unable to Release DID ...something went wrong while delete did destination',
                                                                    });
                                                                }
                                                            }).catch((err) => { 
                                                                this.apiInstance.log(400, 'Bad Request: ' + err.sqlMessage, 'didRelease', type, '', '', '');
                                                                res.status(400).send({
                                                                    status_code: 400,
                                                                    message: 'Bad Request' +err.sqlMessage
                                                                });
                                                                throw err;
                                                             });
                                                    } else {
                                                        this.apiInstance.log(200, 'DID Release which have not destination - ' + did_num, 'didRelease', type, '', '', '');
                                                        res.json({
                                                            status_code: 200,
                                                            message: 'DID Release which have not destination',
                                                        });
                                                    }
                                                }).catch((err) => { 
                                                    this.apiInstance.log(400, 'Bad Request: ' + err.sqlMessage, 'didRelease', type, '', '', '');
                                                    res.status(400).send({
                                                        status_code: 400,
                                                        message: 'Bad Request' +err.sqlMessage
                                                    });
                                                    throw err;
                                                 });
            
                                            } else {
                                                res.status(401).send({ error: 'error', message: 'DB Error' });
                                            }
                                        }).catch((err) => {
                                            this.apiInstance.log(400, 'Bad Request: ' + err.sqlMessage, 'didRelease', type, '', '', '');
                                            res.status(400).send({
                                                status_code: 400,
                                                message: 'Bad Request' + err.sqlMessage
                                            });
                                            throw err;
                                        });
                                }
                            }).catch((err) => {
                                this.apiInstance.log(400, 'Bad Request: ' + err.sqlMessage, 'didRelease', type, '', '', '');
                                res.status(400).send({
                                    status_code: 400,
                                    message: 'Bad Request' + err.sqlMessage
                                });
                                throw err;
                            });
                    }
            
                }).catch((err) => {
                    this.apiInstance.log(400, 'Bad Request: ' + err.sqlMessage, 'didRelease', type, '', '', '');
                    res.status(400).send({
                        status_code: 400,
                        message: 'Bad Request' + err.sqlMessage
                    });
                    throw err;
                });
            } else {
                this.apiInstance.log(201, 'DID does not exist with this customer', 'didRelease', type, '', '', ''); 
                res.status(201).send({ status_code: 201, message: 'DID does not exist with this customer' });
            }
        }).catch((err) => {
            this.apiInstance.log(400, 'Bad Request: ' + err.sqlMessage, 'didRelease', type, '', '', '');
            res.status(400).send({
                status_code: 400,
                message: 'Bad Request' +err.sqlMessage
            });
            throw err;
        });

         } else { // Not Allowed
             this.apiInstance.log(403, 'Forbidden - User has no permission for perform this action.', 'didRelease', type, '', '', '');
             res.status(403).send({ status_code: 403, error: 'Forbidden', message: 'User has no permission for perform this action' });
         }
     }


// Created by Yash Kashyap ----- 18/07/22 --------- DID Creation.  
     /**
      * @param req
      * @param res
      * @param next
      */

     public async createDID(req,res,next){
        let isAdmin = req.user_type;
        let data = req.body;    
        if(isAdmin == '0'){
            if(!data.didtype){
                this.apiInstance.log(402,'Parameter- Missing.','','create DID.');
                return res.status(402).send({status_code : 402, error : 'Parameter Missing.', message : 'Please provide did type.'});
            }
            // console.log("-------YH bhi chl rha h---------------");            
            if(data.didtype != '1' && data.didtype != '3'){
                this.apiInstance.log(402,'Invalid value.','','create DID.');
                return res.status(402).send({ status_code : 402, error : 'Invalid value.', message : 'did type should be 1 or 3'});
            }
            if(!data.provider_name){
                this.apiInstance.log(402, 'Parameter-Missing.','','create DID.');
                return res.status(402).send({status_code : 402, error : 'Parameter-Missing.'});
            }
            let validateProvider;
            if(data.provider_name){                 
                validateProvider = await this.validateInstance.validateProviderExist(data.provider_name);
                // console.log(validateProvider,"---------provider-----------");
                
                if(validateProvider == false){
                    this.apiInstance.log(402,'Invalid provider','','create DID.');
                    return res.status(402).send({status_code : 402, error : 'Invalid provider.', message : 'Please provide valid provider.'})
                }
            }
            let validateCountry;
            if(data.country_name){
                if(typeof(data.country_name) != "string"){
                    this.apiInstance.log(402,'Invalid value.','','create DID.');
                    return res.status(402).send({status_code : 402, error : 'Invalid data.', message : 'please provide string value.'})
                }
                validateCountry = await this.validateInstance.validateCountryExist(data.country_name);
                if(validateCountry == false){
                    this.apiInstance.log(402,'Invalid country','','create DID.');
                    return res.status(402).send({status_code : 402, error : 'Invalid country.', message : 'please provide valid country.'})
                }
            }             
            if(!data.did_num){
                this.apiInstance.log(402,'Parameter- Missing.','','create DID.');
                return res.status(402).send({status_code : 402, error : 'Parameter Missing.', message : 'PLease provide did number.'});
            }
            if(data.did_num.length > 15){
                this.apiInstance.log(402,'Parameter Length exceed.','','create DID.');
                return res.status(402).send({status_code : 402, error : 'Length exceed.', message : 'Please provide suitable length.'});
            }
            if(typeof(data.did_num) != 'number'){
                this.apiInstance.log(402,'did number should be number.','','crate DID.');
                return res.status(402).send({status_code : 402, error : 'Invalid value.', message : 'did should be number.'});
            }
            if(!data.max_concurrent_call){
                this.apiInstance.log(402,'Parameter-Missing.','','create DID.');
                return res.status(402).send({status_code : 402, error : 'Parameter-Missing.', message : 'please provide concurrent call.'});
            }
            if(data.max_concurrent_call.length > 2){
                this.apiInstance.log(402,'length exceed.','','create DID.');
                return res.status(402).send({status_code : 402, error : 'Length exceed.',  message : 'councurrent call length should be less than 3.'});
            }
            if(data.max_concurrent_call > 30){
                this.apiInstance.log(402,'only upto 30','','create DID.');
                return res.status(402).send({status_code : 402, error : 'out of range.',  message : 'max concurrent call can not be greater from 30'});
            }
            if(!data.connect_charge){
                this.apiInstance.log(402,'Parameter-Missing.','','create DID.');
                return res.status(402).send({status_code : 402, error : 'Parameter-Missing.',  message : 'please provide connect charge value.'});;
            }
            if(data.connect_charge.length > 5){
                this.apiInstance.log(402,'Parameter Length exceed.','','create DID.');
                return res.status(402).send({ status_code : 402, error : 'Length exceed', message : 'Parameter length should be less than 6.'});
            }
            if(!data.billingtype){
                this.apiInstance.log(402,'Parameter-Missing.','','create DID.');
                return res.status(402).send({status_code : 402, error : 'Parameter-Missing.',  message : 'please provide billing type value.'});;
            }
            if(data.billingtype != '1' && data.billingtype != '2' && data.billingtype != '3' && data.billingtype != '4'){
                this.apiInstance.log(402,'Invalid parameter.','','create DID.');
                return res.status(402).send({status_code : 402, error : 'Invalid value.', message : 'Billing type should be 1 2 '})
            }
            if(data.billingtype == '1'){
                if(!data.selling_rate || !data.monthly_rate){
                    this.apiInstance.log(402,'Parameter-Missing.','','create DID.');
                    return res.status(402).send({status_code : 402, error : 'Parameter-Missing.',  message : 'Some parameter is missed in a list.'});;
                }
                if(data.selling_rate.length > 5 || data.monthly_rate.length > 5){
                    this.apiInstance.log(402,'Parameter Length exceed.','','create DID.');
                    return res.status(402).send({ status_code : 402, error : 'Length exceed', message : 'Parameter length should be less than 6.'});
                }    
            }
            if(data.billingtype == '2'){
                if(!data.monthly_rate){
                    this.apiInstance.log(402,'Parameter-Missing.','','create DID.');
                    return res.status(402).send({status_code : 402, error : 'Parameter-Missing.',  message : 'Please provide Monthly rate.'});
                }
                if(data.monthly_rate.length > 5){
                    this.apiInstance.log(402,'Parameter Length exceed.','','create DID.');
                    return res.status(402).send({ status_code : 402, error : 'Length exceed', message : 'Parameter length should be less than 6.'});
                }
            }
            if(data.billingtype == '3'){
                if(!data.selling_rate){
                    this.apiInstance.log(402,'Parameter-Missing.','','create DID.');
                    return res.status(402).send({status_code : 402, error : 'Parameter-Missing.',  message : 'Please provide selling rate value.'});
                }
                if(data.selling_rate.length > 5){
                    this.apiInstance.log(402,'Parameter Length exceed.','','create DID.');
                    return res.status(402).send({ status_code : 402, error : 'Length exceed', message : 'Parameter length should be less than 6.'});
                }
            }
            if(data.did_group){
                if(data.did_group != '0' && data.did_group != '1' && data.did_group != '2'){
                    this.apiInstance.log(402, 'did group should be 0 1 & 2.','','create DID.');
                    return res.status(402).send({status_code : 402, error : 'Invalid Value.', message : 'did group should be 0 1 & 2.'});
                }
            }
            data.did_group = data.did_group ? data.did_group : '0';
            data.country_id = data.country_id ? data.country_id : '1';
            data.activate = data.activate ? data.activate : 1;
            if(data.range == '1'){
                let validateMultiUser;
                if(!data.from){
                    this.apiInstance.log(402,'Parameter-Missing.','','create DID.');
                    return res.status(402).send({status_code : 402, error : 'Parameter-Missing.', message : 'please provide the range from number.'});
                }
                if(data.from.length > 15 && data.from.length < 5){
                    this.apiInstance.log(402, 'Invalid Length.', '','create DID.');
                    return res.status(402).send({status_code : 402, error : 'Invalid length.', message : 'please provide valid length.'});
                }
                if(!data.to){
                    this.apiInstance.log(402,'Parameter-Missing.','','create DID.');
                    return res.status(402).send({status_code : 402, error : 'Parameter-Missing.', message : 'please provide the To range number.'});
                }
                if(data.to.length > 15 && data.to.length < 5){
                    this.apiInstance.log(402, 'Invalid Length.', '','create DID.');
                    return res.status(402).send({status_code : 402, error : 'Invalid length.', message : 'please provide valid length.'});
                }
                if(data.from > data.to){
                    this.apiInstance.log(402,'Invalid Range.','','create DID.');
                    return res.status(402).send({status_code : 402, error : 'Invalid range of did.', message : 'range of did_To always be greater from did_From.'})
                }
                validateMultiUser = await this.validateInstance.validateDID(data.from);
                    if(validateMultiUser == true){
                        validateMultiUser = await this.validateInstance.validateDID(data.to);
                        if(validateMultiUser == true){
                            let sql1 = knex(Table.tbl_DID).insert({
                                did : ""+ data.from + "", provider_id : ""+ validateProvider +"", country_id : ""+ data.country_id +"", activated : ""+data.activate+"", 
                                customer_id : ""+ data.customer_id +"", did_group : ""+ data.did_group+"", billingtype : ""+ data.billingtype +"", max_concurrent : ""+ data.max_concurrent_call +"", 
                                selling_rate : ""+ data.selling_rate +"", fixrate : ""+ data.monthly_rate +"", connection_charge : ""+ data.connect_charge +"", 
                                });
                            sql1.then((response)=>{
                                // console.log(response,"------response of to insert----------"); 
                                if(response.length>0){
                                let sql2 = knex(Table.tbl_DID).insert({
                                    did : ""+ data.to + "", provider_id : ""+ validateProvider +"", country_id : ""+ data.country_id +"", activated : ""+data.activate+"", 
                                    customer_id : ""+ data.customer_id +"", did_group : ""+ data.did_group+"", billingtype : ""+ data.billingtype +"", max_concurrent : ""+ data.max_concurrent_call +"", 
                                    selling_rate : ""+ data.selling_rate +"", fixrate : ""+ data.monthly_rate +"", connection_charge : ""+ data.connect_charge +"", 
                                    });
                                    sql2.then((response1)=>{
                                        if(response1.length>0){  
                                            this.apiInstance.log(200,'did created successfully with range To to From.','','create DID.');
                                            return res.status(200).send({status_code : 200,message : 'did created successfully with range from To to From.'});
                                        }
                                    })
                                }
                            });
                        }else{
                            this.apiInstance.log(402,"inavlid did number 1.",'','','create DID.');
                            return res.status(402).send({status_code : 402, error : 'Invalid DID.', message : 'did already exist of this range.'})
                        }
                    }else{
                        this.apiInstance.log(402,"inavlid did number 2.",'','','create DID.');
                        return res.status(402).send({status_code : 402, error : 'Invalid DID.', message : 'did already exist of this range.'})
                    }
                
            }
            let validatedid;
            // let sql = knex(Table.tbl_DID).select('did')
            // .where('did',data.did_num);
            if(!data.range){
            validatedid = await this.validateInstance.validateDID(data.did_num);
                if(validatedid == true){
                    // console.log(response[0]['did'],"-------response of did number------------------")
                    // let did = response[0]['did'];
                    let sql1 = knex(Table.tbl_DID).insert({
                        did : ""+ data.did_num + "", provider_id : ""+ validateProvider +"", country_id : ""+ data.country_id +"", activated : ""+data.activate+"", 
                        customer_id : ""+ data.customer_id +"", did_group : ""+ data.did_group+"", billingtype : ""+ data.billingtype +"", max_concurrent : ""+ data.max_concurrent_call +"", 
                        selling_rate : ""+ data.selling_rate +"", fixrate : ""+ data.monthly_rate +"", connection_charge : ""+ data.connect_charge +"", 
                        });
                    sql1.then((response)=>{
                        // console.log(response,"------response of insert----------"); 
                        if(response.length){  
                            this.apiInstance.log(200,'did created successfully.');
                            return res.status(200).send({status_code : 200,message : 'did created successfully.'});
                        }
                    });
                }
                else{
                    this.apiInstance.log(402,"inavlid did number.",'','','create DID.');
                    return res.status(402).send({status_code : 402, error : 'Invalid DID.', message : 'did already exist.'})
                }
            }
        }
     }



/**
 * @param req
 * @param res
 * @param next
 */

     public async didAssign(req,res,next){
        let isAdmin = req.user_type ? req.user_type : '1';    
        if(isAdmin == '0'){
            let data = req.body;
            if(!data.country_id){
                this.apiInstance.log(402,'Parameter-Missing.','','Assign DID.');
                return res.status(402).send({status_code : 402, error : 'Parameter-Missing.', message : 'Please provide country data.'});
            }
            let validateCountry;
            validateCountry = await this.validateInstance.validateCountryExist(data.country_id);          
            if(validateCountry == false){
                this.apiInstance.log(402,'Invalid country.','','Assign DID.');
                return res.status(402).send({status_code : 402, error  : 'Invalid country.', message : 'please provide valid country.'});
            }
            if(!data.did){
                this.apiInstance.log(402,'Parameter-Missing.','','Assign DID.');
                return res.status(402).send({status_code : 402, error : 'Paramter-Missing.', message : 'please provide did number.'});
            }
            if(typeof(data.did) == "string"){
                this.apiInstance.log(402,'Invalid data.','','Assign DID.');
                return res.status(402).send({status_code : 402, error : 'invalid data.', message : 'did should be number.'});
            }
            let didExist;
            didExist = await this.validateInstance.validateDID(data.did);
            if(didExist == true){
                this.apiInstance.log(402,'did not exist.','','Assign DID.');
                return res.status(402).send({status_code : 402, error : 'Invalid did.', message : 'please provide valid did.'});
            }
            
            let getDID;                        
            getDID = await this.validateInstance.GetDIDByCountry(data.country_id,data.did);
            if(getDID == false){
                this.apiInstance.log(402,'Invalid country.','','Assign DID.');
                return res.status(402).send({status_code : 402, error  : 'Invalid country.', message : 'did does not exist on this country.'});
            }                
            if(!data.product_id){
                this.apiInstance.log(402,'Parameter-Missing.','','Assign DID.');
                return res.status(402).send({status_code : 402, error : 'Paramter-Missing.', message : 'please provide product id.'});
            }            
            if(!data.customer_id){
                this.apiInstance.log(402,'Parameter-Missing.','','Assign DID.');
                return res.status(402).send({status_code : 402, error : 'Paramter-Missing.', message : 'please provide customer id.'});
            }
            let Getcustomer ;
            Getcustomer = await this.validateInstance.GetCustomerByProduct(data.product_id,data.customer_id);         
            if(Getcustomer == false){
                this.apiInstance.log(402,'Invalid data.','','Assign DID.');
                return res.status(402).send({status_code : 402, error : 'invalid customer.', message : 'customer id does not exist on this product.'});
            }else{                
                let sql = knex(Table.tbl_DID)
                .update({reserved : '1', customer_id : Getcustomer[0]['id']})
                .where('did',didExist[0]['did']);
                sql.then((respo)=>{
                    if(respo){
                    knex(Table.tbl_DID).select('id','fixrate','product_id','customer_id')
                    .where('did',didExist[0]['did'])
                    .then((response1)=>{                                          
                        if(response1){ 
                            let currentDate = new Date();
                            let currentYear = currentDate.getFullYear();
                            let currentMonth = currentDate.getMonth()+1;
                            let currentDateInNumber = currentDate.getDate(); // like : 4,6,9,3,12,31,23 etc
                            let totalNumberOfDayaInCurrentMonth = new Date(currentYear, currentMonth, 0).getDate(); // like : 30,31,28
                            let billingDay = Number(totalNumberOfDayaInCurrentMonth) - Number(currentDateInNumber);
                            let didPerDayCharges = Number(response1[0].fixrate)/totalNumberOfDayaInCurrentMonth;
                            let retroDIDcharges = (billingDay+1)*didPerDayCharges;  
                            let charge = Number(Getcustomer[0].balance - retroDIDcharges);                      
                            let sql1 = knex(Table.tbl_Customer)
                                .update({balance : charge})
                                .where('id',Getcustomer[0]['id']);
                            sql1.then((response2)=>{
                                if(response2){
                                    knex(Table.tbl_Charge)
                                    .insert({product_id : response1[0].product_id, did_id : response1[0].id,
                                             customer_id : response1[0].customer_id, amount : retroDIDcharges.toFixed(2),
                                             charge_type : "1", charge_status : 0, invoice_status : 0})
                                    .then((resp)=>{   
                                        if(resp){
                                            let sql0 = knex(Table.tbl_Uses)
                                                .insert({did_id : response1[0]['id'], customer_id : Getcustomer[0]['id']});
                                            sql0.then((responses)=>{
                                                if(responses.length > 0){
                                                    this.apiInstance.log(200,'DID Assign successfully.','','Assign DID.');
                                                    return res.status(200).send({status_code : 200, message : 'DID assign successfully.', did : data.did_id});
                                                }
                                            }).catch((err)=>{
                                                this.apiInstance.log(400,'Bad Request.','',err,'Assign DID.');
                                                return res.status(400).send({status_code : 400, error : 'Bad Request.'});
                                            });
                                        }
                                    }).catch((err)=>{
                                        this.apiInstance.log(400,'Bad Request.','',err,'Assign DID.');
                                        return res.status(400).send({status_code : 400, error : 'Bad Request.'});
                                    });
                                }
                            }).catch((err)=>{
                                this.apiInstance.log(400,'Bad Request.','',err,'Assign DID.');
                                return res.status(400).send({status_code : 400, error : 'Bad Request.'});
                            });
                        }      
                    }).catch((err)=>{
                        this.apiInstance.log(400,'Bad Request.','',err,'Assign DID.');
                        return res.status(400).send({status_code : 400, error : 'Bad Request.'});
                    });
                }                                                                        
                }).catch((err)=>{
                    this.apiInstance.log(400,'Bad Request.','',err,'Assign DID.');
                    return res.status(400).send({status_code : 400, error : 'Bad Request.'});
                });
            }            
        }
     }
 }