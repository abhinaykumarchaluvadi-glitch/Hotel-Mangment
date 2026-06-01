import os
import json
import time
import random
import datetime
from fastapi import FastAPI, Request, HTTPException, status, Depends
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import jwt

app = FastAPI(title="Grand Royale HMS API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

JWT_SECRET = 'super-secret-jwt-key-hms'
DB_FILENAME = 'db.json'
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
LOCAL_DB_FILE = os.path.join(CURRENT_DIR, DB_FILENAME)
TMP_DB_FILE = os.path.join('/tmp', DB_FILENAME)

# Helper to format HTTP exceptions to {"message": "..."} to match Express backend
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    message = exc.detail
    if isinstance(message, dict) and "message" in message:
        message = message["message"]
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": str(message)},
    )

def get_db_path():
    if os.environ.get('VERCEL') == '1':
        if not os.path.exists(TMP_DB_FILE):
            try:
                if os.path.exists(LOCAL_DB_FILE):
                    with open(LOCAL_DB_FILE, 'r', encoding='utf-8') as f:
                        data = f.read()
                    with open(TMP_DB_FILE, 'w', encoding='utf-8') as f:
                        f.write(data)
                else:
                    write_db(get_defaults(), path=TMP_DB_FILE)
            except Exception as e:
                print(f"Error copying DB to /tmp: {e}")
        return TMP_DB_FILE
    return LOCAL_DB_FILE

