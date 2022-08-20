// import { errorLog, infoLog } from '../utils/logger.util';
//  import { Table } from '../dba/table';
//  import { ApiLogs } from '../utils/api-logs';
//  var knex = require('../dba/knex.db');
// import validations from 'validator';
// import { name } from '../calling_functions/call.plan.function'
// import { MinutePlanTypeConstants } from '../utils/constant';

// export class callplans{
//     // public validation = new validations();
//     // public apiInstance = new ApiLogs();
//     // public minutePlan = new MinutePlanTypeConstants();

//      /**
//    *
//    * @param req
//    * @param res
//    * @param next
//    */

//       public callPlan(data, res, next) {
//         var datas = data;
//         var user_name = datas.names;
//         const obj_name = new name();
    
//         var types = datas.lc_type ? datas.lc_type : "0";
//         var circles = datas.circle ? datas.circle : "0";
//         var minutes = datas.minute ? datas.minute : "0";
//         if (validations.isEmpty(datas.names) || !isNaN(datas.names) == true) {
//           res.status(400).json({ message: "Bad Request" });
//         } else {
//           obj_name.namec(user_name).then((name_d) => {
//             console.log(name_d);
//             if (name_d == "0") {
//               if (
//                 user_name &&
//                 datas.status == "1" &&
//                 circles == "0" &&
//                 minutes == "0"
//               ) {
//                 console.log(circles);
    
//                 // console.log(lc_type);
//                 knex(Table.tbl_Call_Plan)
//                   .insert({
//                     name: user_name,
//                     lc_type: types,
//                     status: datas.status,
//                     circle_id: "",
//                   })
//                   .then((response: any) => {
//                     if (response.length > 0) {
//                       res.status(200).json({ message: "Ok" });
//                       console.log("Insert at " + response + "" + "Number");
//                     } else {
//                       console.log("datas not insert");
//                     }
//                   });
//               }
          
//               else if (
//                 user_name &&
//                 datas.status == "1" &&
//                 circles == "1" &&
//                 minutes == "0"
//               ) {
//                 console.log(circles);
//                 // res.json({ message: "circle datas add yhi hoaga" });
//                 if (datas.circle_id) {
//                   knex
//                     .raw("call pbx_call_plan(?,@value)", [datas.circle_id])
//                     .then((res) => knex.select(knex.raw("@value as v")))
//                     .then((row) => {
//                       var rows = Object.values(row[0]);
//                       if (rows == datas.circle_id) {
//                         knex(Table.tbl_Call_Plan)
//                           .insert({
//                             name: user_name,
//                             lc_type: types,
//                             status: datas.status,
//                             is_circle: circles,
//                             circle_id: datas.circle_id,
//                           })
//                           .then((response) => {
//                             if (response.length > 0) {
//                               res.status(200).json({ message: "OK" });
//                               console.log("datas Inserted in circle");
//                             } else {
//                               res.status(201).json({ message: "No datas found" });
//                               console.log("No datas Insert");
//                             }
//                           });
//                       } else {
//                         res.status(400).json({ message: "Invalid Circle Input" });
//                       }
//                     });
//                 } else {
//                   res.status(400).json({ message: `Invalid input` });
//                 }
//               } else if (
//                 user_name &&
//                 circles == "0" &&
//                 datas.status == "1" &&
//                 minutes == "1"
//               ) {
//                 if (
//                   datas.minute_plan_type == MinutePlanTypeConstants.BUNDLE ||
//                   datas.minute_plan_type == MinutePlanTypeConstants.ROAMING ||
//                   datas.minute_plan_type == MinutePlanTypeConstants.TELECONSULTANCY
//                 ) {
//                   knex(Table.tbl_Call_Plan)
//                     .insert({
//                       name: user_name,
//                       is_minute_plan: minutes,
//                       plan_type: datas.minute_plan_type,
//                       status: datas.status,
//                       circle_id: "",
//                       lc_type: types,
//                     })
//                     .then((row) => {
//                       if (row.length > 0) {
//                         console.log("datas");
//                         res.status(200).json({ message: "Minute datas insert" });
//                       }
//                     });
//                 } else {
//                   // if (visible_customer == "1") {
//                   if (
//                     user_name &&
//                     datas.minute_plan_type == MinutePlanTypeConstants.BOOSTER &&
//                     datas.status == "1" &&
//                     circles == "0"
//                   ) {
//                     knex(Table.tbl_Call_Plan)
//                       .insert({
//                         name: user_name,
//                         lc_type: types,
//                         status: datas.status,
//                         plan_type: datas.minute_plan_type,
//                         is_minute_plan: minutes,
//                         is_visible_customer: datas.visible_customer,
//                         circle_id: "",
//                       })
//                       .then((response) => {
//                         if (response.length > 0) {
//                           console.log("datas add for booster");
//                         }
//                       });
//                   } else {
//                     console.log("customer visible nahi hai");
//                     res.json({ message: "customer visible nahi h" });
//                   }
//                   // } else {
//                   //   console.log("minute plan sahi chhose kar");
//                   // }
//                 }
//               }
//             } else {
//               res.status(200).json({ message: "Duplicate Name Entry" });
//               console.log("Duplicate Name");
//             }
//           });
//         }
//       }
// }