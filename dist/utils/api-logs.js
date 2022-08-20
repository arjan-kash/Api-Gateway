"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.ApiLogs=void 0;var table_1=require("../dba/table"),logger_util_1=require("../utils/logger.util"),knex=require("../dba/knex.db"),ApiLogs=function(){function e(){}return e.prototype.log=function(e,t,o,i,r,g,n){console.log(">>>>>>>>>>>>>",e,t,o,i,r,g,n),console.log(typeof g);var s=o,l=g?g.substr(0,g.length-4):"";if(s)try{knex(table_1.Table.tbl_Api_Logs).insert({api_status:e,api_response_msg:t,api_name:o,application:i,customer_id:r||l||"",extension_number:g||"",params:n||""}).then(function(e){0<e.length?logger_util_1.infoLog("api log inserted...."):logger_util_1.traceLog("api log not inserted....")})}catch(e){logger_util_1.fatalLog("something went wrong during api logs insert....")}else logger_util_1.debugLog("something missing parameter data during api logs....")},e}();exports.ApiLogs=ApiLogs;