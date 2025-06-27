const fs = require('fs');
const db = require('./config/db'); // ← asegúrate que apunte bien
const sql = fs.readFileSync('./init.sql', 'utf8');

console.log('📦 DATABASE_URL:', process.env.DATABASE_URL);

db.promise().query(sql)
  .then(() => {
    console.log('✅ Script SQL ejecutado correctamente');
    db.end();
  })
  .catch(err => {
    console.error('❌ Error ejecutando el script SQL:', err.message);
    db.end();
  });
