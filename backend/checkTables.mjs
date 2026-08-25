import { pool } from './config/db.js'

try {
  const tables = await pool.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name
  `)
  console.log('Tables:', tables.rows.map(r => r.table_name))
} catch (err) {
  console.error('Error:', err.message)
}
process.exit(0)