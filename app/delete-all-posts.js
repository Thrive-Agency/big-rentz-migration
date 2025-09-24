// delete-all-posts.js
// Delete all WordPress posts of the configured post type
import { getPostsByType, deletePostByType } from './services/wordpress.js';
import { config } from './settings.js';
import colors from './utils/colors.js';
import ScriptHeader from './utils/ScriptHeader.js';
import ScriptTimer from './utils/ScriptTimer.js';

const header = new ScriptHeader('Delete All Posts', 'red');
header.print();
const timer = new ScriptTimer('Delete All Posts', 'red');
timer.start();

const force = process.argv.includes('--force');

console.log(`${colors.red}WARNING: This will delete ALL posts of type "${config.WP_POST_SLUG}"!${colors.reset}`);

if (!force) {
  process.stdin.setEncoding('utf8');
  process.stdout.write('Are you sure you want to continue? (y/N): ');
  const answer = await new Promise(resolve => process.stdin.once('data', resolve));
  if (answer.trim().toLowerCase() !== 'y') {
    console.log('Aborting deletion.');
    timer.end();
    process.exit(0);
  }

  process.stdout.write('Type DELETE to confirm: ');
  const confirm = await new Promise(resolve => process.stdin.once('data', resolve));
  if (confirm.trim() !== 'DELETE') {
    console.log('Confirmation failed. Aborting.');
    timer.end();
    process.exit(0);
  }
}

let deleted = 0;
let errors = 0;
const errorLog = [];

try {
  console.log(`${colors.yellow}Fetching all posts of type "${config.WP_POST_SLUG}"...${colors.reset}`);
  const posts = await getPostsByType(config.WP_POST_SLUG);
  
  if (posts.length === 0) {
    console.log(`${colors.cyan}No posts found to delete.${colors.reset}`);
    timer.end();
    process.exit(0);
  }

  console.log(`${colors.yellow}Found ${posts.length} posts. Starting deletion...${colors.reset}`);

  for (const post of posts) {
    try {
      await deletePostByType(config.WP_POST_SLUG, post.id);
      deleted++;
      console.log(`${colors.green}Deleted post ${post.id}: "${post.title?.rendered || 'No title'}" (${deleted}/${posts.length})${colors.reset}`);
    } catch (error) {
      errors++;
      const errorMsg = `Failed to delete post ${post.id}: ${error.message}`;
      errorLog.push(errorMsg);
      console.error(`${colors.red}${errorMsg}${colors.reset}`);
    }
  }

  // Summary
  console.log(`\n${colors.cyan}=== Deletion Summary ===${colors.reset}`);
  console.log(`${colors.green}Successfully deleted: ${deleted}${colors.reset}`);
  console.log(`${colors.red}Errors: ${errors}${colors.reset}`);
  
  if (errorLog.length > 0) {
    console.log(`\n${colors.red}Error details:${colors.reset}`);
    errorLog.forEach(error => console.log(`  ${error}`));
  }

} catch (error) {
  console.error(`${colors.red}Failed to fetch posts:${colors.reset}`, error.message);
  timer.end();
  process.exit(1);
}

timer.end();
process.exit(errors > 0 ? 1 : 0);