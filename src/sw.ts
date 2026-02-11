import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { clientsClaim } from 'workbox-core'
import { initializeApp } from 'firebase/app'
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw'

declare let self: ServiceWorkerGlobalScope


cleanupOutdatedCaches()
self.skipWaiting()
clientsClaim()
precacheAndRoute(self.__WB_MANIFEST)



// Configuración de Firebase (reutilizando vars de entorno)
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}


// Inicializar Firebase en el SW
const app = initializeApp(firebaseConfig)
const messaging = getMessaging(app)


// Manejar mensajes en segundo plano
onBackgroundMessage(messaging, (payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload)

    const notificationTitle = payload.notification?.title || 'Nueva Notificación'
    // Construir ruta absoluta para el icono
    const iconUrl = self.location.origin + '/pwa-192x192.png'

    const notificationOptions = {
        body: payload.notification?.body,
        icon: iconUrl,
        data: payload.data,
        tag: 'reserva-notification', // Agrupar notificaciones
        renotify: true
    }

    self.registration.showNotification(notificationTitle, notificationOptions)
})


self.addEventListener('notificationclick', (event) => {
    event.notification.close()

    const urlToOpen = event.notification.data?.url || '/'

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // Si ya hay una ventana abierta, enfocarla
            for (const client of windowClients) {
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus()
                }
            }

            if (self.clients.openWindow) {
                return self.clients.openWindow(urlToOpen)
            }
        })
    )
})
