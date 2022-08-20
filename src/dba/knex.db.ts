/**
 * This is the DB Connection file.
 *
 * @author Nagender Pratap Chauhan 
 */

 import  knex  from 'knex';
 const config = require('../config');
 interface KnexConfig {
    [key: string]: object;
  }
  
// init database connection
const configuration: KnexConfig = {
    developement: {
        client: 'mysql2',
        connection: {
            host: process.env.DB_WRITE_HOST || config.database.host,
            user: process.env.DB_USERNAME || config.database.username,
            password: process.env.DB_PASSWORD || config.database.password,
            database: process.env.DB_DATABASE || config.database.db_name,
            port: process.env.DB_PORT || config.database.port,
            connectTimeout: 90000,
            // debug: true
        },
        pool: {
            min: 5,
            max: 50,
        }
    }
};

const KnexInstance = knex(configuration['developement']);
module.exports = KnexInstance;
