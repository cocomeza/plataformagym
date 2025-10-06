// Sistema temporal de almacenamiento para datos del admin
// En producción esto se reemplazaría por una base de datos real

interface User {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  rol: 'admin' | 'deportista';
  activo: boolean;
  created_at: string;
}

interface Payment {
  id: string;
  userId: string;
  monto: number;
  metodo: string;
  concepto: string;
  estado: string;
  fecha: string;
  created_at: string;
  registrado_por: string;
}

// Almacenamiento temporal en memoria
let users: User[] = [
  {
    id: '1',
    nombre: 'Admin Principal',
    email: 'admin@test.com',
    telefono: '+54 11 1234-5678',
    rol: 'admin',
    activo: true,
    created_at: new Date().toISOString()
  }
];

let payments: Payment[] = [];

export const adminStorage = {
  // Gestión de usuarios
  users: {
    // Obtener todos los usuarios
    getAll(): User[] {
      return users.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    },

    // Obtener usuarios deportistas
    getDeportistas(): User[] {
      return users.filter(user => user.rol === 'deportista');
    },

    // Agregar nuevo usuario
    add(user: User): void {
      users.push(user);
      console.log('👤 Usuario agregado:', user);
    },

    // Actualizar estado de usuario
    updateStatus(userId: string, isActive: boolean): boolean {
      const userIndex = users.findIndex(user => user.id === userId);
      if (userIndex !== -1) {
        users[userIndex].activo = isActive;
        console.log(`👤 Usuario ${isActive ? 'activado' : 'desactivado'}:`, users[userIndex]);
        return true;
      }
      return false;
    },

    // Obtener usuario por ID
    getById(userId: string): User | undefined {
      return users.find(user => user.id === userId);
    }
  },

  // Gestión de pagos
  payments: {
    // Obtener todos los pagos
    getAll(): Payment[] {
      return payments.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    },

    // Obtener pagos por usuario
    getByUser(userId: string): Payment[] {
      return payments
        .filter(payment => payment.userId === userId)
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    },

    // Agregar nuevo pago
    add(payment: Payment): void {
      payments.push(payment);
      console.log('💰 Pago registrado:', payment);
    },

    // Obtener estadísticas de pagos
    getStats() {
      const totalPayments = payments.length;
      const totalAmount = payments.reduce((sum, payment) => sum + payment.monto, 0);
      const thisMonth = new Date().getMonth();
      const thisYear = new Date().getFullYear();
      
      const monthlyPayments = payments.filter(payment => {
        const paymentDate = new Date(payment.fecha);
        return paymentDate.getMonth() === thisMonth && paymentDate.getFullYear() === thisYear;
      });

      const monthlyAmount = monthlyPayments.reduce((sum, payment) => sum + payment.monto, 0);

      return {
        totalPayments,
        totalAmount,
        monthlyPayments: monthlyPayments.length,
        monthlyAmount,
        averagePayment: totalPayments > 0 ? totalAmount / totalPayments : 0
      };
    }
  },

  // Limpiar storage (útil para testing)
  clear(): void {
    users = [
      {
        id: '1',
        nombre: 'Admin Principal',
        email: 'admin@test.com',
        telefono: '+54 11 1234-5678',
        rol: 'admin',
        activo: true,
        created_at: new Date().toISOString()
      }
    ];
    payments = [];
    console.log('🧹 Admin storage limpiado');
  }
};

export type { User, Payment };
