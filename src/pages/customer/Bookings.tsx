import React from 'react';
import { Calendar, Clock } from 'lucide-react';

export const Bookings: React.FC = () => {
  const bookings = [{ id: '1', roomNumber: '101', checkIn: '2026-06-05', checkOut: '2026-06-08', status: 'confirmed', total: '$450' }];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">My Bookings</h1>
      {bookings.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center"><Calendar className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" /><p className="text-muted-foreground">No bookings yet. Start planning your stay!</p></div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-card border border-border rounded-lg p-6 space-y-4">
              <div className="flex justify-between items-start"><div><p className="text-sm text-muted-foreground">Room {booking.roomNumber}</p><p className="text-xl font-semibold text-foreground">Booking #{booking.id}</p></div><span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 capitalize">{booking.status}</span></div>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Check-in</p><p className="font-semibold text-foreground">{booking.checkIn}</p></div></div>
                <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Check-out</p><p className="font-semibold text-foreground">{booking.checkOut}</p></div></div>
                <div className="text-right"><p className="text-xs text-muted-foreground">Total</p><p className="text-xl font-bold text-primary">{booking.total}</p></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
