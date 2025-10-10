// Widget yükleme scripti
(function() {
    // Widget container oluştur
    const container = document.createElement('div');
    container.id = 'feattie-chat-widget';
    document.body.appendChild(container);

    // React ve ReactDOM'u yükle
    const loadScript = (src) => {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    };

    // Widget stillerini yükle
    const loadStyles = () => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'http://localhost:3000/widget.css'; // Production'da gerçek URL kullanılacak
        document.head.appendChild(link);
    };

    // Widget'ı yükle ve başlat
    const initWidget = async () => {
        try {
            // React ve ReactDOM'u yükle
            await Promise.all([
                loadScript('https://unpkg.com/react@18/umd/react.production.min.js'),
                loadScript('https://unpkg.com/react-dom@18/umd/react-dom.production.min.js')
            ]);

            // Widget bundle'ını yükle
            await loadScript('http://localhost:3000/widget.js'); // Production'da gerçek URL kullanılacak

            // Stilleri yükle
            loadStyles();

            // Widget'ı başlat
            window.FeattieWidget.init({
                containerId: 'feattie-chat-widget',
                apiKey: 'YOUR_API_KEY' // Kullanıcıya özel API anahtarı
            });
        } catch (error) {
            console.error('Feattie Widget yüklenirken hata oluştu:', error);
        }
    };

    // Widget'ı yükle
    initWidget();
})();