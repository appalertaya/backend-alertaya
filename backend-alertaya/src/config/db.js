require('dotenv').config();
const mysql = require('mysql2');

console.log('📦 DATABASE_URL:', process.env.DATABASE_URL);

let pool;

function createPoolWithRetry() {
  pool = mysql.createPool(process.env.DATABASE_URL, {
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  pool.getConnection((err, connection) => {
    if (err) {
      console.error('❌ Error al conectar a la base de datos:', err.message);
      setTimeout(createPoolWithRetry, 5000); // Reintenta luego de 5 segundos
    } else {
      console.log('🟢 Conexión a MySQL establecida correctamente');
      connection.release();
    }
  });
}

createPoolWithRetry();

module.exports = pool;
