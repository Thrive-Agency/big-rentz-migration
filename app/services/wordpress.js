import wpAxios from './axios-wp.js';

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

// Generic: Get all posts for a custom post type
export async function getPostsByType(type) {
  try {
    const response = await wpAxios.get(`/wp/v2/${type}`);
    return response.data;
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
  try {
    const response = await wpAxios.get(`/wp/v2/${taxonomy}`);
    return response.data;
  } catch (error) {
    console.error(`WordPress API error (get taxonomy terms: ${taxonomy}):`, error.message);
    throw error;
  }
}
