/**
 * Feattie Chat Widget
 * Embeddable chat widget for e-commerce product assistance
 */

(function() {
  'use strict';

  // Check if FeattieChat configuration exists
  if (typeof window.FeattieChat === 'undefined') {
    console.error('Feattie Chat: Configuration not found. Please initialize window.FeattieChat before loading widget.js');
    return;
  }

  const config = window.FeattieChat;
  const API_URL = config.apiUrl || window.location.origin;
  const TENANT_SLUG = config.tenantSlug;

  if (!TENANT_SLUG) {
    console.error('Feattie Chat: tenantSlug is required in configuration');
    return;
  }

  // Widget state
  let widgetConfig = null;
  let isOpen = false;
  let isLoading = false;
  let messages = [];
  let sessionId = null;

  // DOM elements
  let widgetContainer = null;
  let toggleButton = null;
  let chatWindow = null;
  let messagesContainer = null;
  let inputField = null;
  let sendButton = null;

  /**
   * Initialize the widget
   */
  async function init() {
    try {
      // Fetch widget configuration
      const response = await fetch(`${API_URL}/api/widget/config/${TENANT_SLUG}`);
      if (!response.ok) {
        throw new Error(`Failed to load widget config: ${response.statusText}`);
      }
      widgetConfig = await response.json();

      // Create widget HTML
      createWidgetHTML();

      // Apply custom CSS if provided
      if (widgetConfig.customCss) {
        injectCustomCSS(widgetConfig.customCss);
      }

      // Auto-open if configured
      if (widgetConfig.autoOpen) {
        setTimeout(() => {
          openWidget();
        }, widgetConfig.autoOpenDelaySeconds * 1000);
      }

      console.log('Feattie Chat: Widget initialized successfully');
    } catch (error) {
      console.error('Feattie Chat: Initialization failed', error);
    }
  }

  /**
   * Create widget HTML structure
   */
  function createWidgetHTML() {
    // Create container
    widgetContainer = document.createElement('div');
    widgetContainer.id = 'feattie-chat-widget';
    widgetContainer.innerHTML = getWidgetHTML();
    document.body.appendChild(widgetContainer);

    // Get references to elements
    toggleButton = document.getElementById('feattie-toggle-btn');
    chatWindow = document.getElementById('feattie-chat-window');
    messagesContainer = document.getElementById('feattie-messages');
    inputField = document.getElementById('feattie-input');
    sendButton = document.getElementById('feattie-send-btn');
    const closeButton = document.getElementById('feattie-close-btn');

    // Add event listeners
    toggleButton.addEventListener('click', openWidget);
    closeButton.addEventListener('click', closeWidget);
    sendButton.addEventListener('click', handleSendMessage);
    inputField.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    });

    // Inject CSS
    injectWidgetCSS();
  }

  /**
   * Get widget HTML template
   */
  function getWidgetHTML() {
    const position = widgetConfig.widgetPosition || 'bottom-right';
    const chatTitle = widgetConfig.chatTitle || 'Chat Asistanı';
    const primaryColor = widgetConfig.brandColorPrimary || '#667eea';

    return `
      <!-- Toggle Button -->
      <button id="feattie-toggle-btn" class="feattie-toggle ${position}" style="background: ${primaryColor};">
        💬
      </button>

      <!-- Chat Window -->
      <div id="feattie-chat-window" class="feattie-window ${position}" style="display: none;">
        <div class="feattie-header" style="background: linear-gradient(135deg, ${widgetConfig.brandColorPrimary}, ${widgetConfig.brandColorSecondary});">
          <span class="feattie-title">${chatTitle}</span>
          <button id="feattie-close-btn" class="feattie-close-btn">&times;</button>
        </div>

        <div id="feattie-messages" class="feattie-messages"></div>

        <div class="feattie-input-area">
          <input
            type="text"
            id="feattie-input"
            class="feattie-input"
            placeholder="Mesajınızı yazın..."
            style="border-color: ${primaryColor}20;"
          />
          <button
            id="feattie-send-btn"
            class="feattie-send-btn"
            style="background: ${primaryColor};"
          >
            Gönder
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Inject widget CSS
   */
  function injectWidgetCSS() {
    const position = widgetConfig.widgetPosition || 'bottom-right';
    const primaryColor = widgetConfig.brandColorPrimary || '#667eea';

    const positionStyles = position.includes('right')
      ? 'right: 20px;'
      : 'left: 20px;';

    const css = `
      #feattie-chat-widget * {
        box-sizing: border-box;
      }

      .feattie-toggle {
        position: fixed;
        ${positionStyles}
        bottom: 20px;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        border: none;
        color: white;
        font-size: 28px;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 99998;
        transition: all 0.3s;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .feattie-toggle:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 16px rgba(0,0,0,0.25);
      }

      .feattie-window {
        position: fixed;
        ${positionStyles}
        bottom: 90px;
        width: 380px;
        max-width: calc(100vw - 40px);
        height: 500px;
        max-height: calc(100vh - 120px);
        background: white;
        border-radius: 16px;
        box-shadow: 0 4px 24px rgba(0,0,0,0.15);
        z-index: 99999;
        display: flex;
        flex-direction: column;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        opacity: 0;
        visibility: hidden;
        transform: translateY(20px);
        transition: all 0.3s ease;
      }

      .feattie-window.visible {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }

      .feattie-header {
        padding: 1rem 1.25rem;
        border-radius: 16px 16px 0 0;
        color: white;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .feattie-title {
        font-weight: 600;
        font-size: 1rem;
      }

      .feattie-close-btn {
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background-color 0.2s;
      }

      .feattie-close-btn:hover {
        background-color: rgba(255, 255, 255, 0.1);
      }

      .feattie-messages {
        flex: 1;
        overflow-y: auto;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .feattie-message {
        max-width: 70%;
        padding: 0.75rem 1rem;
        border-radius: 12px;
        font-size: 0.9375rem;
        line-height: 1.5;
      }

      .feattie-message.user {
        align-self: flex-end;
        background: ${primaryColor};
        color: white;
        border-bottom-right-radius: 4px;
      }

      .feattie-message.assistant {
        align-self: flex-start;
        background: #f8f9fa;
        color: #333;
        border-bottom-left-radius: 4px;
      }

      .feattie-message.product-card {
        align-self: flex-start;
        background: white;
        border: 1px solid #e9ecef;
        border-radius: 12px;
        padding: 12px;
        max-width: 85%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      }

      .feattie-product-image {
        width: 100%;
        height: 150px;
        object-fit: cover;
        border-radius: 8px;
        margin-bottom: 8px;
      }

      .feattie-product-title {
        font-weight: 600;
        color: #2c3e50;
        margin-bottom: 4px;
        font-size: 14px;
      }

      .feattie-product-price {
        color: ${primaryColor};
        font-weight: 700;
        font-size: 16px;
      }

      .feattie-input-area {
        padding: 1rem;
        border-top: 1px solid #dee2e6;
        display: flex;
        gap: 0.5rem;
      }

      .feattie-input {
        flex: 1;
        padding: 0.75rem 1rem;
        border: 2px solid #dee2e6;
        border-radius: 12px;
        font-size: 0.9375rem;
        outline: none;
        transition: all 0.2s;
      }

      .feattie-input:focus {
        border-color: ${primaryColor};
        box-shadow: 0 0 0 3px ${primaryColor}20;
      }

      .feattie-send-btn {
        padding: 0.75rem 1.25rem;
        border: none;
        border-radius: 12px;
        color: white;
        font-weight: 600;
        font-size: 0.9375rem;
        cursor: pointer;
        transition: all 0.2s;
      }

      .feattie-send-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 4px ${primaryColor}40;
      }

      .feattie-send-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
      }

      @media (max-width: 480px) {
        .feattie-window {
          width: calc(100vw - 40px);
          bottom: 80px;
        }
      }
    `;

    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }

  /**
   * Inject custom CSS
   */
  function injectCustomCSS(css) {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }

  /**
   * Open widget
   */
  function openWidget() {
    chatWindow.style.display = 'flex';
    setTimeout(() => {
      chatWindow.classList.add('visible');
    }, 10);
    isOpen = true;

    // Show welcome message if first time opening
    if (messages.length === 0) {
      addMessage(widgetConfig.welcomeMessage || 'Merhaba! Size nasıl yardımcı olabilirim?', 'assistant');
    }
  }

  /**
   * Close widget
   */
  function closeWidget() {
    chatWindow.classList.remove('visible');
    setTimeout(() => {
      chatWindow.style.display = 'none';
    }, 300);
    isOpen = false;
  }

  /**
   * Add message to chat
   */
  function addMessage(text, type, productData = null) {
    const messageDiv = document.createElement('div');

    if (productData) {
      messageDiv.className = 'feattie-message product-card';
      // Build product URL from shopify store URL + handle
      const productUrl = productData.shopifyStoreUrl && productData.handle
        ? `${productData.shopifyStoreUrl.replace(/\/$/, '')}/products/${productData.handle}`
        : productData.handle || '#';

      console.log('Building product URL:', {
        shopifyStoreUrl: productData.shopifyStoreUrl,
        handle: productData.handle,
        finalUrl: productUrl
      });

      messageDiv.innerHTML = `
        ${productData.imageUrl ? `<img src="${productData.imageUrl}" class="feattie-product-image" alt="${productData.title}">` : ''}
        <div class="feattie-product-title">${productData.title}</div>
        <div class="feattie-product-price">${productData.price} TL</div>
        ${productData.handle ? `<a href="${productUrl}" target="_blank" style="color: ${widgetConfig.brandColorPrimary}; font-size: 13px; text-decoration: none;">Ürünü Görüntüle →</a>` : ''}
      `;
    } else {
      messageDiv.className = `feattie-message ${type}`;
      messageDiv.textContent = text;
    }

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    messages.push({ text, type, productData });
  }

  /**
   * Handle send message
   */
  async function handleSendMessage() {
    const message = inputField.value.trim();
    if (!message || isLoading) return;

    // Add user message
    addMessage(message, 'user');
    inputField.value = '';

    // Show loading
    isLoading = true;
    sendButton.disabled = true;
    const loadingMsg = addLoadingMessage();

    try {
      // Send message to API
      const response = await fetch(`${API_URL}/api/chat/${widgetConfig.tenantId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: message,
          sessionId: sessionId,
          topK: 3
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();

      // Debug: Log entire response
      console.log('API Response:', data);

      // Update session ID if provided
      if (data.sessionId) {
        sessionId = data.sessionId;
      }

      // Remove loading message
      loadingMsg.remove();

      // Add assistant response
      addMessage(data.response || data.message, 'assistant');

      // Add product cards if any (productsReferenced from ChatResponse)
      if (data.productsReferenced && data.productsReferenced.length > 0) {
        console.log('Shopify Store URL:', data.shopifyStoreUrl);
        console.log('Full data object keys:', Object.keys(data));
        data.productsReferenced.forEach(product => {
          console.log('Product:', product);
          addMessage('', 'assistant', {
            title: product.title,
            price: product.price,
            imageUrl: product.imageUrl,
            handle: product.handle,
            shopifyStoreUrl: data.shopifyStoreUrl
          });
        });
      }

    } catch (error) {
      console.error('Feattie Chat: Error sending message', error);
      loadingMsg.remove();
      addMessage('Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.', 'assistant');
    } finally {
      isLoading = false;
      sendButton.disabled = false;
    }
  }

  /**
   * Add loading message
   */
  function addLoadingMessage() {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'feattie-message assistant';
    messageDiv.textContent = widgetConfig.showTypingIndicator ? 'Düşünüyorum...' : '...';
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    return messageDiv;
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
