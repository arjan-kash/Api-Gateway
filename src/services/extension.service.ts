/**
 * @file
 *
 * This is a ExtensionService controller of public api urls. Can be accessed after success login. These urls need authentication.
 *
 * @author Nagender Pratap Chauhan on 22/6/21.
 */

import { errorLog, infoLog } from '../utils/logger.util';
import { warnLog, unauthLog } from '../utils/logger.util';
import { Table } from '../dba/table';
import * as multer from 'multer';
import * as path from 'path';
import * as express from 'express';
import { ApiLogs } from '../utils/api-logs';
import  { Validation } from '../utils/validation.util';

var knex = require('../dba/knex.db');
const axios = require('axios').default;

export class ExtensionService {

    public apiInstance = new ApiLogs();
    public validationInstance = new Validation();
    
    /**
     *
     * @param req
     * @param res
     * @param next
     */

    getAllExtension(req, res, next) {

    }

    /**
    *
    * @param req
    * @param res
    * @param next
    */

    public getAllExtesnionContacts(req, res, next) {
        let ext_number = req.ext_number ? req.ext_number : 0;
        // console.log(ext_number,"------------------------------------------------------------");
        
        let sql = knex.from(Table.tbl_Extension_Master + ' as ext')
            .select('ext.id')
            .where('ext.ext_number', '=', ext_number);
        sql.then((response) => {
            // console.log(response,"--------------------");
            
            if (response.length) {
                let ext_id = response[0].id;
                var sql2 = knex.from(Table.tbl_Contact_List + ' as c')
                    .select('name', 'email', 'phone_number1 as primary', 'phone_number2 as secondary', 'organization', 'designation')
                    .where('c.extension_id', '=', ext_id);
                sql2.then((response2) => {
                    res.json({
                        status_code: 200,
                        message: 'Contact list.',
                        data: response2
                    });
                  this.apiInstance.log(200,'Contact list.','getAllExtesnionContacts','pbx', '', ext_number); 
                }).catch((err) => {
                    errorLog(err);
                    res.status(400).send({
                        status_code: 400,
                        message: 'Bad Request'
                    });
                    this.apiInstance.log(400,'Bad Request.','getAllExtesnionContacts','pbx', '', ext_number); 
                    throw err
                });
            } else {
                res.status(401).send({ error: 'Unauthorized', message: 'user does not exist' });
                this.apiInstance.log(401,'User does not exist.','getAllExtesnionContacts','pbx', '', ext_number); 
            }
        })
    }

    /**
   *
   * @param req
   * @param res
   * @param next
   */

    public getExtesnionCallHistory(req, res, next) {
        let ext_number = req.ext_number ? req.ext_number : 0;
        let sql = knex.from(Table.tbl_Extension_Master + ' as ext')
            .select('ext.id')
            .where('ext.ext_number', '=', ext_number);
        sql.then((response) => {
            if (response.length) {
                let ext_id = response[0].id;
                knex.raw("Call pbx_getExtensionCdrInfo(" + ext_id + ")").then((response) => {
                    if (response) {
                        res.send({
                            status_code: 200,
                            message: 'Call History.',
                            data: response[0][0]
                        });
                        this.apiInstance.log(200,'Call History.','getExtesnionCallHistory','pbx', '', ext_number); 
                    }
                }).catch((err) => {
                    errorLog(err);
                    res.status(400).send({
                        status_code: 400,
                        message: 'Bad Request'
                    });
                    this.apiInstance.log(400,'Bad Request.','getExtesnionCallHistory','pbx', '', ext_number); 
                    throw err
                });
            } else {
                res.status(401).send({ error: 'Unauthorized', message: 'user does not exist' });
                this.apiInstance.log(401,'User does not exist.','getExtesnionCallHistory','pbx', '', ext_number); 
            }
        })
    }

    /**
    *
    * @param req
    * @param res
    * @param next
    */

    public saveExtesnionLocation(req, res, next) {
        let ext_number = parseInt(req.params.id);
        knex(Table.tbl_SoftPhone_Logs).insert({
            username: "" + ext_number + "",
            city: "" + req.body.city + "",
            state: "" + req.body.state + "",
            country: "" + req.body.country + "",
            latitude: "" + req.body.latitude + "",
            longitude: "" + req.body.longitude + "",
        })
            .then((response) => {
                if (response.length > 0) {
                    res.json({
                        data: req.body,
                        status_code: 200,
                        message: 'You have uploaded location data.'
                    });
                    this.apiInstance.log(200,'Uploaded location data.','saveExtesnionLocation','pbx', '', ext_number); 
                } else {
                    res.status(401).send({ error: 'Unauthorized', message: 'Softphone location Creation error' });
                    this.apiInstance.log(401,'Softphone location Creation error.','saveExtesnionLocation','pbx', '', ext_number); 
                }
            }).catch((err) => {
                errorLog(err);
                res.status(400).send({
                    status_code: 400,
                    message: 'Bad Request'
                });
                this.apiInstance.log(400,'Bad Request.','saveExtesnionLocation','pbx', '', ext_number); 
                 throw err
            });
    }


    /**
  *
  * @param req
  * @param res
  * @param next
  */

