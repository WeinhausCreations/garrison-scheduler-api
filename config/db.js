const mysql = require('mysql')
const db = mysql.createConnection({
    host: 'localhost',
    user: 'weinhaus_buckley',
    password: 'buckleyGSS1701',
    database: 'weinhaus_gss',
});

module.exports = db;