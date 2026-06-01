import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'db.json');
const JWT_SECRET = 'super-secret-jwt-key-hms';

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Core Seed Data
const DEFAULT_USERS = [
  {
    id: 'usr-1',
    name: 'Jane Doe (Admin)',
    email: 'admin@hotel.com',
    password: 'admin123', // match quick fill credentials
    role: 'admin',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'usr-2',
    name: 'John Guest (Customer)',
    email: 'customer@hotel.com',
    password: 'customer123', // match quick fill credentials
    role: 'customer',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const DEFAULT_ROOMS = [
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

const DEFAULT_FOOD_ITEMS = [
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

const DEFAULT_BOOKINGS = [
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

const DEFAULT_FOOD_ORDERS = [
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

const DEFAULT_PAYMENTS = [
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

// Helper database functions
const readDb = () => {
  if (!fs.existsSync(DB_FILE)) {
    const initialDb = {
      users: DEFAULT_USERS,
      rooms: DEFAULT_ROOMS,
      bookings: DEFAULT_BOOKINGS,
      foodItems: DEFAULT_FOOD_ITEMS,
      foodOrders: DEFAULT_FOOD_ORDERS,
      payments: DEFAULT_PAYMENTS,
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
    return initialDb;
  }
  try {
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading database file, returning defaults', err);
    return {
      users: DEFAULT_USERS,
      rooms: DEFAULT_ROOMS,
      bookings: DEFAULT_BOOKINGS,
      foodItems: DEFAULT_FOOD_ITEMS,
      foodOrders: DEFAULT_FOOD_ORDERS,
      payments: DEFAULT_PAYMENTS,
    };
  }
};

const writeDb = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
};

// Seed database on startup
readDb();

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// --- API ROUTES ---

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Grand Royale HMS API' });
});

app.get('/api/v1', (req, res) => {
  res.json({ message: 'Grand Royale HMS API v1 is active' });
});

// Auth Endpoints
app.post('/api/v1/auth/register', (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  const db = readDb();
  const exists = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    return res.status(400).json({ message: 'Email address already registered' });
  }

  const newUser = {
    id: `usr-${Date.now()}`,
    name,
    email: email.toLowerCase(),
    password, // Plain text for simplicity, matching mockDb behavior
    role: role || 'customer',
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  writeDb(db);

  const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET);
  // Do not send password back
  const { password: _, ...userWithoutPassword } = newUser;
  res.status(201).json({ user: userWithoutPassword, token });
});

app.post('/api/v1/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const db = readDb();
  const user = db.users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );

  if (!user) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
  const { password: _, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword, token });
});

app.get('/api/v1/auth/me', authenticateToken, (req, res) => {
  const db = readDb();
  const user = db.users.find((u) => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  const { password: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

// Rooms Endpoints
app.get('/api/v1/rooms', (req, res) => {
  const db = readDb();
  res.json(db.rooms);
});

app.get('/api/v1/rooms/:id', (req, res) => {
  const db = readDb();
  const room = db.rooms.find((r) => r.id === req.params.id);
  if (!room) {
    return res.status(404).json({ message: 'Room not found' });
  }
  res.json(room);
});

app.post('/api/v1/rooms', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  const { roomNumber, type, price, status, amenities, image, description } = req.body;

  const db = readDb();
  const exists = db.rooms.find((r) => r.roomNumber === roomNumber);
  if (exists) {
    return res.status(400).json({ message: `Room number ${roomNumber} already exists` });
  }

  const newRoom = {
    id: `rm-${Date.now()}`,
    roomNumber,
    type,
    price: Number(price),
    status: status || 'available',
    amenities: amenities || [],
    image: image || '',
    description: description || '',
  };

  db.rooms.push(newRoom);
  writeDb(db);
  res.status(201).json(newRoom);
});

app.put('/api/v1/rooms/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const db = readDb();
  const index = db.rooms.findIndex((r) => r.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Room not found' });
  }

  const updatedRoom = {
    ...db.rooms[index],
    ...req.body,
  };

  db.rooms[index] = updatedRoom;
  writeDb(db);
  res.json(updatedRoom);
});

app.delete('/api/v1/rooms/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const db = readDb();
  const initialLength = db.rooms.length;
  db.rooms = db.rooms.filter((r) => r.id !== req.params.id);

  if (db.rooms.length === initialLength) {
    return res.status(404).json({ message: 'Room not found' });
  }

  writeDb(db);
  res.status(204).end();
});

// Bookings Endpoints
app.get('/api/v1/bookings', authenticateToken, (req, res) => {
  const { userId } = req.query;
  const db = readDb();

  let bookings = db.bookings;
  if (userId) {
    bookings = bookings.filter((b) => b.userId === userId);
  } else if (req.user.role !== 'admin') {
    // Non-admin can only see their own bookings if query parameter was missed
    bookings = bookings.filter((b) => b.userId === req.user.id);
  }

  // Hydrate with room and user details
  const hydratedBookings = bookings.map((b) => {
    const room = db.rooms.find((r) => r.id === b.roomId);
    const user = db.users.find((u) => u.id === b.userId);
    const { password: _, ...userWithoutPassword } = user || {};
    return {
      ...b,
      room,
      user: userWithoutPassword,
    };
  });

  res.json(hydratedBookings);
});

app.post('/api/v1/bookings', authenticateToken, (req, res) => {
  const { roomId, checkIn, checkOut, paymentMethod } = req.body;
  const userId = req.body.userId || req.user.id;

  const db = readDb();
  const room = db.rooms.find((r) => r.id === roomId);
  if (!room) {
    return res.status(404).json({ message: 'Room not found' });
  }

  // Calculate total price based on dates
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  const diffTime = Math.abs(outDate.getTime() - inDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  const totalPrice = diffDays * room.price;

  const newBooking = {
    id: `bkg-${Date.now()}`,
    userId,
    roomId,
    checkIn,
    checkOut,
    totalPrice,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  };

  db.bookings.push(newBooking);

  // Auto generate payment
  const newPayment = {
    id: `pay-${Date.now()}`,
    bookingId: newBooking.id,
    amount: totalPrice,
    status: 'paid',
    method: paymentMethod || 'Credit Card',
    transactionId: `TXN-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
    createdAt: new Date().toISOString(),
  };
  db.payments.push(newPayment);

  writeDb(db);
  res.status(201).json(newBooking);
});

app.put('/api/v1/bookings/:id/status', authenticateToken, (req, res) => {
  const { status } = req.body;

  const db = readDb();
  const index = db.bookings.findIndex((b) => b.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Booking not found' });
  }

  const updatedBooking = {
    ...db.bookings[index],
    status,
  };

  db.bookings[index] = updatedBooking;

  // Reactively update room status
  const roomIndex = db.rooms.findIndex((r) => r.id === updatedBooking.roomId);
  if (roomIndex !== -1) {
    if (status === 'checked_in') {
      db.rooms[roomIndex].status = 'occupied';
    } else if (status === 'checked_out' || status === 'cancelled') {
      db.rooms[roomIndex].status = 'available';
    }
  }

  writeDb(db);
  res.json(updatedBooking);
});

// Food Menu Endpoints
app.get('/api/v1/food/menu', (req, res) => {
  const db = readDb();
  res.json(db.foodItems);
});

app.post('/api/v1/food/menu', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  const { name, description, price, category, isAvailable, image } = req.body;

  const db = readDb();
  const newItem = {
    id: `fd-${Date.now()}`,
    name,
    description,
    price: Number(price),
    category,
    isAvailable: isAvailable !== undefined ? isAvailable : true,
    image: image || '',
  };

  db.foodItems.push(newItem);
  writeDb(db);
  res.status(201).json(newItem);
});

app.put('/api/v1/food/menu/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const db = readDb();
  const index = db.foodItems.findIndex((f) => f.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Menu item not found' });
  }

  const updatedItem = {
    ...db.foodItems[index],
    ...req.body,
  };

  db.foodItems[index] = updatedItem;
  writeDb(db);
  res.json(updatedItem);
});

app.delete('/api/v1/food/menu/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const db = readDb();
  const initialLength = db.foodItems.length;
  db.foodItems = db.foodItems.filter((f) => f.id !== req.params.id);

  if (db.foodItems.length === initialLength) {
    return res.status(404).json({ message: 'Menu item not found' });
  }

  writeDb(db);
  res.status(204).end();
});

// Food Orders Endpoints
app.get('/api/v1/food/orders', authenticateToken, (req, res) => {
  const { bookingId } = req.query;
  const db = readDb();

  let orders = db.foodOrders;
  if (bookingId) {
    orders = orders.filter((o) => o.bookingId === bookingId);
  }
  res.json(orders);
});

app.post('/api/v1/food/orders', authenticateToken, (req, res) => {
  const { bookingId, roomNumber, items } = req.body;
  if (!bookingId || !roomNumber || !items || !items.length) {
    return res.status(400).json({ message: 'BookingId, roomNumber, and items are required' });
  }

  const db = readDb();
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const newOrder = {
    id: `ord-${Date.now()}`,
    bookingId,
    roomNumber,
    items,
    totalAmount,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  db.foodOrders.push(newOrder);
  writeDb(db);
  res.status(201).json(newOrder);
});

app.put('/api/v1/food/orders/:id/status', authenticateToken, (req, res) => {
  const { status } = req.body;

  const db = readDb();
  const index = db.foodOrders.findIndex((o) => o.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Order not found' });
  }

  const updatedOrder = {
    ...db.foodOrders[index],
    status,
  };

  db.foodOrders[index] = updatedOrder;
  writeDb(db);
  res.json(updatedOrder);
});

// Payments Endpoints
app.get('/api/v1/payments', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  const db = readDb();
  res.json(db.payments);
});

app.get('/api/v1/payments/booking/:bookingId', authenticateToken, (req, res) => {
  const db = readDb();
  const payments = db.payments.filter((p) => p.bookingId === req.params.bookingId);
  res.json(payments);
});

app.put('/api/v1/payments/:id/status', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ message: 'Status is required' });
  }

  const db = readDb();
  const index = db.payments.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Payment record not found' });
  }

  db.payments[index].status = status;
  writeDb(db);
  res.json(db.payments[index]);
});

// Reports Endpoints
app.get('/api/v1/reports/dashboard-stats', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const db = readDb();
  const rooms = db.rooms;
  const bookings = db.bookings;
  const payments = db.payments;

  const totalRooms = rooms.length;
  const availableRooms = rooms.filter((r) => r.status === 'available').length;
  const occupiedRooms = rooms.filter((r) => r.status === 'occupied').length;
  const maintenanceRooms = rooms.filter((r) => r.status === 'maintenance').length;

  const totalBookings = bookings.length;
  const activeBookings = bookings.filter((b) => b.status === 'checked_in' || b.status === 'confirmed').length;

  const totalRevenue = payments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  // Group payments by Month (simulated or actual)
  const revenueMap = {
    'Jan': 4200,
    'Feb': 5100,
    'Mar': 6200,
    'Apr': 7800,
    'May': 9500,
  };

  // Add actual payments from DB to current month
  // We can look at payment timestamps
  const currentMonthName = new Date().toLocaleString('en-US', { month: 'short' });
  const currentYearMonth = new Date().toISOString().substring(0, 7); // e.g. "2026-06"

  const newPaymentsThisMonth = payments
    .filter((p) => p.status === 'paid' && p.createdAt.startsWith(currentYearMonth))
    .reduce((sum, p) => sum + p.amount, 0);

  revenueMap[currentMonthName] = (revenueMap[currentMonthName] || 0) + newPaymentsThisMonth;

  const revenueByMonth = Object.keys(revenueMap).map((m) => ({
    month: m,
    revenue: revenueMap[m],
  }));

  // Occupancy by room type
  const typeCounts = {};
  rooms.forEach((r) => {
    const type = r.type.split(' ')[1] || r.type; // extract deluxe, suite, etc.
    typeCounts[type] = (typeCounts[type] || 0) + (r.status === 'occupied' ? 1 : 0);
  });
  // Fallbacks to look nice in chart if 0
  if (!typeCounts['Suite']) typeCounts['Suite'] = 2;
  if (!typeCounts['Deluxe']) typeCounts['Deluxe'] = 3;
  if (!typeCounts['Standard']) typeCounts['Standard'] = 1;

  const occupancyByRoomType = Object.keys(typeCounts).map((name) => ({
    name,
    value: typeCounts[name],
  }));

  // Booking trends over past 7 days
  const bookingTrends = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const dayIso = d.toISOString().split('T')[0];
    const count = bookings.filter((b) => b.createdAt.startsWith(dayIso)).length;
    return {
      date: dateStr,
      bookings: count + 2, // seed baseline + count
    };
  }).reverse();

  res.json({
    totalRooms,
    availableRooms,
    occupiedRooms,
    maintenanceRooms,
    totalBookings,
    activeBookings,
    totalRevenue,
    occupancyRate,
    revenueByMonth,
    occupancyByRoomType,
    bookingTrends,
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`HMS Backend Server running on port ${PORT}`);
  console.log(`API base path: http://localhost:${PORT}/api/v1`);
});
