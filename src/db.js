const { Pool } = require("pg");

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "api_usuarios",
    password: "Alaiacamil16",
    port: 5432
});

module.exports = pool;