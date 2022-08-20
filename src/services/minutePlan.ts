/**
 * @file
 *
 * This is a MinutePlanService controller of public api urls. Can be accessed after success login. These urls need authentication.
 *
 * @author Nagender Pratap Chauhan on 25/10/21.
 */

 import { errorLog, infoLog } from '../utils/logger.util';
 import { warnLog, unauthLog } from '../utils/logger.util';
 import { Table } from '../dba/table';
 import { ApiLogs } from '../utils/api-logs';
 import  { Validation } from '../utils/validation.util';
import { MinutePlanTypeConstants } from '../utils/constant';
 
 var knex = require('../dba/knex.db');
 
 export class MinutePlanService {
 
     public apiInstance = new ApiLogs();
     public validationInstance = new Validation();

 /**
  *
  * @param req
  * @param res
  * @param next
  */

    public getMinutePlanForAdmin(req, res, next) {
        var data = req.body;
        let minutePlanType = data.type;
        if (!data.type) {
            this.apiInstance.log(402,'Parameter Missing - type.','getMinutePlan','pbx', '', req.ext_number, JSON.stringify(data)); 
            return res.status(402).send({ status_code: 402, error: 'Parameter Missing', message: 'Please enter the type' });
        }
        let type = data.type == '1' ? 'Bundle' : data.type == '2' ? 'Roaming' : data.type == '3' ? 'Booster' : 'Teleconsultation'
        if (data.type != '1' && data.type != '2' && data.type != '4' && data.type != '3') {
            this.apiInstance.log(406,'Unauthorize Type - Parameter Type is incorrect.','getMinutePlan','pbx', '', '', JSON.stringify(data)); 
            return res.status(406).send({ status_code: 406, error: 'Parameter Type is incorrect', message: 'Please enter the correct type' });
        }
        let isAdmin = req.user_type ? req.user_type : 1;
        if (isAdmin == '0') {
            console.log(knex.raw("Call pbx_getMinutePlanForBackend('" + minutePlanType + "'," + null + "," + null + "," + null + ")").toQuery());
            
            knex.raw("Call pbx_getMinutePlanForBackend('" + minutePlanType + "'," + null + "," + null + "," + null + ")").then((response) => {
                if (response) {
                    console.log(response[0][0],"-----------------------------");                    
                    var data = response[0][0];
                    var count = 0;
                    let destination = [];
                    if (data.length) {
                        // this.apiInstance.log(200, 'Minute Plan Info - '+ type, 'getMinutePlan', 'pbx', '', '');
                        let arrMap = response[0][0] ? response[0][0] : [];
                        for(let i = 0 ; i< arrMap.length ; i++){
                            console.log(knex.raw("Call pbx_getCallPlanRateByFilters(" + arrMap[i]['call_plan_id'] + "," + null + "," + null + "," + null +  "," + null + ",'" + minutePlanType  + "')").toString());
                            knex.raw("Call pbx_getCallPlanRateByFilters(" + arrMap[i]['call_plan_id'] + "," + null + "," + null + "," + null +  "," + null + ",'" + minutePlanType  + "')").then((response2) => {
                                count ++;
                                if (response2) {
                                    let destList = response2[0][0] ? response2[0][0] : [];
                                    let destination = [];
                                    destList.forEach(item => {
                                                destination.push({'dial_prefix': item['dial_prefix'] , 'talktime_minutes':item['talktime_minutes'] })
                                    });
                                    Object.assign(response[0][0][i],{'destination': destination });
                                }else{
                                   // return;
                                }
                                if (data.length == count) {
                                    let arrMaps = response[0][0] ? response[0][0] : [];
                                    arrMaps = arrMaps.map(item => {
                                        let res = item;
                                        delete res['id'];
                                        delete res['plan_type'];
                                        delete res['call_plan'];
                                        delete res['is_overuse'];
                                        delete res['number_of_days'];
                                        delete res['status'];
                                        delete res['created_at'];
                                        delete res['updated_at'];
                                        return res;
                                    });
                                    this.apiInstance.log(200, 'Minute Plan Info - '+ type, 'getMinutePlan', 'pbx', '', '');
                                    res.send({
                                        status_code: 200,
                                        message: 'Minutes Plan Info.',
                                        data: response[0][0] 
                                    });
                                }
                            }).catch((err) => {
                                res.send({ response: { code: err.errno, message: err.sqlMessage } });
                            });
                           }
                           console.log(data.length);
                           console.log(count);

                      
                    } else {
                        res.status(201).send({ status_code: 201, message: 'No Data found' });
                        this.apiInstance.log(201, 'No Data found -' + type, 'getMinutePlan', 'pbx', '', '', '');
                    }
                }
            }).catch((err) => {
                errorLog(err);
                res.status(400).send({
                    status_code: 400,
                    message: 'Bad Request'
                });
                this.apiInstance.log(400, 'Bad Request.', 'getMinutePlan', 'pbx', '', req.ext_number, JSON.stringify(data));
                throw err
            });
        }else {
            this.apiInstance.log(403,'Forbidden - User has no permission for perform this action.','getMinutePlan','pbx','', '','');  
            res.status(403).send({ status_code: 403, error: 'Forbidden', message: 'User has no permission for perform this action' }); 
         }
    }

    /**
    *
    * @param req
    * @param res
    * @param next
    */

     public getCallPlan(req, res, next, type) {
         let isAdmin = req.user_type ? req.user_type : 1;
         if (isAdmin == '0') {
             knex.raw("Call pbx_get_callplan(" + null + "," + null + ")")
                 .then((response) => {
                     if (response.length) {
                         res.json({
                             status_code: 200,
                             message: 'Call Plan Listing.',
                             data: response[0][0]
                         });
                         this.apiInstance.log(200, 'Call Plan Listing Info.', 'getCallPlan', type, '', '');
                     } else {
                         res.status(201).send({ status_code: 201, message: 'No Data found' });
                         this.apiInstance.log(201, 'No Data found.', 'getCallPlan', type, '', '', '');
                     }
                 }).catch((err) => {
                     errorLog(err);
                     res.status(400).send({
                         status_code: 400,
                         message: 'Bad Request'
                     });
                     this.apiInstance.log(400, 'Bad Request: ' + err.sqlMessage, 'getCallPlan', type, '', '', '');
                     throw err;
                 });
         } else {
             this.apiInstance.log(403, 'Forbidden - User has no permission for perform this action.', 'getCallPlan', type, '', '', '');
             res.status(403).send({ status_code: 403, error: 'Forbidden', message: 'User has no permission for perform this action' });
         }
     }

     /**
 *
 * @param req
 * @param res
 * @param next
 */

     public getCallPlanRates(req, res, next, type) {
         let isAdmin = req.user_type ? req.user_type : 1;
         if (!req.query.plan_type) {  // First Name
             this.apiInstance.log(402, 'Parameter Missing - plan_type in URL.', 'getCallPlanRates', type, '', req.ext_number, '');
             return res.status(402).send({ status_code: 402, error: 'Parameter Missing in URL', message: 'Please enter the plan_type in url' });
         }
         if (isAdmin == '0') {
             let planType = req.query.plan_type ? req.query.plan_type : 5;
             if (planType == MinutePlanTypeConstants.STANDARD || planType == MinutePlanTypeConstants.BUNDLE || planType == MinutePlanTypeConstants.ROAMING || planType == MinutePlanTypeConstants.BOOSTER || planType == MinutePlanTypeConstants.TELECONSULTANCY) {
                 knex.raw("Call pbx_getCallPlanRateByFilters(" + null + "," + null + "," + null + "," + null + ", " + null + ", " + planType + ")")
                     .then((response) => {
                         if (response.length) {
                             res.json({
                                 status_code: 200,
                                 message: 'Call Plan Rate Listing.',
                                 data: response[0][0]
                             });
                             this.apiInstance.log(200, 'Call Plan Rate Listing Info.', 'getCallPlanRates', type, '', '');
                         } else {
                             res.status(201).send({ status_code: 201, message: 'No Data found' });
                             this.apiInstance.log(201, 'No Data found.', 'getCallPlanRates', type, '', '', '');
                         }
                     }).catch((err) => {
                         errorLog(err);
                         res.status(400).send({
                             status_code: 400,
                             message: 'Bad Request'
                         });
                         this.apiInstance.log(400, 'Bad Request: ' + err.sqlMessage, 'getCallPlanRates', type, '', '', '');
                         throw err;
                     });
             } else {
                 this.apiInstance.log(406, 'Unauthorize Type - Parameter plan_type is incorrect.', 'getCallPlanRates', 'pbx', '', '', JSON.stringify(req.query));
                 return res.status(406).send({ status_code: 406, error: 'Parameter Type is incorrect', message: 'Please enter the correct plan_type' });
             }

         } else {
             this.apiInstance.log(403, 'Forbidden - User has no permission for perform this action.', 'getCallPlanRates', type, '', '', '');
             res.status(403).send({ status_code: 403, error: 'Forbidden', message: 'User has no permission for perform this action' });
         }
     }

     /**
          *
          * @param req
          * @param res
          * @param next
          */

     public async callPlanCreation(req, res, next) {
         var data = req.body;
         let validatename;
         if (!data.name) {  //  Name
             this.apiInstance.log(402, 'Parameter Missing - name.', 'callPlanCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
             return res.status(402).send({ status_code: 402, error: 'Parameter Missing', message: 'Please enter the name' });
         }
         validatename = await this.validationInstance.validateCallPlanName(data.name);
         if(validatename == false){
            this.apiInstance.log(402, 'Call Plan Exist..', 'callPlanCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
            return res.status(402).send({ status_code: 402, error: 'Invalid Parameter.', message: 'call plan already exist.' });
         }

         if (!data.lctype) {  //  type
             this.apiInstance.log(402, 'Parameter Missing - lctype.', 'callPlanCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
             return res.status(402).send({ status_code: 402, error: 'Parameter Missing', message: 'Please enter the lctype' });
         }
         if (data.lctype != '1' && data.lctype != '2') {  // First Name
             this.apiInstance.log(402, 'LC Type should be either 1 or 0.', 'callPlanCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
             return res.status(402).send({ status_code: 402, error: 'lctype value.', message: 'LC Type should be either 1 or 0.' });
         }

         if (data.iscircle && data.isminuteplan) {  // Both not allowed
             this.apiInstance.log(405, 'Both functionality Circle and Minuteplan are not allowed together.', 'callPlanCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
             return res.status(405).send({ status_code: 405, error: 'Not allowed : iscircle,isminuteplan', message: 'Both functionality Circle and Minuteplan are not allowed together' });
         }

         if (data.iscircle) {  // billing Type
             if (typeof (data.iscircle) != "number") {  // iscircle
                 this.apiInstance.log(402, 'Only Number allowed.', 'callPlanCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
                 return res.status(402).send({ status_code: 402, error: 'Only Number allowed.', message: 'Please provide the correct iscircle.' });
             }
             if (data.iscircle != 1 && data.iscircle != 0) {  // First Name
                 this.apiInstance.log(402, 'Is Circle  should be either 1 or 0.', 'callPlanCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
                 return res.status(402).send({ status_code: 402, error: 'iscircle value.', message: 'Is Circle should be either 1 or 0.' });
             }
             if (!data.circleid) {  //circleid
                 this.apiInstance.log(402, 'Parameter Missing - circleid.', 'callPlanCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
                 return res.status(402).send({ status_code: 402, error: 'Parameter Missing', message: 'Please enter the circleid' });
             }
         }
         if (data.circleid) {  // circleid validate
             if (typeof (data.circleid) != "number") {  // circleid
                 this.apiInstance.log(402, 'Only Number allowed.', 'callPlanCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
                 return res.status(402).send({ status_code: 402, error: 'Only Number allowed.', message: 'Please provide the correct circleid.' });
             }
             let isCirclepackageIdVerified = await this.validationInstance.validateCircleExist(data['circleid']);
             if (isCirclepackageIdVerified) {
                 this.apiInstance.log(402, 'Circle id does not exist.', 'callPlanCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
                 return res.status(402).send({ error: 'Wrong circle id', message: 'circleid does not exist.' });
             }
         }

         if (data.isminuteplan) {  // Minute Plan Type
             if (typeof (data.isminuteplan) != "number") {  // iscircle
                 this.apiInstance.log(402, 'Only Number allowed.', 'callPlanCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
                 return res.status(402).send({ status_code: 402, error: 'Only Number allowed.', message: 'Please provide the correct iscircle.' });
             }
             if (data.isminuteplan != 1 && data.isminuteplan != 0) {  // First Name
                 this.apiInstance.log(402, 'Is Circle  should be either 1 or 0.', 'callPlanCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
                 return res.status(402).send({ status_code: 402, error: 'iscircle value.', message: 'Is Circle should be either 1 or 0.' });
             }
             if (!data.minuteplantype) {  //circleid
                 this.apiInstance.log(402, 'Parameter Missing - minuteplantype.', 'callPlanCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
                 return res.status(402).send({ status_code: 402, error: 'Parameter Missing', message: 'Please enter the minuteplantype' });
             }
         }


         if (data.minuteplantype) {  // circleid validate
             if (typeof (data.minuteplantype) != "number") {  // circleid
                 this.apiInstance.log(402, 'Only Number allowed.', 'callPlanCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
                 return res.status(402).send({ status_code: 402, error: 'Only Number allowed.', message: 'Please provide the correct minuteplantype.' });
             }
             if (data.minuteplantype != 1 && data.minuteplantype != 2 && data.minuteplantype != 3 && data.minuteplantype != 4) {  // First Name
                 this.apiInstance.log(402, 'Minute Plan Type should be 1,2,3,4', 'callPlanCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
                 return res.status(402).send({ status_code: 402, error: 'iscircle value.', message: 'Minute Plan Type should be 1,2,3,4' });
             }
             if (data.minuteplantype == 3) {  // If Booster
                 if (!data.isvisiblecustomer) {  //  Name
                     this.apiInstance.log(402, 'Parameter Missing - isvisiblecustomer.', 'callPlanCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
                     return res.status(402).send({ status_code: 402, error: 'Parameter Missing', message: 'Please enter the isvisiblecustomer' });
                 }
                 if (typeof (data.isvisiblecustomer) != "number") {  // circleid
                     this.apiInstance.log(402, 'Only Number allowed.', 'callPlanCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
                     return res.status(402).send({ status_code: 402, error: 'Only Number allowed.', message: 'Please provide the correct isvisiblecustomer.' });
                 }
                 if (data.isvisiblecustomer != 1 && data.isvisiblecustomer != 0) {  // First Name
                     this.apiInstance.log(402, 'Is Visible Customer  should be either 1 or 0.', 'callPlanCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
                     return res.status(402).send({ status_code: 402, error: 'isvisiblecustomer value.', message: 'Is Visible Customer should be either 1 or 0.' });
                 }
             }
         }



         let isAdmin = req.user_type ? req.user_type : 1;
         if (isAdmin == '0') {
             let request = req.body;
             let id = request.id ? request.id : null;
             let url = req.protocol + '://' + req.get('host');
             let userTypeVal = '';
             let permission_id = '';
             //---------------- Some default value need to assign -----------------------
             request.user_type = '1';
             request.iscircle = request.iscircle ? request.iscircle : 0;
             request.circleid = request.circleid ? request.circleid : '';
             request.isMinutePlan = request.isMinutePlan ? request.isMinutePlan : 0;
             request.minuteplantype = request.minuteplantype ? request.minuteplantype : '';
             request.isvisiblecustomer = request.isvisiblecustomer ? request.isvisiblecustomer : 0;

             console.log(knex.raw("Call pbx_save_callplan(" + id + ",'" + request.name + "','" + request.lctype + "','" + request.iscircle + "','" + request.circleid + "','" + request.isMinutePlan + "','" + request.minuteplantype + "','" + request.isvisiblecustomer + "'," + "'1')").toString());
             knex.raw("Call pbx_save_callplan(" + id + ",'" + request.name + "','" + request.lctype + "','" + request.iscircle + "','" + request.circleid + "','" + request.isMinutePlan + "','" + request.minuteplantype + "','" + request.isvisiblecustomer + "'," + "'1')")
                 .then((response) => {
                     this.apiInstance.log(200, 'Call Plan created succesfully', 'callPlanCreation', 'pbx', '', req.ext_number, '');
                     res.send({
                         status_code: 200,
                         message: 'Call Plan created succesfully.',
                     });

                 }).catch((err) => {
                     errorLog(err);
                     res.status(400).send({
                         status_code: 400,
                         message: 'Bad Request :' + err
                     });
                     this.apiInstance.log(400, 'Bad Request : ' + err, 'callPlanCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
                     throw err
                 });
         } else {
             this.apiInstance.log(403, 'Forbidden - User has no permission for perform this action.', 'callPlanCreation', 'pbx', '', '', '');
             res.status(403).send({ status_code: 403, error: 'Forbidden', message: 'User has no permission for perform this action' });
         }
     }

     
     /**
          *
          * @param req
          * @param res
          * @param next
          */

      public async providerCreation(req, res, next) {
        var data = req.body;
        let isAdmin = req.user_type ? req.user_type : 1;

        if (!data.name) {  //  Name
            this.apiInstance.log(402, 'Parameter Missing - name.', 'providerCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
            return res.status(402).send({ status_code: 402, error: 'Parameter Missing', message: 'Please enter the name' });
        }
        if (data.name) {  // companyName validate
            let isnameVerified = await this.validationInstance.validateProviderExist(data['name']);
            console.log(isnameVerified,'isnameVerified');
            if (isnameVerified == false) {
                this.apiInstance.log(402, 'Provider Name already exist.', 'providerCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
                return res.status(402).send({ error: 'Wrong Name', message: 'Provider Name already exist.' });
            }
        }

        if (isAdmin == '0') {
            let request = req.body;
            let id = request.id ? request.id : null;
            knex(Table.tbl_Provider).insert({
                provider: "" + data.name + ""
            }).then((response) => {
                    this.apiInstance.log(200, 'Provider created succesfully', 'providerCreation', 'pbx', '', req.ext_number, '');
                    res.send({
                        status_code: 200,
                        message: 'Provider created succesfully.',
                    });

                }).catch((err) => {
                    errorLog(err);
                    res.status(400).send({
                        status_code: 400,
                        message: 'Bad Request :' + err
                    });
                    this.apiInstance.log(400, 'Bad Request : ' + err, 'providerCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
                    throw err
                });
        } else {
            this.apiInstance.log(403, 'Forbidden - User has no permission for perform this action.', 'providerCreation', 'pbx', '', '', '');
            res.status(403).send({ status_code: 403, error: 'Forbidden', message: 'User has no permission for perform this action' });
        }
    }



// Developed by Yash kashyap.
    /**
     * @param req
     * @param res
     * @param next
     */

    public async getProvider(req,res,next){
        let isAdmin = req.admin ? req.admin : 1;
        console.log(isAdmin);
        
        if(isAdmin == 0){
            let sql = knex(Table.tbl_Provider).select('*');
            sql.then((response) =>{
                if(response.length){
                    this.apiInstance.log(200, 'Get Provider.','','',req.admin);
                    res.status(200).send({ status_code : 200, message : "Provider data listing.",data : response})
                }else{
                    this.apiInstance.log(201, "No data found.", '', '', 'Get Provider.');
                    res.status(201).send({ status_code : 201, error : 'No data found.'});
                }
            }).catch((err) => {
                errorLog(err);
                res.status(400).send({
                    status_code: 400,
                    message: 'Bad Request.'
            });
        });
        }
    }



/**
 * @param req 
 * @param res 
 * @param next 
 */

    public async CreateCallRate(req,res,next){
        let isAdmin = req['user_type'];
        let data = req.body;
        let validateCallPlan;
        let validategroup;
        if(!data.plan_type){
            this.apiInstance.log(402,'Parameter-Missing.','call rate plan creation.');
            return res.status(402).send({status_code : 402, error : 'Parameter-Missing.', message : 'please provide plan type.'});
        }
        if(data.plan_type != 0 && data.plan_type != 1 && data.plan_type != 2 && data.plan_type != 3 && data.plan_type != 4){
            this.apiInstance.log(402,'Invalid value.','call rate plan creation.');
            return res.status(402).send({status_code : 402, error : 'Invalid value.', message : ' plan type should be 0, 1, 2, 3 & 4'});
        }
        if(!data.call_plan){
            this.apiInstance.log(402,'Parameter-Missing.','call rate plan creation.');
            return res.status(402).send({status_code : 402, error : 'Parameter-Missing.', message : 'please provide call plan.'})
        } 
        if(data.area_code){
            if((data.area_code).toString().length > 5){
                this.apiInstance.log(402,'Invalid length.','call rate plan creation.');
                return res.status(402).send({status_code : 402, error : 'length excced.', message : 'please provide valid length of number.'});
            }
            if(typeof(data.area_code) == "string"){
                this.apiInstance.log(402,'Type Missmatch.','call rate plan creation.');
                return res.status(402).send({status_code : 402, error : 'Type Missmatch.', message : 'provide only string value.'});
            }
        }
        if(!data.buying_rate){
            this.apiInstance.log(402,'Parameter-Missing.','call rate plan creation.');
            return res.status(402).send({status_code : 402, error : 'Parameter-Missing.', message : 'please provide buying rate.'})
        }
        if((data.buying_rate).toString().length > 5){
            this.apiInstance.log(402,'Invalid length.','call rate plan creation.');
            return res.status(402).send({status_code : 402, error : 'length excced.', message : 'please provide valid length of number.'});
        }
        if(typeof(data.buying_rate) == "string"){
            this.apiInstance.log(402,'Type Missmatch.','call rate plan creation.');
            return res.status(402).send({status_code : 402, error : 'Type Missmatch.', message : 'provide only number value.'});
        }
        if(!data.selling_rate){
            this.apiInstance.log(402,'Parameter-Missing.','call rate plan creation.');
            return res.status(402).send({status_code : 402, error : 'Parameter-Missing.', message : 'please provide selling rate.'})
        }
        if((data.selling_rate).toString().length > 5){
            this.apiInstance.log(402,'Invalid length.','call rate plan creation.');
            return res.status(402).send({status_code : 402, error : 'length excced.', message : 'please provide valid length of number.'});
        }
        if(typeof(data.selling_rate) == "string"){
            this.apiInstance.log(402,'Type Missmatch.','call rate plan creation.');
            return res.status(402).send({status_code : 402, error : 'Type Missmatch.', message : 'provide only number value.'});
        }
        if(data.buying_rate > data.selling_rate){
            this.apiInstance.log(402,'Invalid data.','call rate plan creation.');
            return res.status(402).send({status_code : 402, error : 'Invalid data.', message : 'Selling rate should be greater than Buying.'});
        }
        if(data.selling_billing){
            if((data.selling_billing).toString().length > 3){
                this.apiInstance.log(402,'Invalid length.','call rate plan creation.');
                return res.status(402).send({status_code : 402, error : 'length excced.', message : 'please provide valid length of number.'});
            }
            if(typeof(data.selling_billing) == "string"){
                this.apiInstance.log(402,'Type Missmatch.','call rate plan creation.');
                return res.status(402).send({status_code : 402, error : 'Type Missmatch.', message : 'provide only number value.'});
            }
        }
        if(data.selling_min_duration){
            if((data.selling_min_duration).toString().length > 2){
                this.apiInstance.log(402,'Invalid length.','call rate plan creation.');
                return res.status(402).send({status_code : 402, error : 'length excced.', message : 'please provide valid length of number.'});
            }
            if(typeof(data.selling_min_duration) == "string"){
                this.apiInstance.log(402,'Type Missmatch.','call rate plan creation.');
                return res.status(402).send({status_code : 402, error : 'Type Missmatch.', message : 'provide only number value.'});
            }
            if(data.selling_min_duration > 60){
                this.apiInstance.log(402,'Invalid value','call rate plan creation.');
                return res.status(402).send({status_code : 402, error : 'Invalid value.', message : 'selling minimun duration can not be greater from selling billing.'});
            }
        }
        if(!data.dial_prefix){
            this.apiInstance.log(402,'Parameter-Missing.','call rate plan creation.');
            return res.status(402).send({status_code : 402, error : 'Parameter-Missing.', message : 'please provide dial prefix.'})
        }
        if(typeof(data.dial_prefix) == "string"){
            this.apiInstance.log(402,'Invalid data.','call rate plan creation.');
            return res.status(402).send({status_code : 402, error : 'Invalid type.', message : 'dial prefix con not be string.'});
        }
        let getCountry;
        getCountry = await this.validationInstance.getCountry(data.dial_prefix);
        if(getCountry == false){
            this.apiInstance.log(402,'Invalid dial prefix.','call rate plan creation.');
            return res.status(402).send({status_code : 402, error : 'invalid dial prefix.', message : 'country id does not exist for this dial prefix.'});
        }
        if(!data.gateway){
            this.apiInstance.log(402,'Parameter-Missing.','create call rate plan.');
            return res.status(402).send({status_code : 402, error : 'Parameter-Missing.', message : 'please provide gateway.'})
        }
        let getGateway;
        getGateway = await this.validationInstance.validateGateway(data.gateway);
        if(getGateway == false){
            this.apiInstance.log(402,'Invalid gateway.','call rate plan creation.');
            return res.status(402).send({status_code : 402, error : 'invalid dial prefix.', message : 'gateway does not exist.'});
        }
        // console.log(getCountry,"-----------country 1-------------------------------------------");        
        if(data.plan_type == "0"){
            if(data.group){
                this.apiInstance.log(402,'Invalid Parameter.','call rate plan creation.');
                return res.status(402).send({status_code : 402, error : 'Invalid Parameter.', message : 'group does not applicable on standard.'})
            }
            let type = "";
            validateCallPlan = await this.validationInstance.validatePlanType(type,data.call_plan);
            // console.log(validateCallPlan,"------------call plan validaet=--------------------------------------------------");            
            if(validateCallPlan == false){
                this.apiInstance.log(402,'Invalid call plan','call rate plan creation.');
                return res.status(402).send({status_code : 402, error : 'invalid call plan', message : 'call plan does not exist.'});
            }
        }
        // console.log(validateCallPlan,"============validate=============================");        
        if(data.plan_type == 1  || data.plan_type == 2 || data.plan_type == 4){
            if(data.area_code){
                this.apiInstance.log(402,'Parameter Exceed.','call rate plan creation.');
                return res.status(402).send({status_code : 402, error : 'Parameter exceeds.', message : 'area code not acceptable for bundle.'});
            }
            if(data.selling_billing){
                this.apiInstance.log(402,'Parameter Exceed.','call rate plan creation.');
                return res.status(402).send({status_code : 402, error : 'Parameter exceeds.', message : 'selling billing not acceptable for bundle.'});
            }
            if(data.selling_min_duration){
                this.apiInstance.log(402,'Parameter Exceed.','call rate plan creation.');
                return res.status(402).send({status_code : 402, error : 'Parameter exceeds.', message : 'selling minimum duration not acceptable for bundle.'});
            }
            if(!data.group){
                this.apiInstance.log(402,'Parameter-Missing.','create call rate plan.');
                return res.status(402).send({status_code : 402, error : 'Parameter-Missing.', message : 'please provide group.'});
            }
            if(data.group != "0" && data.group != "1"){
                this.apiInstance.log(402,'Invalid value.','call rate plan creation.');
                return res.status(402).send({status_code : 402, error : 'Invalid value.', message : 'group should be either 0 or 1'});
            }
            if(data.group == 1){                    
                if(!data.group_id){
                    this.apiInstance.log(402,'Parameter-Missing.','create call rate plan.');
                    return res.status(402).send({status_code : 402, error : 'Parameter-Missing.', message : 'please provide group id.'})
                }
                if(typeof(data.group_id) == "string"){
                    this.apiInstance.log(402,'Invalid value.','create call rate plan.');
                    return res.status(402).send({status_code : 402, error : 'Invalid value.', message : 'group name can not accept number'});
                }
                validategroup = await this.validationInstance.validateGroup(data.group_id);
                if(validategroup == false){
                    this.apiInstance.log(402,'Invalid group.','call rate plan creation.');
                    return res.status(402).send({status_code : 402, error : 'Invalid group.', message : 'group not exist.'});
                }
                data.talktime_minutes = validategroup;        
            }
            // }           
            validateCallPlan = await this.validationInstance.validatePlanType(data.plan_type,data.call_plan);   
            if(validateCallPlan == false){
                this.apiInstance.log(402,'Invalid call plan','call rate plan creation.');
                return res.status(402).send({status_code : 402, error : 'invalid call plan', message : 'call plan does not exist for bundle.'});
            }
        }
        if(data.plan_type == 3){
            if(!data.booster){
                this.apiInstance.log(402,'Parameter-Missing.','create call rate plan.');
                return res.status(402).send({status_code : 402, error : 'Parameter-Missing.', message : 'please provide booster.'});
            }
            if(data.booster != 1 && data.booster != 2 && data.booster != 4){
                this.apiInstance.log(402,'Invalid value.','call rate plan creation.');
                return res.status(402).send({status_code : 402, error : 'Invalid value.', message : 'booster should be 1 2 & 4'});
            }
                if(data.talktime_minutes){
                    if(typeof(data.talktime_minutes) == "string"){
                        this.apiInstance.log(402,'Type Missmatch.','call rate plan creation.');
                        return res.status(402).send({status_code : 402, error : 'Type Missmatch.', message : 'provide only number value.'});
                    }
                }
        }
        data.selling_min_duration = data.selling_min_duration ? data.selling_min_duration : 0;
        data.selling_billing = data.selling_billing ? data.selling_billing : 60;
        data.status = data.status ? data.status : '0';
        data.area_code = data.area_code ? data.area_code : ''
        data.booster = data.booster ? data.booster : '';
        data.talktime_minutes = data.talktime_minutes ? data.talktime_minutes : '0';

        if(isAdmin == '0'){
        let sql = knex(Table.tbl_Call_Plan_Rates)
        .insert({call_plan_id : validateCallPlan , dial_prefix : `+${data.dial_prefix}`, buying_rate : ""+ data.buying_rate +"", selling_rate : ""+ data.selling +"",
                selling_min_duration : ""+ data.selling_min_duration +"", selling_billing_block : ""+ data.selling_billing +"", status : ""+ data.status +"", 
                gateway_id : ""+ getGateway +"", phonecode : ""+ getCountry +"", area_code : ""+ data.area_code +"", is_group : ""+ data.group +"",
                group_id : ""+ data.group_id +"", talktime_minutes : ""+ data.talktime_minutes +"", used_minutes : ""+ "0" +"", actual_minutes : ""+ data.talktime_minutes +"",
                booster_minutes : ""+ "0" +"", plan_type : ""+ data.plan_type +"", booster_for : ""+ data.booster +""});
        sql .then((resp)=>{
                // console.log(resp,"----resp------------");  
            if(resp){
                this.apiInstance.log(200,'call rate plan created succesfully.','call rate plan creation.');
                return res.status(200).send({status_code : 200 , message : 'call plan rate created succesfully.'});
            }else{
                this.apiInstance.log(400,'Bad Request.','call rate plan creation.');
                return res.status(400).send({status_code : 400 , error : 'Bad Request.'});
            }
        });
    }
    }
}