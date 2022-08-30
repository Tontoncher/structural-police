try {
    module.exports = require('./src');
} catch {
    module.exports = require('./lib');
}