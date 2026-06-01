import React from 'react';
import { useAuth } from '../../store/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { bookingsApi } from '../../api/bookings';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '../../components/ui/core';
import { Calendar, Utensils, CreditCard, Sparkles, Compass, Waves } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();

  // Fetch customer's bookings
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['customer-bookings', user?.id],
    queryFn: () => bookingsApi.getAll(user?.id),
    enabled: !!user?.id,
  });

  const activeBooking = bookings.find(
    (b) => b.status === 'checked_in' || b.status === 'confirmed'
  );

  const totalSpent = bookings
    .filter((b) => b.status !== 'cancelled')
    .reduce((sum, b) => sum + b.totalPrice, 0);

  const stats = [
    { label: 'Active Retreats', value: bookings.filter(b => b.status === 'confirmed' || b.status === 'checked_in').length, icon: Calendar },
    { label: 'Past Stays', value: bookings.filter(b => b.status === 'checked_out').length, icon: Compass },
    { label: 'Total Invested', value: `₹${totalSpent.toLocaleString()}`, icon: CreditCard },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div 
        className="relative rounded-2xl overflow-hidden p-8 md:p-12 bg-cover bg-center text-white"
        style={{ 
          backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.2)), url('https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1200')` 
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent" />
        <div className="relative z-10 max-w-lg space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs text-primary font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Luxury Hotel Experience
          </div>
          <h2 className="text-3xl md:text-4xl font-serif">Welcome back, {user?.name}</h2>
          <p className="text-sm text-white/80 leading-relaxed">
            Your sanctuary awaits. Experience the perfect blend of modern sophistication and timeless hospitality during your stay.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link to="/rooms">
              <Button className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold">
                Reserve a Room
              </Button>
            </Link>
            {activeBooking && activeBooking.status === 'checked_in' && (
              <Link to="/food-order">
                <Button variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20 text-white font-semibold">
                  <Utensils className="w-4 h-4 mr-2" /> Order Room Service
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="relative overflow-hidden group">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                  <p className="text-2xl font-bold font-serif text-foreground">{stat.value}</p>
                </div>
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  <Icon className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Active Booking & Hotel Services */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Booking Column */}
        <div className="lg:col-span-2">
          {isLoading ? (
            <Card className="h-[280px] flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-2 border-primary animate-spin" />
                <p className="text-xs text-muted-foreground">Retrieving active reservations...</p>
              </div>
            </Card>
          ) : activeBooking ? (
            <Card className="h-full flex flex-col justify-between overflow-hidden">
              <div className="flex flex-col md:flex-row md:h-full">
                {/* Image */}
                <div className="md:w-2/5 h-48 md:h-auto relative">
                  <img 
                    src={activeBooking.room?.image} 
                    alt={activeBooking.room?.type} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge variant={activeBooking.status === 'checked_in' ? 'success' : 'default'}>
                      {activeBooking.status === 'checked_in' ? 'Active Stay' : 'Upcoming'}
                    </Badge>
                  </div>
                </div>

                {/* Details */}
                <div className="p-6 md:w-3/5 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <span className="text-[10px] font-semibold text-primary uppercase tracking-widest">Your Reservation</span>
                    <h3 className="text-xl font-bold font-serif text-foreground">{activeBooking.room?.type}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{activeBooking.room?.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 pt-3 text-xs border-t border-border/40">
                      <div>
                        <p className="font-semibold text-muted-foreground uppercase tracking-wider text-[9px]">Check-In Date</p>
                        <p className="font-medium text-foreground">{activeBooking.checkIn}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-muted-foreground uppercase tracking-wider text-[9px]">Check-Out Date</p>
                        <p className="font-medium text-foreground">{activeBooking.checkOut}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border/40">
                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Total Invoiced</p>
                      <p className="text-lg font-bold text-primary font-serif">₹{activeBooking.totalPrice}</p>
                    </div>
                    {activeBooking.status === 'checked_in' && (
                      <Link to="/food-order">
                        <Button size="sm">Order Service</Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4 border-dashed">
              <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Compass className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h3 className="text-lg font-bold font-serif">No Active Bookings</h3>
                <p className="text-xs text-muted-foreground">
                  You do not have any active stays or upcoming bookings at the moment. Plan your next getaway now.
                </p>
              </div>
              <Link to="/rooms">
                <Button size="sm">Browse Available Rooms</Button>
              </Link>
            </Card>
          )}
        </div>

        {/* Hotel Features/Amenities */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="p-4 border-b border-border/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <Waves className="w-5 h-5 text-primary" /> Resort Experiences
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 divide-y divide-border/50 space-y-4">
              <div className="flex gap-3 pt-0">
                <div className="w-12 h-12 rounded bg-cover bg-center shrink-0" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=150')` }} />
                <div>
                  <h4 className="text-xs font-bold text-foreground">Royal Spa & Wellness</h4>
                  <p className="text-[10px] text-muted-foreground">Aromatherapy massage, hot stone wraps, and organic facials. Open 8:00 AM - 10:00 PM.</p>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <div className="w-12 h-12 rounded bg-cover bg-center shrink-0" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=150')` }} />
                <div>
                  <h4 className="text-xs font-bold text-foreground">Michelin Star Dining</h4>
                  <p className="text-[10px] text-muted-foreground">Fine culinary dining curated by internationally acclaimed chefs. Reservation required.</p>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <div className="w-12 h-12 rounded bg-cover bg-center shrink-0" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=150')` }} />
                <div>
                  <h4 className="text-xs font-bold text-foreground">Infinity Edge Pool</h4>
                  <p className="text-[10px] text-muted-foreground">Temperature controlled panoramic ocean view lounge deck, private cabanas available.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
