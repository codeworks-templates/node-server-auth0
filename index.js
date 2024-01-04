require('dotenv').config()
// @ts-ignore
// eslint-disable-next-line no-global-assign
require = require('esm-wallaby')(module)
module.exports = require('./src/main')
