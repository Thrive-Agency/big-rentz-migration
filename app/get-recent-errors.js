import ScriptHeader from './utils/ScriptHeader.js';
import ScriptTimer from './utils/ScriptTimer.js';
import colors from './utils/colors.js';
import db from './db/db.js';

const args = process.argv.slice(2);
const limit = args.includes('-limit') ? parseInt(args[args.indexOf('-limit') + 1], 10) || 1 : 1;

const header = new ScriptHeader('Database: Get Recent Error Logs');
header.print();
const timer = new ScriptTimer('Recent Error Logs');
timer.start();

try {
  // Get the most recent error logs
  const result = await db.pool.query(`
    SELECT 
      ie.id,
      ie.record_id,
      ie.error_messages,
      ie.created_at,
      ie.resolved,
      ie.imported,
      r.data->>'entity_id' as entity_id,
      r.data->>'name' as record_name
    FROM import_errors ie
    LEFT JOIN records r ON ie.record_id = r.id
    ORDER BY ie.created_at DESC
    LIMIT $1
  `, [limit]);

  if (result.rows.length === 0) {
    console.log('No error logs found in the database.');
  } else {
    console.log(`\n${colors.yellow}Recent Error Log${limit > 1 ? 's' : ''}:${colors.reset}`);
    console.log(`${colors.magenta}${'='.repeat(60)}${colors.reset}`);
    
    result.rows.forEach((error, index) => {
      console.log(`\n${colors.cyan}Error #${error.id}${colors.reset} ${colors.white}(${new Date(error.created_at).toLocaleString()})${colors.reset}`);
      console.log(`${colors.yellow}Record ID:${colors.reset} ${error.record_id}`);
      if (error.entity_id) {
        console.log(`${colors.yellow}Entity ID:${colors.reset} ${error.entity_id}`);
      }
      if (error.record_name) {
        console.log(`${colors.yellow}Record Name:${colors.reset} ${error.record_name}`);
      }
      console.log(`${colors.yellow}Status:${colors.reset} ${error.resolved ? colors.green + 'Resolved' : colors.red + 'Unresolved'}${colors.reset} | ${error.imported ? colors.green + 'Imported' : colors.red + 'Not Imported'}${colors.reset}`);
      
      // Display error messages
      console.log(`${colors.yellow}Error Messages:${colors.reset}`);
      if (typeof error.error_messages === 'object' && error.error_messages !== null) {
        const messages = Array.isArray(error.error_messages) ? error.error_messages : [error.error_messages];
        messages.forEach((msg, msgIndex) => {
          const errorText = typeof msg === 'string' ? msg : JSON.stringify(msg, null, 2);
          console.log(`${colors.red}  ${msgIndex + 1}. ${errorText}${colors.reset}`);
        });
      } else {
        console.log(`${colors.red}  ${error.error_messages}${colors.reset}`);
      }
      
      if (index < result.rows.length - 1) {
        console.log(`${colors.magenta}${'-'.repeat(40)}${colors.reset}`);
      }
    });
    
    console.log(`${colors.magenta}${'='.repeat(60)}${colors.reset}`);
    console.log(`${colors.cyan}Showing ${result.rows.length} most recent error log${result.rows.length > 1 ? 's' : ''}${colors.reset}`);
  }

} catch (err) {
  console.error('Error retrieving error logs:', err);
} finally {
  await db.pool.end();
}

timer.end();