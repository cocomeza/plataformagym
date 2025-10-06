// Almacenamiento local para notificaciones
export interface Notification {
  id: string;
  titulo: string;
  mensaje: string;
  tipo: 'info' | 'warning' | 'success' | 'error';
  fecha: string;
  leida: boolean;
  userId?: string; // Si es específica para un usuario
  created_at: string;
}

class NotificationsStorage {
  private notifications: Notification[] = [];

  // Agregar nueva notificación
  add(notification: Omit<Notification, 'id' | 'created_at'>): Notification {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      fecha: notification.fecha || new Date().toISOString()
    };
    
    this.notifications.unshift(newNotification);
    console.log('📢 Notificación agregada:', newNotification);
    return newNotification;
  }

  // Obtener todas las notificaciones
  getAll(): Notification[] {
    return [...this.notifications];
  }

  // Obtener notificaciones de un usuario específico
  getUserNotifications(userId?: string): Notification[] {
    if (!userId) {
      // Si no hay userId, devolver notificaciones generales
      return this.notifications.filter(n => !n.userId);
    }
    
    // Devolver notificaciones generales + específicas del usuario
    return this.notifications.filter(n => !n.userId || n.userId === userId);
  }

  // Marcar notificación como leída
  markAsRead(notificationId: string): boolean {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.leida = true;
      console.log('✅ Notificación marcada como leída:', notificationId);
      return true;
    }
    return false;
  }

  // Obtener notificaciones no leídas
  getUnreadCount(userId?: string): number {
    const userNotifications = this.getUserNotifications(userId);
    return userNotifications.filter(n => !n.leida).length;
  }

  // Eliminar notificación
  delete(notificationId: string): boolean {
    const index = this.notifications.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      this.notifications.splice(index, 1);
      console.log('🗑️ Notificación eliminada:', notificationId);
      return true;
    }
    return false;
  }
}

export const notificationsStorage = new NotificationsStorage();

// Agregar algunas notificaciones de ejemplo
notificationsStorage.add({
  titulo: '¡Bienvenido al gimnasio!',
  mensaje: 'Tu cuenta ha sido activada. Puedes comenzar a usar la plataforma.',
  tipo: 'success',
  fecha: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Hace 1 día
  leida: false
});

notificationsStorage.add({
  titulo: 'Recordatorio de pago',
  mensaje: 'Tu mensualidad vence pronto. Recuerda realizar el pago.',
  tipo: 'warning',
  fecha: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // Hace 12 horas
  leida: false
});
