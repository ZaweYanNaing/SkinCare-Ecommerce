// API configuration
export const API_BASE_URL = 'http://localhost';

export const API_ENDPOINTS = {
  OVERVIEW_STATS: `${API_BASE_URL}/admin/overview-stats.php`,
  SALES_BY_CATEGORY: `${API_BASE_URL}/admin/sales-by-category.php`,
  TOP_PRODUCTS: `${API_BASE_URL}/admin/top-products.php`,
  TEST: `${API_BASE_URL}/admin/test.php`,
};

// Helper function for API calls
export const apiCall = async (url: string, options?: RequestInit) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};