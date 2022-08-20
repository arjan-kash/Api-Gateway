/**
 * @file
 *
 * This is a Recording Service controller of public api urls. Can be accessed after success login. These urls need authentication.
 *
 * @author Nagender Pratap Chauhan on 05/8/21.
 */

 import { errorLog, infoLog } from '../utils/logger.util';
 import { warnLog, unauthLog } from '../utils/logger.util';
 import { Table } from '../dba/table';
 import { ApiLogs } from '../utils/api-logs';

 var knex = require('../dba/knex.db');
 
 export class RecordingService {
 
    public apiInstance = new ApiLogs();

     /**
      *
      * @param req
      * @param res
      * @param next
      */
 
     public getExtensionRecording(req, res, next) {
         let ext_number = req.ext_number ? req.ext_number : 0;
         let host = req.headers.host ;
         host = host.replace('3001', '3000'); // replace the port bcz of access recording
         let data = req.body;
             var sql = knex.from(Table.tbl_Recording + ' as r')
                 .select('r.*', 'r.src as extension', 'r.dest as callee_ext', 'r.created_at as time', knex.raw('CONCAT("/assets/prompts/",r.customer_id,"/recording/",r.file_name) as file_path'), 'r.type as call_type')
                 .andWhere((builder) =>
                     builder.where('r.src', '=', ext_number)
                         .orWhere('r.dest', '=', ext_number)
                 )
                 .orderBy('r.id', 'desc');
             sql.then((response) => {
                 if (response.length) {
                    let arrMap  = response ? response : [];
                     arrMap = arrMap.map(item => {
                         let res = item;
                         delete res['id'];
                         delete res['customer_id'];
                         delete res['status'];
                         delete res['created_at'];
                         delete res['updated_at'];
                         delete res['extension'];
                         delete res['callee_ext'];
                         delete res['type'];
                         res['file_path'] =  host + res['file_path'] 
                         return res;
                     });
                     res.json({
                         data: response,
                         status_code: 200,
                         message: 'Recording listing.',
                     });
                     this.apiInstance.log(200,'Recording listing.','getExtensionRecording','pbx','',ext_number); 
                 } else {
                     res.status(201).send({ status_code: 201, message: 'No Data found' });
                     this.apiInstance.log(201,'No Data found.','getExtensionRecording','pbx','',ext_number);  
                 }
             }).catch((err) => {
                 errorLog(err);
                 res.status(400).send({
                     status_code: 400,
                     message: 'Bad Request'
                 });
                 this.apiInstance.log(400,'Bad Request: '+err.sqlMessage,'getExtensionRecording','pbx','',ext_number);  
                  throw err
             });
     }

     /**
      *
      * @param req
      * @param res
      * @param next
      */
 
     public getExtensionVoicemailRecording(req, res, next) {
         let ext_number = req.ext_number ? req.ext_number : 0;
         
         let host = req.headers.host;
         host = host.replace('3001', '3000'); // replace the port bcz of access recording
        //  console.log('?????????????????????????????????????????????????????');
         
         console.log(req.headers);
         var sql = knex.from(Table.tbl_Voicemail_Recording + ' as r')
             .select('r.*', 'r.src as extension', 'r.dest as callee_ext', 'r.created_at as time', knex.raw('CONCAT("/assets/prompts/",r.customer_id,"/vm/","@extNumber","/",r.file_name) as file_path'))
             .andWhere((builder) =>
                 builder.where('r.src', '=', ext_number)
                     .orWhere('r.dest', '=', ext_number)
             )
             .orderBy('r.id', 'desc');
         sql.then((response) => {
             if (response.length) {
                 let arrMap = response ? response : [];
                 arrMap = arrMap.map(item => {
                     let res = item;
                     delete res['id'];
                     delete res['customer_id'];
                     delete res['status'];
                     delete res['created_at'];
                     delete res['updated_at'];
                     delete res['extension'];
                     delete res['callee_ext'];
                     res['file_path'] = host + (res['file_path']).replace('@extNumber', ext_number)
                     return res;
                 });
                 res.json({
                     data: response,
                     status_code: 200,
                     message: 'Voicemail Recording listing.',
                 });
                 this.apiInstance.log(200, 'Voicemail Recording listing.', 'getExtensionVoicemailRecording', 'pbx','',ext_number);  
             } else {
                 res.send({
                     data: [],
                     status_code: 201,
                     message: 'No Data found.',
                 });
                 this.apiInstance.log(201, 'No Data found.', 'getExtensionVoicemailRecording', 'pbx','',ext_number);  
             }
         }).catch((err) => {
             errorLog(err);
             res.status(400).send({
                 status_code: 400,
                 message: 'Bad Request'
             });
             this.apiInstance.log(400, 'Bad Request: '+err.sqlMessage, 'getExtensionVoicemailRecording', 'pbx','',ext_number);  
             throw err;
         });
     }

     /**
      *
      * @param req
      * @param res
      * @param next
      */
 
     public getCustomerRecording(req, res, next) {
         let customer_id = req.customer_id ? req.customer_id : 0;
         if(customer_id == 1){
        //  let ext_number = req.ext_number ? req.ext_number : 0;
        //  if(ext_number){
        //     this.apiInstance.log(403,'Forbidden - User has no permission for this extension.','getCustomerVoicemailRecording','pbx', customer_id); 
        //     res.status(403).send({ status_code: 403, error: 'Forbidden', message: 'User has no permission for this action' });
        //  }
         let host = req.headers.host;
         host = host.replace('3001', '3000'); // replace the port bcz of access recording
         let data = req.body;
         var sql = knex.from(Table.tbl_Recording + ' as r')
             .select('r.*', 'r.src as extension', 'r.dest as callee_ext', 'r.created_at as time', knex.raw('CONCAT("/assets/prompts/",r.customer_id,"/recording/",r.file_name) as file_path'), 'r.type as call_type')
             .where('r.customer_id', customer_id)
             .orderBy('r.id', 'desc');
         sql.then((response) => {
             if (response.length) {
                 let arrMap = response ? response : [];
                 arrMap = arrMap.map(item => {
                     let res = item;
                     delete res['id'];
                     delete res['customer_id'];
                     delete res['status'];
                     delete res['created_at'];
                     delete res['updated_at'];
                     delete res['extension'];
                     delete res['callee_ext'];
                     delete res['type'];
                     res['call_type'] = res['call_type'] == 'cg' ? 'call group' : res['call_type'] == 'call_conference' ? 'conference' : res['call_type'] == 'call_voicmail' ? 'voicmail': res['call_type'] == 'sip_extn' ? 'sip call': res['call_type'] == 'call_queue' ? 'queue':res['call_type'] == 'tc' ? 'tele consultancy': res['call_type'] == 'call_group' ? 'call group' : res['call_type'];
                     res['file_path'] = host + res['file_path']
                     return res;
                 });
                 res.json({
                     data: response,
                     status_code: 200,
                     message: 'Recording listing.',
                 });
                 this.apiInstance.log(200,'Customer Voicemail Recording listing.','getCustomerVoicemailRecording','pbx',customer_id,'');  
             } else {
                 res.status(201).send({ status_code: 201, message: 'No Data found' });
                 this.apiInstance.log(201,'No Data found.','getCustomerVoicemailRecording','pbx'); 
             }
         }).catch((err) => {
             errorLog(err);
             res.status(400).send({
                 status_code: 400,
                 message: 'Bad Request : '+err.sqlMessage
             });
             this.apiInstance.log(400,'Bad Request: '+err.sqlMessage,'getCustomerVoicemailRecording','pbx');
              throw err;
         });
        }
     }

     /**
      *
      * @param req
      * @param res
      * @param next
      */
 
      public getCRMRecording(req, res, next) {
        let ext_number = req.ext_number ? req.ext_number : 0;
        let host = req.headers.host ;
        host = host.replace('3001', '3000'); // replace the port bcz of access recording
        let data = req.body;
            var sql = knex.from(Table.tbl_Recording + ' as r')
                .select('r.*', 'r.src as extension', 'r.dest as callee_ext', 'r.created_at as time', knex.raw('CONCAT("/assets/prompts/",r.customer_id,"/recording/",r.file_name) as file_path'), 'r.type as call_type')
                .andWhere((builder) =>
                    builder.where('r.src', '=', ext_number)
                        .orWhere('r.dest', '=', ext_number)
                )
                .orderBy('r.id', 'desc');
            sql.then((response) => {
                if (response.length) {
                   let arrMap  = response ? response : [];
                    arrMap = arrMap.map(item => {
                        let res = item;
                        delete res['id'];
                        delete res['customer_id'];
                        delete res['status'];
                        delete res['created_at'];
                        delete res['updated_at'];
                        delete res['extension'];
                        delete res['callee_ext'];
                        delete res['type'];
                        res['file_path'] =  host + res['file_path'] 
                        return res;
                    });
                    res.json({
                        data: response,
                        status_code: 200,
                        message: 'Recording listing.',
                    });
                    this.apiInstance.log(200,'Recording listing.','getCRMRecording','crm','',ext_number); 
                } else {
                    res.status(201).send({ status_code: 201, message: 'No Data found' });
                    this.apiInstance.log(201,'No Data found.','getCRMRecording','crm','',ext_number);  
                }
            }).catch((err) => {
                errorLog(err);
                res.status(400).send({
                    status_code: 400,
                    message: 'Bad Request'
                });
                this.apiInstance.log(400,'Bad Request: '+err.sqlMessage,'getCRMRecording','crm','',ext_number);  
                 throw err
            });
    }
 }