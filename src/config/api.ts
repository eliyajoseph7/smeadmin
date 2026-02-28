// Central API Configuration - Managed by ApiClient
export const API_CONFIG = {
  // Change this URL to switch between UAT and Production
  // BASE_URL: 'https://api-uat.rino.co.tz',
  BASE_URL: 'https://api.rino.co.tz',
  
  // Alternative URLs (uncomment to use)
  // BASE_URL: 'https://api.rino.co.tz', // Production
  
  // API version
  VERSION: 'v1',
  
  // Full base URL with version
  get BASE_URL_WITH_VERSION() {
    return `${this.BASE_URL}/api/${this.VERSION}`;
  }
} as const;

// Export for Vite config to import
export default API_CONFIG;
