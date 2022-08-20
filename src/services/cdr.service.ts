/**
 * @file
 *
 * This is a CDRService controller of public api urls. Can be accessed after success login. These urls need authentication.
 *
 * @author Nagender Pratap Chauhan on 20/7/21.
 */

import { errorLog, infoLog } from "../utils/logger.util";
import { warnLog, unauthLog } from "../utils/logger.util";
import { Table } from "../dba/table";
import { ApiLogs } from "../utils/api-logs";
import { UserTypeConstants } from "../utils/constant";

var knex = require("../dba/knex.db");

export class CDRService {
  public apiInstance = new ApiLogs();

  /**
   *
   * @param req
   * @param res
   * @param next
   */

  public getExtensionCDR(req, res, next) {
    let isExtension = req.user_type ? req.user_type : 1;
    // console.log(isExtension,"-------------------------------");
    
    if (isExtension == "6") {
      let data = req.body;
      let isMissedCall = data.missed_call ? Number(data.missed_call) : null;
      data.company = data.company ? "'" + data.company + "'" : null;
      data.sellcost = data.sellcost ? "'" + data.sellcost + "'" : null;
      data.caller = data.caller ? "'" + data.caller + "'" : null;
      data.callee = data.callee ? "'" + data.callee + "'" : null;
      data.callcost = data.callcost ? "'" + data.callcost + "'" : null;
      data.destination = data.destination ? "'" + data.destination + "'" : null;
      data.callerid = data.callerid ? "'" + data.callerid + "'" : null;
      //data.terminatecause = null;
      let rangeFrom = data.date_from ? "'" + data.date_from + "'" : null;
      let rangeTo = data.date_to ? "'" + data.date_to + "'" : null;
      data.call_type = data.call_type ? "'" + data.call_type + "'" : null;
      data.uuid = data.uuid ? "'" + data.uuid + "'" : null;
      if (isMissedCall) {
        data.terminatecause = "'" + "486,480,487" + "'";
      } else {
        data.terminatecause = data.terminatecause
          ? data.terminatecause.length
            ? "'" + data.terminatecause + "'"
            : null
          : null;
      }

      data.page_per_size = data.page_per_size
        ? "'" + data.page_per_size + "'"
        : null;
      data.page_number = data.page_number ? "'" + data.page_number + "'" : null;
      data.callerid = data.callerid ? "'" + data.callerid + "'" : null;
      console.log(
        knex
          .raw(
            "Call pbx_getExtensionCdrByFilters(" +
              rangeFrom +
              "," +
              rangeTo +
              "," +
              req.id +
              "," +
              data.callcost +
              "," +
              data.sellcost +
              "," +
              data.caller +
              "," +
              data.callee +
              "," +
              data.destination +
              "," +
              data.callerid +
              "," +
              data.terminatecause +
              "," +
              data.call_type +
              "," +
              data.page_per_size +
              "," +
              data.page_number +
              "," +
              data.uuid +
              ")"
          )
          .toString()
      );
      knex
        .raw(
          "Call pbx_getExtensionCdrByFilters(" +
            rangeFrom +
            "," +
            rangeTo +
            "," +
            req.id +
            "," +
            data.callcost +
            "," +
            data.sellcost +
            "," +
            data.caller +
            "," +
            data.callee +
            "," +
            data.destination +
            "," +
            data.callerid +
            "," +
            data.terminatecause +
            "," +
            data.call_type +
            "," +
            data.page_per_size +
            "," +
            data.page_number +
            "," +
            data.uuid +
            ")"
        )
        .then((response) => {
          if (response[0][0].length) {
            let arrMap = response[0][0] ? response[0][0] : [];
            arrMap = arrMap.map((item) => {
              let res = item;
              delete res["id"];
              delete res["hangup_disposition"];
              res["caller"] = res["src"];
              delete res["src"];
              res["date_from"] = res["startTime"];
              res["date_to"] = res["endTime"];
              delete res["startTime"];
              delete res["endTime"];
              delete res["buyCost"];
              res["endpoint"] = res["dispDst"];
              delete res["dispDst"];
              res["sellcost"] = res["sellCost"];
              delete res["sellCost"];
              res["callcost"] = res["callCost"];
              delete res["callCost"];
              res["bridgetime"] = res["bridgeTime"];
              delete res["bridgeTime"];
              res["sessiontime"] = res["sessionTime"];
              delete res["sessionTime"];
              res["callplanname"] = res["callPlanName"];
              delete res["callPlanName"];
              res["gatewayname"] = res["gatewayName"];
              delete res["gatewayName"];
              res["dispcallerid"] = res["dispCallerId"];
              delete res["dispCallerId"];
              res["termdescription"] = res["termDescription"];
              delete res["termDescription"];
              res["dispdestination"] = res["dispDestination"];
              delete res["dispDestination"];
              return res;
            });
            res.send({
              status_code: 200,
              message: "Extension CDR list.",
              data: response[0][0],
            });
            this.apiInstance.log(
              200,
              "Extension CDR list.",
              "getExtensionCDR",
              "pbx",
              req.customer_id,
              req.ext_number
            );
          } else {
            res.send({
              status_code: 201,
              message: "No Data found.",
              data: [],
            });
            this.apiInstance.log(
              201,
              "No Data found.",
              "getExtensionCDR",
              "pbx",
              req.customer_id,
              req.ext_number
            );
          }
        })
        .catch((err) => {
          errorLog(err);
          res.status(400).send({
            status_code: 400,
            message: "Bad Request",
          });
          this.apiInstance.log(
            400,
            "Bad Request: " + err.sqlMessage,
            "getExtensionCDR",
            "pbx",
            req.customer_id,
            req.ext_number
          );
          throw err;
        });
    } else {
      this.apiInstance.log(
        403,
        "Forbidden - User has no permission for perform this action.",
        "getMinutePlan",
        "pbx",
        "",
        "",
        ""
      );
      res
        .status(403)
        .send({
          status_code: 403,
          error: "Forbidden",
          message: "User has no permission for perform this action",
        });
    }
  }

