/**
 * @file
 *
 * This is a Validation utils of public/private api urls. Can be accessed after success login. These urls no need authentication.
 *
 * @author Nagender Pratap Chauhan on 04/10/21.
 */
import { Table } from "../dba/table";
var knex  = require('../dba/knex.db');

export class Validation {
  public validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  public validateMobile(mobileNumber) {
    const re = /^([0|\+[0-9]{1,5})?([7-9][0-9]{9})$/;
    return re.test(String(mobileNumber).toLowerCase());
  }

  public validateOnlyChar(character) {
    const re = /^[a-zA-Z]+$/g;
    return re.test(String(character).toLowerCase());
  }

  public validateOnlyNumber(number) {
    const re = /^[0-9]*$/;
    return re.test(String(number).toLowerCase());
  }

  public secure_password_generator(len) {
    let length = (len) ? (len) : (8);
    let string_lower = "abcdefghijklmnopqrstuvwxyz";
    let string_UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let numeric = '0123456789';
    let punctuation = '!#$%&\*+,-./:<=>?@[\]^_{|}~'; // remove ;'"`() from this punctuation
    let password = "";
    let character = "";
    while (password.length < length) {
      let entity1 = Math.ceil(string_lower.length * Math.random() * Math.random());
      let entity2 = Math.ceil(numeric.length * Math.random() * Math.random());
      let entity3 = Math.ceil(punctuation.length * Math.random() * Math.random());
      let entity4 = Math.ceil(string_UPPER.length * Math.random() * Math.random());
      character += string_lower.charAt(entity1);
      character += string_UPPER.charAt(entity4);
      character += numeric.charAt(entity2);
      character += punctuation.charAt(entity3);
      password = character;
    }
    password = password.split('').sort(function () { return 0.5 - Math.random() }).join('');
    return password.substr(0, len);
  }

  public sipPassword() {
    let length = 8,
      charset = "0123456789abcdefghijklmnopqrstuvwxyz",
      retVal = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
  }

// Developed by Yash kashyap
  public validateAccountManager(acmId) {
    return knex.select(knex.raw('COUNT(c.id) as count'))
      .from(Table.tbl_Customer + ' as c')
      .andWhere('c.id', acmId)
      .andWhere('c.role_id', '4')
      .then((response) => {
        // console.log(response,"------------------");
        
        if (response[0].count > 0) {
          return true;
        } else {
          return false;
        }
      })
  }

  public validateDialOut(dialout){
    return knex.select('dg.id')
    .from(Table.tbl_Dialout_Group + ' as dg')
    .where('dg.id',dialout)
    .then((res)=>{
      if(res == ""){
        return false;
      }else{
        return res[0]['id'];
      }
    });
  }

  public validateExtension(ext_number, custId) {
      return knex.from(Table.tbl_Extension_Master).where('customer_id', "" + custId + "").andWhere('ext_number', "" + ext_number + "")
          .select('id')
          .then((response) => {
          if (response.length >= 1) {
            return true;
          } else {
            return false;
          }
      });
  }

  public validateEmailExist(email) {
    return knex.from(Table.tbl_Extension_Master).where('email', "" + email + "")
    .select('id')
    .then((response) => {
        if (response.length > 0) {
          return true;
        } else {
          return false;
        }
    }).catch((err) => { console.log(err)});   
}


public validateCustomerEmailExist(email) {
  return knex.from(Table.tbl_Customer).where('email', "" + email + "")
   .andWhere('status', '!=', '2')
   .andWhere('role_id', '!=', '0')
   .select('id')
   .then((response) => {
      if (response.length > 0) {
        return true;
      } else {
        return false;
      }
  }).catch((err) => { console.log(err)});
}

  public validateExtensionLimit(ext_limit, custId) {
    return knex.from(Table.tbl_Extension_Master).where('customer_id', "" + custId + "").andWhere('status', "1")
      .select('*')
      .then((response) => { 
        let remainExt = parseInt(ext_limit) - parseInt(response.length ? response.length : 0);
        if (remainExt == 0) {
          return true;
        } else {
          return false;
        }
      });
  }

  public validateExtensionLength(custId){
    return knex.from(Table.tbl_Customer).where('id',""+custId+"")
    .select('extension_length_limit').then((response)=>{
      return response[0];
    }).catch((err)=> {console.log(err)});
  }

  public validateCountry(country_id) {
    return knex.from(Table.tbl_Country).where('id',""+country_id+"")
    .select('phonecode').then((response)=>{
      return response[0]
    }).catch((err)=>{ console.log(err)
    })
  }

  public validateState(state_id){
    return knex.from(Table.tbl_States).where('id',""+state_id+"")
    .select('id').then((response,err)=>{
      if(response.length>0){
      return response[0]
      }
      }).catch((err)=>{ console.log(err)
    });
  }

  public validateCustomerCompany(company) {
    return knex.from(Table.tbl_Customer).where('company_name', "" + company + "")
     .andWhere('status', '!=', '2')
     .andWhere('role_id', '=', '1')
     .select('id')
     .then((response) => {
        if (response.length > 0) {
          return true;
        } else {
          return false;
        }
    }).catch((err) => { console.log(err)});
  }

  public validatePackage(pckgId) {
    return knex.from(Table.tbl_Package)
     .where('id', pckgId)
     .select('mapped')
     .then((response) => {
        if (response[0]['mapped'] == '1') {
          return true;
        } else {
          return false;
        }
    }).catch((err) => { console.log(err)});
  }

  public validatePackageBasedOnCircle(pckgId,circleId) {
     return  knex.from(Table.tbl_Package + ' as p')
          .leftJoin(Table.tbl_Features + ' as f','f.id','p.feature_id')
     .where('p.id', pckgId)
     .andWhere('f.circle_id', circleId)
     .select('p.id')
     .then((response) => {
       console.log(response);
        if (response.length) {
          return false;
        } else {
          return true;
        }
    }).catch((err) => { console.log(err)});
  }

  public validateCircleExist(circleId) {
    return knex.from(Table.tbl_circle)
     .where('id', circleId)
     .select('id')
     .then((response) => {
      if (response.length > 0) {
        return false;
      } else {
        return true;
      }
    }).catch((err) => { console.log(err)});
  }
  public validatePackageExist(pckgId) {
    return knex.from(Table.tbl_Package)
     .where('id', pckgId)
     .select('id')
     .then((response) => {
      if (response.length > 0) {
        return false;
      } else {
        return true;
      }
    }).catch((err) => { console.log(err)});
  }

  public validateProviderExist(name) {
    return knex.from(Table.tbl_Provider).where('provider', "" + name + "")
     .select('id')
     .then((response) => {
        if (response != 0) {
          return response[0]['id'];
        } else {
          return false;
        }
    }).catch((err) => { console.log(err)});
  }

  public validateFeature(feature_id){
    return knex.from(Table.tbl_Feature_Plan).where('id',"" + feature_id + "")
    .select('id')
    .then((response)=>{
      if(response.length>0){
        return response[0];
      }else{
        return false;
      }
    }).catch((err)=>{
      console.log(err);
    })
  }

  public ValidateSmsExist(smsid) {
    return knex.from(Table.tbl_SMS).where('id',""+smsid + "")
    .select('id')
    .then((response)=>{
      if(response.length > 0){
        return response[0];
      }else{
        return false;
      }
    }).catch((err)=>{
      console.log(err);
    })
  }


// Developed by Yash kashyap--------------
  public validateCallPlanExist(callplanid){
    return knex(Table.tbl_Call_Plan)
    .where('is_minute_plan', 'like','0')
    .andWhere('id',callplanid)
    .select('id')
    .then((response) => {
      // console.log(response,"------------------");
      return response; 
    });
  }

  public validateBundle(plantype){
    return knex.raw('call pbx_getMinutePlanForPackageCretion('+plantype+')')
    .then((response3)=>{
        if(response3){
           return response3[0][0];
        }else{
          return false;
        }
    })
  }


// Developed by Yash kashyap
  public validateCallPlanBasedOnCircle(callplanid,circleid){
    return knex(Table.tbl_Call_Plan)
    .where('is_minute_plan', 'like','0')
    .andWhere('id',callplanid)
    .andWhere('circle_id',circleid)
    .select('id')
    .then((response) => {
      if(response.length > 0){
        return true;
      }else{
        return false;
      }
    });
  }


// Developed by Yash kashyap
  public validateCircle(circleid){
    return knex(Table.tbl_circle).where('id',circleid)
    .select('id')
    .then((response)=>{
      // console.log(response[0]['id']);
      if(response.length>0){
      return response[0]['id']
      }else{
        return false;
      }
    }).catch((err)=>{
      return err;
    });
  }


// Developed by Yash kashyap
  public validateCountryExist(country){
    return knex(Table.tbl_Country)
    .where('id',country)
    .select('id')
    .then((response) =>{
     // console.log(response,"--------country response-----------------------------");                    
     if(response.length>0){
        return response;
     }else{
        return false;
     }
    });
}
  

// Developed by Yash kashyap
  public validateDID(did_num){
    return knex(Table.tbl_DID)
    .where('did',did_num)
    .select('did').then((response)=>{
      if(response == ""){
        return true;
      }else{
        return response;
      }
    })
  }


// Developed by Yash kashyap
  public GetCustomerByProduct(product_id,customer_id){
    return knex.from(Table.tbl_Customer +' as c')
    .leftJoin(Table.tbl_Map_Customer_Package + ' as mcp', 'mcp.customer_id' , 'c.id')
    .where('c.status' , "1")
    .andWhere('c.role_id', "1")
    .andWhere('mcp.product_id',product_id)
    .andWhere('c.id',customer_id) 
    .select('c.id','c.balance').then((response)=>{
      if(response == ""){
        return false;
      }else{
        return response;
      }    
    }).catch((err)=>{
      console.log(err);
    })
  }


// Developed by Yash kashyap
  public GetDIDByCountry(country,did){
    return knex(Table.tbl_DID)
    .where('country_id',country)
    .andWhere('reserved', 1)
    .andWhere('status','1')
    .andWhere('did',did)
    .select('did')
    // console.log(sql.toQuery());    
    .then((res)=>{
      // console.log(res,"----------------",);      
      if(res == ''){
        return false;
      }else{
      return res;
      }      
    })
  }


// Developed by Yash kashyap
  public validateCodec(codec_id){
    return knex(Table.tbl_Codec)
    .where('id',codec_id)
    .select('name').then((response)=>{
      if(response == ""){
        return false;
      }else{
        // return true;
        return response[0]['name'];
      }
    })
  }


// Developed by Yash kashyap
  public validateCallPlanName(callPlan){
    return knex(Table.tbl_Call_Plan)
    .where('name',callPlan)
    .select('name')
    .then((response)=>{
      if(response == ""){
        return true;
      }else{
        return false;
      }
    });
  }


// Developed by Yash kashyap
  public validatePlanType(type,id){
    return knex(Table.tbl_Call_Plan)
    .where('plan_type',type)
    .andWhere('id',id)
    .select('id')
    .then((response)=>{
      // console.log(response,"-------------------------------------------");      
      if(response == ""){     
        return false;
      }else{
        // console.log(response,"--------response--------");        
        return response[0]['id'];
      }
    });
  }


// Developed by Yash kashyap
  public getCountry(id){
    return knex(Table.tbl_Country)
    .where('id',id)
    .select('phonecode').then((response)=>{
      if(response == ""){
        return false;
      }else{
        return response[0]['phonecode'];
      }
    });
  }


// Developed by Yash kashyap
  public validateGroup(id){
    return knex(Table.tbl_Call_Rate_Group)
    .where('id',id)
    .select('minutes').then((response)=>{
      // console.log(response,"-------response of group-----------");      
      if(response == ""){
        return false;
      }else{
        return response[0]['minutes'];
      }      
    });
  }


// Developed by Yash kashyap  
  public validateGateway(id){
    return knex(Table.tbl_Gateway)
    .where('id',id)
    .select('id')
    .then((response)=>{
      if(response == ""){
        return false;
      }else{
        return response[0]['id'];
      }
    });
  }
  // public validateCallPlanByCircle(callplanid,circleid){
  //   return knex(Table.tbl_Call_Plan)
  //   .where('id',callplanid)
  //   .andWhere('circle_id',this.validateCircle(circleid))
  //   .then((response)=>{
  //     console.log(response[0]);
      
  //     return response[0]
  //   })
  // }
}