def get_defaults():
    now = datetime.datetime.utcnow()
    return {
        "users": [
            {
                "id": "usr-1",
                "name": "Jane Doe (Admin)",
                "email": "admin@hotel.com",
                "password": "admin123",
                "role": "admin",
                "createdAt": (now - datetime.timedelta(days=30)).isoformat() + "Z"
            },
            {
                "id": "usr-2",
                "name": "John Guest (Customer)",
                "email": "customer@hotel.com",
                "password": "customer123",
                "role": "customer",
                "createdAt": (now - datetime.timedelta(days=15)).isoformat() + "Z"
            }
        ],
        "rooms": [
            {
                "id": "rm-101",
                "roomNumber": "101",
                "type": "Single Standard",
                "price": 2500,
                "status": "available",
                "amenities": ["WiFi", "TV", "AC", "Desk"],
                "image": "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=800",
                "description": "Cozy single room perfect for solo business travelers. Equipped with high-speed internet, workspace, and a comfortable twin bed."
            },
            {
                "id": "rm-102",
                "roomNumber": "102",
                "type": "Single Standard",
                "price": 2500,
                "status": "occupied",
                "amenities": ["WiFi", "TV", "AC", "Desk"],
                "image": "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=800",
                "description": "Stylish single bedroom with modern decor, en-suite bathroom, flat-screen TV, and automated climate control."
            },
            {
                "id": "rm-201",
                "roomNumber": "201",
                "type": "Double Deluxe",
                "price": 4500,
                "status": "available",
                "amenities": ["WiFi", "TV", "AC", "Mini Bar", "Ocean View"],
                "image": "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=800",
                "description": "Spacious room featuring a comfortable queen-size bed, private balcony with partial ocean view, mini-bar, and modern bathroom."
            },
            {
                "id": "rm-202",
                "roomNumber": "202",
                "type": "Double Deluxe",
                "price": 4500,
                "status": "available",
                "amenities": ["WiFi", "TV", "AC", "Mini Bar", "Coffee Machine"],
                "image": "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=800",
                "description": "Deluxe double room with luxurious bedding, workstation, Nespresso coffee maker, walk-in shower, and complementary smart assistant."
            },
            {
                "id": "rm-301",
                "roomNumber": "301",
                "type": "Executive Suite",
                "price": 9500,
                "status": "available",
                "amenities": ["WiFi", "TV", "AC", "Mini Bar", "Ocean View", "Living Room", "Bathtub"],
                "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800",
                "description": "Luxurious suite featuring a separate living room, plush king bed, deep soaking bathtub, panoramic floor-to-ceiling windows overlooking the coast."
            },
            {
                "id": "rm-302",
                "roomNumber": "302",
                "type": "Presidential Suite",
                "price": 18000,
                "status": "maintenance",
                "amenities": ["WiFi", "TV", "AC", "Mini Bar", "Ocean View", "Kitchen", "Jacuzzi", "Butler Service"],
                "image": "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&q=80&w=800",
                "description": "Our ultimate luxury experience. Includes private jacuzzi, fully equipped kitchen, personalized butler service, and private dining options."
            }
        ],
        "bookings": [
            {
                "id": "bkg-1",
                "userId": "usr-2",
                "roomId": "rm-102",
                "checkIn": (now - datetime.timedelta(days=3)).strftime("%Y-%m-%d"),
                "checkOut": (now + datetime.timedelta(days=2)).strftime("%Y-%m-%d"),
                "totalPrice": 12500,
                "status": "checked_in",
                "createdAt": (now - datetime.timedelta(days=10)).isoformat() + "Z"
            },
            {
                "id": "bkg-2",
                "userId": "usr-2",
                "roomId": "rm-201",
                "checkIn": (now - datetime.timedelta(days=7)).strftime("%Y-%m-%d"),
                "checkOut": (now - datetime.timedelta(days=5)).strftime("%Y-%m-%d"),
                "totalPrice": 9000,
                "status": "checked_out",
                "createdAt": (now - datetime.timedelta(days=12)).isoformat() + "Z"
            },
            {
                "id": "bkg-3",
                "userId": "usr-2",
                "roomId": "rm-301",
                "checkIn": (now + datetime.timedelta(days=5)).strftime("%Y-%m-%d"),
                "checkOut": (now + datetime.timedelta(days=8)).strftime("%Y-%m-%d"),
                "totalPrice": 28500,
                "status": "confirmed",
                "createdAt": (now - datetime.timedelta(days=1)).isoformat() + "Z"
            }
        ],
        "foodItems": [
            {
                "id": "fd-1",
                "name": "Masala Dosa",
                "description": "Thin crispy rice crepe filled with spiced potato mash, served with coconut chutney and piping hot sambar.",
                "price": 120,
                "category": "breakfast",
                "isAvailable": True,
                "image": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&q=80&w=400"
            },
            {
                "id": "fd-2",
                "name": "Idli Vada Combo",
                "description": "Steamed rice cakes (idli) and crispy savory donuts (vada), served with lentil soup (sambar) and mint chutney.",
                "price": 90,
                "category": "breakfast",
                "isAvailable": True,
                "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=400"
            },
            {
                "id": "fd-3",
                "name": "Paneer Butter Masala",
                "description": "Succulent cottage cheese cubes simmered in a rich, creamy, tomato-based butter sauce, paired with spices.",
                "price": 240,
                "category": "lunch",
                "isAvailable": True,
                "image": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=400"
            },
            {
                "id": "fd-4",
                "name": "Butter Chicken (Murgh Makhani)",
                "description": "Tender tandoori grilled chicken pieces cooked in a creamy tomato sauce with butter and rich Indian spices.",
                "price": 320,
                "category": "dinner",
                "isAvailable": True,
                "image": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&q=80&w=400"
            },
            {
                "id": "fd-5",
                "name": "Hyderabadi Chicken Biryani",
                "description": "Aromatic long-grain basmati rice cooked layered with marinated chicken, saffron, mint, and exotic spices.",
                "price": 380,
                "category": "dinner",
                "isAvailable": True,
                "image": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=400"
            },
            {
                "id": "fd-6",
                "name": "Mango Lassi",
                "description": "A cooling, sweet yogurt-based traditional Indian drink blended with fresh sweet mango pulp and cardamom.",
                "price": 80,
                "category": "beverages",
                "isAvailable": True,
                "image": "https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&q=80&w=400"
            },
            {
                "id": "fd-7",
                "name": "Paneer Tikka",
                "description": "Soft cottage cheese cubes marinated in yogurt and spices, grilled with bell peppers and onions, served with fresh mint chutney.",
                "price": 160,
                "category": "snacks",
                "isAvailable": True,
                "image": "/paneer_tikka.png"
            },
            {
                "id": "fd-8",
                "name": "Masala Chai",
                "description": "Classic Indian spiced tea brewed with fresh milk, ginger, crushed cardamom, cloves, and cinnamon.",
                "price": 40,
                "category": "beverages",
                "isAvailable": True,
                "image": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=400"
            }
        ],
        "foodOrders": [
            {
                "id": "ord-1",
                "bookingId": "bkg-1",
                "roomNumber": "102",
                "items": [
                    {"foodItemId": "fd-1", "name": "Masala Dosa", "price": 120, "quantity": 1},
                    {"foodItemId": "fd-6", "name": "Mango Lassi", "price": 80, "quantity": 2}
                ],
                "totalAmount": 280,
                "status": "delivered",
                "createdAt": (now - datetime.timedelta(days=1)).isoformat() + "Z"
            }
        ],
        "payments": [
            {
                "id": "pay-1",
                "bookingId": "bkg-1",
                "amount": 12500,
                "status": "paid",
                "method": "Credit Card",
                "transactionId": "TXN-9842013894",
                "createdAt": (now - datetime.timedelta(days=10)).isoformat() + "Z"
            },
            {
                "id": "pay-2",
                "bookingId": "bkg-2",
                "amount": 9000,
                "status": "paid",
                "method": "PayPal",
                "transactionId": "TXN-8472910382",
                "createdAt": (now - datetime.timedelta(days=12)).isoformat() + "Z"
            },
            {
                "id": "pay-3",
                "bookingId": "bkg-3",
                "amount": 28500,
                "status": "paid",
                "method": "Credit Card",
                "transactionId": "TXN-1294810294",
                "createdAt": (now - datetime.timedelta(days=1)).isoformat() + "Z"
            }
        ]
    }

