# WordPress Post Deletion Tools

This document covers the deletion tools available for managing WordPress posts in the migration project.

## Overview

The project includes two deletion scripts for managing WordPress posts:
- **Single Post Deletion**: Delete a specific post by ID
- **Bulk Post Deletion**: Delete all posts of the configured post type

Both tools use the WordPress REST API and follow the same authentication and configuration as other WordPress integration tools.

## Single Post Deletion

### Usage
```bash
npm run delete <post-id>
```

### Example
```bash
npm run delete 23425
```

### Features
- Deletes a single WordPress post by ID
- Uses the post type configured in `settings.js` (`WP_POST_SLUG`)
- Validates post ID is a positive number
- Permanently deletes the post (bypasses trash)
- Displays colored success/error messages
- Shows deletion result details

### Error Handling
- Invalid or missing post ID: Script exits with error message
- WordPress API errors: Displays detailed error information
- Network issues: Standard error handling with descriptive messages

## Bulk Post Deletion

### Usage
```bash
# Interactive mode (recommended)
npm run delete-all

# Force mode (skip confirmations)
npm run delete-all -- --force
```

### Safety Features
- **Double Confirmation**: Requires both y/N confirmation and typing "DELETE"
- **Force Flag**: Use `--force` to bypass confirmations (dangerous!)
- **Preview**: Shows total number of posts before deletion
- **Progress**: Displays each post being deleted with title and ID

### Process Flow
1. Fetches all posts of the configured post type (handles pagination)
2. Shows total count and asks for confirmation
3. Requires typing "DELETE" to proceed
4. Deletes posts one by one with progress updates
5. Provides summary with success/error counts

### Features
- Handles WordPress pagination automatically (fetches all posts)
- Progress tracking with post titles and IDs
- Comprehensive error logging for failed deletions
- Colored output for easy monitoring
- Execution timing with improved time formatting
- Graceful error handling for individual post failures

### Output Example
```
Found 869 posts. Starting deletion...
Deleted post 117290: "DeFuniak Springs" (869/869)

=== Deletion Summary ===
Successfully deleted: 869
Errors: 0
```

## Configuration

Both deletion tools use the following configuration from `settings.js`:
- `WP_POST_SLUG`: The WordPress custom post type to target
- WordPress API credentials and endpoint settings

## WordPress API Integration

The deletion tools use the following WordPress service functions:
- `deletePostByType(type, id)`: Deletes a single post with force parameter
- `getPostsByType(type)`: Fetches all posts with pagination handling

## Safety Considerations

⚠️ **Important Safety Notes:**
- Deletions are **permanent** (bypass WordPress trash)
- Always test on a staging environment first
- Consider backing up your database before bulk operations
- Use `--force` flag only when absolutely certain
- The bulk deletion tool fetches ALL posts - be aware of large datasets

## Error Recovery

If bulk deletion fails partway through:
- Check the error summary for specific failure details
- Re-run the script to delete remaining posts
- Individual post failures won't stop the overall process
- Use single post deletion for manual cleanup if needed

## Integration with Migration Workflow

These deletion tools integrate with the broader migration workflow:
- Use before re-importing to clear existing data
- Helpful for testing and development iterations
- Can be used to clean up specific post types during migrations
- Compatible with the bulk processing and record management systems

---

**Next Steps**: After deletion, you can use the bulk processing tools to re-import fresh data from your migration sources.