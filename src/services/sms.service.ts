/**
 * @file
 *
 * This is a SMSService controller of private api urls. Can be accessed after success login. These urls need authentication.
 *
 * @author Nagender Pratap Chauhan on 26/10/21.
 */

 import { errorLog, infoLog } from '../utils/logger.util';
 import { Table } from '../dba/table';
 import { ApiLogs } from '../utils/api-logs';
 import  { Validation } from '../utils/validation.util';
 var knex = require('../dba/knex.db');

 export class SMSService {
     public apiInstance = new ApiLogs();

      /**
    *
    * @param req
    * @param res
    * @param next
    */

     public getSMS(req, res, next, type) {
         let isAdmin = req.user_type ? req.user_type : 1;
         if (isAdmin == '0') {
             let sql = knex.from(Table.tbl_SMS + ' as sms')
                 .select('sms.name', 'sms.description', 'sms.charge', 'sms.provider', 'sms.number_of_sms',
                     knex.raw('IF (sms.validity = "1","Monthly", IF (sms.validity = "2","Yearly","Pay Per Use")) as validity'), 'sa.provider')
                 .leftJoin(Table.tbl_SMS_API + ' as sa', 'sa.id', 'sms.provider')
                 .orderBy('sms.id', 'desc');
             sql.then((response) => {
                 if (response.length) {
                     res.json({
                         status_code: 200,
                         message: 'SMS Listing.',
                         data: response
                     });
                     this.apiInstance.log(200, 'SMS Listing Info.', 'getSMS', type, '', '');
                 } else {
                     res.status(201).send({ status_code: 201, message: 'No Data found' });
                     this.apiInstance.log(201, 'No Data found.', 'getSMS', type, '', '', '');
                 }
             }).catch((err) => {
                 errorLog(err);
                 res.status(400).send({
                     status_code: 400,
                     message: 'Bad Request'
                 });
                 this.apiInstance.log(400, 'Bad Request: ' + err.sqlMessage, 'getSMS', type, '', '', '');
                 throw err
             });
         } else {
             this.apiInstance.log(403, 'Forbidden - User has no permission for perform this action.', 'getSMS', type, '', '', '');
             res.status(403).send({ status_code: 403, error: 'Forbidden', message: 'User has no permission for perform this action' });
         }
     }
 }
     