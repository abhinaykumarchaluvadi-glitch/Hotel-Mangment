import type { Room, Booking, FoodItem, FoodOrder, Payment, User } from '../types';

// Helper to seed localStorage
const getOrSet = <T>(key: string, defaultValue: T): T => {
  const existing = localStorage.getItem(key);
  if (existing) {
    try {
      return JSON.parse(existing) as T;
    } catch {
      // Fallback if parsing fails
    }
  }
  localStorage.setItem(key, JSON.stringify(defaultValue));
  return defaultValue;
};

// Default Users (Passwords are simulated as plain text or simply mock-checked)
const DEFAULT_USERS: User[] = [
  {
    id: 'usr-1',
    name: 'Jane Doe (Admin)',
    email: 'admin@hotel.com',
    role: 'admin',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'usr-2',
    name: 'John Guest (Customer)',
    email: 'customer@hotel.com',
    role: 'customer',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Room images from unsplash (premium styling)
const DEFAULT_ROOMS: Room[] = [
  {
    id: 'rm-101',
    roomNumber: '101',
    type: 'Single Standard',
    price: 2500,
    status: 'available',
    amenities: ['WiFi', 'TV', 'AC', 'Desk'],
    image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=800',
    description: 'Cozy single room perfect for solo business travelers. Equipped with high-speed internet, workspace, and a comfortable twin bed.',
  },
  {
    id: 'rm-102',
    roomNumber: '102',
    type: 'Single Standard',
    price: 2500,
    status: 'occupied',
    amenities: ['WiFi', 'TV', 'AC', 'Desk'],
    image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=800',
    description: 'Stylish single bedroom with modern decor, en-suite bathroom, flat-screen TV, and automated climate control.',
  },
  {
    id: 'rm-201',
    roomNumber: '201',
    type: 'Double Deluxe',
    price: 4500,
    status: 'available',
    amenities: ['WiFi', 'TV', 'AC', 'Mini Bar', 'Ocean View'],
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=800',
    description: 'Spacious room featuring a comfortable queen-size bed, private balcony with partial ocean view, mini-bar, and modern bathroom.',
  },
  {
    id: 'rm-202',
    roomNumber: '202',
    type: 'Double Deluxe',
    price: 4500,
    status: 'available',
    amenities: ['WiFi', 'TV', 'AC', 'Mini Bar', 'Coffee Machine'],
    image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=800',
    description: 'Deluxe double room with luxurious bedding, workstation, Nespresso coffee maker, walk-in shower, and complementary smart assistant.',
  },
  {
    id: 'rm-301',
    roomNumber: '301',
    type: 'Executive Suite',
    price: 9500,
    status: 'available',
    amenities: ['WiFi', 'TV', 'AC', 'Mini Bar', 'Ocean View', 'Living Room', 'Bathtub'],
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800',
    description: 'Luxurious suite featuring a separate living room, plush king bed, deep soaking bathtub, panoramic floor-to-ceiling windows overlooking the coast.',
  },
  {
    id: 'rm-302',
    roomNumber: '302',
    type: 'Presidential Suite',
    price: 18000,
    status: 'maintenance',
    amenities: ['WiFi', 'TV', 'AC', 'Mini Bar', 'Ocean View', 'Kitchen', 'Jacuzzi', 'Butler Service'],
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&q=80&w=800',
    description: 'Our ultimate luxury experience. Includes private jacuzzi, fully equipped kitchen, personalized butler service, and private dining options.',
  },
];

const DEFAULT_FOOD_ITEMS: FoodItem[] = [
  {
    id: 'fd-1',
    name: 'Masala Dosa',
    description: 'Thin crispy rice crepe filled with spiced potato mash, served with coconut chutney and piping hot sambar.',
    price: 120,
    category: 'breakfast',
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'fd-2',
    name: 'Idli Vada Combo',
    description: 'Steamed rice cakes (idli) and crispy savory donuts (vada), served with lentil soup (sambar) and mint chutney.',
    price: 90,
    category: 'breakfast',
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'fd-3',
    name: 'Paneer Butter Masala',
    description: 'Succulent cottage cheese cubes simmered in a rich, creamy, tomato-based butter sauce, paired with spices.',
    price: 240,
    category: 'lunch',
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'fd-4',
    name: 'Butter Chicken (Murgh Makhani)',
    description: 'Tender tandoori grilled chicken pieces cooked in a creamy tomato sauce with butter and rich Indian spices.',
    price: 320,
    category: 'dinner',
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'fd-5',
    name: 'Hyderabadi Chicken Biryani',
    description: 'Aromatic long-grain basmati rice cooked layered with marinated chicken, saffron, mint, and exotic spices.',
    price: 380,
    category: 'dinner',
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'fd-6',
    name: 'Mango Lassi',
    description: 'A cooling, sweet yogurt-based traditional Indian drink blended with fresh sweet mango pulp and cardamom.',
    price: 80,
    category: 'beverages',
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'fd-7',
    name: 'Paneer Tikka',
    description: 'Soft cottage cheese cubes marinated in yogurt and spices, grilled with bell peppers and onions, served with fresh mint chutney.',
    price: 160,
    category: 'snacks',
    isAvailable: true,
    image: '/paneer_tikka.png',
  },
  {
    id: 'fd-8',
    name: 'Masala Chai',
    description: 'Classic Indian spiced tea brewed with fresh milk, ginger, crushed cardamom, cloves, and cinnamon.',
    price: 40,
    category: 'beverages',
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=400',
  }
];

const DEFAULT_BOOKINGS: Booking[] = [
  {
    id: 'bkg-1',
    userId: 'usr-2',
    roomId: 'rm-102',
    checkIn: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    checkOut: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    totalPrice: 12500,
    status: 'checked_in',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'bkg-2',
    userId: 'usr-2',
    roomId: 'rm-201',
    checkIn: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    checkOut: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    totalPrice: 9000,
    status: 'checked_out',
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'bkg-3',
    userId: 'usr-2',
    roomId: 'rm-301',
    checkIn: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    checkOut: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    totalPrice: 28500,
    status: 'confirmed',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const DEFAULT_FOOD_ORDERS: FoodOrder[] = [
  {
    id: 'ord-1',
    bookingId: 'bkg-1',
    roomNumber: '102',
    items: [
      { foodItemId: 'fd-1', name: 'Masala Dosa', price: 120, quantity: 1 },
      { foodItemId: 'fd-6', name: 'Mango Lassi', price: 80, quantity: 2 },
    ],
    totalAmount: 280,
    status: 'delivered',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const DEFAULT_PAYMENTS: Payment[] = [
  {
    id: 'pay-1',
    bookingId: 'bkg-1',
    amount: 12500,
    status: 'paid',
    method: 'Credit Card',
    transactionId: 'TXN-9842013894',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'pay-2',
    bookingId: 'bkg-2',
    amount: 9000,
    status: 'paid',
    method: 'PayPal',
    transactionId: 'TXN-8472910382',
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'pay-3',
    bookingId: 'bkg-3',
    amount: 28500,
    status: 'paid',
    method: 'Credit Card',
    transactionId: 'TXN-1294810294',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const mockDb = {
  getUsers: () => getOrSet<User[]>('hms_users', DEFAULT_USERS),
  setUsers: (users: User[]) => localStorage.setItem('hms_users', JSON.stringify(users)),

  getRooms: () => getOrSet<Room[]>('hms_rooms', DEFAULT_ROOMS),
  setRooms: (rooms: Room[]) => localStorage.setItem('hms_rooms', JSON.stringify(rooms)),

  getBookings: () => getOrSet<Booking[]>('hms_bookings', DEFAULT_BOOKINGS),
  setBookings: (bookings: Booking[]) => localStorage.setItem('hms_bookings', JSON.stringify(bookings)),

  getFoodItems: () => getOrSet<FoodItem[]>('hms_food_items', DEFAULT_FOOD_ITEMS),
  setFoodItems: (items: FoodItem[]) => localStorage.setItem('hms_food_items', JSON.stringify(items)),

  getFoodOrders: () => getOrSet<FoodOrder[]>('hms_food_orders', DEFAULT_FOOD_ORDERS),
  setFoodOrders: (orders: FoodOrder[]) => localStorage.setItem('hms_food_orders', JSON.stringify(orders)),

  getPayments: () => getOrSet<Payment[]>('hms_payments', DEFAULT_PAYMENTS),
  setPayments: (payments: Payment[]) => localStorage.setItem('hms_payments', JSON.stringify(payments)),

  // Reset database helper
  reset: () => {
    localStorage.removeItem('hms_users');
    localStorage.removeItem('hms_rooms');
    localStorage.removeItem('hms_bookings');
    localStorage.removeItem('hms_food_items');
    localStorage.removeItem('hms_food_orders');
    localStorage.removeItem('hms_payments');
  },
};
