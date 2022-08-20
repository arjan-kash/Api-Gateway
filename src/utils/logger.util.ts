import {configure, getLogger} from 'log4js';
const config = require('../config');

configure({
  appenders: {console: {type: 'console'}, file: {type: 'file', filename: config.logging.log_location}},
  categories: {default: {appenders: ['file', 'console'], level: 'debug'}}
});

export function debugLog(msg: string) {
  const logger = getLogger('');
  logger.level = 'debug';
  logger.debug(msg);
}

export function traceLog(msg: string) {
  const logger = getLogger('');
  logger.level = 'trace';
  logger.trace(msg);
}

export function infoLog(msg: string) {
  const logger = getLogger('');
  logger.level = 'info';
  logger.info(msg);
}

export function warnLog(error: string | Error) {
  const logger = getLogger('');
  logger.level = 'warn';
  if (error instanceof Error) {
    logger.error(error.stack)
  } else {
    logger.error(error);
  }
}

export function unauthLog(msg: string, url: string, ip: string, headers?) {
  const logger = getLogger('');
  logger.level = 'warn';
  msg += '\nIP - ' + ip + '\nURL - ' + url;
  // msg += '\n-----HEADERS-----\n' + JSON.stringify(headers);
  logger.warn(msg);
}

export function errorLog(error: string | Error) {
  const logger = getLogger('');
  logger.level = 'error';
  if (error instanceof Error) {
   logger.error(error.stack)
  } else {
    logger.error(error);
  }
}

export function fatalLog(msg: string) {
  const logger = getLogger('');
  logger.level = 'fatal';
  logger.fatal(msg);
}
