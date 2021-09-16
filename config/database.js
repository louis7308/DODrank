module.exports = {
    connectionLimit : 15,
    waitForConnections: true,
    queueLimit: 0,
    host    : process.env.DB_HOST,
    user    : process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
}