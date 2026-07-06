// Vérifie le support du navigateur
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('service-worker.js')
            .then((reg) => {
                console.log('SW enregistré', reg);
            });
    });
}
