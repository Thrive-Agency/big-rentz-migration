# wordpress.js

Provides generic methods for interacting with the WordPress REST API, including custom post types and taxonomies.

## Methods

### getSiteInfo()
Fetches general site info from the WordPress API root.
```js
const info = await getSiteInfo();
```

### getCustomPostTypes()
Fetches all registered post types (including custom) from `/wp/v2/types`.
```js
const postTypes = await getCustomPostTypes();
```

### getPostsByType(type)
Fetches all posts for a given custom post type (e.g., 'rental-locations').
```js
const locations = await getPostsByType('rental-locations');
```

### getPostByType(type, id)
Fetches a single post by type and ID.
```js
const location = await getPostByType('rental-locations', 123);
```

### createPostByType(type, data)
Creates a new post for a given custom post type.
```js
const newLocation = await createPostByType('rental-locations', { title: 'New Location', ... });
```

### getTaxonomyTerms(taxonomy)
Fetches all terms for a given taxonomy (e.g., 'state').
```js
const states = await getTaxonomyTerms('state');
```

## Usage
```js
import {
  getSiteInfo,
  getCustomPostTypes,
  getPostsByType,
  getPostByType,
  createPostByType,
  getTaxonomyTerms
} from '../services/wordpress.js';
```

## Location
- JS: `app/services/wordpress.js`
- MD: `docs/wordpress.md`
