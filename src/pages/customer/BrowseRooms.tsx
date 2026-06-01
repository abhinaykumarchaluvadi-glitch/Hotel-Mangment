import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roomsApi } from '../../api/rooms';
import { bookingsApi } from '../../api/bookings';
import { useAuth } from '../../store/AuthContext';
import { 
  Card, 
  Badge, 
  Button, 
  Dialog, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  Input 
} from '../../components/ui/core';
import { Search, SlidersHorizontal, Shield, Compass, Calendar, IndianRupee } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { bookingSchema } from '../../schemas/booking';
import type { BookingFormData } from '../../schemas/booking';
import { useNavigate } from 'react-router-dom';

export const BrowseRooms: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [sortBy, setSortBy] = useState('price-asc');
  
  // Booking Dialog State
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  // Fetch Rooms
  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ['rooms-catalog'],
    queryFn: roomsApi.getAll,
  });

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);

  // Form Setup
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  });

  const watchCheckIn = watch('checkIn');
  const watchCheckOut = watch('checkOut');

  // Dynamic Price Estimator
  const getEstimation = () => {
    if (!selectedRoom || !watchCheckIn || !watchCheckOut) return null;
    const checkInDate = new Date(watchCheckIn);
    const checkOutDate = new Date(watchCheckOut);
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime()) || checkOutDate <= checkInDate) {
      return null;
    }
    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    return {
      days: diffDays,
      total: diffDays * selectedRoom.price,
    };
  };

  const estimation = getEstimation();

  // Booking Mutation
  const bookingMutation = useMutation({
    mutationFn: (data: BookingFormData) => 
      bookingsApi.create({ ...data, userId: user!.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['rooms-catalog'] });
      setSelectedRoomId(null);
      reset();
      navigate('/bookings');
    },
  });

  const handleBookingSubmit = (data: BookingFormData) => {
    if (!user) {
      navigate('/login');
      return;
    }
    bookingMutation.mutate(data);
  };

  // Filter & Search Logic
  const filteredRooms = rooms
    .filter((room) => {
      const matchSearch = room.roomNumber.includes(search) || 
                          room.type.toLowerCase().includes(search.toLowerCase()) ||
                          room.description.toLowerCase().includes(search.toLowerCase());
      
      const matchFilter = filterType === 'All' || room.type.toLowerCase().includes(filterType.toLowerCase());
      
      return matchSearch && matchFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return 0;
    });

  const uniqueTypes = ['All', ...Array.from(new Set(rooms.map((r) => r.type.split(' ')[0])))];

  return (
    <div className="space-y-6">
      {/* Search & Filter Header */}
      <div className="p-4 bg-card rounded-xl border border-border flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search room number, type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-lg bg-muted/50 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/45"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 w-full md:w-auto items-center justify-end">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Filter:</span>
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="h-10 px-3 py-1 text-sm bg-card border border-border rounded-lg text-foreground focus:outline-none"
          >
            {uniqueTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-10 px-3 py-1 text-sm bg-card border border-border rounded-lg text-foreground focus:outline-none"
          >
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Rooms List Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="h-[420px] flex flex-col justify-between">
              <div className="w-full h-48 bg-muted animate-pulse" />
              <div className="p-6 space-y-4 flex-1">
                <div className="h-6 bg-muted animate-pulse rounded w-2/3" />
                <div className="h-4 bg-muted animate-pulse rounded w-full" />
                <div className="h-4 bg-muted animate-pulse rounded w-5/6" />
                <div className="h-10 bg-muted animate-pulse rounded w-1/3 pt-4" />
              </div>
            </Card>
          ))}
        </div>
      ) : filteredRooms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <Card key={room.id} className="flex flex-col justify-between hover:shadow-lg transition-all group">
              {/* Room Image */}
              <div className="w-full h-52 overflow-hidden relative">
                <img
                  src={room.image}
                  alt={room.type}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 flex gap-1">
                  <Badge variant={room.status === 'available' ? 'success' : room.status === 'occupied' ? 'error' : 'warning'}>
                    {room.status}
                  </Badge>
                </div>
                <div className="absolute bottom-4 right-4 bg-black/75 backdrop-blur-md text-white font-serif font-bold text-lg px-3 py-1.5 rounded-lg border border-white/10">
                  ₹{room.price}<span className="text-xs font-sans font-normal text-white/70">/night</span>
                </div>
              </div>

              {/* Description & Amenities */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold font-serif text-foreground truncate">{room.type}</h3>
                    <span className="text-xs text-muted-foreground font-semibold">Room {room.roomNumber}</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {room.description}
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Amenities */}
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/40">
                    {room.amenities.map((amenity) => (
                      <span
                        key={amenity}
                        className="px-2 py-0.5 rounded-md bg-muted text-[10px] font-semibold text-muted-foreground border border-border/50"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>

                  <Button
                    onClick={() => {
                      setSelectedRoomId(room.id);
                      reset();
                    }}
                    disabled={room.status !== 'available'}
                    className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-semibold"
                  >
                    {room.status === 'available' ? 'Reserve Retreat' : 'Currently Booked'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
            <Compass className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold font-serif">No Rooms Found</h3>
            <p className="text-xs text-muted-foreground">
              Try adjusting your filters or search keywords to find alternative suites.
            </p>
          </div>
        </Card>
      )}

      {/* Booking Dialog Modal */}
      <Dialog isOpen={!!selectedRoomId} onClose={() => setSelectedRoomId(null)}>
        {selectedRoom && (
          <div className="space-y-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-serif">Reserve Your Suite</DialogTitle>
              <DialogDescription>
                {selectedRoom.type} (Room {selectedRoom.roomNumber}) &mdash; ₹{selectedRoom.price}/night
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(handleBookingSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Check-In
                  </label>
                  <Input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    error={errors.checkIn?.message}
                    {...register('checkIn')}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Check-Out
                  </label>
                  <Input
                    type="date"
                    min={watchCheckIn || new Date().toISOString().split('T')[0]}
                    error={errors.checkOut?.message}
                    {...register('checkOut')}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Payment Method
                </label>
                <select
                  {...register('paymentMethod')}
                  className="w-full h-10 px-3 py-2 bg-card border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="Credit Card">Credit Card</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Cash">Cash / Pay at Counter</option>
                </select>
              </div>

              {/* Real-time Invoice preview */}
              {estimation && (
                <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 space-y-2 mt-6">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Invoice Summary</span>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Stays</span>
                    <span>{estimation.days} Nights</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Nightly Rate</span>
                    <span>₹{selectedRoom.price} / night</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-foreground border-t border-border/40 pt-2">
                    <span className="flex items-center gap-1">
                      <IndianRupee className="w-4 h-4 text-primary" /> Total Price
                    </span>
                    <span className="text-primary font-serif">₹{estimation.total}</span>
                  </div>
                </div>
              )}

              {/* Info alert */}
              <div className="p-3 bg-muted rounded-lg border border-border flex items-start gap-3">
                <Shield className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Booking confirms immediately. Free cancellation is permitted up to 24 hours prior to the scheduled check-in time.
                </p>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-border/40">
                <Button type="button" variant="outline" onClick={() => setSelectedRoomId(null)}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={bookingMutation.isPending}>
                  Confirm Booking
                </Button>
              </div>
            </form>
          </div>
        )}
      </Dialog>
    </div>
  );
};