def read_db():
    db_path = get_db_path()
    if not os.path.exists(db_path):
        defaults = get_defaults()
        write_db(defaults)
        return defaults
    try:
        with open(db_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error reading database, returning defaults: {e}")
        return get_defaults()

def write_db(data, path=None):
    db_path = path or get_db_path()
    try:
        with open(db_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        print(f"Error writing to database: {e}")

# Helper dependency to authenticate JWT tokens
def authenticate_token(request: Request):
    auth_header = request.headers.get('Authorization')
    token = None
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
    
    if not token:
        raise HTTPException(status_code=401, detail="Authentication token required")
    
    try:
        user = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        return user
    except Exception:
        raise HTTPException(status_code=403, detail="Invalid or expired token")

# Root endpoints
@app.get('/')
def home():
    return {"message": "Welcome to Grand Royale HMS API"}

@app.get('/api/v1')
def api_root():
    return {"message": "Grand Royale HMS API v1 is active"}

# --- Auth Endpoints ---

@app.post('/api/v1/auth/register', status_code=201)
async def register(request: Request):
    data = await request.json() or {}
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')

    if not name or not email or not password:
        raise HTTPException(status_code=400, detail="Name, email, and password are required")

    db = read_db()
    exists = any(u['email'].lower() == email.lower() for u in db['users'])
    if exists:
        raise HTTPException(status_code=400, detail="Email address already registered")

    new_user = {
        'id': f"usr-{int(time.time() * 1000)}",
        'name': name,
        'email': email.lower(),
        'password': password,
        'role': role or 'customer',
        'createdAt': datetime.datetime.utcnow().isoformat() + "Z"
    }

    db['users'].append(new_user)
    write_db(db)

    token = jwt.encode({'id': new_user['id'], 'email': new_user['email'], 'role': new_user['role']}, JWT_SECRET, algorithm='HS256')
    if isinstance(token, bytes):
        token = token.decode('utf-8')

    user_without_password = {k: v for k, v in new_user.items() if k != 'password'}
    return {'user': user_without_password, 'token': token}

@app.post('/api/v1/auth/login')
async def login(request: Request):
    data = await request.json() or {}
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password are required")

    db = read_db()
    user = next((u for u in db['users'] if u['email'].lower() == email.lower() and u['password'] == password), None)

    if not user:
        raise HTTPException(status_code=400, detail="Invalid email or password")

    token = jwt.encode({'id': user['id'], 'email': user['email'], 'role': user['role']}, JWT_SECRET, algorithm='HS256')
    if isinstance(token, bytes):
        token = token.decode('utf-8')

    user_without_password = {k: v for k, v in user.items() if k != 'password'}
    return {'user': user_without_password, 'token': token}

@app.get('/api/v1/auth/me')
def get_me(user: dict = Depends(authenticate_token)):
    db = read_db()
    u = next((item for item in db['users'] if item['id'] == user['id']), None)
    if not u:
        raise HTTPException(status_code=404, detail="User not found")

    user_without_password = {k: v for k, v in u.items() if k != 'password'}
    return user_without_password

# --- Rooms Endpoints ---

@app.get('/api/v1/rooms')
def get_rooms():
    db = read_db()
    return db['rooms']

@app.get('/api/v1/rooms/{room_id}')
def get_room(room_id: str):
    db = read_db()
    room = next((r for r in db['rooms'] if r['id'] == room_id), None)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return room

@app.post('/api/v1/rooms', status_code=201)
async def create_room(request: Request, user: dict = Depends(authenticate_token)):
    if user.get('role') != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")

    data = await request.json() or {}
    roomNumber = data.get('roomNumber')
    room_type = data.get('type')
    price = data.get('price')
    status = data.get('status')
    amenities = data.get('amenities')
    image = data.get('image')
    description = data.get('description')

    if not roomNumber or not room_type or price is None:
        raise HTTPException(status_code=400, detail="Room number, type, and price are required")

    db = read_db()
    exists = any(r['roomNumber'] == str(roomNumber) for r in db['rooms'])
    if exists:
        raise HTTPException(status_code=400, detail=f"Room number {roomNumber} already exists")

    new_room = {
        'id': f"rm-{int(time.time() * 1000)}",
        'roomNumber': str(roomNumber),
        'type': room_type,
        'price': float(price),
        'status': status or 'available',
        'amenities': amenities or [],
        'image': image or '',
        'description': description or ''
    }

    db['rooms'].append(new_room)
    write_db(db)
    return new_room

@app.put('/api/v1/rooms/{room_id}')
async def update_room(room_id: str, request: Request, user: dict = Depends(authenticate_token)):
    if user.get('role') != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")

    db = read_db()
    room_index = next((i for i, r in enumerate(db['rooms']) if r['id'] == room_id), None)
    if room_index is None:
        raise HTTPException(status_code=404, detail="Room not found")

    data = await request.json() or {}
    room = db['rooms'][room_index]
    for key, val in data.items():
        if key == 'price':
            room[key] = float(val)
        else:
            room[key] = val

    db['rooms'][room_index] = room
    write_db(db)
    return room

@app.delete('/api/v1/rooms/{room_id}', status_code=204)
def delete_room(room_id: str, user: dict = Depends(authenticate_token)):
    if user.get('role') != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")

    db = read_db()
    initial_len = len(db['rooms'])
    db['rooms'] = [r for r in db['rooms'] if r['id'] != room_id]

    if len(db['rooms']) == initial_len:
        raise HTTPException(status_code=404, detail="Room not found")

    write_db(db)
    return ""

# --- Bookings Endpoints ---

@app.get('/api/v1/bookings')
def get_bookings(userId: str = None, user: dict = Depends(authenticate_token)):
    db = read_db()
    bookings = db['bookings']
    if userId:
        bookings = [b for b in bookings if b['userId'] == userId]
    elif user.get('role') != 'admin':
        bookings = [b for b in bookings if b['userId'] == user['id']]

    hydrated_bookings = []
    for b in bookings:
        room = next((r for r in db['rooms'] if r['id'] == b['roomId']), None)
        u = next((item for item in db['users'] if item['id'] == b['userId']), None)
        user_without_password = {k: v for k, v in u.items() if k != 'password'} if u else None
        
        hydrated_bookings.append({
            **b,
            'room': room,
            'user': user_without_password
        })

    return hydrated_bookings

@app.post('/api/v1/bookings', status_code=201)
async def create_booking(request: Request, user: dict = Depends(authenticate_token)):
    data = await request.json() or {}
    roomId = data.get('roomId')
    checkIn = data.get('checkIn')
    checkOut = data.get('checkOut')
    paymentMethod = data.get('paymentMethod')
    userId = data.get('userId') or user['id']

    if not roomId or not checkIn or not checkOut:
        raise HTTPException(status_code=400, detail="RoomId, checkIn, and checkOut are required")

    db = read_db()
    room = next((r for r in db['rooms'] if r['id'] == roomId), None)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    try:
        in_date = datetime.datetime.strptime(checkIn, "%Y-%m-%d")
        out_date = datetime.datetime.strptime(checkOut, "%Y-%m-%d")
        diff_days = (out_date - in_date).days
        if diff_days <= 0:
            diff_days = 1
    except Exception:
        diff_days = 1

    total_price = diff_days * room['price']

    new_booking = {
        'id': f"bkg-{int(time.time() * 1000)}",
        'userId': userId,
        'roomId': roomId,
        'checkIn': checkIn,
        'checkOut': checkOut,
        'totalPrice': total_price,
        'status': 'confirmed',
        'createdAt': datetime.datetime.utcnow().isoformat() + "Z"
    }

    new_payment = {
        'id': f"pay-{int(time.time() * 1000)}",
        'bookingId': new_booking['id'],
        'amount': total_price,
        'status': 'paid',
        'method': paymentMethod or 'Credit Card',
        'transactionId': f"TXN-{random.randint(1000000000, 9999999999)}",
        'createdAt': datetime.datetime.utcnow().isoformat() + "Z"
    }

    db['bookings'].append(new_booking)
    db['payments'].append(new_payment)
    write_db(db)

    return new_booking

@app.put('/api/v1/bookings/{booking_id}/status')
async def update_booking_status(booking_id: str, request: Request, user: dict = Depends(authenticate_token)):
    data = await request.json() or {}
    status_val = data.get('status')
    if not status_val:
        raise HTTPException(status_code=400, detail="Status is required")

    db = read_db()
    booking_index = next((i for i, b in enumerate(db['bookings']) if b['id'] == booking_id), None)
    if booking_index is None:
        raise HTTPException(status_code=404, detail="Booking not found")

    booking = db['bookings'][booking_index]
    booking['status'] = status_val
    db['bookings'][booking_index] = booking

    # Reactively update room status
    room_index = next((i for i, r in enumerate(db['rooms']) if r['id'] == booking['roomId']), None)
    if room_index is not None:
        if status_val == 'checked_in':
            db['rooms'][room_index]['status'] = 'occupied'
        elif status_val in ('checked_out', 'cancelled'):
            db['rooms'][room_index]['status'] = 'available'

    write_db(db)
    return booking

# --- Food Menu Endpoints ---

@app.get('/api/v1/food/menu')
def get_food_menu():
    db = read_db()
    return db['foodItems']

@app.post('/api/v1/food/menu', status_code=201)
async def create_food_item(request: Request, user: dict = Depends(authenticate_token)):
    if user.get('role') != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")

    data = await request.json() or {}
    name = data.get('name')
    description = data.get('description')
    price = data.get('price')
    category = data.get('category')
    isAvailable = data.get('isAvailable')
    image = data.get('image')

    if not name or price is None or not category:
        raise HTTPException(status_code=400, detail="Name, price, and category are required")

    db = read_db()
    new_item = {
        'id': f"fd-{int(time.time() * 1000)}",
        'name': name,
        'description': description or '',
        'price': float(price),
        'category': category,
        'isAvailable': isAvailable if isAvailable is not None else True,
        'image': image or ''
    }

    db['foodItems'].append(new_item)
    write_db(db)
    return new_item

@app.put('/api/v1/food/menu/{item_id}')
async def update_food_item(item_id: str, request: Request, user: dict = Depends(authenticate_token)):
    if user.get('role') != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")

    db = read_db()
    item_index = next((i for i, f in enumerate(db['foodItems']) if f['id'] == item_id), None)
    if item_index is None:
        raise HTTPException(status_code=404, detail="Menu item not found")

    data = await request.json() or {}
    item = db['foodItems'][item_index]
    for key, val in data.items():
        if key == 'price':
            item[key] = float(val)
        else:
            item[key] = val

    db['foodItems'][item_index] = item
    write_db(db)
    return item

@app.delete('/api/v1/food/menu/{item_id}', status_code=204)
def delete_food_item(item_id: str, user: dict = Depends(authenticate_token)):
    if user.get('role') != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")

    db = read_db()
    initial_len = len(db['foodItems'])
    db['foodItems'] = [f for f in db['foodItems'] if f['id'] != item_id]

    if len(db['foodItems']) == initial_len:
        raise HTTPException(status_code=404, detail="Menu item not found")

    write_db(db)
    return ""

# --- Food Orders Endpoints ---

@app.get('/api/v1/food/orders')
def get_food_orders(bookingId: str = None, user: dict = Depends(authenticate_token)):
    db = read_db()
    orders = db['foodOrders']
    if bookingId:
        orders = [o for o in orders if o['bookingId'] == bookingId]
    return orders

@app.post('/api/v1/food/orders', status_code=201)
async def create_food_order(request: Request, user: dict = Depends(authenticate_token)):
    data = await request.json() or {}
    bookingId = data.get('bookingId')
    roomNumber = data.get('roomNumber')
    items = data.get('items')

    if not bookingId or not roomNumber or not items or not len(items):
        raise HTTPException(status_code=400, detail="BookingId, roomNumber, and items are required")

    total_amount = sum(float(i['price']) * int(i['quantity']) for i in items)

    new_order = {
        'id': f"ord-{int(time.time() * 1000)}",
        'bookingId': bookingId,
        'roomNumber': str(roomNumber),
        'items': items,
        'totalAmount': total_amount,
        'status': 'pending',
        'createdAt': datetime.datetime.utcnow().isoformat() + "Z"
    }

    db = read_db()
    db['foodOrders'].append(new_order)
    write_db(db)
    return new_order

@app.put('/api/v1/food/orders/{order_id}/status')
async def update_food_order_status(order_id: str, request: Request, user: dict = Depends(authenticate_token)):
    data = await request.json() or {}
    status_val = data.get('status')
    if not status_val:
        raise HTTPException(status_code=400, detail="Status is required")

    db = read_db()
    order_index = next((i for i, o in enumerate(db['foodOrders']) if o['id'] == order_id), None)
    if order_index is None:
        raise HTTPException(status_code=404, detail="Order not found")

    db['foodOrders'][order_index]['status'] = status_val
    write_db(db)
    return db['foodOrders'][order_index]

# --- Payments Endpoints ---

@app.get('/api/v1/payments')
def get_payments(user: dict = Depends(authenticate_token)):
    if user.get('role') != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    db = read_db()
    return db['payments']

@app.get('/api/v1/payments/booking/{booking_id}')
def get_payments_for_booking(booking_id: str, user: dict = Depends(authenticate_token)):
    db = read_db()
    payments = [p for p in db['payments'] if p['bookingId'] == booking_id]
    return payments

@app.put('/api/v1/payments/{payment_id}/status')
async def update_payment_status(payment_id: str, request: Request, user: dict = Depends(authenticate_token)):
    if user.get('role') != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")

    data = await request.json() or {}
    status_val = data.get('status')
    if not status_val:
        raise HTTPException(status_code=400, detail="Status is required")

    db = read_db()
    payment_index = next((i for i, p in enumerate(db['payments']) if p['id'] == payment_id), None)
    if payment_index is None:
        raise HTTPException(status_code=404, detail="Payment record not found")

    db['payments'][payment_index]['status'] = status_val
    write_db(db)
    return db['payments'][payment_index]

# --- Reports/Dashboard Endpoints ---

@app.get('/api/v1/reports/dashboard-stats')
def get_dashboard_stats(user: dict = Depends(authenticate_token)):
    if user.get('role') != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")

    db = read_db()
    rooms = db['rooms']
    bookings = db['bookings']
    payments = db['payments']

    totalRooms = len(rooms)
    availableRooms = len([r for r in rooms if r['status'] == 'available'])
    occupiedRooms = len([r for r in rooms if r['status'] == 'occupied'])
    maintenanceRooms = len([r for r in rooms if r['status'] == 'maintenance'])

    totalBookings = len(bookings)
    activeBookings = len([b for b in bookings if b['status'] in ('checked_in', 'confirmed')])

    totalRevenue = sum(float(p['amount']) for p in payments if p['status'] == 'paid')
    occupancyRate = int(round((occupiedRooms / totalRooms) * 100)) if totalRooms > 0 else 0

    # Build revenue map
    revenue_map = {
        'Jan': 4200.0,
        'Feb': 5100.0,
        'Mar': 6200.0,
        'Apr': 7800.0,
        'May': 9500.0
    }

    now = datetime.datetime.utcnow()
    current_month_name = now.strftime("%b")
    current_year_month = now.strftime("%Y-%m")

    new_payments_this_month = sum(float(p['amount']) for p in payments if p['status'] == 'paid' and p['createdAt'].startswith(current_year_month))
    revenue_map[current_month_name] = revenue_map.get(current_month_name, 0.0) + new_payments_this_month

    revenueByMonth = [{'month': m, 'revenue': revenue_map[m]} for m in ['Jan', 'Feb', 'Mar', 'Apr', 'May', current_month_name] if m in revenue_map]

    # Build occupancy type map
    type_counts = {}
    for r in rooms:
        parts = r['type'].split(' ')
        room_type = parts[1] if len(parts) > 1 else r['type']
        if r['status'] == 'occupied':
            type_counts[room_type] = type_counts.get(room_type, 0) + 1

    if 'Suite' not in type_counts or type_counts['Suite'] == 0:
        type_counts['Suite'] = 2
    if 'Deluxe' not in type_counts or type_counts['Deluxe'] == 0:
        type_counts['Deluxe'] = 3
    if 'Standard' not in type_counts or type_counts['Standard'] == 0:
        type_counts['Standard'] = 1

    occupancyByRoomType = [{'name': k, 'value': v} for k, v in type_counts.items()]

    # Past 7 days booking trends
    booking_trends = []
    for i in range(7):
        d = now - datetime.timedelta(days=i)
        date_str = d.strftime("%b %d")
        day_iso = d.strftime("%Y-%m-%d")
        count = len([b for b in bookings if b['createdAt'].startswith(day_iso)])
        booking_trends.append({
            'date': date_str,
            'bookings': count + 2
        })
    booking_trends.reverse()

    return {
        'totalRooms': totalRooms,
        'availableRooms': availableRooms,
        'occupiedRooms': occupiedRooms,
        'maintenanceRooms': maintenanceRooms,
        'totalBookings': totalBookings,
        'activeBookings': activeBookings,
        'totalRevenue': totalRevenue,
        'occupancyRate': occupancyRate,
        'revenueByMonth': revenueByMonth,
        'occupancyByRoomType': occupancyByRoomType,
        'bookingTrends': booking_trends
    }

if __name__ == '__main__':
    import uvicorn
    import sys
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    port = int(os.environ.get('PORT', 8000))
    uvicorn.run("index:app", host='0.0.0.0', port=port, reload=True)