  /**
   *
   * @param req
   * @param res
   * @param next
   */

  public getCustomerCDR(req, res, next) {
    let isCustomer = req.user_type ? req.user_type : 1;
    // let isType = req.app_type ? req.app_type : null;
    // console.log("Customer data is", Object.values(req));

    // console.log(isCustomer,"getCustomerCDR");

    if (isCustomer == "1") {
      let data = req.body;

      // console.log(data, "here is data");
      let isMissedCall = data.missed_call ? Number(data.missed_call) : null;
      // console.log(isMissedCall,"isMissedCall data");
      
      data.company = data.company ? "'" + data.company + "'" : null;
      data.sellcost = data.sellcost ? "'" + data.sellcost + "'" : null;
      data.caller = data.caller ? "'" + data.caller + "'" : null;
      data.callee = data.callee ? "'" + data.callee + "'" : null;
      data.callcost = data.callcost ? "'" + data.callcost + "'" : null;
      data.destination = data.destination ? "'" + data.destination + "'" : null;
      data.callerid = data.callerid ? "'" + data.callerid + "'" : null;
      //data.terminatecause = null;
      let rangeFrom = data.date_from ? "'" + data.date_from + "'" : null;
      let rangeTo = data.date_to ? "'" + data.date_to + "'" : null;
      data.call_type = data.call_type ? "'" + data.call_type + "'" : null;
      if (isMissedCall) {
        data.terminatecause = "'" + "486,480,487" + "'";
      } else {
        data.terminatecause = data.terminatecause
          ? data.terminatecause.length
            ? "'" + data.terminatecause + "'"
            : null
          : null;
      }

      data.page_per_size = data.page_per_size
        ? Number(data.page_per_size)
        : null;
      data.page_number = data.page_number ? Number(data.page_number) : null;

      console.log(
        knex
          .raw(
            "Call pbx_getCustomerCdrByFilters(" +
              rangeFrom +
              "," +
              rangeTo +
              "," +
              req.id +
              "," +
              data.callcost +
              "," +
              data.sellcost +
              "," +
              data.caller +
              "," +
              data.callee +
              "," +
              data.destination +
              "," +
              data.callerid +
              "," +
              data.terminatecause +
              "," +
              data.call_type +
              "," +
              data.page_per_size +
              "," +
              data.page_number +
              ")"
          )
          .toString()
      );
      knex
        .raw(
          "Call pbx_getCustomerCdrByFilters(" +
            rangeFrom +
            "," +
            rangeTo +
            "," +
            req.id +
            "," +
            data.callcost +
            "," +
            data.sellcost +
            "," +
            data.caller +
            "," +
            data.callee +
            "," +
            data.destination +
            "," +
            data.callerid +
            "," +
            data.terminatecause +
            "," +
            data.call_type +
            "," +
            data.page_per_size +
            "," +
            data.page_number +
            ")"
        )
        .then((response) => {
          if (response[0][0].length) {
            // console.log("-------->",response[0][0],"response of customercdr");
            
            let arrMap = response[0][0] ? response[0][0] : [];
            arrMap = arrMap.map((item) => {
              let res = item;
              delete res["id"];
              delete res["hangup_disposition"];
              res["caller"] = res["src"];
              delete res["src"];
              res["date_from"] = res["startTime"];
              res["date_to"] = res["endTime"];
              delete res["startTime"];
              delete res["endTime"];
              delete res["buyCost"];
              res["endpoint"] = res["dispDst"];
              delete res["dispDst"];
              res["sellcost"] = res["sellCost"];
              delete res["sellCost"];
              res["callcost"] = res["callCost"];
              delete res["callCost"];
              res["bridgetime"] = res["bridgeTime"];
              delete res["bridgeTime"];
              res["sessiontime"] = res["sessionTime"];
              delete res["sessionTime"];
              res["callplanname"] = res["callPlanName"];
              delete res["callPlanName"];
              res["gatewayname"] = res["gatewayName"];
              delete res["gatewayName"];
              res["dispcallerid"] = res["dispCallerId"];
              delete res["dispCallerId"];
              res["termdescription"] = res["termDescription"];
              delete res["termDescription"];
              res["dispdestination"] = res["dispDestination"];
              delete res["dispDestination"];
              return res;
            });
            res.send({
              status_code: 200,
              message: "Customer CDR list.",
              data: response[0][0],
            });
            this.apiInstance.log(
              200,
              "Customer CDR list.",
              "getCustomerCDR",
              "pbx",
              req.id,
              ""
            );
          } else {
            if (data.page_per_size && data.page_number) {
              res.send({
                status_code: 416,
                message: "Range Not Satisfiable.",
                data: [],
              });
              this.apiInstance.log(
                416,
                "Range Not Satisfiable.",
                "getCustomerCDR",
                "pbx",
                req.id,
                ""
              );
            } else {
              res.send({
                status_code: 201,
                message: "No Data found.",
                data: [],
              });
              this.apiInstance.log(
                201,
                "No Data found.",
                "getCustomerCDR",
                "pbx",
                req.id,
                ""
              );
            }
          }
        })
        .catch((err) => {
          errorLog(err);
          res.status(400).send({
            status_code: 400,
            message: "Bad Request",
          });
          this.apiInstance.log(
            400,
            "Bad Request: " + err.sqlMessage,
            "getCustomerCDR",
            "pbx",
            req.id,
            ""
          );
          throw err;
        });
    } else {
      this.apiInstance.log(
        403,
        "Forbidden - User has no permission for perform this action.",
        "getMinutePlan",
        "pbx",
        "",
        "",
        ""
      );
      res
        .status(403)
        .send({
          status_code: 403,
          error: "Forbidden",
          message: "User has no permission for perform this action",
        });
    }
  }

/**
 * @param req 
 * @param res
 * @param next
 */

