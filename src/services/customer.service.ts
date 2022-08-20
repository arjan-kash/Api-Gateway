/**
 * @file
 *
 * This is a CustomerService controller of public api urls. Can be accessed after success login. These urls need authentication.
 *
 * @author Nagender Pratap Chauhan on 16/11/21.
 */

import { errorLog, infoLog } from '../utils/logger.util';
import { warnLog, unauthLog } from '../utils/logger.util';
import { Table } from '../dba/table';
import { ApiLogs } from '../utils/api-logs';
import { Validation } from '../utils/validation.util';
import { PushEmail } from '../utils/pushMail';
import * as Hash from 'crypto-js/pbkdf2';
import * as fs from 'fs';
import * as JWT from 'jsonwebtoken';
import { UserTypeConstants } from '../utils/constant';
const e = require('express');
import { ResourceGroupsTaggingAPI } from 'aws-sdk';

const config = require('../config');
var knex = require('../dba/knex.db');
const JWTUtil = require('../utils/jwt.util');


export class CustomerService {

    public apiInstance = new ApiLogs();
    public validationInstance = new Validation();
    public pushEmail = new PushEmail();
    public jwt = new JWTUtil();
    public encrypt = new JWTUtil(); 


    /**
     *
     * @param req
     * @param res
     * @param next
     */

