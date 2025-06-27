require('dotenv').config();
const fs = require('fs');
const db = require('./config/db');

const sql = fs.readFileSync('./init.sql', 'utf8');

db.query(sql)
  .then(() => {
    console.log('✅ Script SQL ejecutado correctamente');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Error ejecutando el script SQL:', err.message);
    process.exit(1);
  });