 public getAdminCDR(req, res, next) {
    let isAdmin = req .user_type ? req.user_type : 0;
    // console.log(isAdmin);

    if (isAdmin == "0") {
      let data = req.body;
      data.flag_limit = data.flag_limit ? Number(data.flag_limit) : 0;

      let sql=knex.raw("Call pbx_getAdminCdrInfo(" + data.flag_limit + ")");
          // console.log(knex
          //     .raw(
          //       "Call pbx_getAdminCdrInfo()")
          //     .toString()
          // );

        sql.then((response) => {
            // console.log("==========>",response[0][0],"<======");
            
          if (response[0][0].length) {
            // console.log("-------->",response[0][0],"response of ADmincdr");
            
            // let arrMap = response[0][0] ? response[0][0] : [];
            // arrMap = arrMap.map((item) => {
            //   let res = item;

            res.send({
              status_code: 200,
              message: "Admin CDR list.",
              data: response[0][0],
            });
            this.apiInstance.log(
              200,
              "Admin CDR list.",
              "getAdminCDR",
              "crm",
              ""
            );
         
              // this.apiInstance.log(
              //   416,
              //   "Range Not Satisfiable.",
              //   "getAdminCDR",
              //   "crm",
              //   ""
              // );
            } else {
              res.send({
                status_code: 201,
                message: "No Data found.",
                data: [],
              });
              this.apiInstance.log(
                201,
                "No Data found.",
                "getAdminCDR",
                "crm",
                ""
              );
            }
        })
        .catch((err) => {
          errorLog(err);
          res.status(400).send({
            status_code: 400,
            message: "Bad Request",
          });
          this.apiInstance.log(
            400,
            "Bad Request: " + err.sqlMessage,
            "getAdminCDR",
            "crm",
            ""
          );
          throw err;
        });
    } else {
      this.apiInstance.log(
        403,
        "Forbidden - User has no permission for perform this action.",
        "getMinutePlan",
        "crm",
        "",
        "",
        ""
      );
      res
        .status(403)
        .send({
          status_code: 403,
          error: "Forbidden",
          message: "User has no permission for perform this action",
        });
    }
  }
  /**
   *
   * @param req
   * @param res
   * @param next
   */

