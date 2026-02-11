importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: 'AIzaSyDobXWahJlUcgsBCkskQNOTkr70r7f4Fk8',
  authDomain: 'transfer-eliud-push.firebaseapp.com',
  projectId: 'transfer-eliud-push',
  storageBucket: 'transfer-eliud-push.firebasestorage.app',
  messagingSenderId: '744633111438',
  appId: '1:744633111438:web:95d08c207b2acaf0698adf',
  measurementId: 'G-H4E0Y23XQF',
})


const messaging = firebase.messaging()

// Manejar notificaciones cuando la app está en segundo plano o cerrada
messaging.onBackgroundMessage(function (payload) {
  console.log(' [Service Worker] Notificación recibida en segundo plano:', payload)

  const notificationTitle = payload.notification?.title || 'Transporte Eliud'
  const notificationOptions = {
    body: payload.notification?.body || 'Nueva notificación',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'transporte-eliud-notification',
    requireInteraction: true, 
    data: {
      url: '/notificaciones',
      ...payload.data, 
    },
    actions: [
      {
        action: 'view',
        title: 'Ver Reserva',
      },
      {
        action: 'close',
        title: 'Cerrar',
      }
    ]
  }

  return self.registration.showNotification(notificationTitle, notificationOptions)
})

// Manejar clic en la notificación
self.addEventListener('notificationclick', function (event) {
  console.log(' [Service Worker] Usuario hizo clic en la notificación')

  event.notification.close() // Cerrar la notificación

  if (event.action === 'close') {
    // Usuario cerró la notificación
    return
  }

  // Abrir o enfocar el panel admin
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function (clientList) {
        // Si ya hay una ventana abierta, enfocarla
        for (let i = 0; i < clientList.length; i++) {
          let client = clientList[i]
          if (client.url.includes('/calendario') && 'focus' in client) {
            return client.focus()
          }
        }
        // Si no hay ventana abierta, abrir una nueva
        if (clients.openWindow) {
          return clients.openWindow('/notificaciones')
        }
      })
  )
})
