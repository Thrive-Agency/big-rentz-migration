import wpAxios from './axios-wp.js';
import fs from 'fs';
import path from 'path';

// Test endpoint: Get WP site info
export async function getSiteInfo() {
  try {
    const response = await wpAxios.get('/');
    return response.data;
  } catch (error) {
    console.error('WordPress API error:', error.message);
    throw error;
  }
}

// Get all custom post types from WP REST API
export async function getCustomPostTypes() {
  try {
    const response = await wpAxios.get('/wp/v2/types');
    return response.data;
  } catch (error) {
    console.error('WordPress API error (custom post types):', error.message);
    throw error;
  }
}

// Generic: Get all posts for a custom post type (handles pagination)
export async function getPostsByType(type, progressCallback) {
  try {
    let allPosts = [];
    let page = 1;
    let response;

    do {
      response = await wpAxios.get(`/wp/v2/${type}`, { params: { page, per_page: 100 } });
      allPosts = allPosts.concat(response.data);
      
      // Call progress callback if provided
      if (progressCallback) {
        progressCallback(allPosts.length);
      }
      
      page++;
    } while (response.headers['x-wp-totalpages'] && page <= parseInt(response.headers['x-wp-totalpages'], 10));

    return allPosts;
  } catch (error) {
    console.error(`WordPress API error (get posts for type: ${type}):`, error.message);
    throw error;
  }
}

// Generic: Get a single post by type and ID
export async function getPostByType(type, id) {
  try {
    const response = await wpAxios.get(`/wp/v2/${type}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`WordPress API error (get post for type: ${type}, id: ${id}):`, error.message);
    throw error;
  }
}

// Generic: Create a post for a custom post type
export async function createPostByType(type, data) {
  try {
    const response = await wpAxios.post(`/wp/v2/${type}`, data);
    return response.data;
  } catch (error) {
    console.error(`WordPress API error (create post for type: ${type}):`, error.message);
    throw error;
  }
}

// Generic: Get taxonomy terms
export async function getTaxonomyTerms(taxonomy) {
  // File-based cache with expiry
  const cacheDir = path.resolve('./.cache');
  const cacheFile = path.join(cacheDir, `taxonomy-${taxonomy}.json`);
  const expiryMs = 60 * 60 * 1000; // 1 hour

  // Ensure cache directory exists
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir);
  }

  // Try to read cache
  if (fs.existsSync(cacheFile)) {
    try {
      const cacheData = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
      if (cacheData.timestamp && Date.now() - cacheData.timestamp < expiryMs) {
        return cacheData.terms;
      }
    } catch (err) {
      // Ignore cache read errors, fall through to fetch
    }
  }

  // Fetch from API
  try {
    let allTerms = [];
    let page = 1;
    let response;

    do {
      response = await wpAxios.get(`/wp/v2/${taxonomy}`, { params: { page, per_page: 100 } });
      allTerms = allTerms.concat(response.data);
      page++;
    } while (response.headers['x-wp-totalpages'] && page <= parseInt(response.headers['x-wp-totalpages'], 10));

    // Write to cache
    fs.writeFileSync(cacheFile, JSON.stringify({ timestamp: Date.now(), terms: allTerms }, null, 2));
    return allTerms;
  } catch (error) {
    console.error(`WordPress API error (get taxonomy terms: ${taxonomy}):`, error.message);
    throw error;
  }
}

// Generic: Delete a post by type and ID
export async function deletePostByType(type, id) {
  try {
    const response = await wpAxios.delete(`/wp/v2/${type}/${id}`, {
      params: { force: true } // Bypass trash, permanently delete
    });
    return response.data;
  } catch (error) {
    console.error(`WordPress API error (delete post for type: ${type}, id: ${id}):`, error.message);
    throw error;
  }
}

// Lookup state term ID by name or slug
export async function getTaxTermId(searchTerm, taxonomySlug) {
  const terms = await getTaxonomyTerms(taxonomySlug);
  // Try to match by slug first, then name (case-insensitive)
  console.log('Searching for term:', searchTerm, 'in taxonomy:', taxonomySlug);
  //console.log('Available terms:', terms);
  const match = terms.find(
    t => t.slug.toLowerCase() === searchTerm.toLowerCase()
      || t.name.toLowerCase() === searchTerm.toLowerCase()
  );
  return match ? match.id : null;
} 