"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.ResponseCall=void 0;var api_logs_1=require("./api-logs"),ResponseCall=function(){function s(){this.apiinstance=new api_logs_1.ApiLogs}return s.prototype.responses=function(s,e,o,t,n,a){if(200==s)return this.apiinstance.log(s,e,t),a.status(s).send({status_code:s,message:e});console.log(n,a),this.apiinstance.log(s,o,t),a.status(s).send({status_code:s,error:o,message:e})},s}();exports.ResponseCall=ResponseCall;