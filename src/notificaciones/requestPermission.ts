import { getToken } from 'firebase/messaging'
import { messaging, vapidKey } from '../lib/firebase'
import axios from '../api/axios'

export async function requestNotificationPermission() {
  try {
    const permission = await Notification.requestPermission()

    if (permission !== 'granted') {
      console.log('Permiso de notificaciones denegado')
      return
    }

    // Firebase Messaging registra automáticamente el service worker
    // No pasar serviceWorkerRegistration para evitar conflictos
    const token = await getToken(messaging, {
      vapidKey: vapidKey,
    })

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
