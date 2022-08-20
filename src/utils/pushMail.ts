/**
 * @file
 *
 * This is a PushEmail utils of private api urls. Can be accessed after success login. These urls need authentication.
 *
 * @author Nagender Pratap Chauhan on 16/11/21.
 */

 import { Table } from "../dba/table";
 import { warnLog, unauthLog, infoLog, traceLog, debugLog, fatalLog } from '../utils/logger.util';
 import * as path from 'path';
 import * as nodemailer from 'nodemailer';
 var knex  = require('../dba/knex.db');
 const config = require('../config');
 import * as EmailTemplate from 'email-templates';

//  let EmailTemplate = require('email-templates').EmailTemplate;

 export class PushEmail {

 transporter = nodemailer.createTransport({
    host: config.mailing.host,
    port: 465,
    secure: true,
    service: 'gmail',
    auth: {
        user: config.mailing.user,
        pass: config.mailing.pass,
    } 
});

 getCustomerNameandEmail(req) {
    return knex.raw("select CONCAT(first_name, \' \',last_name) as name,company_name,email \
     from " + Table.tbl_Customer + "\
    where id in (" + req + ")").then((response) => {
        if (response) {
            return ({ userName: response[0][0].name, email: response[0][0].email, company_name: response[0][0].company_name });
        }
    })
}

 getExtensionName(req) {
    return knex(Table.tbl_Extension_Master).where('email', '=', "" + req + "").select('username as name')
        .then((response) => {
            if (response) {
                return ({ userName: response[0].name, email: req });
            }
        })
}

 getEmailContentUsingCategory(req) {
    return knex.select('e.id', 'e.name', 'e.title', 'e.image', 'e.content', 'e.email_category_id',
        'c.category_name as category_name')
        .from(Table.tbl_Email_template + ' as e')
        .leftOuterJoin(Table.tbl_Email_Category + ' as c', 'e.email_category_id', 'c.id')
        .where('c.category_name', '=', "" + req + "")
        .andWhere('e.status', '=', '1')
        .then((response) => {
            return response[0];
        })
}

 getCustomerName(req) {
    return knex(Table.tbl_Customer).where('email', '=', "" + req + "").andWhere('status', '=', '1')
        .select(knex.raw('CONCAT(first_name, \' \',last_name) as name'))
        .then((response) => {
            return ({ userName: response[0].name, email: req });
        })
}

 getCustomerEmail(req) {
    return knex.select('id', 'email').from(Table.tbl_Customer).where('first_name', '=', "" + req + "").andWhere('status', '=', '1')
        .then((response) => {
            return ({ userName: req, email: response[0].email });
            // return res.json({ response });
        })
}

 sendmail(req) {
    console.log('data=====',req.data);
    // console.log('val=====',req.val);
     const newLocal = 'testMailTemplate';
    let templateDir = path.join(__dirname, "../", 'emailTemplate', newLocal);
    console.log(templateDir);
    let testMailTemplate = new EmailTemplate(templateDir);
    let locals = {
        mailList: req.mailList + req.action + "&email=" + req.data.email,
        action: req.action ? req.action : '',
        userName: req.data.userName ? req.data.userName : '',
        title: req.val.title,
        content: req.val.content ? req.val.content : '',
        url: req.val.image ? req.val.image : '',
        category_id: req.val.email_category_id ? req.val.email_category_id : '',
        ticket_number: req.ticket_number ? req.ticket_number : '',
        ticket_type: req.ticket_type_name ? req.ticket_type_name : '',
        product: req.product ? req.product : '',
        ticketMessage: req.ticketMessage ? req.ticketMessage : '',
        reply: req.reply ? req.reply : '',
        username: req.username ? req.username : '',
        password: req.password ? req.password : '',
        features: req.feature ? req.feature : '',
        customer: req.customer ? req.customer : '',
        loginURL: req.data.url ? req.data.url : '',
        invoice_number: req.data.invoice_number ? req.data.invoice_number : '',
        amount: req.data.amount ? req.data.amount : '',
        fare_amount: req.data.fare_amount ? req.data.fare_amount : '',
        gst_amount: req.data.gst_amount ? req.data.gst_amount : '',
        invoice_month: req.data.invoice_month ? req.data.invoice_month : '',
        didData : req.data.didDatas ? req.data.didDatas : [],
        customerName : req.data.userName ? req.data.userName : '',
        customerEmail : req.data.email ? req.data.email : '',
        customerOrganization : req.data.company_name ? req.data.company_name : '',
        didCountryName : req.data.countryName ? req.data.countryName : '',
        boosterDetail : req.boosterData ? req.boosterData : '',
        boostercustomerEmail : req.data.customerEmail ? req.data.customerEmail : '',
 
    };  
   
    // console.log('locals=',locals);
    console.log('testMailTemplate=====',testMailTemplate);
    //  return testMailTemplate.render(locals, function (err, temp) {
    //     console.log('temp=====',temp);
    //      if (err) { console.log("error", err); }
    //      else {
    //          try {
        return   this.transporter.sendMail({
                     from: 'helpdesk@cloud-connect.in',
                     to: req.data.email,
                     subject: req.val.title,
                     text: req.val.content,
                     html: "<strong>Hello world?</strong>",
        //          }, function (error, info) {
        //              if (error) {
        //                  console.log(error);
        //                  return ({ success: false, msg: 'Mail not sent!', sendStatus: 500 });
        //              } else {
        //                  console.log('Message sent: ' + JSON.stringify(info));
        //                  return ({ success: true, msg: 'Mail sent', sendStatus: 200 });
        //              }
        //          })
        //      } catch (err) {
        //          console.log("error", err)
        //      }
        //  }
     });
    //  console.log("Message sent: %s", info['response']);
}
 }
