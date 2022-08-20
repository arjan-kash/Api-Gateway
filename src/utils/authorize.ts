import { Table } from "../dba/table";
var knex  = require('../dba/knex.db');

class Authentication {
    authorize(token, callback, errorCallback){
        const authorization = token;
        if (authorization) {
            try {
                let sql = knex.select('exm.token')
                    .from(Table.tbl_Extension_Master + ' as exm')
                    .andWhere('exm.token', authorization)
                sql.then((response) => {
                    if (response.length > 0) {
                        return callback();
                    } else {
                        // return res.status(400).send({ error: 'Token does not exist', message: 'Authentication failed.' });
                        errorCallback();
                    }
                })
            } catch (e) {
                // return res.status(400).send({ error: 'Token does not exist', message: 'Authentication failed.' });
                errorCallback();
            }

        } else {
            errorCallback();
            //return res.status(400).send({ error: 'Unauthorized', message: 'Authentication failed.' });
        }
    }
}

module.exports = Authentication;
