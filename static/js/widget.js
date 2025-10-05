/**
 * Shopify RAG Chat Widget
 * Embeddable chat widget for product recommendations
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    apiUrl: window.SHOPIFY_RAG_API_URL || 'http://localhost:8000',
    position: window.SHOPIFY_RAG_POSITION || 'bottom-right', // bottom-right, bottom-left
    primaryColor: window.SHOPIFY_RAG_COLOR || '#000000',
    buttonText: window.SHOPIFY_RAG_BUTTON_TEXT || '💬',
    title: window.SHOPIFY_RAG_TITLE || 'Ürün Danışmanı'
  };

  // Create widget HTML
  const widgetHTML = `
    <div id="shopify-rag-widget" style="display: none;">
      <div id="shopify-rag-chat-window">
        <div id="shopify-rag-header">
          <span>${CONFIG.title}</span>
          <button id="shopify-rag-close">×</button>
        </div>
        <div id="shopify-rag-messages"></div>
        <div id="shopify-rag-input-area">
          <input type="text" id="shopify-rag-input" placeholder="Ürün hakkında soru sorun..." />
          <button id="shopify-rag-send">Gönder</button>
        </div>
      </div>
    </div>
    <button id="shopify-rag-toggle">${CONFIG.buttonText}</button>
  `;

  // Create widget CSS
  const widgetCSS = `
    #shopify-rag-widget {
      position: fixed;
      ${CONFIG.position.includes('right') ? 'right: 20px;' : 'left: 20px;'}
      bottom: 80px;
      width: 380px;
      max-width: calc(100vw - 40px);
      z-index: 99999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    #shopify-rag-chat-window {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.15);
      display: flex;
      flex-direction: column;
      height: 500px;
      max-height: calc(100vh - 120px);
    }

    #shopify-rag-header {
      background: ${CONFIG.primaryColor};
      color: white;
      padding: 16px 20px;
      border-radius: 12px 12px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 600;
    }

    #shopify-rag-close {
      background: none;
      border: none;
      color: white;
      font-size: 28px;
      cursor: pointer;
      padding: 0;
      width: 32px;
      height: 32px;
      line-height: 1;
    }

    #shopify-rag-messages {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .shopify-rag-message {
      max-width: 80%;
      padding: 12px 16px;
      border-radius: 12px;
      line-height: 1.5;
      font-size: 14px;
    }

    .shopify-rag-message.user {
      background: ${CONFIG.primaryColor};
      color: white;
      align-self: flex-end;
      border-bottom-right-radius: 4px;
    }

    .shopify-rag-message.assistant {
      background: #f0f0f0;
      color: #333;
      align-self: flex-start;
      border-bottom-left-radius: 4px;
    }

    .shopify-rag-message.loading {
      background: #f0f0f0;
      color: #666;
      align-self: flex-start;
    }

    #shopify-rag-input-area {
      padding: 16px;
      border-top: 1px solid #e0e0e0;
      display: flex;
      gap: 8px;
    }

    #shopify-rag-input {
      flex: 1;
      padding: 10px 14px;
      border: 1px solid #ddd;
      border-radius: 20px;
      font-size: 14px;
      outline: none;
    }

    #shopify-rag-input:focus {
      border-color: ${CONFIG.primaryColor};
    }

    #shopify-rag-send {
      background: ${CONFIG.primaryColor};
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 20px;
      cursor: pointer;
      font-weight: 600;
      font-size: 14px;
    }

    #shopify-rag-send:hover {
      opacity: 0.9;
    }

    #shopify-rag-send:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    #shopify-rag-toggle {
      position: fixed;
      ${CONFIG.position.includes('right') ? 'right: 20px;' : 'left: 20px;'}
      bottom: 20px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: ${CONFIG.primaryColor};
      color: white;
      border: none;
      font-size: 28px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 99998;
      transition: transform 0.2s;
    }

    #shopify-rag-toggle:hover {
      transform: scale(1.05);
    }

    @media (max-width: 480px) {
      #shopify-rag-widget {
        width: calc(100vw - 40px);
        bottom: 90px;
      }

      #shopify-rag-chat-window {
        height: calc(100vh - 120px);
      }
    }
  `;

  // Initialize widget
  function init() {
    // Add CSS
    const style = document.createElement('style');
    style.textContent = widgetCSS;
    document.head.appendChild(style);

    // Add HTML
    const container = document.createElement('div');
    container.innerHTML = widgetHTML;
    document.body.appendChild(container);

    // Get elements
    const widget = document.getElementById('shopify-rag-widget');
    const toggle = document.getElementById('shopify-rag-toggle');
    const close = document.getElementById('shopify-rag-close');
    const input = document.getElementById('shopify-rag-input');
    const send = document.getElementById('shopify-rag-send');
    const messages = document.getElementById('shopify-rag-messages');

    // Toggle chat
    toggle.addEventListener('click', () => {
      const isVisible = widget.style.display !== 'none';
      widget.style.display = isVisible ? 'none' : 'block';
      if (!isVisible) {
        input.focus();
        if (messages.children.length === 0) {
          addMessage('Merhaba! Size nasıl yardımcı olabilirim? Ürünler hakkında soru sorabilirsiniz.', 'assistant');
        }
      }
    });

    close.addEventListener('click', () => {
      widget.style.display = 'none';
    });

    // Send message
    function sendMessage() {
      const query = input.value.trim();
      if (!query) return;

      addMessage(query, 'user');
      input.value = '';
      send.disabled = true;

      // Show loading
      const loadingId = addMessage('Düşünüyorum...', 'loading');

      // Call API
      fetch(`${CONFIG.apiUrl}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, top_k: 3 })
      })
      .then(res => res.json())
      .then(data => {
        removeMessage(loadingId);
        addMessage(data.response, 'assistant');
      })
      .catch(err => {
        removeMessage(loadingId);
        addMessage('Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.', 'assistant');
        console.error('Widget error:', err);
      })
      .finally(() => {
        send.disabled = false;
      });
    }

    send.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });

    // Message helpers
    let messageIdCounter = 0;
    function addMessage(text, type) {
      const id = `msg-${messageIdCounter++}`;
      const msg = document.createElement('div');
      msg.className = `shopify-rag-message ${type}`;
      msg.id = id;
      msg.textContent = text;
      messages.appendChild(msg);
      messages.scrollTop = messages.scrollHeight;
      return id;
    }

    function removeMessage(id) {
      const msg = document.getElementById(id);
      if (msg) msg.remove();
    }
  }

  // Load when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
