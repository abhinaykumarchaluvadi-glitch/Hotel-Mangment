export type UserRole = 'admin' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export type RoomStatus = 'available' | 'occupied' | 'maintenance';

export interface Room {
  id: string;
  roomNumber: string;
  type: string; // e.g. Single, Double, Deluxe, Suite
  price: number;
  status: RoomStatus;
  amenities: string[]; // e.g. WiFi, TV, AC, Mini Bar, Ocean View
  image: string;
  description: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';

export interface Booking {
  id: string;
  userId: string;
  user?: User; // Joined data
  roomId: string;
  room?: Room; // Joined data
  checkIn: string; // ISO date string
  checkOut: string; // ISO date string
  totalPrice: number;
  status: BookingStatus;
  createdAt: string;
}

export type FoodCategory = 'breakfast' | 'lunch' | 'dinner' | 'beverages' | 'snacks';

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: FoodCategory;
  isAvailable: boolean;
  image: string;
}

export type FoodOrderStatus = 'pending' | 'preparing' | 'delivered' | 'cancelled';

export interface FoodOrderItem {
  foodItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface FoodOrder {
  id: string;
  bookingId: string;
  roomNumber: string;
  items: FoodOrderItem[];
  totalAmount: number;
  status: FoodOrderStatus;
  createdAt: string;
}

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  status: PaymentStatus;
  method: string; // e.g. Credit Card, PayPal, Cash
  transactionId: string;
  createdAt: string;
}

export interface DashboardStats {
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  maintenanceRooms: number;
  totalBookings: number;
  activeBookings: number;
  totalRevenue: number;
  occupancyRate: number;
  revenueByMonth: { month: string; revenue: number }[];
  occupancyByRoomType: { name: string; value: number }[];
  bookingTrends: { date: string; bookings: number }[];
}
