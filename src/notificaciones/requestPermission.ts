import { getToken } from 'firebase/messaging'
import { messaging, vapidKey } from '../lib/firebase'
import axios from '../api/axios'

export async function requestNotificationPermission() {
  try {
    // Verificar soporte de notificaciones
    if (!('Notification' in window)) {
      console.error('Este navegador no soporta notificaciones')
      return
    }

    // Verificar soporte de service workers
    if (!('serviceWorker' in navigator)) {
      console.error('Este navegador no soporta service workers')
      return
    }

    const permission = await Notification.requestPermission()

    if (permission !== 'granted') {
      console.log('Permiso de notificaciones denegado')
      return
    }

    console.log('✅ Permiso de notificaciones concedido')

    // Registrar el service worker específicamente para Firebase
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/'
    })

    console.log('✅ Service Worker registrado:', registration.scope)

    // Esperar a que esté activo
    await navigator.serviceWorker.ready

    // Generar token con el service worker específico
    const token = await getToken(messaging, {
      vapidKey: vapidKey,
      serviceWorkerRegistration: registration,
    })

    console.log('✅ Token FCM generado')

    if (!token) {
      return
    }

    // Obtener información del usuario desde localStorage
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      return
    }

    const user = JSON.parse(userStr)

    // Enviar token al backend con información del usuario
    await axios.post('/notificaciones/login', {
      token,
      userId: user.id,
      rol: user.rol,
    })
  } catch (error: any) {
    console.error('Error al registrar notificaciones:', error)
  }
}
