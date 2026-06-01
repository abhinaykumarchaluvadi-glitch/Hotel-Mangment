export type UserRole = 'admin' | 'customer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  address?: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Room {
  id: string;
  number: string;
  type: 'single' | 'double' | 'suite' | 'deluxe';
  price: number;
  capacity: number;
  amenities: string[];
  available: boolean;
  images?: string[];
}

export interface Booking {
  id: string;
  userId: string;
  roomId: string;
  room?: Room;
  checkInDate: string;
  checkOutDate: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  totalPrice: number;
  guestCount: number;
  createdAt: string;
}

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
  image?: string;
}

export interface FoodOrder {
  id: string;
  userId: string;
  bookingId?: string;
  items: Array<{ itemId: string; quantity: number; price: number }>;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  totalPrice: number;
  deliveryTime?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  userId: string;
  bookingId?: string;
  orderId?: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  method: 'card' | 'bank' | 'wallet';
  transactionId?: string;
  createdAt: string;
}
