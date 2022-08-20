/**
 * @file
 *
 * This is a ApiLogs utils of public/private api urls. Can be accessed after success login. These urls no need authentication.
 *
 * @author Nagender Pratap Chauhan on 27/7/21.
 */

import { Table } from "../dba/table";
import { warnLog, unauthLog, infoLog, traceLog, debugLog, fatalLog } from '../utils/logger.util';
var knex  = require('../dba/knex.db');

export class ApiLogs {
    log(api_status?, api_retrn_message?, api_name?, api_type?, cust_id?, extension_num?, params ? ){

        console.log('>>>>>>>>>>>>>',api_status,api_retrn_message,api_name,api_type, cust_id, extension_num, params );
        console.log(typeof extension_num);
        
        const authorization = api_name;
        let cust_id_from_ext =  extension_num ? extension_num.substr(0,extension_num.length - 4) : ''; // => "Tabs1"
        if (authorization) {
            try {
                let sql = knex(Table.tbl_Api_Logs).insert({
                    api_status: api_status,
                    api_response_msg: api_retrn_message,
                    api_name: api_name,
                    application: api_type,
                    customer_id : cust_id ? cust_id : cust_id_from_ext ? cust_id_from_ext : '',
                    extension_number : extension_num ? extension_num : '',
                    params : params ? params : ''
                });
                sql.then((response) => {
                    if (response.length > 0) {
                        infoLog('api log inserted....')
                    } else {
                        traceLog('api log not inserted....')
                    }
                })
            } catch (e) {
                fatalLog('something went wrong during api logs insert....')
            }

        } else {
            debugLog('something missing parameter data during api logs....')
        }
     }
}