    public makeExtensionContactAsFavorite(req, res, next) {
        let isExtension = req.user_type ? req.user_type : 1;
        if (isExtension == '6') {
            let data = req.body;
            if (!data.extension) {
                this.apiInstance.log(402, 'Parameter Missing - extension.', 'makeExtensionContactAsFavorite', 'pbx', '', req.ext_number, JSON.stringify(data));
                return res.status(402).send({ status_code: 402, error: 'Parameter Missing', message: 'Please enter the extension' });
            }
            let sql0 = knex.from(Table.tbl_Extension_Master).select(knex.raw('COUNT(id) as count')).where('ext_number', data.extension).andWhere('customer_id', req.customer_id);
            sql0.then((response) => {
                console.log( response[0]);
                if (response[0].count == 0) {
                    this.apiInstance.log(403, 'Forbidden - User has no permission for this extension.', 'makeExtensionContactAsFavorite', 'pbx', '', req.ext_number, JSON.stringify(data));
                    res.status(403).send({ status_code: 403, error: 'Forbidden', message: 'User has no permission for this extension' });
                } else {
                    let id = req.id ? req.id : 0;
                    let sql = knex.from(Table.tbl_Extension_Master).select(knex.raw('COUNT(id) as count')).where('favorite', 'like', "%" + data.extension + "%").andWhere('id', id);
                    sql.then((response) => {
                        if (response[0].count == 0) { // Not EXIST
                            let sql2 = knex.raw('select *, json_extract(favorite,"$.ext_number") favorite from extension_master  where id =' + id);
                            sql2.then((response2) => {
                                if (response2) {
                                    let fav_contact_list = response2[0][0].favorite ? (((response2[0][0].favorite).replace(/"/g, '')).split(',')) : [];
                                    fav_contact_list.push(data.extension);
                                    let obj = {};
                                    obj['ext_number'] = (fav_contact_list).toString();
                                    console.log(knex.raw("Call pbx_save_extension_favorite_contact(" + id + ",'" + JSON.stringify(obj) + "','" + 'make_favorite' + "')").toString());
                                    knex.raw("Call pbx_save_extension_favorite_contact(" + id + ",'" + JSON.stringify(obj) + "','" + 'make_favorite' + "')")
                                        .then((response3) => {
                                            if (response3) {
                                                res.send({
                                                    status_code: 200,
                                                    message: 'You have maked contact as favorite.',
                                                    //db_response: response3[0][0]
                                                });
                                                this.apiInstance.log(200, 'maked contact as favorite.', 'makeExtensionContactAsFavorite', 'pbx', '', req.ext_number);
                                            }
                                        }).catch((err) => {
                                            errorLog(err);
                                            res.status(400).send({
                                                status_code: 400,
                                                message: 'Bad Request'
                                            });
                                            this.apiInstance.log(400, 'Bad Request.', 'makeExtensionContactAsFavorite', 'pbx', '', req.ext_number, JSON.stringify(data));
                                            throw err
                                        });
                                }
                            }).catch((err) => {
                                errorLog(err);
                                res.status(400).send({
                                    status_code: 400,
                                    message: 'Bad Request'
                                });
                                this.apiInstance.log(400, 'Bad Request.', 'makeExtensionContactAsFavorite', 'pbx', '', req.ext_number, JSON.stringify(data));
                                throw err
                            });
                        } else {   // aLREADY eXIST
                            console.log('come in ');
                            res.send({ status_code: 409, message: 'Conflict : This contact already maked as a favorite' });
                            this.apiInstance.log(409, 'Conflict : This contact already maked as a favorite.', 'makeExtensionContactAsFavorite', 'pbx', '', req.ext_number, JSON.stringify(data));
                        }
                    }).catch((err) => {
                        errorLog(err);
                        res.status(400).send({
                            status_code: 400,
                            message: 'Bad Request'
                        }); throw err
                    });

                }
            }).catch((err) => {
                errorLog(err);
                res.status(400).send({
                    status_code: 400,
                    message: 'Bad Request'
                }); throw err
            });
        } else {
            this.apiInstance.log(403, 'Forbidden - User has no permission for perform this action.', 'makeExtensionContactAsFavorite', 'pbx', '', '', '');
            res.status(403).send({ status_code: 403, error: 'Forbidden', message: 'User has no permission for perform this action' });
        }
    }


    /**
     *
     * @param req
     * @param res
     * @param next
     */

    public getAllFavoriteExtesnionContact(req, res, next) {
        let isExtension = req.user_type ? req.user_type : 1;
        console.log(isExtension, "hello");
        
        if (isExtension == '6') {
            let count = 0;
            let data = req.body.filters;
            let ext_number = req.ext_number ? req.ext_number : 0;
            let customer_id = req.customer_id ? req.customer_id : 0;
            let sql = knex.from(Table.tbl_Extension_Master)
                .select('ext_number as extension', 'username', 'mobile', 'email')
                .where('status', '=', "1")
            sql.orderBy('ext_number', 'desc');

            if (data.by_username != '' && data.hasOwnProperty('by_username')) {
                sql = sql.andWhere('username', 'like', "%" + data.by_username + "%");
            }
            if (data.by_roaming != '' && data.hasOwnProperty('by_roaming')) {
                sql = sql.andWhere('roaming', '=', data.by_roaming);
            }
            if (customer_id != '') {
                sql = sql.andWhere('customer_id', 'like', "%" + customer_id + "%");
            }
            if (data.by_number != '' && data.hasOwnProperty('by_number')) {
                sql = sql.andWhere('ext_number', 'like', "%" + data.by_number + "%");
            }
            if (data.by_type != '' && data.hasOwnProperty('by_type')) {
                let subquery = knex.raw("select JSON_UNQUOTE(json_extract(favorite,'$.ext_number')) fav from extension_master where customer_id =" + customer_id + " and ext_number=" + ext_number);
                subquery.then((response) => {
                    console.log("response[0][0]['fav']", response[0][0]['fav']);
                    if (response[0][0]['fav'] && (data.by_type == 'favorite' || data.by_type == 'unfavorite')) {  // type = favorite and have data
                        let fav_Contact = response[0][0]['fav'] ? (response[0][0]['fav']).split(',') : '';
                        if (fav_Contact || data.by_type != 'favorite') {
                            count++;
                            sql = data.by_type == 'favorite' ? sql.whereIn('ext_number', fav_Contact) : sql.whereNotIn('ext_number', fav_Contact);
                            console.log(sql.toQuery());
                            sql.then((response) => {
                                if (response) {
                                    res.json({
                                        status_code: 200,
                                        message: 'Extension Info.',
                                        data: response
                                    });
                                    this.apiInstance.log(200, 'Extension Info.', 'getAllFavoriteExtesnionContact', 'pbx', '', ext_number);
                                } else {
                                    res.status(401).send({ error: 'error', message: 'DB Error: Unable to get data' });
                                    this.apiInstance.log(401, 'Unable to get data.', 'getAllFavoriteExtesnionContact', 'pbx', '', ext_number, JSON.stringify(data));
                                }
                            }).catch((err) => {
                                errorLog(err);
                                res.status(400).send({
                                    status_code: 400,
                                    message: 'Bad Request'
                                });
                                this.apiInstance.log(400, 'Bad Request.', 'getAllFavoriteExtesnionContact', 'pbx', '', ext_number, JSON.stringify(data));
                                throw err
                            });

                        } else {
                            res.status(401).send({ error: 'error', message: 'User has no favorite/unfavorite contact' });
                            this.apiInstance.log(401, 'User has no favorite/unfavorite contact.', 'getAllFavoriteExtesnionContact', 'pbx', '', ext_number, JSON.stringify(data));
                        }
                    } else if (!response[0][0]['fav'] && data.by_type == 'favorite') {  // type = favorite but no data found
                        res.status(201).send({ status_code: 201, message: 'No Data found : User has no favorite contact', data: [] });
                        this.apiInstance.log(201, 'No Data found : User has no favorite contact.', 'getAllFavoriteExtesnionContact', 'pbx', '', ext_number, JSON.stringify(data));
                    } else {// type = Un-favorite but no data found as per logic
                        count++;
                        let sql = knex.from(Table.tbl_Extension_Master)
                            .select('ext_number as extension', 'username', 'mobile', 'email')
                            .where('status', '=', "1")
                            .andWhere('customer_id', 'like', "%" + customer_id + "%");;
                        sql.orderBy('ext_number', 'desc');
                        sql = sql.whereNotIn('ext_number', ext_number.split(' '));
                        console.log(sql.toQuery());
                        sql.then((response) => {
                            if (response) {
                                res.json({
                                    status_code: 200,
                                    message: 'Extension Info.',
                                    data: response
                                });
                                this.apiInstance.log(200, 'Extension Info.', 'getAllFavoriteExtesnionContact', 'pbx', '', ext_number, JSON.stringify(data));
                            } else {
                                res.status(401).send({ error: 'error', message: 'DB Error: Unable to get data' });
                                this.apiInstance.log(401, 'Unable to get data.', 'getAllFavoriteExtesnionContact', 'pbx', '', ext_number, JSON.stringify(data));
                            }
                        }).catch((err) => {
                            console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
                            this.apiInstance.log(400, 'Bad Request.', 'getAllFavoriteExtesnionContact', 'pbx', '', ext_number, JSON.stringify(data));
                            throw err
                        });
                    }
                }).catch((err) => {
                    errorLog(err);
                    res.status(400).send({
                        status_code: 400,
                        message: 'Bad Request: ' + err.sqlMessage
                    });
                    this.apiInstance.log(400, 'Bad Request: ' + err.sqlMessage, 'getAllFavoriteExtesnionContact', 'pbx', '', ext_number, JSON.stringify(data));
                    throw err;
                });
            }

            if (count > 0) {
                sql.then((response) => {
                    if (response) {
                        res.json({
                            response
                        });
                    } else {
                        res.status(401).send({ error: 'error', message: 'DB Error: Unable to get data' });
                        this.apiInstance.log(401, 'Unable to get data.', 'getAllFavoriteExtesnionContact', 'pbx', '', ext_number);
                    }
                }).catch((err) => {
                    errorLog(err);
                    res.status(400).send({
                        status_code: 400,
                        message: 'Bad Request'
                    });
                    this.apiInstance.log(400, 'Bad Request.', 'getAllFavoriteExtesnionContact', 'pbx', '', ext_number, JSON.stringify(data));
                    throw err
                });
            }
        } else {
            this.apiInstance.log(403, 'Forbidden - User has no permission for perform this action.', 'getAllFavoriteExtesnionContact', 'pbx', '', '', '');
            res.status(403).send({ status_code: 403, error: 'Forbidden', message: 'User has no permission for perform this action' });
        }
    }


    /**
  *
  * @param req
  * @param res
  * @param next
  */

    public makeExtensionContactAsUnFavorite(req, res, next) {
        let data = req.body;
        if (!data.extension) {
            this.apiInstance.log(402,'Parameter Missing - extension.','gatewayLogin','pbx', '', req.ext_number); 
            return res.status(402).send({ status_code: 402, error: 'Parameter Missing', message: 'Please enter the extension' });
        }
        let sql0 = knex.from(Table.tbl_Extension_Master).select(knex.raw('COUNT(id) as count')).where('ext_number', data.extension).andWhere('customer_id', req.customer_id);
        sql0.then((response) => {
            if (response[0].count == 0) {
                res.status(403).send({ status_code: 403, error: 'Forbidden', message: 'User has no permission for this extension' });
                this.apiInstance.log(403,'Forbidden - User has no permission for this extension.','makeExtensionContactAsUnFavorite','pbx', '', req.ext_number,JSON.stringify(data)); 
            } else {
                let id = req.id ? req.id : 0;
                let sql = knex.from(Table.tbl_Extension_Master).select(knex.raw('COUNT(id) as count')).where('favorite', 'like', "%" + data.extension + "%").andWhere('id', id);
                sql.then((response) => {
                    if (response[0].count == 0) { // Not EXIST
                        res.send({ status_code: 409, message: 'Conflict : This contact already maked as a Un-favorite' });
                        this.apiInstance.log(409,'Conflict : This contact already maked as a Un-favorite.','makeExtensionContactAsUnFavorite','pbx', '', req.ext_number,JSON.stringify(data)); 
                    } else {   // aLREADY eXIST
                        let sql2 = knex.raw('select *, json_extract(favorite,"$.ext_number") favorite from extension_master  where id =' + id);
                        sql2.then((response2) => {
                            if (response2) {
                                let fav_contact_list = response2[0][0].favorite ? (((response2[0][0].favorite).replace(/"/g, '')).split(',')) : [];
                                fav_contact_list = fav_contact_list.filter(item => item != data.extension);
                                let obj = {};
                                obj['ext_number'] = (fav_contact_list).toString();
                                console.log(knex.raw("Call pbx_save_extension_favorite_contact(" + id + ",'" + JSON.stringify(obj) + "','" + 'make_unfavorite' + "')").toString());
                                knex.raw("Call pbx_save_extension_favorite_contact(" + id + ",'" + JSON.stringify(obj) + "','" + 'make_unfavorite' + "')")
                                    .then((response3) => {
                                        if (response3) {
                                            res.send(
                                                {
                                                    status_code: 200,
                                                    message: 'You have maked contact as un-favorite.',
                                                    //db_response: response3[0][0]
                                                });
                                                this.apiInstance.log(200,'You have maked contact as un-favorite.','makeExtensionContactAsUnFavorite','pbx', '', req.ext_number); 
                                        }
                                    }).catch((err) => {
                                        errorLog(err);
                                        res.status(400).send({
                                            status_code: 400,
                                            message: 'Bad Request'
                                        });
                                        this.apiInstance.log(400,'Bad Request.','makeExtensionContactAsUnFavorite','pbx', '', req.ext_number,JSON.stringify(data)); 
                                        throw err
                                    });
                            }
                        }).catch((err) => {
                            errorLog(err);
                            res.status(400).send({
                                status_code: 400,
                                message: 'Bad Request'
                            });
                            this.apiInstance.log(400,'Bad Request.','makeExtensionContactAsUnFavorite','pbx', '', req.ext_number,JSON.stringify(data)); 
                            throw err
                        });
                    }
                }).catch((err) => {
                    errorLog(err);
                    res.status(400).send({
                        status_code: 400,
                        message: 'Bad Request'
                    });
                    this.apiInstance.log(400,'Bad Request.','makeExtensionContactAsUnFavorite','pbx', '', req.ext_number,JSON.stringify(data));   
                    throw err
                });
            }
        }).catch((err) => {
            errorLog(err);
            res.status(400).send({
                status_code: 400,
                message: 'Bad Request'
            });
            this.apiInstance.log(400,'Bad Request.','makeExtensionContactAsUnFavorite','pbx', '', req.ext_number,JSON.stringify(data));   
            throw err
        });
    }


    /**
    *
    * @param req
    * @param res
    * @param next
    */

    public getExtesnionProfie(req, res, next) {
        let extension = req.ext_number ? req.ext_number : 0;
        let host = req.headers.host ;
        host = host.replace('3001', '3000'); // replace the port bcz of access recording
        let sql = knex.from(Table.tbl_Extension_Master + ' as ext')
            .select('ext.ext_number as extension', 'ext.caller_id_name as callername', 'ext.email', 'ext.mobile', 'ext.username',  'ext.profile_img')
            .where('ext.ext_number', '=', extension);
        sql.then((response) => {
            if (response.length) {
                let arrMap = response ? response : [];
                arrMap = arrMap.map(item => {
                    let res = item;
                    // res['profile_img'] = host + res['profile_img'];
                    res['profile_img'] = res['profile_img'] ? host + res['profile_img'] : '';
                    return res;
                });
                res.json({
                    status_code: 200,
                    message: 'User profile Info.',
                    data: response
                });
                this.apiInstance.log(200,'User profile Info.','getExtesnionProfie','pbx', '',extension); 
            } else {
                res.status(401).send({ error: 'Unauthorized', message: 'user does not exist' });
                this.apiInstance.log(401,'user does not exist.','getExtesnionProfie','pbx', '', '',extension);
            }
        }).catch((err) => {
            errorLog(err);
            res.status(400).send({
                status_code: 400,
                message: 'Bad Request'
            });
            this.apiInstance.log(400,'Bad Request: '+err.sqlMessage,'getExtesnionProfie','pbx', '','', extension);  
            throw err
        });
    }


     /**
    *
    * @param req
    * @param res
    * @param next
    */

      public getExtesnionProfieForSP(req, res, next) {
        let extension = req.ext_number ? req.ext_number : 0;
        let host = req.headers.host ;
        host = host.replace('3001', '3000'); // replace the port bcz of access recording
        let sql = knex.from(Table.tbl_Extension_Master + ' as ext')
            .select('ext.ext_number as extension', 'ext.caller_id_name as callername', 'ext.email', 'ext.mobile', 'ext.username',  'ext.profile_img')
            .where('ext.ext_number', '=', extension);
        sql.then((response) => {
            if (response.length) {
                let arrMap = response ? response : [];
                arrMap = arrMap.map(item => {
                    let res = item;
                    res['profile_img'] = res['profile_img'] ? host + res['profile_img'] : '';
                    return res;
                });
                res.json({
                    status_code: 200,
                    message: 'User profile Info.',
                    data: response
                });
                this.apiInstance.log(200,'User profile Info.','getExtesnionProfie','sp', '',extension); 
            } else {
                res.status(401).send({ error: 'Unauthorized', message: 'user does not exist' });
                this.apiInstance.log(401,'user does not exist.','getExtesnionProfie','sp', '', '',extension);
            }
        }).catch((err) => {
            errorLog(err);
            res.status(400).send({
                status_code: 400,
                message: 'Bad Request'
            });
            this.apiInstance.log(400,'Bad Request: '+err.sqlMessage,'getExtesnionProfie','sp', '','', extension);  
            throw err
        });
    }

 /**
  *
  * @param req
  * @param res
  * @param next
  */

    public getIndividualExtesnionInfo(req, res, next) {
        let data = req.body;
        let ext_number = data.extension;
        if (!data.extension) {
            this.apiInstance.log(402,'Parameter Missing - extension.','getIndividualExtesnionInfo','pbx', '', req.ext_number, JSON.stringify(data)); 
            return res.status(402).send({ status_code: 402, error: 'Parameter Missing', message: 'Please enter the extension' });
        }
        let sql0 = knex.from(Table.tbl_Extension_Master).select(knex.raw('COUNT(id) as count')).where('ext_number', data.extension).andWhere('customer_id', req.customer_id);
        sql0.then((response) => {
            if (response[0].count == 0) {
                this.apiInstance.log(403,'Forbidden - User has no permission for this extension.','getIndividualExtesnionInfo','pbx', '', req.ext_number,JSON.stringify(data)); 
                res.status(403).send({ status_code: 403, error: 'Forbidden', message: 'User has no permission for this extension' });
            } else {
                let sql = knex.from(Table.tbl_Extension_Master + ' as ext')
                    .select('ext.ext_number as extension', 'ext.caller_id_name as callername', 'ext.email', 'ext.mobile', 'ext.username')
                    .where('ext.ext_number', '=', ext_number);
                sql.then((response) => {
                    if (response.length) {
                        this.apiInstance.log(200,'Extension Info.','getIndividualExtesnionInfo','pbx', '', req.ext_number); 
                        res.json({
                            status_code: 200,
                            message: 'Extension Info.',
                            data: response
                        });
                    } else {
                        res.status(401).send({ error: 'Unauthorized', message: 'extension does not exist' });
                        this.apiInstance.log(401,'user does not exist.','getIndividualExtesnionInfo','pbx', '', req.ext_number,JSON.stringify(data));    
                    }
                }).catch((err) => {
                    errorLog(err);
                    res.status(400).send({
                        status_code: 400,
                        message: 'Bad Request'
                    });
                    this.apiInstance.log(400,'Bad Request.','getIndividualExtesnionInfo','pbx', '', req.ext_number,JSON.stringify(data));  
                     throw err
                });
            }
        }).catch((err) => {
            errorLog(err);
            res.status(400).send({
                status_code: 400,
                message: 'Bad Request'
            });
            this.apiInstance.log(400,'Bad Request.','getIndividualExtesnionInfo','pbx', '', req.ext_number,JSON.stringify(data));  
            throw err
        });
    }

    /**
   *
   * @param req
   * @param res
   * @param next
   */

    public async updateExtensionProfile(req, res, next, type) {
        let ext_number = req.ext_number ? req.ext_number : 0;
        let updateObj = req.body;
        // console.log(updateObj,"Yash");
        // console.log(updateObj.constructor);
        
        
        if (updateObj && Object.keys(updateObj).length === 0 && updateObj.constructor === Object) {
            this.apiInstance.log(402,'Parameter Missing For update.','updateExtensionProfile',type, '', ext_number); 
            res.status(402).send({ error: 'parameter Missing', message: 'Please provide data which you want to update' });
        }
        let dynamicObj = {};
        if (req.body.username) dynamicObj['username'] = req.body.username;
        if (req.body.email) {
            dynamicObj['email'] = req.body.email;
            let isEmailVerified = await this.validationInstance.validateEmail(dynamicObj['email']);
            if(!isEmailVerified){
                this.apiInstance.log(402,'Wrong Email Id.','updateExtensionProfile',type, '', ext_number,JSON.stringify(updateObj)); 
                res.status(402).send({ error: 'Wrong Email Id', message: 'Please provide the correct email id.' });
            }
        }
        if (req.body.mobile) {
            dynamicObj['mobile'] = req.body.mobile;
            let isMobileVerified = await this.validationInstance.validateMobile(dynamicObj['mobile']);
            if(!isMobileVerified){
                this.apiInstance.log(402,'Wrong Mobile Number.','updateExtensionProfile',type, '', ext_number, JSON.stringify(updateObj)); 
                res.status(402).send({ error: 'Wrong Mobile Number', message: 'Please provide the correct mobile number.' });
            } 
        }
        if (req.body.callername) dynamicObj['caller_id_name'] = req.body.callername;
        if (req.body.email) {
            let sql0 = knex(Table.tbl_Extension_Master).select(knex.raw('COUNT(id) as count'))
            .where('email', req.body.email)
            .whereNot('ext_number', ext_number)
            sql0.then((response) => {
                console.log(response,"<==========,update profile data here");
                if (response[0].count > 0) {
                    res.status(403).send({ status_code: 403, error: 'Forbidden', message: 'Email id already exists' });
                    this.apiInstance.log(403, 'Forbidden - Email id already exists.', 'updateExtensionProfile', type, '', ext_number,JSON.stringify(updateObj));
                } else {
                    this.updateProfile(req, res, next, type, dynamicObj, ext_number, updateObj)
                }
            }).catch((err) => {
                errorLog(err); 
                res.status(400).send({
                    status_code: 400,
                    message: 'Bad Request'
                });
                this.apiInstance.log(400, 'Bad Request.', 'updateExtensionProfile', type, '', ext_number, JSON.stringify(updateObj));
                throw err;
            });
        } else {
            this.updateProfile(req, res, next, type, dynamicObj, ext_number, updateObj)
        }
    }

    public updateProfile(req, res, next, type,dynamicObj,ext_number,updateObj){
        let sql = knex(Table.tbl_Extension_Master).update(dynamicObj).where('ext_number', ext_number);
        sql.then((response) => {
            console.log(response);
            if (response) {
                res.json({
                    status_code: 200,
                    message: 'Profile has been updated.'
                });
                this.apiInstance.log(200,'Profile has been updated.','updateExtensionProfile', type,'', ext_number);    
            } else {
                res.status(402).send({ message: 'Profile Updation error!' });
                this.apiInstance.log(402,'Profile Updation error!.','updateExtensionProfile',type, '', ext_number,JSON.stringify(updateObj));     
            }
        }).catch((err) => {
            errorLog(err); 0
            res.status(400).send({
                status_code: 400,
                message: 'Bad Request'
            });
            this.apiInstance.log(400,'Bad Request.','updateExtensionProfile','pbx', '', ext_number,JSON.stringify(updateObj));    
             throw err
        });
    }

    /**
   *
   * @param req
   * @param res
   * @param next
   */

    public getAllUserExtensions(req, res, next) {
        let customer_id = req.customer_id ? req.customer_id : 0;
        let sql = knex.from(Table.tbl_Extension_Master + ' as ext')
            .select('ext.id','ext.ext_number as extension', 'ext.caller_id_name as callername', 'ext.email', 'ext.mobile', 'ext.username', knex.raw('IF(extloc.username != "","Register","Un-Register") as status'))
            .leftJoin(Table.tbl_Register_Extension_Location + ' as extloc', 'extloc.username', 'ext.ext_number')
            .where('ext.customer_id', '=', customer_id);
        sql.then((response) => {
            if (response.length) {
                let arrMap = response ? response : [];
                arrMap = arrMap.map(item => {
                    let res = item;
                    delete res['id'];
                    return res;
                });
                res.json({
                    status_code: 200,
                    message: 'Extension listing.',
                    data: response
                });
                this.apiInstance.log(200,'Extension listing..','getAllUserExtensions','pbx', customer_id);    
            } else {
                res.status(201).send({ status_code: 201, message: 'No Data found' });
                this.apiInstance.log(201,'No Data found.','getAllUserExtensions','pbx', customer_id);
            }
        })
    }

      /**
   *
   * @param req
   * @param res
   * @param next
   */

    public getExtensionsDIDmapping(req, res, next) {
        let ext_number = req.ext_number ? req.ext_number : 0;
        let customer_id = req.customer_id ? req.customer_id : 0;
        if(ext_number){
            this.apiInstance.log(403,'Forbidden - User has no permission for this action.','getExtensionsDIDmapping','pbx', customer_id); 
            res.status(403).send({ status_code: 403, error: 'Forbidden', message: 'User has no permission for this action' });
         }
        // 'd.id', 'd.product_id', 'd.billingtype','d.status','dest.active_feature_id',,'dest.destination', 
        var sql = knex.select( 'pro.provider', 'c.name as country', 'd.reserved', 'd.customer_id','cust.first_name as customer_name', 'd.did', knex.raw('CONCAT((CONCAT("+",c.phonecode)), \' \',d.did) as didDisplay'), 'd.secondusedreal',
            knex.raw('IF (d.billingtype = "1","Fix per month + Dialoutrate", IF (d.billingtype = "2","Fix per month", IF (d.billingtype = "3","Only dialout rate","Free"))) as billingtype'),
             'd.fixrate', 'd.connection_charge', 'd.selling_rate', 'd.max_concurrent', 'd.did_type', knex.raw('IF (d.did_type = "1","DID Number", IF (d.did_type = "2","DID Number","Tollfree Number")) as did_type'),
            knex.raw('IF (d.did_group = "0","General", IF (d.did_group = "1","Premium", IF (d.did_group = "2","Private","Parked"))) as did_group'),
            knex.raw('IF (d.activated = "0","Inactive","Active") as activated'),
            knex.raw('IF (d.status = "0","Inactive", IF (d.status = "1","Active","Deleted")) as status'),
            'af.active_feature','time.name as time_group_name',
            knex.raw('IF (dest.active_feature_id = "1",ext.ext_number, IF (dest.active_feature_id = "2",ivr.name, IF (dest.active_feature_id = "3",conf.name,IF (dest.active_feature_id = "4",que.name,IF (dest.active_feature_id = "5",call.name,IF (dest.active_feature_id = "10",tc.name,IF (dest.active_feature_id = "11",bc.name,IF (dest.active_feature_id = "12",pr.prompt_name,IF (dest.active_feature_id = "13",appointment.name, ""))))))))) as destination_name')).from(Table.tbl_DID + ' as d')
            .leftJoin(Table.tbl_Provider + ' as pro', 'pro.id', 'd.provider_id')
            .leftJoin(Table.tbl_Country + ' as c', 'c.id', 'd.country_id')
            .leftJoin(Table.tbl_DID_Destination + ' as dest', 'd.id', 'dest.did_id')
            .leftJoin(Table.tbl_DID_active_feature + ' as af', 'dest.active_feature_id', 'af.id')
            .leftJoin(Table.tbl_Extension_Master + ' as ext', 'dest.destination_id', 'ext.id')
            .leftJoin(Table.tbl_Ivr_Master + ' as ivr', 'dest.destination_id', 'ivr.id')
            .leftJoin(Table.tbl_Conference + ' as conf', 'dest.destination_id', 'conf.id')
            .leftJoin(Table.tbl_Queue + ' as que', 'dest.destination_id', 'que.id')
            .leftJoin(Table.tbl_CALLGROUP + ' as call', 'dest.destination_id', 'call.id')
            .leftJoin(Table.tbl_Time_Group + ' as time', 'dest.time_group_id', 'time.id')
            .leftJoin(Table.tbl_TC + ' as tc', 'dest.destination_id', 'tc.id')
            .leftJoin(Table.tbl_Broadcast + ' as bc', 'dest.destination_id', 'bc.id')
            .leftJoin(Table.tbl_Prompt + ' as pr', 'dest.destination_id', 'pr.id')
            .leftJoin(Table.tbl_Appointment + ' as appointment', 'dest.destination_id', 'appointment.id')
            .leftJoin(Table.tbl_Customer + ' as cust', 'cust.id', 'd.customer_id')

            .where('d.status', '!=', "2")
            .andWhere('d.customer_id', '=', "" + customer_id + "")
            .orderBy('d.id', 'desc');
        // console.log(sql.toString());
        sql.then((response) => {
            if (response) {
                res.json({
                    status_code: 200,
                    message: 'DID Mapping.',
                    data: response
                });
                this.apiInstance.log(200,'DID Mapping.','getExtensionsDIDmapping','pbx', customer_id, req.ext_number);      
            }
        }).catch((err) => { console.log(err); res.status(401).send({ error: 'error', message: 'DB Error: ' + err.message });
        this.apiInstance.log(400,'Bad Request.','getExtensionsDIDmapping','pbx', customer_id, req.ext_number);      
        throw err
     });
    }


      /**
      *
      * @param req
      * @param res
      * @param next
      */
 
       public async getExtensionCall2Call(req, res, next) {
        let data = req.body;
        let port = '1111';
        let ext_number = req.ext_number ? req.ext_number : 0;
        let customer_id = req.customer_id ? req.customer_id : 0;

        if (!data.destination_number) {
            this.apiInstance.log(402,'Parameter Missing - username.','getExtensionC2C','pbx', '', req.ext_number, JSON.stringify(data));      
            return res.status(402).send({ status_code: 402, error: 'Parameter Missing', message: 'Please enter the username' });
        }
        let callback_url = await knex.select('c.*')
        .from(Table.tbl_Customer + ' as c')
        .andWhere('c.id', customer_id)
        .andWhere('c.role_id', '1')
        .then((response) => {
          if (response) {
            return response[0]['callback_url'];
          } else {
            return 'no';
          }
        });
        // if (!data.callback_url) {
        //     this.apiInstance.log(402,'Parameter Missing - callback url.','getExtensionC2C','pbx', '', req.ext_number, JSON.stringify(data));   
        //     return res.status(402).send({ status_code: 402, error: 'Parameter Missing', message: 'Please enter the callback url' });
        // }
        // if (!data.token) {
        //     this.apiInstance.log(402,'Parameter Missing - token.','getExtensionC2C','pbx', '', req.ext_number, JSON.stringify(data));   
        //     return res.status(402).send({ status_code: 402, error: 'Parameter Missing', message: 'Please enter the token' });
        // }   remove it as per discussion with virendra sir at 9-3-2022
       

        let baseUrl = req.hostname;
        baseUrl = baseUrl.split(":")[0];
        // baseUrl = 'http://'+baseUrl + ':' +  port + '/esl_api';
        baseUrl = 'http://127.0.0.1:' +  port + '/esl_api';


        let obj = {};
        obj['application'] = "click2call";
        obj['cust_id'] = customer_id;
        obj['extension'] = ext_number;
        obj['destination_number'] = data['destination_number'];
        obj['callback_url'] = callback_url ? callback_url : 'no';
       // obj['token_id'] = data['token'];

        console.log('baseUrl',baseUrl);
        console.log('obj',obj);

        axios.post(baseUrl, obj)
          .then(function (response) {
             res.send({
                    status_code: 200,
                    message: 'C2C Status.',
                    data: response['data']
                });
                let apiInstance = new ApiLogs();
                apiInstance.log(200,'C2C Status : ' + (response['data'] ? response['data']['data']: ''),'getExtensionC2C','pbx', '', req.ext_number);   
          })
          .catch(function (err) {
            res.send({
                status_code: 400,
                message: 'C2C Status.',
                data: err
            });
            this.apiInstance.log(400,'Bad Request : '+err.sqlMessage,'getExtensionC2C','pbx', '', req.ext_number, JSON.stringify(data));   
          });
    }

     /**
   *
   * @param req
   * @param res
   * @param next
   */

      public getC2Cstatus(req, res, next) {
        // let customer_id = req.customer_id ? req.customer_id : 0;
        let data = req.body;
        let uuid = data['uuid'];
        if (!data.uuid) {
            this.apiInstance.log(402,'Parameter Missing - uuid.','getC2Cstatus','pbx', '', req.ext_number, JSON.stringify(data));   
            return res.status(402).send({ status_code: 402, error: 'Parameter Missing', message: 'Please enter the uuid' });
        }
        let sql = knex.from(Table.tbl_Realtime_CDR + ' as r')
        .select('r.uuid', 'r.destination', 'r.current_status', 'r.src','r.call_disposition')
        .where('r.uuid', '=', uuid );
        sql.then((response) => {
            if(response){
            if (response.length != 0) {
                res.json({
                    status_code: 200,
                    message: 'c2c current status.',
                    data: response
                });
                this.apiInstance.log(200,'C2C current Status.','getC2Cstatus','pbx', '', req.ext_number);   
            } else {
                res.status(201).send({ status_code: 402, message: 'Please provide valid uuid.' });
                this.apiInstance.log(402,'No current Status.','getC2Cstatus','pbx', '', req.ext_number, JSON.stringify(data));   
            }
        } else {
            res.status(201).send({ status_code: 201, message: 'No Data found' });
            this.apiInstance.log(201,'No current Status.','getC2Cstatus','pbx', '', req.ext_number, JSON.stringify(data));   
        }
        })
    }

     /**
      *
      * @param req
      * @param res
      * @param next
      */
 
      public getCRMExtensionCall2Call(req, res, next) {
        let data = req.body;
        if (!data.destination_number) {
            this.apiInstance.log(402,'Parameter Missing - username.','getcrmExtensionC2C','crm', '', req.ext_number, JSON.stringify(data));      
            return res.status(402).send({ status_code: 402, error: 'Parameter Missing', message: 'Please enter the username' });
        }
        if(typeof(data.destination_number) != "number"){
            this.apiInstance.log(402,'Invalid Parameter - username.','getcrmExtensionC2C','crm', '', req.ext_number, JSON.stringify(data));      
            return res.status(402).send({ status_code: 402, error: 'Invalid Paramter.', message: 'Please enter the valid destination number.' });
        }
        if (!data.callback_url) {
            this.apiInstance.log(402,'Parameter Missing - callback url.','getcrmExtensionC2C','crm', '', req.ext_number, JSON.stringify(data));   
            return res.status(402).send({ status_code: 402, error: 'Parameter Missing', message: 'Please enter the callback url' });
        }
        if (!data.token) {
            this.apiInstance.log(402,'Parameter Missing - token.','getcrmExtensionC2C','crm', '', req.ext_number, JSON.stringify(data));   
            return res.status(402).send({ status_code: 402, error: 'Parameter Missing', message: 'Please enter the token' });
        }
        let port = '1111'
        let ext_number = req.ext_number ? req.ext_number : 0;
        let customer_id = req.customer_id ? req.customer_id : 0;

        let baseUrl = req.hostname;
        baseUrl = baseUrl.split(":")[0];
        baseUrl = 'http://'+baseUrl + ':' +  port + '/esl_api';

        let obj = {};
        obj['application'] = "click2call";
        obj['cust_id'] = customer_id;
        obj['extension'] = ext_number;
        obj['destination_number'] = data['destination_number'];
        obj['callback_url'] = data['callback_url'] ? data['callback_url'] : 'no' ;
        obj['token_id'] = data['token'];

        console.log('baseUrl',baseUrl);
        console.log('obj',obj);

        axios.post(baseUrl, obj)
          .then(function (response) {
             res.send({
                    status_code: 200,
                    message: 'C2C Status.',
                    data: response['data']
                });
                let apiInstance = new ApiLogs();
                apiInstance.log(200,'C2C Status : ' + (response['data'] ? response['data']['data']: ''),'getcrmExtensionC2C','crm', '', req.ext_number);   
          })
          .catch(function (err) {
            res.send({
                status_code: 400,
                message: 'C2C Status.',
                data: err
            });
            this.apiInstance.log(400,'Bad Request : '+err.sqlMessage,'getcrmExtensionC2C','crm', '', req.ext_number, JSON.stringify(data));   
          });
    }

    
      /**
   *
   * @param req
   * @param res
   * @param next
   */

       public getCRMC2Cstatus(req, res, next) {
        // let customer_id = req.customer_id ? req.customer_id : 0;
        let data = req.body;
        let uuid = data['uuid'];
        if (!data.uuid) {
            this.apiInstance.log(402,'Parameter Missing - uuid.','getCrmC2Cstatus','crm', '', req.ext_number, JSON.stringify(data));   
            return res.status(402).send({ status_code: 402, error: 'Parameter Missing', message: 'Please enter the uuid' });
        }
        let sql = knex.from(Table.tbl_Realtime_CDR + ' as r')
        .select('r.uuid', 'r.destination', 'r.current_status', 'r.src','r.call_disposition')
        .where('r.uuid', '=', uuid );
        sql.then((response) => {
            if(response){
                if (response.length != 0) {
                    res.json({
                        status_code: 200,
                        message: 'c2c current status.',
                        data: response
                    });
                    this.apiInstance.log(200,'C2C current Status.','getC2Cstatus','crm', '', req.ext_number);   
                } else {
                    res.status(201).send({ status_code: 402, message: 'Please provide valid uuid.' });
                    this.apiInstance.log(402,'No current Status.','getC2Cstatus','crm', '', req.ext_number, JSON.stringify(data));   
                }
            } else {
                res.status(201).send({ status_code: 201, message: 'No Data found' });
                this.apiInstance.log(201,'No current Status.','getC2Cstatus','pbx', '', req.ext_number, JSON.stringify(data));   
            }
        })
    }


 /**
   *
   * @param req
   * @param res
   * @param next
   */

    public async extensionCreation(req, res, next) {
        var data = req.body;
        if (!data.extnumber) {  // Ext Number
            this.apiInstance.log(402,'Parameter Missing - extnumber.','extensionCreation','pbx', '', req.ext_number, JSON.stringify(data)); 
            return res.status(402).send({ status_code: 402, error: 'Parameter Missing', message: 'Please enter the extnumber' });
        }
        if (typeof(data.extnumber) != "number") {  // Ext Number
            this.apiInstance.log(402,'Parameter type format - extnumber should be number.','extensionCreation','pbx', '', req.ext_number, JSON.stringify(data)); 
            return res.status(402).send({ status_code: 402, error: 'Parameter type format', message: 'extnumber should be number.' });
        }
        // if (((data.extnumber).toString()).length != 4 && ((data.extnumber).toString()).length != 3 && ((data.extnumber).toString()).length != 2) {  // Ext Number
        //     this.apiInstance.log(402,'Parameter - extnumber length .','extensionCreation','pbx', '', req.ext_number, JSON.stringify(data)); 
        //     return res.status(402).send({ status_code: 402, error: 'Parameter length', message: 'Please enter valid digit length of extnumber' });
        // }
        if (data.extnumber) {
            // console.log(data.extnumber,"jjjjjj");
            
            let isExtensionlength = await this.validationInstance.validateExtensionLength(req.customer_id) ;
            // console.log(isExtensionlength['extension_length_limit'],"<======= Extension length");
            if(isExtensionlength['extension_length_limit'] == 4){
                // console.log(isExtensionlength['extension_length_limit'],"<=========")
                // console.log(((data.extnumber).toString()).length);
                
                    if (((data.extnumber).toString()).length != 4 && ((data.extnumber).toString()).length != 3 && ((data.extnumber).toString()).length != 2) {  // Ext Number
                               this.apiInstance.log(402,'Parameter - extnumber length .','extensionCreation','pbx', '', req.ext_number, JSON.stringify(data)); 
                               return res.status(402).send({ status_code: 402, error: 'Extension length limit exceed', message: 'Please enter valid digit length of extnumber for 4' });
                          }
                }
                if(isExtensionlength['extension_length_limit'] == 3){
                    // console.log("for 3");
                    
                    if (((data.extnumber).toString()).length != 3 && ((data.extnumber).toString()).length != 2) {  // Ext Number
                        this.apiInstance.log(402,'Parameter - extnumber length .','extensionCreation','pbx', '', req.ext_number, JSON.stringify(data)); 
                        return res.status(402).send({ status_code: 402, error: 'Extension length limit exceed', message: 'Please enter valid digit length of extnumber for 3' });
                   }
                }
                if(isExtensionlength['extension_length_limit'] == 2){
                    // console.log("for 2");
                    
                    if (((data.extnumber).toString()).length == 4 || ((data.extnumber).toString()).length == 3 || ((data.extnumber).toString()).length != 2) {  // Ext Number
                        this.apiInstance.log(402,'Parameter - extnumber length .','extensionCreation','pbx', '', req.ext_number, JSON.stringify(data)); 
                        return res.status(402).send({ status_code: 402, error: 'Extension length limit exceed', message: 'Please enter valid digit length of extnumber for 2' });
                   }
                }
                let isExtVerified = await this.validationInstance.validateExtension(req.customer_id + ''+ data['extnumber'] , req.customer_id);
                if (isExtVerified) {
                    this.apiInstance.log(402, 'Extension already in used.', 'extensionCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
                    return res.status(402).send({ error: 'Extension already in used', message: 'Please provide the alternate extension number.' });
                }
            }
        if (!data.extname) {  // Ext Name
            this.apiInstance.log(402,'Parameter Missing - extname.','extensionCreation','pbx', '', req.ext_number, JSON.stringify(data)); 
            return res.status(402).send({ status_code: 402, error: 'Parameter Missing', message: 'Please enter the extname' });
        }
        if (!data.email) {  // Email
            this.apiInstance.log(402,'Parameter Missing - email.','extensionCreation','pbx', '', req.ext_number, JSON.stringify(data)); 
            return res.status(402).send({ status_code: 402, error: 'Parameter Missing', message: 'Please enter the email' });
        }
        if (data.email) {  // email id verify
            let isMailVerified = await this.validationInstance.validateEmailExist(data['email']);
            if (isMailVerified) {
                this.apiInstance.log(402, 'Email already exist.', 'extensionCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
                return res.status(402).send({ error: 'Email already exist', message: 'Please provide the alternate email.' });
            }
            let EmailFormat = await this.validationInstance.validateEmail(data['email']);
            if(!EmailFormat){
                this.apiInstance.log(402,'Provide Valid email.','extensionCreation','pbx','',req.ext_number,JSON.stringify(data));
                return res.status(402).send({status_code:402,error:'Invalid Email',message: 'Provide Valid email.'})
            }
        }
        if (!data.countryid) {  // Country-Code
            this.apiInstance.log(402,'Parameter Missing - countrycode.','extensionCreation','pbx', '', req.ext_number, JSON.stringify(data)); 
            return res.status(402).send({ status_code: 402, error: 'Parameter Missing', message: 'Please enter the countryid' });
        }
        
        if (!data.mobile) {  
            this.apiInstance.log(402,'Parameter Missing - mobile.','extensionCreation','pbx', '', req.ext_number, JSON.stringify(data)); 
            return res.status(402).send({ status_code: 402, error: 'Parameter Missing', message: 'Please enter the mobile' });
        }
        if (data.mobile) {  // mobile
            let isMobileVerified = await this.validationInstance.validateMobile(data['mobile']);
            if (!isMobileVerified) {
                this.apiInstance.log(402, 'Wrong Mobile Number.', 'extensioncreation', 'pbx', '', req.ext_number, JSON.stringify(data));
                return res.status(402).send({ error: 'Wrong Mobile Number', message: 'Please provide the correct mobile number.' });
            }
        }
        if (!data.calleridname) {  // caller id name
            this.apiInstance.log(402,'Parameter Missing - calleridname.','extensionCreation','pbx', '', req.ext_number, JSON.stringify(data)); 
            return res.status(402).send({ status_code: 402, error: 'Parameter Missing', message: 'Please enter the calleridname' });
        }
        
        if (!data.dtmftype) {  // dtmftype
            this.apiInstance.log(402,'Parameter Missing - dtmftype.','extensionCreation','pbx', '', req.ext_number, JSON.stringify(data)); 
            return res.status(402).send({ status_code: 402, error: 'Parameter Missing', message: 'Please enter the dtmftype' });
        }
        if (!data.calleridheader) {  // caller id header type
            this.apiInstance.log(402,'Parameter Missing - calleridheader.','extensionCreation','pbx', '', req.ext_number, JSON.stringify(data)); 
            return res.status(402).send({ status_code: 402, error: 'Parameter Missing', message: 'Please enter the calleridheader' });
        }
        // if (!data.extnumber) {  // check extension limit
        //     let isExtVerified = await this.validationInstance.validateExtension(data['extnumber'], req.customer_id);
        //     if (!isExtVerified) {
        //         this.apiInstance.log(402, 'Extension already in used.', 'extensionCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
        //         return res.status(402).send({ error: 'Extension already in used', message: 'Please provide the alternate extension number.' });
        //     }
        // }
        if (data.admin) {
            if (data.admin !== 0 && data.admin !== 1) {  // isadmin
                this.apiInstance.log(402, 'Parameter admin should be either 1 or 0', 'extensionCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
                return res.status(402).send({ status_code: 402, error: 'Only Number Allowed !', message: 'admin should be either 1 or 0' });
            }
        }
        if (data.balancerestriction) {
            if (data.balancerestriction !== 0 && data.balancerestriction !== 1) {  // balancerestriction
                this.apiInstance.log(402, 'Parameter balancerestriction should be either 1 or 0', 'extensionCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
                return res.status(402).send({ status_code: 402, error: 'Only Number Allowed !', message: 'balancerestriction should be either 1 or 0' });
            }
        }
        if (data.calltransfer) {
            if (data.calltransfer !== 0 && data.calltransfer !== 1) {  // balancerestriction
                this.apiInstance.log(402, 'Parameter calltransfer should be either 1 or 0', 'extensionCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
                return res.status(402).send({ status_code: 402, error: 'Only Number Allowed !', message: 'calltransfer should be either 1 or 0' });
            }
        }
        if (data.callforward) {
            if (data.callforward !== 0 && data.callforward !== 1) {  // balancerestriction
                this.apiInstance.log(402, 'Parameter callforward should be either 1 or 0', 'extensionCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
                return res.status(402).send({ status_code: 402, error: 'Only Number Allowed !', message: 'callforward should be either 1 or 0' });
            }
        }
        if (data.dialout) {
            if (data.dialout !== 0 && data.dialout !== 1) {  // balancerestriction
                this.apiInstance.log(402, 'Parameter dialout should be either 1 or 0', 'extensionCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
                return res.status(402).send({ status_code: 402, error: 'Only Number Allowed !', message: 'dialout should be either 1 or 0' });
            }
        }
        if (data.findmefollowme) {
            if (data.findmefollowme !== 0 && data.findmefollowme !== 1) {  // balancerestriction
                this.apiInstance.log(402, 'Parameter findmefollowme should be either 1 or 0', 'extensionCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
                return res.status(402).send({ status_code: 402, error: 'Only Number Allowed !', message: 'findmefollowme should be either 1 or 0' });
            }
        }
        if (data.multiplereg) {
            if (data.multiplereg !== 0 && data.multiplereg !== 1) {  // balancerestriction
                this.apiInstance.log(402, 'Parameter multiplereg should be either 1 or 0', 'extensionCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
                return res.status(402).send({ status_code: 402, error: 'Only Number Allowed !', message: 'multiplereg should be either 1 or 0' });
            }
        }
        if (data.misscallalert) {
            if (data.misscallalert !== 0 && data.misscallalert !== 1) {  // balancerestriction
                this.apiInstance.log(402, 'Parameter misscallalert should be either 1 or 0', 'extensionCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
                return res.status(402).send({ status_code: 402, error: 'Only Number Allowed !', message: 'misscallalert should be either 1 or 0' });
            }
        }
        if (data.outboundsmsnotification) {
            if (data.outboundsmsnotification !== 0 && data.outboundsmsnotification !== 1) {  // balancerestriction
                this.apiInstance.log(402, 'Parameter outboundsmsnotification should be either 1 or 0', 'extensionCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
                return res.status(402).send({ status_code: 402, error: 'Only Number Allowed !', message: 'outboundsmsnotification should be either 1 or 0' });
            }
        }
        if (data.recording) {
            if (data.recording !== 0 && data.recording !== 1) {  // balancerestriction
                this.apiInstance.log(402, 'Parameter recording should be either 1 or 0', 'extensionCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
                return res.status(402).send({ status_code: 402, error: 'Only Number Allowed !', message: 'recording should be either 1 or 0' });
            }
        }
        if (data.speeddial) {
            if (data.speeddial !== 0 && data.speeddial !== 1) {  // balancerestriction
                this.apiInstance.log(402, 'Parameter speeddial should be either 1 or 0', 'extensionCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
                return res.status(402).send({ status_code: 402, error: 'Only Number Allowed !', message: 'speeddial should be either 1 or 0' });
            }
        }
        if (data.stickyagent) {
            if (data.stickyagent !== 0 && data.stickyagent !== 1) {  // balancerestriction
                this.apiInstance.log(402, 'Parameter stickyagent should be either 1 or 0', 'extensionCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
                return res.status(402).send({ status_code: 402, error: 'Only Number Allowed !', message: 'stickyagent should be either 1 or 0' });
            }
        }
        if (data.outbound) {
            if (data.outbound !== 0 && data.outbound !== 1) {  // balancerestriction
                this.apiInstance.log(402, 'Parameter outbound should be either 1 or 0', 'extensionCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
                return res.status(402).send({ status_code: 402, error: 'Only Number Allowed !', message: 'outbound should be either 1 or 0' });
            }
        }
        if (data.ringtone) {
            if (data.ringtone !== 0 && data.ringtone !== 1) {  // balancerestriction
                this.apiInstance.log(402, 'Parameter ringtone should be either 1 or 0', 'extensionCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
                return res.status(402).send({ status_code: 402, error: 'Only Number Allowed !', message: 'ringtone should be either 1 or 0' });
            }
        }
        if (data.dtmftype) {
            if (data.dtmftype !== 0 && data.dtmftype !== 1) {  // balancerestriction
                this.apiInstance.log(402, 'Parameter dtmftype should be either 1 or 0', 'extensionCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
                return res.status(402).send({ status_code: 402, error: 'Only Number Allowed !', message: 'dtmftype should be either 1 or 0' });
            }
        }
        if (data.voicemail) {
            if (data.voicemail !== 0 && data.voicemail !== 1) {  // balancerestriction
                this.apiInstance.log(402, 'Parameter voicemail should be either 1 or 0', 'extensionCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
                return res.status(402).send({ status_code: 402, error: 'Only Number Allowed !', message: 'voicemail should be either 1 or 0' });
            }
        }
        
        let isCustomer = req.user_type ? req.user_type : "0";
        const web_pass = this.validationInstance.secure_password_generator(8);
        const sip_pass = this.validationInstance.sipPassword();
        let voicemail_pass = ''; // this.validationInstance.secure_password_generator(8);
       // let finalKey = req.customer_id + '' + mykeyword;

        knex.select('pf.billing_type', 'pf.minute_balance', 'mcp.package_id', 'p.feature_id', 'pf.extension_limit', 'pf.recording','pf.is_caller_id',
        'pf.outbound_call', 'pf.voicemail', 'pf.forward', 'pf.speed_dial', 'pf.black_list', 'pf.call_transfer', 'mcp.customer_id',
         'pf.is_sms as sms','pf.miss_call_alert','pf.geo_tracking','pf.is_roaming_type as roaming', 'pf.find_me_follow_me','pf.custom_prompt','pf.sticky_agent','p.id as package_id')
        .from(Table.tbl_Map_Customer_Package + ' as mcp')
        .leftJoin(Table.tbl_Package + ' as p', 'p.id', 'mcp.package_id')
        .leftJoin(Table.tbl_Features + ' as pf', 'p.feature_id', 'pf.id')
        .where('mcp.customer_id', '=', "" + req.customer_id + "").andWhere('mcp.product_id', '=', "1")
        .then(async (response) => {
             const extPermission = response[0];
             console.log(extPermission);
             let isExtLimitVerified = await this.validationInstance.validateExtensionLimit(extPermission['extension_limit'], req.customer_id);
             if (isExtLimitVerified) {
                 this.apiInstance.log(402, 'Maximum extenstion limit exceeded.', 'extensionCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
                 return res.status(402).send({ error: 'Maximum extenstion limit exceeded', message: 'Your Maximum extenstion limit has been exceeded.' });
             }
             
             if (isCustomer == '1') {
                let request = req.body;
                //---------------- Some default value need to assign -----------------------
                request.admin = request.admin == 1 ? 1 : request.admin == 0 ? 0 : 0;
                request.balancerestriction = request.balancerestriction == 1 ? 1 : request.balancerestriction == 0 ? 0 : 0;
                request.calltransfer = extPermission.call_transfer  ? (request.calltransfer == 1 ? 1 :  request.calltransfer == 0 ? 0 : 0) : 0;
                request.callforward = extPermission.forward ? (request.callforward  == 1 ? 1 :  request.callforward == 0 ? 0 : 0 ) : 0;
                request.dialout = extPermission.outbound_call ? (request.dialout  == 1 ? 1 :  request.dialout == 0 ? 0 : 0) : 0;
                request.dnd = request.dnd  == 1 ? 1 :  request.dnd == 0 ? 0 : 0;
                request.findmefollowme = extPermission.find_me_follow_me ?  (request.findmefollowme  == 1 ? 1 :  request.findmefollowme == 0 ? 0 : 0 ) : 0;
                request.multiplereg = request.multiplereg  == 1 ? 1 :  request.multiplereg == 0 ? 0 : 0;
                request.misscallalert = extPermission.miss_call_alert ?  ( request.misscallalert  == 1 ? 1 :  request.misscallalert == 0 ? 0 : 0 ) : 0;
                request.outboundsmsnotification =  extPermission.sms ? (request.outboundsmsnotification  == 1 ? 1 :  request.outboundsmsnotification == 0 ? 0 : 0 ) : 0;
                request.recording = extPermission.recording ? ( request.recording  == 1 ? 1 :  request.recording == 0 ? 0 : 0 ) : 0;
                request.roaming = extPermission.roaming ? ( request.roaming  == 1 ? 1 :  request.roaming == 0 ? 0 : 0 ) : 0;
                request.speeddial = extPermission.speed_dial ? (request.speeddial  == 1 ? 1 :  request.speeddial == 0 ? 0 : 0 ) : 0;
                request.stickyagent = extPermission.sticky_agent ? ( request.stickyagent  == 1 ? 1 :  request.stickyagent == 0 ? 0 : 0 ) : 0;
                request.outbound = extPermission.outbound_call ? ( request.outbound  == 1 ? 1 :  request.outbound == 0 ? 0 : 0 ) : 0;
                request.ringtone = extPermission.custom_prompt ? ( request.ringtone  == 1 ? 1 :  request.ringtone == 0 ? 0 : 0 ) : 0;
                //-------------------------- others----------------------------------------
                request.dtmftype = request.dtmftype  == 1 ? 1 :  request.dtmftype == 0 ? 0 : 0;
                request.voicemail = request.voicemail  == 1 ? 1 :  request.voicemail == 0 ? 0 : 0;
                if(request.voicemail) voicemail_pass = this.validationInstance.secure_password_generator(8);
                request.headertype = 0 // only support portal
                request.callerIDheadervalue = 0 // only support portal
                //-------------------------------------------------------------------------------------
    
                knex(Table.tbl_Extension_Master).insert({
                    package_id: extPermission.package_id, //
                    customer_id: extPermission.customer_id, //
                    ext_number:  extPermission.customer_id + "" + data.extnumber + "",//
                    username: "" + request.extname + "", //
                    password: "" + web_pass + "", //
                    email: "" + request.email + "",//
                    send_misscall_notification: "" + request.misscallalert + "", //
                    balance_restriction: "" + request.balancerestriction + "", //
                    caller_id_name: "" + request.calleridname + "", //
                    sip_password: "" + sip_pass + "", //
                    ring_time_out: "60", //
                    dial_time_out: "60", //
                    external_caller_id: "", 
                    dtmf_type: "" + request.dtmftype + "",//
                    caller_id_header_type: "" + request.headertype + "", //
                    caller_id_header_value: "" + request.callerIDheadervalue + "",  //
                    multiple_registration: "" + request.multiplereg + "",//
                    codec: "", //
                    voicemail: "" + request.voicemail + "", // 
                    dnd: "" + request.dnd + "", //
                    vm_password: voicemail_pass, //
                    outbound: "" + request.outbound + "",//
                    recording: "" + request.recording + "", //
                    forward: "" + request.callforward + "", // 
                    speed_dial: "" + request.speeddial + "", //
                    black_list: 0, // recently removed from front-end
                    call_transfer: "" + request.calltransfer + "", //
                    billing_type: extPermission.billing_type, //
                    total_min_bal: 0, //
                    token: request.token,//-------------------
                    api_token: "0", //
                    roaming: "" + request.roaming + "", //
                    outbound_sms_notification: "" + request.outboundsmsnotification + "",//
                    dial_prefix : "" + request.countryid + "", //
                    mobile: ""+ request.mobile + "", //
                    admin: ""+ request.admin + "", //
                    find_me_follow_me: ""+ request.findmefollowme + "", //
                    ringtone: ""+ request.ringtone + "", //
                    sticky_agent: ""+ request.stickyagent + "" //
                }).then((response) => {
                    this.apiInstance.log(200, 'Extension created succesfully', 'extensionCreation', 'pbx', '', req.ext_number, '');
                    res.send({
                        status_code: 200,
                        message: 'Extension created succesfully.',
                        web_password : web_pass,
                        extnumber : req.customer_id + ''+ data['extnumber'],
                        sip_password : sip_pass
                    });
                    // let newdata = { userName: data.extension_number, email: data.email, url: url }
                    // pushEmail.getEmailContentUsingCategory('ExtensionCreation').then(val => {
                    //     pushEmail.sendmail({ data: newdata, val: val, username: data.extension_number, password: data.web_pass, email: data.email, ext_name: data.ext_name }).then((data1) => {
                    //         //res.json({ data1 })
                    //     })
                    // })
                }).catch((err) => {
                    errorLog(err);
                    res.status(400).send({
                        status_code: 400,
                        message: 'Bad Request :' + err 
                    });
                    this.apiInstance.log(400, 'Bad Request : '+ err, 'extensionCreation', 'pbx', '', req.ext_number, JSON.stringify(data));
                    throw err
                });
        
            
            }else {
                this.apiInstance.log(403,'Forbidden - User has no permission for perform this action.','extensionCreation','pbx','', '','');  
                res.status(403).send({ status_code: 403, error: 'Forbidden', message: 'User has no permission for perform this action' }); 
             }
        });

        
    }

       /**
  *
  * @param req
  * @param res
  * @param next
  */

    public updateExtensionFeatures(req, res, next) {
        let obj = req.body;
        let data = { ...obj }; // clone the object with spread operator
        let updObj = {};
        let isCustomer = req.user_type ? req.user_type : "0";
        let ext_number = req.query.ext_number;
        console.log('ext_number',ext_number);
        
        if (!ext_number) {  // Ext Number
            this.apiInstance.log(402,'Parameter Missing - ext_number in params','updateExtensionFeatures','pbx', '', '', JSON.stringify(data)); 
            return res.status(402).send({ status_code: 402, error: 'Parameter Missing', message: 'Please pass ext_number in params' });
        }
        knex.select('pf.billing_type', 'pf.minute_balance', 'mcp.package_id', 'p.feature_id', 'pf.extension_limit', 'pf.recording', 'pf.is_caller_id',
            'pf.outbound_call', 'pf.voicemail', 'pf.forward', 'pf.speed_dial', 'pf.black_list', 'pf.call_transfer', 'mcp.customer_id',
            'pf.is_sms as sms', 'pf.miss_call_alert', 'pf.geo_tracking', 'pf.is_roaming_type as roaming', 'pf.find_me_follow_me', 'pf.custom_prompt', 'pf.sticky_agent', 'p.id as package_id')
            .from(Table.tbl_Map_Customer_Package + ' as mcp')
            .leftJoin(Table.tbl_Package + ' as p', 'p.id', 'mcp.package_id')
            .leftJoin(Table.tbl_Features + ' as pf', 'p.feature_id', 'pf.id')
            .where('mcp.customer_id', '=', "" + req.customer_id + "").andWhere('mcp.product_id', '=', "1")
            .then((response) => {
                const extPermission = response[0];
                if (isCustomer == '1') {
                    if (obj.hasOwnProperty('admin')) updObj['admin'] = data.admin == 1 ? '1' : data.admin == 0 ? '0' : '0';
                    if (obj.hasOwnProperty('balancerestriction')) updObj['balance_restriction'] = data.balancerestriction == 1 ? 1 : data.balancerestriction == 0 ? 0 : 0;
                    if (obj.hasOwnProperty('calltransfer') && extPermission.call_transfer) updObj['call_transfer'] = data.calltransfer == 1 ? 1 : data.calltransfer == 0 ? 0 : 0;
                    if (obj.hasOwnProperty('callforward') && extPermission.forward) updObj['forward'] = data.callforward == 1 ? 1 : data.callforward == 0 ? 0 : 0;
                    if (obj.hasOwnProperty('dnd') ) updObj['dnd'] = data.dnd == 1 ? 1 : data.dnd == 0 ? 0 : 0;
                    if (obj.hasOwnProperty('findmefollowme') && extPermission.find_me_follow_me) updObj['find_me_follow_me'] = data.findmefollowme == 1 ? 1 : data.findmefollowme == 0 ? 0 : 0;
                    if (obj.hasOwnProperty('multiplereg') ) updObj['multiplereg'] = data.multiplereg == 1 ? 1 : data.multiplereg == 0 ? 0 : 0;
                    if (obj.hasOwnProperty('misscallalert') && extPermission.miss_call_alert) updObj['miss_call_alert'] = data.misscallalert == 1 ? 1 : data.misscallalert == 0 ? 0 : 0;
                    if (obj.hasOwnProperty('outboundsmsnotification') && extPermission.sms) updObj['outbound_sms_notification'] = data.outboundsmsnotification == 1 ? 1 : data.outboundsmsnotification == 0 ? 0 : 0;
                    if (obj.hasOwnProperty('recording') && extPermission.recording) updObj['recording'] = data.recording == 1 ? 1 : data.recording == 0 ? 0 : 0;
                    if (obj.hasOwnProperty('roaming') && extPermission.roaming) updObj['roaming'] = data.roaming == 1 ? 1 : data.roaming == 0 ? 0 : 0;
                    if (obj.hasOwnProperty('speeddial') && extPermission.speed_dial) updObj['speed_dial'] = data.speeddial == 1 ? 1 : data.speeddial == 0 ? 0 : 0;
                    if (obj.hasOwnProperty('stickyagent') && extPermission.sticky_agent) updObj['sticky_agent'] = data.stickyagent == 1 ? 1 : data.stickyagent == 0 ? 0 : 0;
                    if (obj.hasOwnProperty('outbound') && extPermission.outbound_call) updObj['outbound'] = data.outbound == 1 ? 1 : data.outbound == 0 ? 0 : 0;
                    if (obj.hasOwnProperty('ringtone') && extPermission.custom_prompt) updObj['ringtone'] = data.ringtone == 1 ? 1 : data.ringtone == 0 ? 0 : 0;
                
                    let sql0 = knex.from(Table.tbl_Extension_Master).select(knex.raw('COUNT(id) as count')).where('ext_number', ext_number).andWhere('customer_id', req.customer_id);
                    console.log(sql0.toQuery());
                    
                    sql0.then((response) => {
                        if (response[0].count == 0) {
                            this.apiInstance.log(403, 'Forbidden - User has no permission for this extension.', 'updateExtensionFeatures', 'pbx', '', ext_number, JSON.stringify(data));
                            res.status(403).send({ status_code: 403, error: 'Forbidden', message: 'User has no permission for this extension' });
                        } else {
                            let sql = knex.from(Table.tbl_Extension_Master + ' as ext')
                                .update(updObj)
                                .where('ext.ext_number', '=', ext_number)
                                .andWhere('customer_id', req.customer_id);
                            sql.then((response) => {
                                console.log(response,"-----------------------");
                                
                                    this.apiInstance.log(200, 'Extension features updated.', 'updateExtensionFeatures', 'pbx', '', req.ext_number);
                                    res.json({
                                        status_code: 200,
                                        message: 'Extension features updated.',
                                    });
                            }).catch((err) => {
                                errorLog(err);
                                res.status(400).send({
                                    status_code: 400,
                                    message: 'Bad Request'
                                });
                                this.apiInstance.log(400, 'Bad Request.', 'updateExtensionFeatures', 'pbx', '', ext_number, JSON.stringify(data));
                                throw err
                            });
                        }
                    }).catch((err) => {
                        errorLog(err);
                        res.status(400).send({
                            status_code: 400,
                            message: 'Bad Request'
                        });
                        this.apiInstance.log(400, 'Bad Request.' + err, 'updateExtensionFeatures', 'pbx', '', req.ext_number, JSON.stringify(data));
                        throw err
                    });
                } else {
                    this.apiInstance.log(403,'Forbidden - User has no permission for perform this action.','updateExtensionFeatures','pbx','', '','');  
                    res.status(403).send({ status_code: 403, error: 'Forbidden', message: 'User has no permission for perform this action' }); 
                 }
            }).catch((err) => {
                errorLog(err);
                res.status(400).send({
                    status_code: 400,
                    message: 'Bad Request :' + err
                });
                this.apiInstance.log(400, 'Bad Request : ' + err, 'updateExtensionFeatures', 'pbx', '', ext_number, JSON.stringify(data));
                throw err
            });

    }
    
}