  public getCRMCDR(req, res, next) {
    let isCustomer = req.user_type ? req.user_type : 1;
    let isType = req.app_type ? req.app_type : null;
    console.log("request data",Object.values(req));
    console.log("Extesion number get here",isCustomer);
    
    if (isCustomer == UserTypeConstants.EXTENSION) {
      let data = req.body;
      let isMissedCall = data.missed_call ? Number(data.missed_call) : null;
      data.company = data.company ? "'" + data.company + "'" : null;
      data.sellcost = data.sellcost ? "'" + data.sellcost + "'" : null;
      data.caller = data.caller ? "'" + data.caller + "'" : null;
      data.callee = data.callee ? "'" + data.callee + "'" : null;
      data.callcost = data.callcost ? "'" + data.callcost + "'" : null;
      data.destination = data.destination ? "'" + data.destination + "'" : null;
      data.callerid = data.callerid ? "'" + data.callerid + "'" : null;
      data.uuid = data.uuid ? "'" + data.uuid + "'" : null;
      let rangeFrom = data.date_from ? "'" + data.date_from + "'" : null;
      let rangeTo = data.date_to ? "'" + data.date_to + "'" : null;
      data.call_type = data.call_type ? "'" + data.call_type + "'" : null;
      if (isMissedCall) {
        data.terminatecause = "'" + "486,480,487" + "'";
      } else {
        data.terminatecause = data.terminatecause
          ? data.terminatecause.length
            ? "'" + data.terminatecause + "'"
            : null
          : null;
      }

      data.page_per_size = data.page_per_size
        ? "'" + data.page_per_size + "'"
        : null;
      data.page_number = data.page_number ? "'" + data.page_number + "'" : null;
      console.log(
        knex
          .raw(
            "Call pbx_getExtensionCdrByFilters(" +
              rangeFrom +
              "," +
              rangeTo +
              "," +
              req.id +
              "," +
              data.callcost +
              "," +
              data.sellcost +
              "," +
              data.caller +
              "," +
              data.callee +
              "," +
              data.destination +
              "," +
              data.callerid +
              "," +
              data.terminatecause +
              "," +
              data.call_type +
              "," +
              data.page_per_size +
              "," +
              data.page_number +
              "," +
              data.uuid +
              ")"
          )
          .toString()
      );
      knex
        .raw(
          "Call pbx_getExtensionCdrByFilters(" +
            rangeFrom +
            "," +
            rangeTo +
            "," +
            req.id +
            "," +
            data.callcost +
            "," +
            data.sellcost +
            "," +
            data.caller +
            "," +
            data.callee +
            "," +
            data.destination +
            "," +
            data.callerid +
            "," +
            data.terminatecause +
            "," +
            data.call_type +
            "," +
            data.page_per_size +
            "," +
            data.page_number +
            "," +
            data.uuid +
            ")"
        )
        .then((response) => {
          if (response[0][0].length) {
            let arrMap = response[0][0] ? response[0][0] : [];
            arrMap = arrMap.map((item) => {
              let res = item;
              delete res["id"];
              delete res["hangup_disposition"];
              res["caller"] = res["src"];
              delete res["src"];
              res["date_from"] = res["startTime"];
              res["date_to"] = res["endTime"];
              delete res["startTime"];
              delete res["endTime"];
              delete res["buyCost"];
              res["endpoint"] = res["dispDst"];
              delete res["dispDst"];
              res["sellcost"] = res["sellCost"];
              delete res["sellCost"];
              res["callcost"] = res["callCost"];
              delete res["callCost"];
              res["bridgetime"] = res["bridgeTime"];
              delete res["bridgeTime"];
              res["sessiontime"] = res["sessionTime"];
              delete res["sessionTime"];
              res["callplanname"] = res["callPlanName"];
              delete res["callPlanName"];
              res["gatewayname"] = res["gatewayName"];
              delete res["gatewayName"];
              res["dispcallerid"] = res["dispCallerId"];
              delete res["dispCallerId"];
              res["termdescription"] = res["termDescription"];
              delete res["termDescription"];
              res["dispdestination"] = res["dispDestination"];
              delete res["dispDestination"];
              return res;
            });
            res.send({
              status_code: 200,
              message: "Extension CDR list.",
              data: response[0][0],
            });
            this.apiInstance.log(
              200,
              "Extension CDR list.",
              "getCRMCDR",
              "crm",
              req.customer_id,
              req.ext_number
            );
          } else {
            res.send({
              status_code: 201,
              message: "No Data found.",
              data: [],
            });
            this.apiInstance.log(
              201,
              "No Data found.",
              "getCRMCDR",
              "crm",
              req.customer_id,
              req.ext_number
            );
          }
        })
        .catch((err) => {
          errorLog(err);
          res.status(400).send({
            status_code: 400,
            message: "Bad Request",
          });
          this.apiInstance.log(
            400,
            "Bad Request: " + err.sqlMessage,
            "getCRMCDR",
            "crm",
            req.customer_id,
            req.ext_number
          );
          throw err;
        });
    } else {
      this.apiInstance.log(
        403,
        "Forbidden - User has no permission for perform this action.",
        "getMinutePlan",
        "pbx",
        "",
        "",
        ""
      );
      res
        .status(403)
        .send({
          status_code: 403,
          error: "Forbidden",
          message: "User has no permission for perform this action",
        });
    }
  }
}