    public async customerCreation(req, res, next) {
        var data = req.body;
        let credit;
        if (data.accountmanager) {  // account Manager id verify
            let isEmailVerified : any =  await this.validationInstance.validateAccountManager(data['accountmanager']);
            if (!isEmailVerified) {
                this.apiInstance.log(402, 'Wrong Account Manager Id.', 'customerCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
                return res.status(402).send({ error: 'Wrong accountmanager Id', message: 'Please provide the correct accountmanager fields.' });
            }
        }

        if (!data.firstname) {  // First Name
            this.apiInstance.log(402, 'Parameter Missing - firstname.', 'customerCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
            return res.status(402).send({ status_code: 402, error: 'Parameter Missing', message: 'Please enter the firstname' });
        }
        if (data.firstname) {  // First Name
            let isFirstNameVerified = await this.validationInstance.validateOnlyChar(data['firstname']);
            if (!isFirstNameVerified) {
                this.apiInstance.log(402, 'Only Character allowed.', 'customerCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
                return res.status(402).send({ status_code: 402, error: 'Only Character allowed.', message: 'Please provide the correct firstname.' });
            }
        }
        if (data.firstname.length >20) {  // First Name
            this.apiInstance.log(402, 'First Name length should be less than 20.', 'customerCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
            return res.status(402).send({ status_code: 402, error: 'firstname length.', message: 'First Name length should be less than 21.' });
        }
        // if(!data.lastname){
        //     this.apiInstance.log(402, 'Parameter Missing - lastname.', 'customerCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
        //     return res.status(402).send({ status_code: 402, error: 'Parameter Missing', message: 'Please enter the lastname.' });
        //  }
        if (data.lastname) {  // Last Name
            let isLastNameVerified = await this.validationInstance.validateOnlyChar(data['lastname']);
            if (!isLastNameVerified) {
                this.apiInstance.log(402, 'Only Character allowed.', 'customerCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
                return res.status(402).send({ status_code: 402, error: 'Only Character allowed.', message: 'Please provide the correct lastname.' });
            }
            if(data.lastname.length > 20){
                this.apiInstance.log(402, 'last Name length should be less than 20.', 'customerCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
                return res.status(402).send({ status_code: 402, error: 'lastname length.', message: 'last Name length should be less than 21.' });     
            }   
        }
        if (!data.email) {  // Email
            this.apiInstance.log(402, 'Parameter Missing - email.', 'customerCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
            return res.status(402).send({ status_code: 402, error: 'Parameter Missing', message: 'Please enter the email' });
        }
        if (data.email) {  // Email
            let isEmailVerified = await this.validationInstance.validateEmail(data['email']);
            if (!isEmailVerified) {
                this.apiInstance.log(402, 'Wrong Email Id.', 'customerCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
                return res.status(402).send({ error: 'Wrong Email Id', message: 'Please provide the correct email id.' });
            }
        }
        if (data.email) {  // email id verify
            let isMailVerified = await this.validationInstance.validateCustomerEmailExist(data['email']);
            if (isMailVerified) {
                this.apiInstance.log(402, 'Email already exist.', 'customerCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
                return res.status(402).send({ error: 'Email already exist', message: 'Please provide the alternate email.' });
            }
        }
        if (!data.username) {  // Username
            this.apiInstance.log(402, 'Parameter Missing - username.', 'customerCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
            return res.status(402).send({ status_code: 402, error: 'Parameter Missing', message: 'Please enter the username' });
        }
        if(data.username){
        if(!(data.username>7 && data.username<21) && (/\s/.test(data.username))){
            this.apiInstance.log(402, 'Username does not valid.', 'customerCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
            return res.status(402).send({ status_code: 402, error: 'Ivalid Username', message: 'Please enter the correct username.' });
        }
    }
        if (!data.mobile) {  // mobile
            this.apiInstance.log(402, 'Parameter Missing - mobile.', 'customerCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
            return res.status(402).send({ status_code: 402, error: 'Parameter Missing', message: 'Please enter the mobile' });
        }
        if (data.mobile) {  // mobile
            let isMobileVerified = await this.validationInstance.validateMobile(data['mobile']);
            if (!isMobileVerified) {
                this.apiInstance.log(402, 'Wrong Mobile Number.', 'customerCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
                return res.status(402).send({ error: 'Wrong Mobile Number', message: 'Please provide the correct mobile number.' });
            }
        }
        if (!data.countryid) {  // Country
            this.apiInstance.log(402, 'Parameter Missing - countryid.', 'customerCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
            return res.status(402).send({ status_code: 402, error: 'Parameter Missing', message: 'Please enter the countryid' });
        }
        if (typeof (data.countryid) != "number") {  // createdby
            this.apiInstance.log(402, 'Only Number allowed.', 'customerCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
            return res.status(402).send({ status_code: 402, error: 'Only Number allowed.', message: 'Please provide the correct countryid.' });
        }
        let countryVerified;
        let stateVerified;
        let state;
        if(data.countryid != 99){
            // console.log("if condition -------------------------");
            countryVerified= await this.validationInstance.validateCountry(data.countryid);
            // console.log(countryVerified['phonecode'],"---------------------");
            if(data.states){
                this.apiInstance.log(402, "state not exist.", 'customerCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
                return res.status(402).send({ status_code: 402, error: 'state not exist.', message: 'state not valid on country id.' });
            }else{
                state = '';
            }
        }
        if(data.countryid == 99){
                // console.log("again if condtion --------------------");
                countryVerified= await this.validationInstance.validateCountry(data.countryid);
                if(countryVerified['phonecode']==91){
                if (!data.states) {  // State
                    this.apiInstance.log(402, 'Parameter Missing - states.', 'customerCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
                    return res.status(402).send({ status_code: 402, error: 'Parameter Missing', message: 'Please enter the states' });
                }
                if (typeof (data.states) != "number") {  // states
                    this.apiInstance.log(402, 'Only Number allowed.', 'customerCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
                    return res.status(402).send({ status_code: 402, error: 'Only Number allowed.', message: 'Please provide the correct states.' });
                }
                stateVerified = await this.validationInstance.validateState(data.states);
                // console.log(stateVerified,"<========");
                
                if(!stateVerified){
                    this.apiInstance.log(402, 'Invalid State.', 'customerCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
                    return res.status(402).send({ status_code: 402, error: 'Invalid State.', message: 'Please provide the correct states id.' });
                }
                if(stateVerified['id']==data.states){
                    // console.log(stateVerified,"<========");
                     state = stateVerified['id'];
                }else{
                    res.json("state not found")
                }
            }
        }
        if (!data.timezone) {  // time Zone
            this.apiInstance.log(402, 'Parameter Missing - timezone.', 'customerCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
            return res.status(402).send({ status_code: 402, error: 'Parameter Missing', message: 'Please enter the timezone' });
        }
        if (typeof (data.timezone) != "number") {  // timezone
            this.apiInstance.log(402, 'Only Number allowed.', 'customerCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
            return res.status(402).send({ status_code: 402, error: 'Only Number allowed.', message: 'Please provide the correct timezone.' });
        }
        if (!data.companyname) {  // companyName
            this.apiInstance.log(402, 'Parameter Missing - companyname.', 'customerCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
            return res.status(402).send({ status_code: 402, error: 'Parameter Missing', message: 'Please enter the companyname' });
        }
        if (data.companyname) {  // companyName validate
            let isCompanynameVerified = await this.validationInstance.validateCustomerCompany(data['companyname']);
            // console.log(isCompanynameVerified,'isCompanynameVerified');
            if (isCompanynameVerified) {
                this.apiInstance.log(402, 'Company name already exist.', 'customerCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
                return res.status(402).send({ error: 'Wrong Company Name', message: 'Company name already exist.' });
            }
        }
        if (!data.accountmanager) {  // account Manager
            this.apiInstance.log(402, 'Parameter Missing - accountmanager.', 'customerCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
            return res.status(402).send({ status_code: 402, error: 'Parameter Missing', message: 'Please enter the accountmanager' });
        }
        if (!data.accountmanager) {  // account Manager id verify
            let isAMVerified = await this.validationInstance.validateAccountManager(data['accountmanager']);
            if (!isAMVerified) {
                this.apiInstance.log(402, 'Wrong accountmanager Id.', 'customerCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
                return res.status(402).send({ error: 'Wrong Account Manager', message: 'Please provide the correct accountmanager.' });
            }
        }
        if (!data.billingtype) {  // billing Type
            this.apiInstance.log(402, 'Parameter Missing - billingtype.', 'customerCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
            return res.status(402).send({ status_code: 402, error: 'Parameter Missing', message: 'Please enter the billingtype' });
        }
        if (typeof (data.billingtype) != "number") {  // billingtype
            this.apiInstance.log(402, 'Only Number allowed.', 'customerCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
            return res.status(402).send({ status_code: 402, error: 'Only Number allowed.', message: 'Please provide the correct billingtype.' });
        }
        if(data.billingtype != 1 && data.billingtype != 2){
            this.apiInstance.log(402, 'billingtype should be 1 and 2.', 'customerCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
            return res.status(402).send({ status_code: 402, error: 'Not Correct value', message: 'billingtype should be 1 and 2.' });
        }
        if(data.billingtype ==1){
            if(data.creditlimit){
                this.apiInstance.log(402, 'creditlimit not valid on billingtype 1.', 'customerCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
                return res.status(402).send({ status_code: 402, error: 'invalid parameter on billing type 1', message: 'creditlimit not valid on billingtype 1.' });
                // request.creditlimit = request.creditlimit ? request.creditlimit : 0;
            }
        }else{
            if(data.creditlimit){
                credit = data.creditlimit ? data.creditlimit : 0
            }
        }
        if (!data.packageid) {  // billing Type
            this.apiInstance.log(402, 'Parameter Missing - packageid.', 'customerCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
            return res.status(402).send({ status_code: 402, error: 'Parameter Missing', message: 'Please enter the packageid' });
        }
        if (data.packageid) {  // packageid validate
            let ispackageIdVerified = await this.validationInstance.validatePackageExist(data['packageid']);
            if (ispackageIdVerified) {
                this.apiInstance.log(402, 'Package does not exist.', 'customerCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
                return res.status(402).send({ error: 'Wrong Package id', message: 'Package does not exist.' });
            }
        }
        if (data.packageid) {  // packageid validate
            let ispackageIdVerified = await this.validationInstance.validatePackage(data['packageid']);
            if (ispackageIdVerified) {
                this.apiInstance.log(402, 'Package already in used.', 'customerCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
                return res.status(402).send({ error: 'Wrong Package id', message: 'Package already in used.' });
            }
        }
        if (data.iscircle) {  // billing Type
            if (typeof (data.iscircle) != "number") {  // iscircle
                this.apiInstance.log(402, 'Only Number allowed.', 'customerCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
                return res.status(402).send({ status_code: 402, error: 'Only Number allowed.', message: 'Please provide the correct iscircle.' });
            }
            if (!data.circleid) {  //circleid
                this.apiInstance.log(402, 'Parameter Missing - circleid.', 'customerCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
                return res.status(402).send({ status_code: 402, error: 'Parameter Missing', message: 'Please enter the circleid' });
            }
        }
       
        if (data.circleid) {  // circleid validate
            let isCirclepackageIdVerified = await this.validationInstance.validateCircleExist(data['circleid']);
            if (typeof (data.circleid) != "number") {  // circleid
                this.apiInstance.log(402, 'Only Number allowed.', 'customerCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
                return res.status(402).send({ status_code: 402, error: 'Only Number allowed.', message: 'Please provide the correct circleid.' });
            }
            if (isCirclepackageIdVerified) {
                this.apiInstance.log(402, 'Circle id does not exist.', 'customerCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
                return res.status(402).send({ error: 'Wrong circle id', message: 'circleid does not exist.' });
            }
        }
        if (data.circleid) {  // circleid based pacakage validate
            let isCirclepackageIdVerified = await this.validationInstance.validatePackageBasedOnCircle(data['packageid'],data['circleid']);
            if (isCirclepackageIdVerified) {
                this.apiInstance.log(402, 'Circle has not any Package with id =.'+data.packageid, 'customerCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
                return res.status(402).send({ error: 'Wrong Package/circle id', message: 'Circle has not any Package with id ='+data.packageid });
            }
        }
        if (typeof (data.createdby) != "number") {  // createdby
            this.apiInstance.log(402, 'Only Number allowed.', 'customerCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
            return res.status(402).send({ status_code: 402, error: 'Only Number allowed.', message: 'Please provide the correct createdby.' });
        }
        if(data.balance){
        if (typeof (data.balance) != "number") {  // balance
            this.apiInstance.log(402, 'balance - Only Number allowed.', 'customerCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
            return res.status(402).send({ status_code: 402, error: 'Only Number allowed.', message: 'Please provide the correct balance.' });
        }
    }
        if(data.isapitoken){
        if (typeof (data.isapitoken) != "number") {  // isapitoken
            this.apiInstance.log(402, 'isapitoken - Only Number allowed.', 'customerCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
            return res.status(402).send({ status_code: 402, error: 'Only Number allowed.', message: 'Please provide the correct isapitoken.' });
        }
    }
        if (!data.extensionlengthlimit) {  // extensionLengthLimit
            this.apiInstance.log(402, 'Parameter Missing - extensionlengthlimit.', 'customerCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
            return res.status(402).send({ status_code: 402, error: 'Parameter Missing', message: 'Please enter the extensionlengthlimit' });
        }
        if (typeof (data.extensionlengthlimit) != "number") {  // extensionlengthlimit
            this.apiInstance.log(402, 'extensionlengthlimit - Only Number allowed.', 'customerCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
            return res.status(402).send({ status_code: 402, error: 'Only Number allowed.', message: 'Please provide the correct extensionlengthlimit.' });
        }
        if (data.extensionlengthlimit != 2 && data.extensionlengthlimit != 3 && data.extensionlengthlimit != 4) {  // extensionLengthLimit
            this.apiInstance.log(402, 'Parameter extensionlengthlimit should be 2,3,4', 'customerCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
            return res.status(402).send({ status_code: 402, error: 'Not Correct value', message: 'Please enter the correct extensionlengthlimit like : 2,3,4' });
        }
        if(data.monthlyinternationalthreshold){
        if (typeof (data.monthlyinternationalthreshold) != "number") {  // monthlyinternationalthreshold
            this.apiInstance.log(402, 'monthlyinternationalthreshold - Only Number allowed.', 'customerCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
            return res.status(402).send({ status_code: 402, error: 'Only Number allowed.', message: 'Please provide the correct monthlyinternationalthreshold.' });
        }
    }
        if (!data.invoiceday) {  // extensionLengthLimit
            this.apiInstance.log(402, 'Parameter Missing - invoiceday.', 'customerCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
            return res.status(402).send({ status_code: 402, error: 'Parameter Missing', message: 'Please enter the invoiceday' });
        }
        if (typeof (data.invoiceday) != "number") {  // extensionlengthlimit
            this.apiInstance.log(402, 'invoiceday - Only Number allowed.', 'customerCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
            return res.status(402).send({ status_code: 402, error: 'Only Number allowed.', message: 'Please provide the correct invoiceday.' });
        }
        if (data.invoiceday <= 0 || data.invoiceday >= 29) {  // extensionLengthLimit
            this.apiInstance.log(402, 'Parameter invoiceday should be from 1 to 28', 'customerCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
            return res.status(402).send({ status_code: 402, error: 'Not Correct value', message: 'Invoiceday should be from 1 to 28' });
        }
        if(data.advancepayment){
        if (typeof (data.advancepayment) != "number") {  // advancepayment
            this.apiInstance.log(402, 'advancepayment - Only Number allowed.', 'customerCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
            return res.status(402).send({ status_code: 402, error: 'Only Number allowed.', message: 'Please provide the correct advancepayment.' });
        }
    }
        if (data.dialoutgroup && typeof (data.dialoutgroup) != "number") {  // dialoutgroup
            this.apiInstance.log(402, 'dialoutgroup - Only Number allowed.', 'customerCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
            return res.status(402).send({ status_code: 402, error: 'Only Number allowed.', message: 'Please provide the correct dialoutgroup.' });
        }
        if (data.isnotificationemail && (data.isnotificationemail !== 0 && data.isnotificationemail  !== 1)) {  // isnotificationemail
            this.apiInstance.log(402, 'Parameter isnotificationemail should be either 1 or 0', 'customerCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
            return res.status(402).send({ status_code: 402, error: 'Not Correct value', message: 'isnotificationemail should be either 1 or 0' });
        }
        if (data.isnotificationemail) {  // isnotificationemail
            if (data.hasOwnProperty('notificationemail') || !data.notificationemail) {  // notificationemail
                this.apiInstance.log(402, 'Parameter Missing - notificationemail.', 'customerCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
                return res.status(402).send({ status_code: 402, error: 'Parameter Missing', message: 'Please enter the notificationemail' });
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
            request.createdby = request.createdby ? request.createdby : 2;
            request.status = '1'; // ACTIVE User
            request.time_zone = request.time_zone ? request.time_zone : "49"; //INDIA CHENNAI

            request.balance = request.balance ? request.balance :0;
            console.log(request.balance,"<======");
            
            // request.creditlimit = request.creditlimit ? request.creditlimit : 0;
            request.product_name = ['1'];
            request.iscircle = request.iscircle ? request.iscircle : 0;
            request.circleid = request.circleid ? request.circleid : '';
            const isapitoken = request.isapitoken ? request.isapitoken : 0;
            credit = 0;
            request.token = request.token ? request.token : '';
            request.credit_limit = request.credit_limit ? request.credit_limit : 0;
            request.gstnumber = request.gstnumber ? request.gstnumber : '';
            request.states = request.states ? request.states : '';

            request.monthlyinternationalthreshold = request.monthlyinternationalthreshold ? request.monthlyinternationalthreshold : 0;
            request.oc_package_name = '';
            request.notificationemail = request.notificationemail ? request.notificationemail : '';
            request.dialoutgroup = request.dialoutgroup ? request.dialoutgroup : 0;
            request.callbackurl =request.callbackurl ? request.callbackurl : '';
            request.advancepayment = request.advancepayment ? request.advancepayment : 0
            request.lastname = request.lastname ? request.lastname : '';
            request.companyaddress = request.companyaddress ? request.companyaddress : '';
            request.companyphone = request.companyphone ? request.companyphone : '';
            request.domain = request.domain ? request.domain : '';
            // request.li = request.li ? request.li : 0;
            request.ip = request.ip ? request.ip : '';
            // request.litext = request.litext ? request.litext : '';
            const private_cipher = this.encrypt.cipher(config.jwt.appSecret);
            const password = private_cipher(Math.random().toString(36).slice(-8));
            //--------------------------------------------------------------------------
            if (!id) {
                if (request.user_type == '1') { userTypeVal = 'CustomerCreation' }
                else if (request.user_type == '2') { userTypeVal = 'SubAdminCreation'; permission_id = request.permission_type }
                else userTypeVal = 'InternalUserCreation';
            }
            else {
                if (request.user_type == '1') { userTypeVal = 'CustomerUpdation' }
                else if (request.user_type == '2') { userTypeVal = 'SubAdminCreation' }
                else userTypeVal = 'InternalUserUpdation';
            }

            console.log(knex.raw("Call pbx_create_customer(" + id + ",'" + request.firstname + "','" + request.lastname + "','" + request.email + "','" +
            request.mobile + "','" + request.username + "','" + password.toString() + "','" +
            Math.round(+new Date() / 1000) + "','" + request.companyname + "','" + request.companyaddress + "','" + request.companyphone + "','" +
            request.user_type + "','" + request.domain + "','" + request.createdby + "','" + request.status + "','" + (request.accountmanager ? request.accountmanager : '0') + "','" +
            request.countryid + "','" + request.countrycode + "','" + request.timezone + "','" + request.billingtype + "','" +
            request.balance + "','" + request.creditlimit + "','" + request.gstnumber + "','" + request.packageid + "' ,'" + request.oc_package_name + "','" +
            request.product_name + "', '" + request.states + "', '" + request.iscircle + "', '" + request.circleid + "', '" + request.isapitoken + "', '" + request.token + "', '" + permission_id + "'," + (request.product_name ? (request.product_name).length : 1) + "," +  
            request.extensionlengthlimit  + "," +  request.monthlyinternationalthreshold  + "," + request.invoiceday + "," + 
            request.advancepayment + ",'" + request.callbackurl + "'," +  request.dialoutgroup + ",'" + request.isnotificationemail + "','" + request.notificationemail + "')").toString())           
            console.log("======>","isapitoken",isapitoken,"<=======");
            

            knex.raw("Call pbx_create_customer(" + id + ",'" + request.firstname + "','" + request.lastname + "','" + request.email + "','" +
                request.mobile + "','" + request.username + "','" + password.toString() + "','" +
                Math.round(+new Date() / 1000) + "','" + request.companyname + "','" + request.companyaddress + "','" + request.companyphone + "','" +
                request.user_type + "','" + request.domain + "','" + request.createdby + "','" + request.status + "','" + (request.accountmanager ? request.accountmanager : '0') + "','" +
                request.countryid + "','" + countryVerified['phonecode'] + "','" + request.timezone + "','" + request.billingtype + "','" +
                request.balance + "','" + request.creditlimit + "','" + request.gstnumber + "','" + request.packageid + "' ,'" + request.oc_package_name + "','" +
                request.product_name + "', '" + state + "', '" + request.iscircle + "', '" + request.circleid + "', '" + request.isapitoken + "', '" + request.token + "', '" + permission_id + "'," + (request.product_name ? (request.product_name).length : 1) + "," +  
                request.extensionlengthlimit  + "," +  request.monthlyinternationalthreshold  + "," + request.invoiceday + "," + 
                request.advancepayment + ",'" + request.callbackurl + "'," +  request.dialoutgroup + ",'" + request.isnotificationemail + "','" + request.notificationemail + "','" + request.ip +")")
                .then((response) => {
                    if (response) {
                        let customer_id = response[0][0][0]['lastInserted'];
                        console.log(customer_id);
                        const payload = { 'id': customer_id, 'package_id': "", 'customer_id': customer_id, 'ext_number': '', 'token': '', 'user_type': request.user_type };
                        const upgradeToken = JWT.sign(payload, config.jwt.secret);
                        console.log('upgradeToken', upgradeToken);
                        this.updateCustomerToken(upgradeToken, customer_id);

                        if ((request.user_type == '1') && (response[0][0][0].MYSQL_SUCCESSNO == 200) && (id == null)) {
                            this.ensureExists(__dirname + '/../upload/' + response[0][0][0].lastInserted, 0o755, function (err) {
                                if (err) { console.log("customer dir not created. " + err); }
                                else {
                                    this.ensureExists(__dirname + '/../upload/' + response[0][0][0].lastInserted + '/prompts', 0o755, function (err) {
                                        if (err) { console.log("prompts dir not created. " + err); }
                                        else { console.log("prompts dir created."); }
                                    });

                                    this.ensureExists(__dirname + '/../upload/' + response[0][0][0].lastInserted + '/vm', 0o755, function (err) {
                                        if (err) { console.log("vm dir not created. " + err); }
                                        else { console.log("vm dir created."); }
                                    });

                                    this.ensureExists(__dirname + '/../upload/' + response[0][0][0].lastInserted + '/recording', 0o755, function (err) {
                                        if (err) { console.log("recording dir not created. " + err); }
                                        else { console.log("recording dir created."); }
                                    });
                                }
                            });
                        }
                        const private_cipher = this.encrypt.decipher(config.jwt.appSecret);
                        const decrypted = private_cipher(password.toString());
                        console.log('decrypted==',decrypted);

                        res.send({ code: response[0][0][0].MYSQL_SUCCESSNO, message: response[0][0][0].MESSAGE_TEXT, username:request.username, user_id: response[0][0][0].lastInserted, CompanyName:request.company_name, password : decrypted });
                        // let newdata = { userName: request.f_name, email: request.email, url: url }
                        // this.pushEmail.getEmailContentUsingCategory(userTypeVal).then(val => {
                        //     this.pushEmail.sendmail({ data: newdata, val: val, username: request.username, password: 'cloudconnect' }).then((data1) => {
                        //         //res.json({ data1 })
                        //     })
                        // })

                    }
                }).catch((err) => {
                    errorLog(err);
                    res.status(400).send({
                        status_code: 400,
                        message: 'Bad Request'
                    });
                    this.apiInstance.log(400, 'Bad Request : ' + err, 'customerCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
                    throw err
                });
        } else {
            this.apiInstance.log(403, 'Forbidden - User has no permission for perform this action.', 'customerCreation', 'pbx', '', '', '');
            res.status(403).send({ status_code: 403, error: 'Forbidden', message: 'User has no permission for perform this action' });
        }
    }

    public ensureExists(path, mask, cb) {
        fs.mkdir(path, mask, function (err) {
            if (err) {
                if (err.code == 'EEXIST') cb(null);
                else cb(err);
            } else cb(null);
        });
    }

    public updateCustomerToken = (jwtToken, customer_id) => {
        let current_time = new Date();
        current_time.setHours(current_time.getHours() + 1);
        let current_time_obj: any = current_time.toISOString().split('T')[0] + ' ' + current_time.toTimeString().split(' ')[0];
        knex(Table.tbl_Customer)
            .update({ token: jwtToken, token_exp_time: current_time_obj })
            .where('id', customer_id)
            .then((resp) => {
                console.log(resp);
            });

    }


    /**
     * @param req
     * @param res
     * @param next
     */

        // public UpdateProfile(req,res,next){
        //     let isCustomer = req.user_type ? req.user_type : 1;
        //     if(isCustomer == '1'){
        //         let data= "assets/uploads/"+req.file.filename;
        //         console.log(req.file.filename,"--------filename---------");
        //         console.log(data,"------------------data");
                
        //         let sql = knex(Table.tbl_Customer).update('profile_img',data);
        //         sql.then((response)=>{
        //             if(response.length){
        //                 this.apiInstance.log(200,"Profile update.",'','',req.file.filename);
        //                 return res.sned({status_code:200, message: "Profile update.", url:req.originalUrl});
        //             }else{
        //                 this.apiInstance.log(200,"Profile not update.",'','');
        //                 return res.sned({status_code:200, error: 'Something went wrong', message: "Profile Not Update."});
        //             }
        //         })
        //     }
        // }

    /**
    *
    * @param req
    * @param res
    * @param next
    */

         public getCustomers(req, res, next, type) {
            let isAdmin = req.user_type ? req.user_type : 1;
            // console.log(isAdmin,"---------------admin");
            
            if (isAdmin == '0') {
                let userType = req.query.type;
                if(userType ==  UserTypeConstants.ACCOUNT_MANAGER){
                    knex.raw("Call pbx_getinternalusersbyfilters(" + null + "," + null + "," + null + "," + null + ", " + userType + ")")
                    .then((response) => {
                        if (response.length) {
                            let data =  response[0][0] ? JSON.parse(JSON.stringify((response[0][0]))) : [];
                            let array = [];
                            data.forEach(element => {
                                let obj = {};
                                obj['id'] = element['id'],
                                obj['firstname'] = element['first_name'];
                                obj['email'] = element['email'];
                                obj['username'] = element['username'];
                                array.push(obj);
                            });
                            let sendData = array;
                            res.json({
                                status_code: 200,
                                message: 'Account Manager Listing.',
                                data: sendData
                            });
                            this.apiInstance.log(200, 'Account Manager Listing Info.', 'getCustomer', type, '', '');
                        } else {
                            res.status(201).send({ status_code: 201, message: 'No Data found' });
                            this.apiInstance.log(201, 'No Data found.', 'getCustomer', type, '', '', '');
                        }
                    }).catch((err) => {
                        errorLog(err);
                        res.status(400).send({
                            status_code: 400,
                            message: 'Bad Request'
                        });
                        this.apiInstance.log(400, 'Bad Request: ' + err.sqlMessage, 'getCustomer', type, '', '', '');
                        throw err;
                                        });
                }else if(userType ==  UserTypeConstants.CUSTOMER){
                    let sql  =  knex.raw("Call pbx_getAllUser()");
                    sql.then((response) => {
                        if (response.length) {
                            let data =  response[0][0] ? JSON.parse(JSON.stringify((response[0][0]))) : [];
                            let array = [];
                            data.forEach(element => {
                                let obj = {};
                                obj['id'] = element['id'],
                                obj['firstname'] = element['first_name'];
                                obj['email'] = element['email'];
                                obj['username'] = element['username'];
                                array.push(obj);
                            });
                            let sendData = array;
                            res.json({
                                status_code: 200,
                                message: 'Customer Listing.',
                                data: sendData
                            });
                            this.apiInstance.log(200, 'Customer Listing Info.', 'getCustomer', type, '', '');
                        } else {
                            res.status(201).send({ status_code: 201, message: 'No Data found' });
                            this.apiInstance.log(201, 'No Data found.', 'getCustomer', type, '', '', '');
                        }
                    }).catch((err) => {
                        errorLog(err);
                        res.status(400).send({
                            status_code: 400,
                            message: 'Bad Request'
                        });
                        this.apiInstance.log(400, 'Bad Request: ' + err.sqlMessage, 'getCustomer', type, '', '', '');
                        throw err
                    });
                }else{
                    this.apiInstance.log(406,'Unauthorize Type - Parameter Type is incorrect.','getCustomer','pbx', '', '', req.query); 
                   return res.status(406).send({ status_code: 406, error: 'Parameter Type is incorrect', message: 'Please enter the correct type' });  
                }
               
            } else {
                this.apiInstance.log(403, 'Forbidden - User has no permission for perform this action.', 'getCustomer', type, '', '', '');
                res.status(403).send({ status_code: 403, error: 'Forbidden', message: 'User has no permission for perform this action' });
            }
        }

  /**
  *
  * @param req
  * @param res
  * @param next
  */

    public async didPurchase(req, res, next, type) {
        var data = req.body;
        if (!data.did_id) {  // DID  ID
            this.apiInstance.log(402, 'Parameter Missing - did_id.', 'didPurchase', 'pbx', '', req.ext_number, JSON.stringify(data));
            return res.status(402).send({ status_code: 402, error: 'Parameter Missing', message: 'Please enter the did_id' });
        }
        let userType = req.user_type ? req.user_type : 1;
        if (userType == '1') {  // cUSTOMER PURCHASED
            let isDidExist = await this.didExistOrNot(data.did_id);
            if (!isDidExist) {
                this.apiInstance.log(402, 'did does not exist.', 'didPurchase', 'pbx', '', req.ext_number, JSON.stringify(data));
                return res.status(402).send({ status_code: 402, error: 'DID does not exist', message: 'Please enter the correct did_id' });
            }
            let isDidReservedOrNot = await this.didReservedOrNot(data.did_id);
            if (!isDidReservedOrNot) {
                this.apiInstance.log(402, 'DID already reserved.', 'didPurchase', type, '', req.ext_number, JSON.stringify(data));
                return res.status(402).send({ status_code: 402, error: 'DID already reserved.', message: 'Please enter the correct did_id' });
            }

            knex.select('d.*').from(Table.tbl_DID + ' as d')
                .where('d.id', data.did_id)
                .then((response) => {
                    if (response.length) {
                        let didData = response[0];
                        let did_id = didData['id'];
                        let did_num = didData['did'];
                        let did_kind = didData['did_type'];
                        let description = "";

                        if (did_kind == '1' || did_kind == '2') {
                            description = "Charge for DID - " + did_num;
                        } else {
                            description = "Charge for TFN - " + did_num;
                        }
                         console.log(didData);
                         console.log('did_id',did_id);
                         
                        knex(Table.tbl_DID).where('id', '=', "" + did_id + "")
                            .update({
                                reserved: '1', customer_id: didData.customer_id, product_id: didData.product_id
                            }).then((respo) => {
                                knex.from(Table.tbl_DID + ' as did').where('did.id', "" + did_id + "")
                                    .leftJoin(Table.tbl_Customer + ' as c', 'c.id', 'did.customer_id')
                                    .leftJoin(Table.tbl_Country + ' as cntr', 'cntr.id', 'did.country_id')
                                    // .leftJoin(table.tbl_Package + ' as p', 'p.id', 'mcp.package_id')
                                    .select('did.fixrate', 'c.company_name', 'cntr.nicename', 'c.first_name', 'c.last_name')
                                    .then((resp) => {
                                        let countryName = resp[0].nicename ? resp[0].nicename : '';
                                        let OrganizationName = resp[0].company_name ? resp[0].company_name : '';
                                        let customerName = resp[0].first_name + (resp[0].last_name ? resp[0].last_name : '');
                                        let currentDate = new Date();
                                        let currentYear = currentDate.getFullYear();
                                        let currentMonth = currentDate.getMonth() + 1;
                                        let currentDateInNumber = currentDate.getDate(); // like : 4,6,9,3,12,31,23 etc
                                        let totalNumberOfDayaInCurrentMonth = new Date(currentYear, currentMonth, 0).getDate(); // like : 30,31,28
                                        let billingDay = Number(totalNumberOfDayaInCurrentMonth) - Number(currentDateInNumber);
                                        let didPerDayCharges = Number(resp[0].fixrate) / totalNumberOfDayaInCurrentMonth;
                                        let retroDIDcharges = (billingDay + 1) * didPerDayCharges; // plus one day bcz of need to add current day too.
                                        console.log(retroDIDcharges);
                                        var sql = knex(Table.tbl_Charge).insert({
                                            did_id: "" + did_id + "", customer_id: "" + didData.customer_id + "", amount: "" + (retroDIDcharges).toFixed(2) + "",
                                            charge_type: "1", description: "" + description, charge_status: 0,
                                            invoice_status: 0, product_id: didData.product_id
                                        });
                                        sql.then((response) => {
                                            if (response) {
                                                knex(Table.tbl_Uses).insert({
                                                    did_id: "" + did_id + "", customer_id: "" + didData.customer_id + ""
                                                }).then((response) => {
                                                    if (response) {
                                                        this.apiInstance.log(200, 'DID purchased sucessfully - ' + customerName, 'didPurchase', type, '', '','');
                                                        res.status(200).send({ status_code:200 , message: 'DID purchased sucessfully.' });
                                                    } else {
                                                        this.apiInstance.log(400, 'Error while insert data into did_uses.', 'didPurchase', type, '', '', JSON.stringify(data));
                                                        res.status(400).send({
                                                            status_code: 400,
                                                            message: 'Error while insert data into did_uses.'
                                                        });
                                                    }
                                                    // let newdata = {  email: didData.adminEmail, didDatas: didDatas, cName: customerName, 
                                                    //                 cEmail: didData.customerEmail,  url: url , userName : 'Admin' ,
                                                    //                  customerOrganization : OrganizationName , countryName : countryName };
                                                    // pushEmail.getEmailContentUsingCategory(userTypeVal).then(val => {
                                                    //     pushEmail.sendmail({ data: newdata, val: val }).then((data1) => {
                                                    //     })
                                                    // })
                                                }).catch((err) => {
                                                    this.apiInstance.log(400, 'Bad Request: ' + err.sqlMessage, 'didPurchase', type, '', '', '');
                                                    res.status(400).send({
                                                        status_code: 400,
                                                        message: 'Bad Request' + err.sqlMessage
                                                    });
                                                    throw err;
                                                });
                                            } else {
                                                this.apiInstance.log(400, 'Error while insert data into charge.', 'didPurchase', type, '', '', JSON.stringify(data));
                                                res.status(400).send({
                                                    status_code: 400,
                                                    message: 'Error while insert data into charge.'
                                                });
                                            }
                                        }).catch((err) => {
                                            this.apiInstance.log(400, 'Bad Request: ' + err.sqlMessage, 'didPurchase', type, '', '', '');
                                            res.status(400).send({
                                                status_code: 400,
                                                message: 'Bad Request' + err.sqlMessage
                                            });
                                            throw err;
                                        });
                                    }).catch((err) => {
                                        this.apiInstance.log(400, 'Bad Request: ' + err.sqlMessage, 'didPurchase', type, '', '', '');
                                        res.status(400).send({
                                            status_code: 400,
                                            message: 'Bad Request' + err.sqlMessage
                                        });
                                        throw err;
                                    });
                            }).catch((err) => {
                                this.apiInstance.log(400, 'Bad Request: ' + err.sqlMessage, 'didPurchase', type, '', '', '');
                                res.status(400).send({
                                    status_code: 400,
                                    message: 'Bad Request' + err.sqlMessage
                                });
                                throw err;
                            });
                    } else {
                        this.apiInstance.log(201, 'DID not exist', 'didPurchase', type, '', '', JSON.stringify(data));
                        res.status(201).send({ status_code: 201, message: 'DID not exist' });
                    }
                }).catch((err) => {
                    this.apiInstance.log(400, 'Bad Request: ' + err.sqlMessage, 'didPurchase', type, '', '', '');
                    res.status(400).send({
                        status_code: 400,
                        message: 'Bad Request' + err.sqlMessage
                    });
                    throw err;
                });

        } else {
            this.apiInstance.log(403, 'Forbidden - User has no permission for perform this action.', 'didPurchase', type, '', '', '');
            res.status(403).send({ status_code: 403, error: 'Forbidden', message: 'User has no permission for perform this action' });
        }
    }

    private didExistOrNot(didId) {
        return knex.select('d.*').from(Table.tbl_DID + ' as d')
            .where('d.id', didId)
            .then((response) => {
                if (response.length) {
                    return true;
                }
                else {
                    return false;
                }
            })
    }

    private didReservedOrNot(didId) {
        return knex.select('d.*').from(Table.tbl_DID + ' as d')
            .where('d.id', didId)
            .andWhere('d.reserved', '1')
            .then((response) => {
                if (response.length) {
                    return true;
                }
                else {
                    return false;
                }
            })
    }
   
    
// Update customer detail on the basis of customer token------------------
/**
 * @param req
 * @param res
 * @param next
 */

 public async UpdateCustomerDetail(req, res, next){
    let customerId = req.customer_id ? req.customer_id : null;
    let IsCustomer = req.user_type ? req.user_type : '1'
    let Updatedata =req.body;
    let dataObj ={};
    if(IsCustomer == '1'){    
    // if(Object.keys(Updatedata).length===0){
    //     res.status(402).send("Please provide data.")
    // }
    
    if(Updatedata.first_name){
        if(Updatedata.first_name.length>20){
            this.apiInstance.log(402,'First Name length should be less than 21.','UpdateCustomerDetail', '',req.customer_id,JSON.stringify(Updatedata)); 
            res.status(402).send({ error: 'First Name Length', message: 'First Name length should be less than 21.' });
        }
        let isFirstNameVerified = await this.validationInstance.validateOnlyChar(Updatedata['first_name']);
        if(!isFirstNameVerified){
            this.apiInstance.log(402, 'Only Character allowed.', 'UpdateCustomer', '', req.customer_id, JSON.stringify(Updatedata));
            return res.status(402).send({ status_code: 402, error: 'Only Character allowed.', message: 'Please provide the correct firstname.' });
        }else{
            dataObj['first_name'] = Updatedata.first_name;
        }
    }    

    if(Updatedata.last_name) {
        let isLastNameVerified = await this.validationInstance.validateOnlyChar(Updatedata['last_name']);
        if(!isLastNameVerified){ 
            this.apiInstance.log(402, 'Only Character allowed.', 'UpdateCustomer', '', req.customer_id, JSON.stringify(Updatedata));
            return res.status(402).send({ status_code: 402, error: 'Only Character allowed.', message: 'Please provide the correct Lastname.' });
        }else{
            dataObj['last_name'] = Updatedata.last_name;
        }
    }

    if(Updatedata.mobile){
        if((Updatedata.mobile).toString().length > 10){
            this.apiInstance.log(400,'invalid input.','','customer Update.');
            return res.status(400).send({status_code : 400, error : 'invalid length.', message : 'please provide valid mobile number.'})
        }
        let isMobileVerified = await this.validationInstance.validateMobile(Updatedata['mobile']);
        if(isMobileVerified == false){
            this.apiInstance.log(402, 'Wrong Mobile Number.', 'UpdateCustomer', '', req.customer_id, JSON.stringify(Updatedata));
            return res.status(402).send({ status_code: 402, error: 'Wrong Mobile Number.', message: 'Please provide correct mobile number.' });
        }else{
            dataObj['mobile'] = Updatedata.mobile;
        }
    }

    if(Updatedata.company_name){  
        let isCompanynameVerified = await this.validationInstance.validateCustomerCompany(Updatedata['company_name']);
        if(isCompanynameVerified) {
            this.apiInstance.log(402, 'Company name already exist.', 'UpdateCustomer', '', req.customer_id, JSON.stringify(Updatedata));
            return res.status(402).send({ error: 'Wrong Company Name', message: 'Company name already exist.' });
        }else{
            dataObj['company_name'] = Updatedata.company_name;
        }
    }

    if(Updatedata.company_phone){
        let number = String(Updatedata.company_phone)[0];
        if(number == '0' || (Updatedata.company_phone.toString().length) < 10 || (Updatedata.company_phone.toString().length) > 15 ){
            this.apiInstance.log(402, 'not start with 0', 'UpdateCustomer', '', req.customer_id, JSON.stringify(Updatedata));
            return res.status(402).send({ error: 'number not allowed.', message: 'Number can not start with 0 and not less than 10 digits.' });
        }else{
            dataObj['phone']= Updatedata.company_phone;
        }
    }    

    if(Updatedata.status){
        if(Updatedata.status != '0' && Updatedata.status != '1' && Updatedata.status != '2' && Updatedata.status != '3' && Updatedata.status != '4' && Updatedata.status != '5'){
            this.apiInstance.log(400, 'status should be 0, 1, 2, 3 & 4.', 'CustomerUpdate', '', req.customer_id, JSON.stringify(Updatedata));
            return res.status(400).send({ status_Code: 402, error: 'status should be 0, 1, 2, 3, 4 & 5.', message: 'Please provide correct status.'});
        }
        dataObj['status'] = Updatedata.status; 
    }

    if(Updatedata.account_manager){
        dataObj['account_manager_id'] = Updatedata.account_manager;
        let isAMVerified = await this.validationInstance.validateAccountManager(Updatedata['account_manager']);
        // console.log(isAMVerified,"--------------verified----------");
        
        if(isAMVerified == false) {
            this.apiInstance.log(400, 'Wrong accountmanager Id.', 'customerCreation', '', req.customer_id, JSON.stringify(Updatedata));
            return res.status(400).send({status_code : 400, error: 'Wrong Account Manager', message: 'Please provide the correct account manager.' });
        }
    }

    if(Updatedata.time_zone){ 
        dataObj['timezone'] = Updatedata.time_zone;
        if (typeof (Updatedata.time_zone) != "number") {  // timezone
            this.apiInstance.log(402, 'Only Number allowed.', 'customerCreation', 'pbx', '', req.customer_id, JSON.stringify(Updatedata));
            return res.status(402).send({ status_code: 402, error: 'Only Number allowed.', message: 'time zone should be number.' });
        }            
    }
    if(Updatedata.GST) dataObj['company_gst_number'] = Updatedata.GST;
    if(Updatedata.billing){
        if(Updatedata.billing != '1' && Updatedata.billing != '2'){
            this.apiInstance.log(402, 'Only Number allowed.', 'CustomerUpdate', 'pbx', '', req.customer_id, JSON.stringify(Updatedata));
            return res.status(402).send({ status_code: 402, error: 'Only Number allowed.', message: 'Please provide the correct billing type.' });
        }
        dataObj['billing_type'] = Updatedata.billing;
    }
    if(Updatedata.advanced_pay) dataObj['advance_payment'] = Updatedata.advanced_pay ? Updatedata.advanced_pay : '0.00';
    if(Updatedata.invoice && Updatedata.invoice < 29) dataObj['invoice_day'] = Updatedata.invoice;
    let validateDialOut;
    if(Updatedata.dialout_id){
        dataObj['dialout_group'] = Updatedata.dialout_id;
        validateDialOut = await this.validationInstance.validateDialOut(Updatedata.dialout_id);
        if(validateDialOut == false){
            this.apiInstance.log(400, 'invalid Parameter.','','update Customer.');
            return res.status(400).send({status_code : 400, error : 'Invalid data.', message : 'dialout does not exist.'});
        }
    }
    if(Updatedata.email_notify){
        dataObj['is_email_notification'] = Updatedata.email_notify;
        if(Updatedata.popup_email){
            dataObj['notification_email'] = Updatedata.popup_email;
        }
    }
    if(Number(Updatedata.call_limit)){
        dataObj['monthly_international_threshold'] = Updatedata.call_limit;
        if((Updatedata.call_limit).toString().length > 3){
            this.apiInstance.log(402,'length excedd.','','update Customer.');
            return res.status(402).send({status_code : 402, error : 'length not suitable.', message : 'please provide valid number.'});
        }
    }
    if(Updatedata.ip) dataObj['ip'] = Updatedata.ip;
    if(Updatedata.product) {
        if(Updatedata.product != 1 && Updatedata.product != 2){
            this.apiInstance.log(402, 'Product Should be either 0 or 1.', 'CustomerUpdate', 'pbx', '', req.customer_id, JSON.stringify(Updatedata));
            return res.status(402).send({ status_code: 402, error: 'Invalid data.', message: 'Product Should be either 0 or 1.' });                
        }
        if(Updatedata.product == 1){
            if(Updatedata.extension_length_limit){
                dataObj['extension_length_limit'] = Updatedata.extension_length_limit ;
                if(Updatedata.extension_length_limit != "number" && Updatedata.extension_length_limit != 2 && Updatedata.extension_length_limit != 3 && Updatedata.extension_length_limit != 4){
                    this.apiInstance.log(402, 'Product Should only number 2, 3 & 4.', 'CustomerUpdate', '', req.customer_id, JSON.stringify(Updatedata));
                    return res.status(402).send({ status_code: 402, error:'Product Should only number 2, 3 & 4.', message: 'Please provide the correct Value.' });
                }                    
            }            
            if(Updatedata.package_id){
                let validatePackage = await this.validationInstance.validatePackage
            }
        }
    }
    dataObj['api_token'] = Updatedata.apitoken ? Updatedata.apitoken : '1';
    dataObj['credit_limit'] = Updatedata.credit_limit ? Updatedata.credit_limit : 0;
    if(Updatedata.domain) dataObj['domain'] = Updatedata.domain;
    if(Updatedata.company_address) dataObj['company_address'] = Updatedata.company_address; 
    if(Updatedata.email){
        dataObj['email'] = Updatedata.email;
        let sql=knex('customer').select(knex.raw('COUNT(id) as count')).where('email',Updatedata.email).whereNot('id',req.customer_id)
        sql.then((response)=>{
            if(response[0].count>0){
                this.apiInstance.log(402, 'Email already Exist.', 'CustomerUpdate', '', req.customer_id, JSON.stringify(Updatedata));
                return res.status(402).send({ status_code: 402, error:'Email already Exist.', message: 'please provide anouther email.' });
            }else{
                this.updateCustomer(req,res,next,dataObj,customerId,Updatedata);
            }
        });
    }else{
        this.updateCustomer(req,res,next,dataObj,customerId,Updatedata);
    }
}else{
    this.apiInstance.log(400, 'Customer not valid', 'CustomerUpdate', '', req.customer_id, JSON.stringify(Updatedata));
    return res.status(400).send({ status_code: 402, error: 'unknown customer', message: 'please provide valid customer.' });
  }
}


// ---------------------------------using this method we don't need to run query multiple time--------------------------------------- //

public updateCustomer(req,res,next,dataObj,customerId,Updatedata){
    let sqlUpdate = knex('customer').update(dataObj).where('id',customerId);
    sqlUpdate.then((response)=>{
        if(response){
            this.apiInstance.log(200, 'Customer Updated Successfully.', 'CustomeUpdate', '', req.customer_id, JSON.stringify(Updatedata));
            return res.status(402).send({ status_code: 200, message: 'Customer Updated Successfully.' });
    }else{
        this.apiInstance.log(402, 'customer not update', 'CustomerUpdate', '', req.customer_id, JSON.stringify(Updatedata));
        return res.status(402).send({ status_code: 402, error: 'Bad request', message: 'customer not updated.' });
      }
    }).catch((err)=>{
        this.apiInstance.log(400,'Bad Request.','','customer Update.');
        return res.status(400).send({status_code : 400, error : 'Bad Request.'});
    });
  }
}

