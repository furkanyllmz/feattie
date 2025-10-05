/**
 * Shopify RAG Widget Loader
 * One-line integration script
 *
 * Usage:
 * <script src="http://your-server:8000/static/widget-loader.js"></script>
 */

(function() {
  'use strict';

  // Auto-detect API URL from script src
  const currentScript = document.currentScript;
  const scriptSrc = currentScript ? currentScript.src : '';
  const apiUrl = scriptSrc ? scriptSrc.replace('/static/widget-loader.js', '') : 'http://localhost:8000';

  // Set API URL globally for widget
  window.SHOPIFY_RAG_API_URL = window.SHOPIFY_RAG_API_URL || apiUrl;

  // Load widget script
  const script = document.createElement('script');
  script.src = `${apiUrl}/static/widget.js`;
  script.async = true;
  document.head.appendChild(script);
})();
