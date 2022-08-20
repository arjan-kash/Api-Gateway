/**
 * @file
 *
 * This is a PackageService controller of private api urls. Can be accessed after success login. These urls need authentication.
 *
 * @author Nagender Pratap Chauhan on 29/10/21.
 */

 import { errorLog, infoLog } from '../utils/logger.util';
 import { Table } from '../dba/table';
 import { ApiLogs } from '../utils/api-logs';
 import  { Validation } from '../utils/validation.util';
 var knex = require('../dba/knex.db');

 export class PackageService {
     public apiInstance = new ApiLogs();
     public validateInstance = new Validation();


     /**
      * @param req 
      * @param res
      * @param next
      */

     public PackageCreation(req,res,next){
        let isAdmin = req['user_type'];
        let data = req.body;
        if (!data.product) {
            this.apiInstance.log(402,'Parameter Missing In Params - product type.','create Package.', '',''); 
            return res.status(402).send({ status_code: 402, error: 'Parameter Missing', message: 'Please enter the product type in parameter' });
        }
        if(data.product != 1 && data.product != 2){
            this.apiInstance.log(402,'Invalid value. - product type.','create Package.', '',''); 
            return res.status(402).send({ status_code: 402, error: 'Invalid value.', message: 'product id should be either 0 or 1' });
        }
        if(data.product == 1){    
            if (!data.package_name){
                this.apiInstance.log(402,'Parameter Missing In Params - product type.','create Package.', '',''); 
                return res.status(402).send({ status_code: 402, error: 'Parameter Missing', message: 'Please enter the package id in parameter' });
            }        
            // let validatePackage = this.validateInstance.validatePackageExist(data.id,data.package_name);
            // if(validatePackage == false){
            //     this.apiInstance.log(400,'Package already exist.','create Package.', '',''); 
            //     return res.status(400).send({ status_code: 402, error: 'Duplicate Package.', message: 'package id already exist.' });
            // }
            if(data.concurrent_call){
                if((data.concurrent_call).toString().length > 3){
                    this.apiInstance.log(400,'Invalid length.','create Package.', '',''); 
                    return res.status(400).send({ status_code: 402, error: 'length exceed.', message: 'Concurrents call max length is 3 character long.' });
                }
                if(typeof(data.concurrent_call ) != "number"){
                    this.apiInstance.log(400,'Type-Missmatch.','create Package.', '',''); 
                    return res.status(400).send({ status_code: 402, error: 'Type-Missmatch.', message: 'concurrent call can not be sring.' });
                }                
            }
            
            if(!data.phone_book){
                this.apiInstance.log(402,'Parameter Missing In Params - product type.','create Package.', '',''); 
                return res.status(402).send({ status_code: 402, error: 'Parameter Missing', message: 'Please enter the phone book in parameter' });
            }
            if(((data.phone_book).toString()).length > 3){
                this.apiInstance.log(402, 'phone book length can not be greater from phone book', 'packageupdate', JSON.stringify(data));
                return res.status(402).send({status_code:402, error:'invalid length.', message:'phone book length should be less than 4.'})
            }
            if(typeof(data.phone_book) != "number"){
                this.apiInstance.log(402, 'phone number should be number' , 'packageupdate',JSON.stringify(data));
                return res.status(402).send({status_code:402, error:'invalid value.', message:'phone book should be number.'});
            }
            if(data.phone_book < 50){
                this.apiInstance.log(402, 'phone book can not be less than 50', 'packageupdate', JSON.stringify(data));
                return res.status(402).send({status_code:402, error:'invalid length.', message:'phone book can not be less than 50'})
            }

            if(data.extension_limit){
                if(typeof(data.extension_limit) != "number"){
                    this.apiInstance.log(402, 'extension limit should be number' , 'packageupdate',JSON.stringify(data));
                    return res.status(402).send({status_code:402, error:'invalid value.', message:'extension limit should be number.'});
                }
                if((data.extension_limit).toString().length > 4){
                    this.apiInstance.log(402, 'extension limit length can not be greater 4', 'packageupdate', JSON.stringify(data));
                    return res.status(402).send({status_code:402, error:'invalid length.', message:'extension limit length can not be greater 4'})
                }
            }

            if(data.minute_plan){
                if(data.minute_plan != 1 && data.minute_plan != 0){
                    this.apiInstance.log(402,'Minute plan should be either 0 or 1.','','',JSON.stringify(data));
                    return res.status(402).send({status_code:402,error:"invalid parameter",message:"Minute plan should be either 0 or 1"})
                }
                if(data.minute_plan == 1){
                    if(!data.bundle && (!data.roaming) && (!data.teleConsultancy)){
                        this.apiInstance.log(402, 'please choose atleast one from bundle, roaming, teleconsulatat.' , 'packageupdate',JSON.stringify(data));
                        return res.status(402).send({status_code:402, error:'invalid value.', message:'please choose atleast one from bundle, roaming, teleconsulatat.'});
                    }
                    if(data.bundle){
                        if(data.bundle != 1 && data.bundle != 0){
                            this.apiInstance.log(402,'bundle plan should be either 0 or 1.','','',JSON.stringify(data));
                            return res.status(402).send({status_code:402,error:"invalid parameter",message:"bundle plan should be either 0 or 1"})
                        }
                        if(data.bundle == 1){
                            if(!data.bundle_plan_id){
                                this.apiInstance.log(402,'please provide bundle plan id.','','',JSON.stringify(data));
                                return res.status(402).send({status_code:402, error:"Missing Parameter.", message:"please provide bundle plan id."})
                            }
                            if(typeof(data.bundle_plan_id) != 'number'){
                                this.apiInstance.log(402,'bundle plan id should be number.','','',JSON.stringify(data));
                                return res.status(402).send({status_code:402,error:"invalid value.",message:'bundle plan id should be number.'})
                            }
                            let validateBundle = this.validateInstance.validateBundle(1);
                            let count=0;
                            // console.log(validateBundle[0]['id'],"-----------bundle----------",validateBundle.length);
                            for(let a=0; a<validateBundle.length; a++){
                                if(validateBundle[a].id != data.bundle_plan_id){
                                    count++;
                                }else{
                                    count=0;
                                    break;
                                }
                            }
                            if(count != 0){
                                this.apiInstance.log(400,'bundle plan id does not match.','','',JSON.stringify(data));
                                return res.status(402).send({status_code:402, error:'Invallid data.',message:'Please provide valid bundle call plan id.'}) 
                            }
                        }
                    }
                    if(data.roaming){
                        if(data.roaming != 1 && data.roaming != 0){
                            this.apiInstance.log(402,'roaming plan should be either 0 or 1.','','',JSON.stringify(data));
                            return res.status(402).send({status_code:402, error:"invalid parameter",message:"roaming plan should be either 0 or 1"})
                        }
                        if(data.roaming == 1){
                            if(!data.roaming_plan_id){
                                this.apiInstance.log(402,'please provide roaming plan id.','','',JSON.stringify(data));
                                return res.status(402).send({status_code:402, error:"Missing-Parameter.", message:"please provide roaming plan id."})
                            }
                            if(typeof(data.roaming_plan_id) != 'number'){
                                this.apiInstance.log(402,'roaming plan id should be number.','','',JSON.stringify(data));
                                return res.status(402).send({status_code:402, error:"invalid value.",message:'roaming plan id should be number.'})
                            }
                            let validateRoaming = this.validateInstance.validateBundle(2);
                            let count=0;
                            // console.log(validateRoaming[0]['id'],"-----------roaming----------",validateRoaming.length);
                            for(let a=0; a<validateRoaming.length; a++){
                                if(validateRoaming[a].id != data.roaming_plan_id){
                                    count++;
                                }else{
                                    count=0;
                                    break;
                                }
                            }
                            if(count != 0){
                                this.apiInstance.log(400,'roaming plan id does not match.','','',JSON.stringify(data));
                                return res.status(402).send({status_code:402, error:'Invalid data.',message:'Please provide valid roaming call plan id.'}) 
                            }
                        }
                    }
                    if(data.teleConsultancy){    
                        if(data.teleConsultancy != 1 && data.teleConsultancy != 0){
                            this.apiInstance.log(402,'teleConsultancy should be either 0 or 1.','','',JSON.stringify(data));
                            return res.status(402).send({status_code:402, error:"invalid parameter",message:"teleConsultancy should be either 0 or 1"})
                        }
                        if(data.teleConsultancy == 1){
                            if(!data.teleConsultancy_call_plan_id){
                                this.apiInstance.log(402,'please provide teleConsultancy plan id.','','',JSON.stringify(data));
                                return res.status(402).send({status_code:402, error:"Missing-Parameter.", message:"please provide teleConsultancy plan id."})
                            }   
                            if(typeof(data.teleConsultancy_call_plan_id) != 'number'){
                                this.apiInstance.log(402,'teleConsultancy plan id should be number.','','',JSON.stringify(data));
                                return res.status(402).send({status_code:402, error:"invalid value.",message:'teleConsultancy plan id should be number.'})
                            }   
                            let validateTeleConsultancy = this.validateInstance.validateBundle(4);
                            let count=0;
                            // console.log(validateTeleConsultancy[0]['id'],"-----------teleConsultancy----------",validateTeleConsultancy.length);
                            for(let a=0; a<validateTeleConsultancy.length; a++){
                                if(validateTeleConsultancy[a].id != data.teleConsultancy_call_plan_id){
                                    count++;
                                }else{
                                    count=0;
                                    break;
                                }
                            }
                            if(count != 0){
                                this.apiInstance.log(400,' plan id does not match.','','',JSON.stringify(data));
                                return res.status(402).send({status_code:402, error:'Invalid data.',message:'Please provide valid teleConsultancy call plan id.'}) 
                            }   
                        }
                    }
                }
            }

            if(data.sms){
                if(data.sms != 1 && data.sms != 0){
                    this.apiInstance.log(402,'sms should be either 0 or 1.','','',JSON.stringify(data));
                    return res.status(402).send({status_code:402, error:"invalid parameter",message:"sms should be either 0 or 1"})
                }
                if(data.sms == 1){
                    if(!data.sms_id){
                        this.apiInstance.log(402, 'please provide sms id based on circle.' , 'create Package.',JSON.stringify(data));
                        return res.status(402).send({status_code:402, error:'Invalid value.', message:'please provide sms id based on circle.'});
                    }
                    let validateEmail = this.validateInstance.ValidateSmsExist(data.sms_id);
                    if(validateEmail == false){
                        this.apiInstance.log(400, 'Invalid sms id.' , 'create Package.',JSON.stringify(data));
                        return res.status(400).send({status_code:400, error:'Invalid sms.', message:'please provide valid sms id.'});
                    }
                }
            }

            if(data.outbound){
                if(data.outbound != 1 && data.outbound != 0){
                    this.apiInstance.log(402,'outbound should be either 0 or 1.','','',JSON.stringify(data));
                    return res.status(402).send({status_code:402, error:"invalid parameter",message:"outbound should be either 0 or 1"});
                }
                if(data.outbound == 1){
                    if(data.outbound == 1 && !data.circle){                
                        let validateCallPlan;
                        if(!data.call_plan_id){
                            this.apiInstance.log(402, 'please provide call plan id.' , 'create Package.',JSON.stringify(data));
                            return res.status(402).send({status_code:402, error:'Invalid value.', message:'please provide call plan id.'});
                        }
                        validateCallPlan = this.validateInstance.validateCallPlanExist(data.call_plan_id);
                        // console.log(validateCallPlan,"--------call plan-----------");
                        if(validateCallPlan == ''){
                            this.apiInstance.log(402, 'please provide valid callplan id.' , 'create Package.',JSON.stringify(data));
                            return res.status(402).send({status_code:402, error:'Invalid value.', message:'please provide valid callplan id.'});
                        }     
                    }
                    if(data.circle){
                        if(data.circle != 1 && data.circle != 0){
                            this.apiInstance.log(402, 'circle should be either 0 or 1.' , 'create Package.',JSON.stringify(data));
                            return res.status(402).send({status_code:402, error:'Invalid value.', message:'circle should be either 0 or 1.'});
                        }                 
                        if(data.circle == 1 && data.outbound == 1){                
                            if(!data.circle_id){
                                this.apiInstance.log(402, 'please provide circle id.' , 'create Package.',JSON.stringify(data));
                                return res.status(402).send({status_code:402,error:'Missing Parameter.', message:'please provide the circle id.'});
                            }       
                            if(typeof(data.circle_id) != "number"){
                                this.apiInstance.log(402, 'circle id should be number.' , 'create Package.',JSON.stringify(data));
                                return res.status(402).send({status_code:402, error:'Invalid value.', message:'circle id should be number..'});
                            }
                            if(!data.call_plan_id){
                                this.apiInstance.log(402, 'please provide call plan id based on circle.' , 'create Package.',JSON.stringify(data));
                                return res.status(402).send({status_code:402, error:'Invalid value.', message:'please provide call plan id based on circle.'});
                            }   
                            if(typeof(data.call_plan_id) != "number"){
                                this.apiInstance.log(402, 'call plan id should be number.' , 'create Package.',JSON.stringify(data));
                                return res.status(402).send({status_code:402, error:'Invalid value.', message:'call plan id should be number..'});
                            }   
                            let validateCircle = this.validateInstance.validateCircleExist(data.circle_id);
                            if(validateCircle == true){
                                this.apiInstance.log(402, 'please provide valid circle id' , 'create Package.',JSON.stringify(data));
                                return res.status(402).send({status_code:402, error:'Invalid data.', message:'Please provide valid circle id.'});
                            }
                            let validateCallPlanBasedOnCircle = this.validateInstance.validateCallPlanBasedOnCircle(data.call_plan_id, data.circle_id);
                            if(validateCallPlanBasedOnCircle == false){
                                this.apiInstance.log(402, 'please provide valid circle id' , 'create Package.',JSON.stringify(data));
                                return res.status(402).send({status_code:402, error:'does not exist.', message:'call plan does not exist for circle.'});
                            }     
                        }
                    }
                }
            }

            if(data.feature){
                if(data.feature != 1){
                    this.apiInstance.log(402, 'feature should be only 1.' , 'packageupdate',JSON.stringify(data));
                    return res.status(402).send({status_code:402, error:'invalid value.', message:'feature should be number.'});  
                }
                if(typeof(data.feature_rate) != "number"){
                    this.apiInstance.log(402, 'only number allowed.' , 'packageupdate',JSON.stringify(data));
                    return res.status(402).send({status_code:402, error:'Inavlid Format', message:'please provide only number.'});  
                }
                let Isfeature = this.validateInstance.validateFeature(data['feature_rate'])
                if(Isfeature == false){
                    this.apiInstance.log(402, 'featureRate not valid.' , 'packageupdate',JSON.stringify(data));
                    return res.status(402).send({status_code:402, error:'Invalid data.', message:'Provide valid feature rate.'});  
                }
            }

            if(data.storage){
                // if(data.storage == 0){
                //     data.appointment = '0';
                //     data.broadcast = '0';
                //     data.ivr = '0'; 
                //     data.music_on_hold = '0';
                //     data.queue = '0';
                //     data.file_storage_duration = '0';
                //     data.file_storage_size = '0';
                //     data.recording = '0';
                //     data.custom_prompt = '0';                    
                // }
                if(data.storage == 1){
                    data.appointment = data.appointment ? data.appointment : '0';
                    data.broadcast = data.broadcast ? data.broadcast : '0';
                    data.ivr = data.ivr ? data.ivr : '0';
                    data.music_on_hold = data.music_on_hold ? data.music_on_hold : '0';
                    data.queue = data.queue ? data.queue : '0';
                    data.file_storage_duration = data.file_storage_duration ? data.file_storage_duration : 30;
                    data.file_storage_size = data.file_storage_size ? data.file_storage_size : 1;
                }
            }
        }
        data.concurrent_call = data.concurrent_call ? data.concurrent_call : 10;
        data.extension_limit = data.extension_limit ? data.extension_limit : 10;
        data.caller_id = data.caller_id ? data.caller_id : 0;
        data.call_barging = data.call_barging ? data.call_barging : 0;
        data.call_group = data.call_group ? data.call_group : 0;
        data.call_transfer = data.call_transfer ? data.call_transfer : 0;
        data.recording = data.recording ? data.recording : 0;
        data.click_to_call = data.click_to_call ? data.click_to_call : 0;
        data.conference = data.conference ? data.conference : 0;
        data.custom_acl = data.custom_acl ? data.custom_acl :0;
        data.feedback_call = data.feedback_call ? data.feedback_call : 0;
        data.find_me_follow_me = data.find_me_follow_me ? data.find_me_follow_me : 0;
        data.forwarding = data.forwarding ? data.forwarding : 0;
        data.geo_tracking = data.geo_tracking ? data.geo_tracking : 0;
        data.one_to_one_video_call = data.one_to_one_video_call ? data.one_to_one_video_call : 0;
        data.missed_call_alert = data.missed_call_alert ? data.missed_call_alert : 0;
        data.paging = data.paging ? data.paging : 0;
        data.playback = data.playback ? data.playback : 0;
        data.speed_dial = data.speed_dial ? data.speed_dial : 0;
        data.whatsapp = data.whatsapp ? data.whatsapp : 0;
        data.sticky_agent = data.sticky_agent ? data.sticky_agent : 0;
        data.circle_id = data.circle_id  ? data.circle_id : 0;
        data.feature_id = data.feature_id ? data.feature_id : 0;
        data.sms_id = data.sms_id ? data.sms_id : 0;

        let sql = knex(Table.tbl_Package).where('name',data.package_name).select('name');
        sql.then((response)=>{            
            if(response.length > 0){
                this.apiInstance.log(400,'package already exist.','','create Package.');
                return res.status(400).send({status_code : 400, error : 'Duplicate Package.', message : 'package already exist.'});
            }else{ 
                let sql0 = knex(Table.tbl_Features).insert({ black_list : ""+ 1 +"", voicemail : ""+ '1' +"", voicemail_limit : ""+ 10 +"", ivr : ""+ data.ivr +"",
                            call_transfer : ""+ data.call_transfer +"", forward : ""+ data.forwarding +"", concurrent_call : ""+ data.concurrent_call +"",
                            recording : ""+ data.recording +"", phone_book : ""+ data.phone_book +"", outbound_call : ""+ data.outbound +"", click_to_call : ""+ data.click_to_call +"",
                            music_on_hold : ""+ data.music_on_hold +"", paging : ""+ data.paging +"", speed_dial : ""+ data.speed_dial +"", ring_time_out : ""+ 60 +"",
                            conference : ""+ data.conference +"", call_group : ""+ data.call_group +"", barging : ""+ data.call_barging +"", extension_limit : ""+ data.extension_limit +"",
                            file_storage_duration : ""+ data.file_storage_duration +"", file_storage_type : ""+ '' +"", storage : ""+ data.storage +"", file_storage_size : ""+ data.file_storage_size +"",
                            custom_prompt : ""+ data.custom_prompt +"", queue : ""+ data.queue +"", gateway_group_id  :""+ '' + "", call_plan_id : ""+ '' +"", find_me_follow_me : ""+ data.find_me_follow_me +"",
                            one_to_one_video_call : ""+ data.one_to_one_video_call +"", is_circle : ""+ data.circle +"", circle_id : ""+ data.circle_id +"", is_feature_rate : ""+ data.feature +"",
                            feature_rate_id : ""+ data.feature_id +"", custom_acl : ""+ data.custom_acl +"", is_caller_id : ""+ data.caller_id +"", broadcasting : ""+ data.broadcast +"",
                            is_sms : ""+ data.sms +"", is_sms_type_custom : ""+ '0' +"", sms_id : ""+ data.sms_id +"", teleconsultation : ""+ data.teleConsultancy +"", subscription : ""+ '1' +"",
                            feed_back_call : ""+ data.feedback_call +"", sticky_agent : ""+ data.sticky_agent +"",geo_tracking : ""+ data.geo_tracking +"", miss_call_alert : ""+ data.missed_call_alert +"",
                            playback : ""+ data.playback +"", appointment : ""+ data.appointment +"", whatsapp : ""+ data.whatsapp +"", minute_plan : ""+ data.minute_plan +"", is_bundle_type : ""+ data.bundle +"",
                            is_roaming_type : ""+ data.roaming +"", bundle_plan_id : ""+ data.bundle_plan_id +"", roaming_plan_id : ""+ data.roaming_plan_id +"", teleConsultancy_call_plan_id : ""+ data.teleConsultancy_call_plan_id +"",
                            status : ""+ '1' +""});
                    sql0.then((response)=>{
                        if(response){
                            let sql1 = knex(Table.tbl_Package).insert({name : ""+ data.package_name +"", product_id : ""+ data.product +"", feature_id : ""+ response[0] +"",
                                     duration : ""+ '0' +"", renew : ""+ '0' +"", status : ""+ '1' +"", mapped : ""+ '0' +""});
                            sql1.then((response1) =>{
                                if(response1){
                                    this.apiInstance.log(200,'package create successfully.','','create Package.');
                                    return res.status(200).send({status_code : 200, message : 'Package Created Successfully.'});
                                }else{
                                    this.apiInstance.log(400,'Bad Request.','','create Package.');
                                    return res.status(400).send({status_code : 400, error : 'Bad Request.'});
                                }
                            }).catch((err)=>{
                                this.apiInstance.log(400,'Bad Request.','','create Package.');
                                return res.status(400).send({status_code : 400, error : 'Bad Request.'});
                            });                    
                        }
                    }).catch((err)=>{
                        this.apiInstance.log(400,'Bad Request.','','create Package.');
                        return res.status(400).send({status_code : 400, error : 'Bad Request.'});
                    });
            }
        });
    }


      /**
    *
    * @param req
    * @param res
    * @param next
    */

     public getPackage(req, res, next, type) {
         let isAdmin = req.user_type ? req.user_type : 1;
         if (isAdmin == '0') {
            var productId = req.query.productId ?  req.query.productId : false;
            var circleId = req.query.circleId ?  req.query.circleId : false;
            var sql ;
            if (!productId) {
                this.apiInstance.log(402,'Parameter Missing In Params - product type.','getPackage',type, '',''); 
                return res.status(402).send({ status_code: 402, error: 'Parameter Missing', message: 'Please enter the product type in parameter' });
            }
            // var packageId = req.query.packageId;
             if (productId == '1') {
                 sql = knex.select('pf.*', 'p.id as package_id', 'p.name', 'p.duration', 'p.renew', 'gp.name as gateway_group',
                     'cp.name as call_plan', 'cr.name as circle_name', 'sms.name as sms_plan_name', 'bp.name as bundle_plan_name', 'bpr.name as roaming_plan_name')
                     .from(Table.tbl_Package + ' as p')
                     .leftJoin(Table.tbl_Features + ' as pf', 'p.feature_id', 'pf.id')
                    // .leftJoin(Table.tbl_Features + ' as p', 'p.feature_id', 'pf.id')
                    // .from(Table.tbl_Features + ' as pf')
                     .leftJoin(Table.tbl_Map_Customer_Package + ' as map', 'p.id', 'map.package_id')
                     .leftJoin(Table.tbl_Customer + ' as c', 'c.id', 'map.customer_id')
                     .leftJoin(Table.tbl_Gateway_Group + ' as gp', 'pf.gateway_group_id', 'gp.id')
                     .leftJoin(Table.tbl_Call_Plan + ' as cp', 'pf.call_plan_id', 'cp.id')
                     .leftJoin(Table.tbl_circle + ' as cr', 'cr.id', 'pf.circle_id')
                     .leftJoin(Table.tbl_SMS + ' as sms', 'sms.id', 'pf.sms_id')
                     .leftJoin(Table.tbl_Bundle_Plan + ' as bp', 'bp.id', 'pf.bundle_plan_id')
                     .leftJoin(Table.tbl_Bundle_Plan + ' as bpr', 'bpr.id', 'pf.roaming_plan_id')
                     .where('p.product_id', '=', productId)
                     // .andWhere('p.id', '=', "" + packageId + "")
                    //  .andWhere('c.status', '=', "1");
                 if (circleId) {
                     sql = sql.andWhere('pf.circle_id', circleId);
                    //  sql = sql.andWhere('pf.minute_plan', '=', 0)
                 }
             } else {
                //  sql = knex.select('oc.*', 'p.id as package_id', 'p.name', 'p.duration','p.renew', knex.raw('COUNT(map.customer_id) as user_count'))
                //     .from(table.tbl_OC_features + ' as oc')
                //     .leftJoin(table.tbl_Package + ' as p', 'p.feature_id', 'oc.id')
                //     .leftJoin(table.tbl_Map_customer_package + ' as map', 'p.id', 'map.package_id')
                //     .where('p.product_id', '=', "2").andWhere('p.id', '=', "" + packageId + "");
            }
   
            console.log(sql.toQuery());
            sql = sql.groupBy('p.id')
            sql.then((response) => {
                if (response.length) {
                    let arrMap = response ? response : [];
                    arrMap = arrMap.map(item => {
                        let res = item;
                        delete res['id'];
                        delete res['voicemail_limit'];
                        delete res['minute_balance'];
                        delete res['gateway_group_id'];
                        delete res['created_at'];
                        delete res['updated_at'];
                        delete res['renew'];
                        delete res['gateway_group'];
                        res['id'] = res['package_id'];
                        delete res['package_id'];
                        res['bundle_plan_name'] = res['bundle_plan_name'] == null ? '': res['bundle_plan_name'];
                        res['roaming_plan_name'] = res['roaming_plan_name'] == null ? '': res['roaming_plan_name'];
                        res['circle_name'] = res['circle_name'] == null ? '': res['circle_name'];
                        res['sms_plan_name'] = res['sms_plan_name'] == null ? '': res['sms_plan_name'];

                   //     delete res['updated_at'];
                        return res
                    });
                    res.json({
                        status_code: 200,
                        message: 'Package Listing.',
                        data: response
                    });
                    this.apiInstance.log(200, 'Package Listing Info.', 'getPackage', type, '', '');
                } else {
                    res.status(201).send({ status_code: 201, message: 'No Data found' });
                    this.apiInstance.log(201, 'No Data found.', 'getPackage', type, '', '', '');
                }
            }).catch((err) => {
                errorLog(err);
                res.status(400).send({
                    status_code: 400,
                    message: 'Bad Request'
                });
                this.apiInstance.log(400, 'Bad Request: ' + err.sqlMessage, 'getPackage', type, '', '', '');
                throw err
            });
         } else {
             this.apiInstance.log(403, 'Forbidden - User has no permission for perform this action.', 'getPackage', type, '', '', '');
             res.status(403).send({ status_code: 403, error: 'Forbidden', message: 'User has no permission for perform this action' });
         }
     }


// Developed by Yash Kashyap--------Update Package detail-------------------
     /**
      * @param req 
      * @param res 
      * @param next 
      */
     public async packageUpdate(req,res,next){
        let data = req.body;
        let dataObj = {};
        let isAdmin = req.user_type ? req.user_type : '1';
        if(isAdmin == '0'){
            if(data.phone_book){
                if(((data.phone_book).toString()).length > 3){
                    this.apiInstance.log(402, 'phone book length should be less than 4.', 'packageupdate', JSON.stringify(data));
                    return res.status(402).send({status_code:402, error:'invalid length.', message:'phone book length should be less than 4.'})
                }
                if(typeof(data.phone_book) != "number"){
                    this.apiInstance.log(402, 'phone number should be number' , 'packageupdate',JSON.stringify(data));
                    return res.status(402).send({status_code:402, error:'invalid value.', message:'phone book should be number.'});
                }
                if(data.phone_book < 50){
                    this.apiInstance.log(402, 'phone book can not be less than 50', 'packageupdate', JSON.stringify(data));
                    return res.status(402).send({status_code:402, error:'invalid length.', message:'phone book can not be less than 50'})
                }
                dataObj['phone_book'] = data.phone_book;
            }

            if(data.concurrent_call){
                if(((data.concurrent_call).toString()).length > 3){
                    this.apiInstance.log(402, 'concurrentcall length should be less than 4.', 'packageupdate', JSON.stringify(data));
                    return res.status(402).send({status_code:402, error:'invalid length.', message:'concurrentcall length should be less than 4.'})
                }
                if(typeof(data.concurrent_call) != "number"){
                    this.apiInstance.log(402, 'concurrentcall should be number' , 'packageupdate',JSON.stringify(data));
                    return res.status(402).send({status_code:402, error:'invalid value.', message:'concurrentcall should be number.'});
                }
                dataObj['concurrent_call'] = data.concurrent_call;
            }
    
            if(data.extension_limit){
                if((data.extension_limit).toString().length > 4){
                    this.apiInstance.log(402, 'extensionLimit length should be less than 4.', 'packageupdate', JSON.stringify(data));
                    return res.status(402).send({status_code:402, error:'invalid length.', message:'extensionLimit length should be less than 4.'})
                }
                if(typeof(data.extension_limit) != "number"){
                    this.apiInstance.log(402, 'extensionLimit should be number 1' , 'packageupdate',JSON.stringify(data));
                    return res.status(402).send({status_code:402, error:'invalid value.', message:'extensionLimit should be number 1.'});
                }
                dataObj['extension_limit'] = data.extension_limit;
            }
    
            if(data.appointment){
                if(data.appointment != 0 && data.appointment != 1){
                    this.apiInstance.log(402, 'appointment should be either 0 or 1' , 'packageupdate',JSON.stringify(data));
                    return res.status(402).send({status_code:402, error:'invalid value.', message:'appointment should be either 0 or 1'});  
                }   
                dataObj['appointment'] = data.appointment;
                if(data.appointment == 1){                
                    dataObj['storage'] = 1;
                    dataObj['file_storage_duration'] = 30;
                    dataObj['file_storage_size'] = 1;
                    dataObj['custom_prompt'] = 1;                
                }
            }

            if(data.caller_id){
                if(data.caller_id != '1' && data.caller_id != '0'){
                    this.apiInstance.log(402, 'caller id should be either 0 or 1' , 'packageupdate',JSON.stringify(data));
                    return res.status(402).send({status_code:402, error:'invalid value.', message:'caller id should be either 0 or 1'});  
                }
                dataObj['is_caller_id'] = data.caller_id;
            }

            if(data.call_barging){
                if(data.call_barging != '1' && data.call_barging != '0'){
                    this.apiInstance.log(402, 'call barging should be either 0 or 1' , 'packageupdate',JSON.stringify(data));
                    return res.status(402).send({status_code:402, error:'invalid value.', message:'call barging should be either 0 or 1'});  
                }
                dataObj['barging'] = data.call_barging;
            }

            if(data.call_group){
                if(data.call_group != 1 && data.call_group != 0){
                    this.apiInstance.log(402, 'call group should be either 0 or 1' , 'packageupdate',JSON.stringify(data));
                    return res.status(402).send({status_code:402, error:'invalid value.', message:'call group should be either 0 or 1'});  
                }
                dataObj['call_group'] = data.call_group;
            }
            if(data.call_transfer){
                if(data.call_transfer != 1 && data.call_transfer != 0){
                    this.apiInstance.log(402, 'calltransfer should be either 0 or 1' , 'packageupdate',JSON.stringify(data));
                    return res.status(402).send({status_code:402, error:'invalid value.', message:'calltransfer should be either 0 or 1'});  
                }
                dataObj['call_transfer'] = data.call_transfer;
            }
            if(data.click_to_call){
                if(data.click_to_call != 1 && data.click_to_call != 0){
                    this.apiInstance.log(402, 'click to call should be either 0 or 1' , 'packageupdate',JSON.stringify(data));
                    return res.status(402).send({status_code:402, error:'invalid value.', message:'click to call should be either 0 or 1'});  
                }
                dataObj['click_to_call']= data.click_to_call;
            }
            if(data.conference){
                if(data.conference != 1 && data.conference != 0){
                    this.apiInstance.log(402, 'conference should be either 0 or 1' , 'packageupdate',JSON.stringify(data));
                    return res.status(402).send({status_code:402, error:'invalid value.', message:'conference should be either 0 or 1'});  
                }
                dataObj['conference'] = data.conference;
            }
            if(data.custom_acl){
                if(data.custom_acl != '1' && data.custom_acl != '0'){
                    this.apiInstance.log(402, 'custom acl should be either 0 or 1' , 'packageupdate',JSON.stringify(data));
                    return res.status(402).send({status_code:402, error:'invalid value.', message:'custom acl should be either 0 or 1'});  
                }
                dataObj['custom_acl'] = data.custom_acl;
            }
            // let Isfeature;
            // if(data.feature){
                // dataObj['feature'] = data.feature;
            //     if(data.feature != 1){
            //         this.apiInstance.log(402, 'feature should be only 1.' , 'packageupdate',JSON.stringify(data));
            //         return res.status(402).send({status_code:402, error:'invalid value.', message:'feature should be number.'});  
            //     }
            //     if(typeof(data.featurerate) != "number"){
            //         this.apiInstance.log(402, 'only number allowed.' , 'packageupdate',JSON.stringify(data));
            //         return res.status(402).send({status_code:402, error:'Inavlid Format', message:'please provide only number.'});  
            //     }
            //     Isfeature = this.validateInstance.validateFeature(data['featurerate'])
            //     if(!Isfeature){
            //         this.apiInstance.log(402, 'featureRate not valid.' , 'packageupdate',JSON.stringify(data));
            //         return res.status(402).send({status_code:402, error:'Invalid data.', message:'Provide valid feature rate.'});  
            //     }else{
            //         dataObj['featurerate'] = Isfeature;
            //     }
            // }
            if(data.feedback_call){
                if(data.feedback_call != 1 && data.feedback_call != 0){
                    this.apiInstance.log(402, 'feedbackcall should be either 0 or 1' , 'packageupdate',JSON.stringify(data));
                    return res.status(402).send({status_code:402, error:'invalid value.', message:'feedbackcall should be either 0 or 1'});  
                }
                dataObj['feed_back_call'] = data.feedback_call;
            }
            if(data.find_me_follow_me){
                if(data.find_me_follow_me != 1 && data.find_me_follow_me != 0){
                    this.apiInstance.log(402, 'Find me Follow me should be either 0 or 1' , 'packageupdate',JSON.stringify(data));
                    return res.status(402).send({status_code:402, error:'invalid value.', message:'Find me Follow me should be either 0 or 1'});  
                }
                dataObj['find_me_follow_me'] = data.find_me_follow_me;
            }
            if(data.forwarding){
                if(data.forwarding != 1 && data.forwarding != 0){
                    this.apiInstance.log(402, 'Forwarding should be either 0 or 1' , 'packageupdate',JSON.stringify(data));
                    return res.status(402).send({status_code:402, error:'invalid value.', message:'Forwarding should be either 0 or 1'});  
                }
                dataObj['forward'] = data.forwarding;
            }
            if(data.geotrack){
                if(data.geotrack != 1 && data.geotrack != 0){
                    this.apiInstance.log(402, 'geo tracking should be either 0 or 1' , 'packageupdate',JSON.stringify(data));
                    return res.status(402).send({status_code:402, error:'invalid value.', message:'geo tracking should be either 0 or 1'});  
                }
                dataObj['geo_tracking'] = data.geotrack;
            }   
            if(!data.storage){
                if(data.recording){
                    this.apiInstance.log(402, 'recording not access without storage.' , 'packageupdate',JSON.stringify(data));
                    return res.status(402).send({status_code:402, error:'Missing Parameter.', message:'recording not access without storage.'});  
                }
                if(data.file_storage_size){
                    this.apiInstance.log(402, 'File Storag Size not access without storage.' , 'packageupdate',JSON.stringify(data));
                    return res.status(402).send({status_code:402, error:'Missing Parameter.', message:'File Storag Size not access without storage.'});  
                }
                if(data.file_storage_duration){
                    this.apiInstance.log(402, 'File Storag Duration not access without storage.' , 'packageupdate',JSON.stringify(data));
                    return res.status(402).send({status_code:402, error:'Missing Parameter.', message:'File Storag Duration not access without storage.'});  
                }
                if(data.custom_prompt){
                    this.apiInstance.log(402, 'CustomPrompts not access without storage.' , 'packageupdate',JSON.stringify(data));
                    return res.status(402).send({status_code:402, error:'Missing Parameter.', message:'CustomPrompt not access without storage.'});  
                }
            }else{
                if(data.storage == 1){
                    dataObj['storage'] = data.storage;
                    dataObj['file_storage_duration'] = data.file_storage_duration ? data.file_storage_duration : 30;
                    dataObj['file_storage_size'] = data.file_storage_size ? data.file_storage_size : 1;
                    if(data.storage != 1 && data.storage != 0){
                        this.apiInstance.log(402, 'Storage should be either 0 or 1' , 'packageupdate',JSON.stringify(data));
                        return res.status(402).send({status_code:402, error:'invalid value.', message:'Storage should be either 0 or 1'});  
                    }
                    if(data.recording){
                        if(data.recording != 1 && data.recording != 0){
                            this.apiInstance.log(402, 'Recording should be either 0 or 1' , 'packageupdate',JSON.stringify(data));
                            return res.status(402).send({status_code:402, error:'invalid value.', message:'Recording should be either 0 or 1'});  
                        }
                        dataObj['recording'] = data.recording;
                    }
                    if(data.file_storage_duration){
                        if((data.file_storage_duration).length > 4){
                            this.apiInstance.log(402, 'File Storage Duration should be less than 3 length.' , 'packageupdate',JSON.stringify(data));
                            return res.status(402).send({status_code:402, error:'Invalid time duration.', message:'please provide valid duration.'});   
                        }
                        if(data.file_storage_duration < 1){
                            this.apiInstance.log(402, 'File Storage Duration can not be less than 1' , 'packageupdate',JSON.stringify(data));
                            return res.status(402).send({status_code:402, error:'invalid value.', message:'File Storage Duration can not be less than 1'});   
                        }
                    }   
                    if(data.file_storage_size){
                        if((data.file_storage_size).length > 6){
                            this.apiInstance.log(402, 'File Storage Size length should less than 6' , 'packageupdate',JSON.stringify(data));
                            return res.status(402).send({status_code:402, error:'size not accepted.', message:'Please provide valid size.'});  
                        }
                    }
                    if(data.custom_prompt){
                        if(data.custom_prompt != 1 && data.custom_prompt != 0){
                            this.apiInstance.log(402, 'Custom Prompt should be only 1.' , 'packageupdate',JSON.stringify(data));
                            return res.status(402).send({status_code:402, error:'invalid value.', message:'Custom Prompt should be 1'});  
                        }
                        dataObj['custom_prompt'] = data.custom_prompt;
                    }
                }else{
                    dataObj['storage'] = data.storage;
                    dataObj['file_storage_duration'] = "0";
                    dataObj['file_storage_size'] = "0";
                    dataObj['recording'] = "0";
                    dataObj['custom_prompt'] = "0";
                }
            }
            if(data.missed_call_alert){
                if(data.missed_call_alert != 1 && data.missed_call_alert != 0){
                    this.apiInstance.log(402, 'missed call alert should be either 0 or 1' , 'packageupdate',JSON.stringify(data));
                    return res.status(402).send({status_code:402, error:'invalid value.', message:'missed call alert should be either 0 or 1'});  
            }
                dataObj['miss_call_alert'] = data.missed_call_alert;
            }
            if(data.one_to_one_video_call){
                if(data.one_to_one_video_call != 1 && data.one_to_one_video_call != 0){
                    this.apiInstance.log(402, 'One to one video call should be either 0 or 1' , 'packageupdate',JSON.stringify(data));
                    return res.status(402).send({status_code:402, error:'invalid value.', message:'OnetoOne video call should be either 0 or 1'});  
                }
                dataObj['one_to_one_video_call'] = data.one_to_one_video_call;
            }   
            if(data.paging){
                dataObj['paging'] = data.paging
                if(data.paging != 1 && data.paging != 0){
                    this.apiInstance.log(402, 'Pagging should be either 0 or 1' , 'packageupdate',JSON.stringify(data));
                    return res.status(402).send({status_code:402, error:'invalid value.', message:'Pagging should be either 0 or 1'});  
                }
            }
            if(data.playback){
                dataObj['playback'] = data.playback;
                if(data.playback != 0 && data.playback != 1){
                    this.apiInstance.log(402, 'Playback should be either 0 or 1' , 'packageupdate',JSON.stringify(data));
                    return res.status(402).send({status_code:402, error:'invalid value.', message:'Playback should be either 0 or 1'});  
                }
            }
            if(data.speed_dial){
                dataObj['speed_dial'] = data.speed_dial;
                if(data.speed_dial != 1 && data.speed_dial != 0){
                    this.apiInstance.log(402, 'Speed dial should be 0 or 1' , 'packageupdate',JSON.stringify(data));
                    return res.status(402).send({status_code:402, error:'invalid value.', message:'Speed dial should be 0 or 1'});  
                }
            }   
            if(data.ivr || data.moh || data.queue || data.broadcast){
                if((data.ivr != 1 && data.ivr != 0) && (data.moh != 1 && data.moh != 0) && (data.queue != 1 && data.queue != 0) && (data.broadcast != 1 && data.broadcast != 0)){
                    this.apiInstance.log(402, 'Please provide valid value.' , 'packageupdate',JSON.stringify(data));
                    return res.status(402).send({status_code:402, error:'invalid value.', message:'please provide valid value.'});  
                }else{
                    dataObj['storage'] = 1;
                    dataObj['file_storage_duration'] = data.file_storage_duration ? data.file_storage_duration : 30;
                    dataObj['file_storage_size'] = data.file_storage_size ? data.file_storage_size : 1;
                    dataObj['ivr'] = data.ivr ? data.ivr : 0;
                    dataObj['music_on_hold'] = data.moh ? data.moh : 0;
                    dataObj['queue'] = data.queue ? data.queue : 0;
                    dataObj['broadcasting'] = data.broadcast ? data.broadcast : 0;
                    if(data.ivr || data.queue || data.broadcast){
                        dataObj['custom_prompt'] = 1;
                    }
                }
            }
            let SmsValidation;
            if(data.sms){
                if(data.sms != 1 && data.sms != 0){
                    this.apiInstance.log(402, 'sms should be either 0 or 1' , 'packageupdate',JSON.stringify(data));
                    return res.status(402).send({status_code:402, error:'invalid value.', message:'sms should be either 0 or 1'});  
                }
                dataObj['is_sms'] = data.sms;
                if(data.sms == 1){
                    if(!data.sms_id){
                        this.apiInstance.log(402, 'Please provide sms id.' , 'packageupdate',JSON.stringify(data));
                        return res.status(402).send({status_code:402, error:'Parameter Missing.', message:'Please provide sms id.'});
                    }
                    if(typeof(data.sms_id) != "number"){
                        this.apiInstance.log(402, 'SmsId should be number' , 'packageupdate',JSON.stringify(data));
                        return res.status(402).send({status_code:402, error:'invalid value.', message:'Sms id should be number.'});
                    }
                    SmsValidation = await this.validateInstance.ValidateSmsExist(data.sms_id)
                    // console.log(SmsValidation,"<=====>>>");
                    if(SmsValidation){
                        // console.log(SmsValidation['id']);
                        dataObj['sms_id'] = SmsValidation['id'];
                    }else{
                        this.apiInstance.log(402, 'sms does not exist.' , 'packageupdate',JSON.stringify(data));
                        return res.status(402).send({status_code:402, error:'Invalid data.', message:'Please provide valid sms data.'});
                    }
                }   
            }
            if(data.whatsapp){
                dataObj['whatsapp'] = data.whatsapp
                if(data.whatsapp != 1 && data.whatsapp != 0){
                    this.apiInstance.log(402, 'whatsapp should be only 1.' , 'packageupdate',JSON.stringify(data));
                    return res.status(402).send({status_code:402, error:'invalid value.', message:'whatsapp should be 1'});  
                }   
            }   
            if(data.sticky_agent){
                dataObj['sticky_agent'] = data.sticky_agent
                if(data.sticky_agent != 1 && data.sticky_agent != 0){
                    this.apiInstance.log(402, 'sticky agent should be only 1.' , 'packageupdate',JSON.stringify(data));
                    return res.status(402).send({status_code:402, error:'invalid value.', message:'sticky agent should be 1'});  
                }
            }
            
            if(data.outbound){
                dataObj['outbound_call'] = data.outbound;
                if(data.outbound != 1 && data.outbound != 0){
                    this.apiInstance.log(402, 'outbound should be either 0 or 1.' , 'packageupdate',JSON.stringify(data));
                    return res.status(402).send({status_code:402, error:'Invalid value.', message:'outbound should be either 0 or 1.'});
                }
                if(data.outbound == 1 && !data.circle){                
                    let validateCallPlan;
                    if(!data.call_plan_id){
                        this.apiInstance.log(402, 'please provide call plan id.' , 'packageupdate',JSON.stringify(data));
                        return res.status(402).send({status_code:402, error:'Invalid value.', message:'please provide call plan id.'});
                    }
                    dataObj['call_plan_id'] = data.call_plan_id;
                    validateCallPlan = await this.validateInstance.validateCallPlanExist(data.call_plan_id);
                    // console.log(validateCallPlan,"--------call plan-----------");
                    if(validateCallPlan == ''){
                        this.apiInstance.log(402, 'please provide valid callplan id.' , 'packageupdate',JSON.stringify(data));
                        return res.status(402).send({status_code:402, error:'Invalid value.', message:'please provide valid callplan id.'});
                    }     
                }
                if(data.circle){
                    if(data.circle != 1 && data.circle != 0){
                        this.apiInstance.log(402, 'circle should be either 0 or 1.' , 'packageupdate',JSON.stringify(data));
                        return res.status(402).send({status_code:402, error:'Invalid value.', message:'circle should be either 0 or 1.'});
                    }                 
                    if(data.circle == 1 && data.outbound == 1){
                        dataObj['call_plan_id'] = data.call_plan_id;
                        dataObj['circle_id'] = data.circle_id;
                        dataObj['is_circle'] = data.circle;
                        if(!data.circle_id){
                            this.apiInstance.log(402, 'please provide circle id.' , 'packageupdate',JSON.stringify(data));
                            return res.status(402).send({status_code:402,error:'Missing Parameter.', message:'please provide the circle id.'});
                        }       
                        if(typeof(data.circle_id) != "number"){
                            this.apiInstance.log(402, 'circle id should be number.' , 'packageupdate',JSON.stringify(data));
                            return res.status(402).send({status_code:402, error:'Invalid value.', message:'circle id should be number..'});
                        }
                        if(!data.call_plan_id){
                            this.apiInstance.log(402, 'please provide call plan id based on circle.' , 'packageupdate',JSON.stringify(data));
                            return res.status(402).send({status_code:402, error:'Invalid value.', message:'please provide call plan id based on circle.'});
                        }   
                        if(typeof(data.call_plan_id) != "number"){
                            this.apiInstance.log(402, 'call plan id should be number.' , 'packageupdate',JSON.stringify(data));
                            return res.status(402).send({status_code:402, error:'Invalid value.', message:'call plan id should be number..'});
                        }   
                        let validateCircle = await this.validateInstance.validateCircleExist(data.circle_id);
                        if(validateCircle == true){
                            this.apiInstance.log(402, 'please provide valid circle id' , 'packageupdate',JSON.stringify(data));
                            return res.status(402).send({status_code:402, error:'Invalid data.', message:'Please provide valid circle id.'});
                        }
                        let validateCallPlanBasedOnCircle = await this.validateInstance.validateCallPlanBasedOnCircle(data.call_plan_id, data.circle_id);
                        if(validateCallPlanBasedOnCircle == false){
                            this.apiInstance.log(402, 'please provide valid circle id' , 'packageupdate',JSON.stringify(data));
                            return res.status(402).send({status_code:402, error:'does not exist.', message:'call plan does not exist for circle.'});
                        }     
                    }
                }
            }
            if(data.minute_plan){
                if(data.minute_plan != 1 && data.minute_plan != 0){
                    this.apiInstance.log(402,'Minute plan should be either 0 or 1.','','',JSON.stringify(data));
                    return res.status(402).send({status_code:402,error:"invalid parameter",message:"Minute plan should be either 0 or 1"})
                }
                if(data.minute_plan == 1){
                    dataObj['minute_plan'] = data.minute_plan;
                    if(!data.bundle && (!data.roaming) && (!data.teleConsultancy)){
                        this.apiInstance.log(402, 'please choose atleast one from bundle, roaming, teleconsulatat.' , 'packageupdate',JSON.stringify(data));
                        return res.status(402).send({status_code:402, error:'invalid value.', message:'please choose atleast one from bundle, roaming, teleconsulatat.'});
                    }
                    if(data.bundle){
                        dataObj['is_bundle_type'] = data.bundle;
                        dataObj['bundle_plan_id'] = data.bundle_plan_id;
                        if(data.bundle != 1 && data.bundle != 0){
                            this.apiInstance.log(402,'bundle plan should be either 0 or 1.','','',JSON.stringify(data));
                            return res.status(402).send({status_code:402,error:"invalid parameter",message:"bundle plan should be either 0 or 1"})
                        }
                        if(data.bundle == 1){
                            if(!data.bundle_plan_id){
                                this.apiInstance.log(402,'please provide bundle plan id.','','',JSON.stringify(data));
                                return res.status(402).send({status_code:402, error:"Missing Parameter.", message:"please provide bundle plan id."})
                            }
                            if(typeof(data.bundle_plan_id) != 'number'){
                                this.apiInstance.log(402,'bundle plan id should be number.','','',JSON.stringify(data));
                                return res.status(402).send({status_code:402,error:"invalid value.",message:'bundle plan id should be number.'})
                            }
                            let validateBundle = await this.validateInstance.validateBundle(1);
                            let count=0;
                            // console.log(validateBundle[0]['id'],"-----------bundle----------",validateBundle.length);
                            for(let a=0; a<validateBundle.length; a++){
                                if(validateBundle[a].id != data.bundle_plan_id){
                                    count++;
                                }else{
                                    count=0;
                                    break;
                                }
                            }
                            if(count != 0){
                                this.apiInstance.log(400,'bundle plan id does not match.','','',JSON.stringify(data));
                                return res.status(402).send({status_code:402, error:'Invallid data.',message:'Please provide valid bundle call plan id.'}) 
                            }
                        }
                    }
                    if(data.roaming){
                        dataObj['is_roaming_type'] = data.roaming;
                        dataObj['roaming_plan_id'] = data.roaming_plan_id;
                        if(data.roaming != 1 && data.roaming != 0){
                            this.apiInstance.log(402,'roaming plan should be either 0 or 1.','','',JSON.stringify(data));
                            return res.status(402).send({status_code:402, error:"invalid parameter",message:"roaming plan should be either 0 or 1"})
                        }
                        if(data.roaming == 1){
                            if(!data.roaming_plan_id){
                                this.apiInstance.log(402,'please provide roaming plan id.','','',JSON.stringify(data));
                                return res.status(402).send({status_code:402, error:"Missing-Parameter.", message:"please provide roaming plan id."})
                            }
                            if(typeof(data.roaming_plan_id) != 'number'){
                                this.apiInstance.log(402,'roaming plan id should be number.','','',JSON.stringify(data));
                                return res.status(402).send({status_code:402, error:"invalid value.",message:'roaming plan id should be number.'})
                            }
                            let validateRoaming = await this.validateInstance.validateBundle(2);
                            let count=0;
                            // console.log(validateRoaming[0]['id'],"-----------roaming----------",validateRoaming.length);
                            for(let a=0; a<validateRoaming.length; a++){
                                if(validateRoaming[a].id != data.roaming_plan_id){
                                    count++;
                                }else{
                                    count=0;
                                    break;
                                }
                            }
                            if(count != 0){
                                this.apiInstance.log(400,'roaming plan id does not match.','','',JSON.stringify(data));
                                return res.status(402).send({status_code:402, error:'Invalid data.',message:'Please provide valid roaming call plan id.'}) 
                            }
                        }
                    }
                    if(data.teleConsultancy){
                        dataObj['teleconsultation'] = data.teleConsultancy;
                        dataObj['teleConsultancy_call_plan_id'] = data.teleConsultancy_call_plan_id;
                        if(data.teleConsultancy != 1 && data.teleConsultancy != 0){
                            this.apiInstance.log(402,'teleConsultancy should be either 0 or 1.','','',JSON.stringify(data));
                            return res.status(402).send({status_code:402, error:"invalid parameter",message:"teleConsultancy should be either 0 or 1"})
                        }
                        if(data.teleConsultancy == 1){
                            if(!data.teleConsultancy_call_plan_id){
                                this.apiInstance.log(402,'please provide teleConsultancy plan id.','','',JSON.stringify(data));
                                return res.status(402).send({status_code:402, error:"Missing-Parameter.", message:"please provide teleConsultancy plan id."})
                            }   
                            if(typeof(data.teleConsultancy_call_plan_id) != 'number'){
                                this.apiInstance.log(402,'teleConsultancy plan id should be number.','','',JSON.stringify(data));
                                return res.status(402).send({status_code:402, error:"invalid value.",message:'teleConsultancy plan id should be number.'})
                            }   
                            let validateTeleConsultancy = await this.validateInstance.validateBundle(4);
                            let count=0;
                            // console.log(validateTeleConsultancy[0]['id'],"-----------teleConsultancy----------",validateTeleConsultancy.length);
                            for(let a=0; a<validateTeleConsultancy.length; a++){
                                if(validateTeleConsultancy[a].id != data.teleConsultancy_call_plan_id){
                                    count++;
                                }else{
                                    count=0;
                                    break;
                                }
                            }
                            if(count != 0){
                                this.apiInstance.log(400,' plan id does not match.','','',JSON.stringify(data));
                                return res.status(402).send({status_code:402, error:'Invalid data.',message:'Please provide valid teleConsultancy call plan id.'}) 
                            }   
                        }
                    }
                }
            }
            this.updatepackage(req,res,next,dataObj,data);
        }              
    }

     public updatepackage(req,res,next,dataObj,data){
        let datas=req.body;
        // console.log(dataObj,"----------+-----------+--------");
        
        if(!datas.packageid){
            this.apiInstance.log(402, 'Please provide package id.' , 'packageupdate',JSON.stringify(data));
            return res.status(402).send({status_code:402, error:'Missing Parameter.', message:'Please provide package id.'});
        }
        if(typeof(datas.packageid) != "number"){
            this.apiInstance.log(402, 'Please provide valid id.' , 'packageupdate',JSON.stringify(data));
            return res.status(402).send({status_code:402, error:'Invalid data.', message:'package id should be number.'});
        }
        let sql0 = knex(Table.tbl_Package).select('feature_id')
            .where('id',data.packageid)
            .then((response)=>{
                if (dataObj == ''){
                    return ;
                }
                let sql = knex(Table.tbl_Features).update(dataObj)
                .where('id',response[0]['feature_id'])
                .then((response2)=>{
                    if(response2){
                        this.apiInstance.log(200, 'Package Update Successfully..' , 'packageupdate',JSON.stringify(dataObj));
                        return res.status(200).send({status_code:200, message:'Package update successfully with features.'});
                    }else{
                        this.apiInstance.log(402, 'Package Not Update.' , 'packageupdate',JSON.stringify(data));
                        return res.status(402).send({status_code:400, error: 'Bad Request.',message:'Package Not Update.'});
                    }
                }).catch((err)=>{
                    this.apiInstance.log(400, 'Package Not Update.' ,'',JSON.stringify(data));
                    return res.status(400).send({status_code:400, error: 'Bad Request.'});
                });
            }).catch((err)=>{
                this.apiInstance.log(400, 'Package Not Update.' ,'',JSON.stringify(data));
                return res.status(400).send({status_code:400, error: 'Bad Request.'});
            });
        }
}





 