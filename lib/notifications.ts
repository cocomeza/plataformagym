// Tipos de notificaciones
export const NOTIFICATION_TYPES = {
  PAYMENT_REMINDER: 'payment_reminder',
  ATTENDANCE_REMINDER: 'attendance_reminder',
  GYM_ANNOUNCEMENT: 'gym_announcement',
  PROMOTION: 'promotion',
  WELCOME: 'welcome',
  PAYMENT_CONFIRMATION: 'payment_confirmation'
} as const;

export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
}

export interface CreateNotificationRequest {
  type: NotificationType;
  title: string;
  message: string;
  userIds?: string[];
  priority?: 'low' | 'medium' | 'high';
}
