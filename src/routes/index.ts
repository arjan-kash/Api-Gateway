import * as  express from 'express';

const praviteRouter = require('./secured-api.routes');
const publicRouter = require('./public-api.routes');

const ROUTER = express.Router();

ROUTER.use('/', praviteRouter);
ROUTER.use('/', publicRouter);

module.exports = ROUTER;