// delete-post.js
// Delete a WordPress post by ID
import { deletePostByType } from './services/wordpress.js';
import { config } from './settings.js';
import colors from './utils/colors.js';

const postId = process.argv[2];

if (!postId) {
  console.error(colors.red + 'Usage: npm run delete <post-id>' + colors.reset);
  process.exit(1);
}

const id = parseInt(postId, 10);
if (isNaN(id) || id <= 0) {
  console.error(colors.red + 'Invalid post ID. Must be a positive number.' + colors.reset);
  process.exit(1);
}

console.log(`${colors.yellow}Deleting post ID ${id} from post type "${config.WP_POST_SLUG}"...${colors.reset}`);

try {
  const result = await deletePostByType(config.WP_POST_SLUG, id);
  console.log(`${colors.green}Post ${id} deleted successfully.${colors.reset}`);
  console.log('Result:', result);
} catch (error) {
  console.error(`${colors.red}Failed to delete post ${id}:${colors.reset}`, error.message);
  process.exit(1);
}