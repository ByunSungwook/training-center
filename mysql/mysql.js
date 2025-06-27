const mysql = require('mysql2');
const connection = mysql.createConnection({
  host: process.env.RDS_URL,
  user: process.env.RDS_USER,
  password: process.env.RDS_PASSWORD,
  database: process.env.RDS_DATABASE,
  port: 3306,
})

module.exports = connection;

async function query() {
  connection.connect();
  const query = `SELECT a, b as B FROM \`P\` WHERE q = "${q._id}" GROUP BY q;`
  const result = await connection.promise().query(query);
  connection.end();
  return result;
}