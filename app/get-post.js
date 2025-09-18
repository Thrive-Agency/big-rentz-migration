// get-post.js
// Usage: npm run get-post <id>
import { getPostByType } from './services/wordpress.js';
import {config} from './settings.js';

const args = process.argv.slice(2);
if (args.length < 1) {
  console.error('Usage: npm run get-post <id>');
  process.exit(1);
}

const postId = args[0];
const postType = config.WP_POST_SLUG;

(async () => {
  try {
    const post = await getPostByType(postType, postId);
    console.log(JSON.stringify(post, null, 2));
  } catch (err) {
    console.error('Error retrieving post:', err);
    process.exit(1);
  }
})();
