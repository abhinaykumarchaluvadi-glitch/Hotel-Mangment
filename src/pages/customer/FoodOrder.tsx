import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { foodApi } from '../../api/food';
import { bookingsApi } from '../../api/bookings';
import { useAuth } from '../../store/AuthContext';
import { 
  Card, 
  CardContent, 
  Badge, 
  Button 
} from '../../components/ui/core';
import { ShoppingCart, AlertTriangle, Plus, Minus, Clock, UtensilsCrossed } from 'lucide-react';

interface CartItem {
  foodItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export const FoodOrder: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');

  // Fetch Menu
  const { data: menu = [], isLoading: menuLoading } = useQuery({
    queryKey: ['food-menu'],
    queryFn: foodApi.getMenu,
  });

  // Fetch customer bookings to see if they are checked-in
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['customer-bookings', user?.id],
    queryFn: () => bookingsApi.getAll(user?.id),
    enabled: !!user?.id,
  });

  const checkedInBooking = bookings.find((b) => b.status === 'checked_in');

  // Fetch existing food orders for this booking
  const { data: existingOrders = [] } = useQuery({
    queryKey: ['customer-food-orders', checkedInBooking?.id],
    queryFn: () => foodApi.getOrders(checkedInBooking?.id),
    enabled: !!checkedInBooking?.id,
  });

  // Place Order Mutation
  const orderMutation = useMutation({
    mutationFn: (data: { bookingId: string; roomNumber: string; items: CartItem[] }) =>
      foodApi.placeOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-food-orders'] });
      setCart([]);
      alert('Your room service order has been placed! Our chefs are preparing it.');
    },
  });

  const handleAddToCart = (item: any) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.foodItemId === item.id);
      if (existing) {
        return prev.map((i) => 
          i.foodItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { foodItemId: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.foodItemId === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map((i) => 
          i.foodItemId === itemId ? { ...i, quantity: i.quantity - 1 } : i
        );
      }
      return prev.filter((i) => i.foodItemId !== itemId);
    });
  };

  const handlePlaceOrder = () => {
    if (!checkedInBooking) return;
    orderMutation.mutate({
      bookingId: checkedInBooking.id,
      roomNumber: checkedInBooking.room?.roomNumber || 'N/A',
      items: cart,
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const categories = ['all', 'breakfast', 'lunch', 'dinner', 'beverages', 'snacks'];

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Preparing</Badge>;
      case 'preparing':
        return <Badge variant="default">Cooking</Badge>;
      case 'delivered':
        return <Badge variant="success">Delivered</Badge>;
      case 'cancelled':
        return <Badge variant="error">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const filteredMenu = menu.filter(item => activeTab === 'all' || item.category === activeTab);

  if (!bookingsLoading && !checkedInBooking) {
    return (
      <Card className="flex flex-col items-center justify-center p-12 text-center space-y-4 border-dashed max-w-xl mx-auto my-12">
        <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold font-serif">Room Service Unavailable</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Room service food orders are exclusively available to checked-in guests. Once you are checked into your room by our receptionist, you can place orders directly here.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Menu browsing */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold font-serif">Epicurean Room Service</h2>
          {checkedInBooking && (
            <Badge variant="success">
              Room {checkedInBooking.room?.roomNumber} Active Session
            </Badge>
          )}
        </div>

        {/* Menu category filters */}
        <div className="flex flex-wrap gap-2 pb-2 border-b border-border/40">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveTab(c)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all border ${
                activeTab === c
                  ? 'bg-primary text-primary-foreground border-transparent shadow-sm'
                  : 'bg-card text-muted-foreground hover:text-foreground border-border hover:bg-muted'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {menuLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="h-32 bg-muted animate-pulse" />
            ))}
          </div>
        ) : filteredMenu.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredMenu.map((item) => {
              const cartQty = cart.find(i => i.foodItemId === item.id)?.quantity || 0;
              return (
                <Card key={item.id} className="flex h-32 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="w-1/3 h-full overflow-hidden shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4 w-2/3 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-foreground truncate">{item.name}</h4>
                      <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">{item.description}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-primary">₹{item.price}</span>
                      <div className="flex items-center gap-1.5">
                        {cartQty > 0 && (
                          <>
                            <button
                              onClick={() => handleRemoveFromCart(item.id)}
                              className="p-1 rounded bg-muted border border-border text-muted-foreground hover:text-foreground active:scale-95"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold w-4 text-center">{cartQty}</span>
                          </>
                        )}
                        <button
                          onClick={() => handleAddToCart(item)}
                          disabled={!item.isAvailable}
                          className="p-1 rounded bg-primary text-primary-foreground hover:bg-primary/95 active:scale-95 disabled:opacity-50"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No dishes available in this category.</p>
        )}

        {/* Existing active orders tracker */}
        {existingOrders.length > 0 && (
          <div className="pt-6 border-t border-border/40">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Pending Kitchen Deliveries</h3>
            <div className="space-y-3">
              {existingOrders.map((order) => (
                <Card key={order.id} className="p-4 border-l-2 border-l-primary">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary animate-pulse" />
                      <span className="text-xs font-bold text-foreground">Order Ref: {order.id.slice(-6).toUpperCase()}</span>
                    </div>
                    {getOrderStatusBadge(order.status)}
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground space-y-1">
                    {order.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>{it.name} &times; {it.quantity}</span>
                        <span>₹{it.price * it.quantity}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold border-t border-border/40 pt-1.5 text-foreground mt-2">
                      <span>Total Amount</span>
                      <span>₹{order.totalAmount}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Cart sidebar */}
      <div>
        <Card className="sticky top-20 border-primary/20">
          <CardContent className="p-6 space-y-6">
            <h3 className="text-lg font-serif font-bold text-foreground flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" /> Your Cart
            </h3>

            {cart.length > 0 ? (
              <>
                <div className="divide-y divide-border/40 space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {cart.map((item, idx) => (
                    <div key={item.foodItemId} className={`flex items-center justify-between pt-3 ${idx === 0 ? 'pt-0' : ''}`}>
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="text-xs font-semibold truncate text-foreground">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground">₹{item.price} each</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleRemoveFromCart(item.foodItemId)}
                          className="p-1 rounded bg-muted hover:bg-muted/80 text-muted-foreground"
                        >
                          <Minus className="w-2.5 h-2.5" />
                        </button>
                        <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => handleAddToCart({ id: item.foodItemId, name: item.name, price: item.price })}
                          className="p-1 rounded bg-muted hover:bg-muted/80 text-muted-foreground"
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                        <span className="text-xs font-bold text-foreground w-12 text-right">
                          ₹{item.price * item.quantity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Subtotal</span>
                    <span>₹{cartTotal}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Delivery Charge</span>
                    <span className="text-emerald-500">FREE</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-foreground border-t border-border/40 pt-2">
                    <span>Grand Total</span>
                    <span className="text-primary font-serif text-lg">₹{cartTotal}</span>
                  </div>
                </div>

                <Button
                  onClick={handlePlaceOrder}
                  isLoading={orderMutation.isPending}
                  className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-semibold"
                >
                  Place Room Service Order
                </Button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
                <UtensilsCrossed className="w-10 h-10 text-muted-foreground/45" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your tray is empty. Add gourmet dishes from the room service menu to place an order.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
