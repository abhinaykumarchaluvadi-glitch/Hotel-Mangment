import React from 'react';
import { BedDouble, Users, Wifi } from 'lucide-react';

export const BrowseRooms: React.FC = () => {
  const rooms = [{ id: '1', number: '101', type: 'Single', price: 150, capacity: 1, amenities: ['WiFi', 'AC', 'TV'], available: true }, { id: '2', number: '102', type: 'Double', price: 250, capacity: 2, amenities: ['WiFi', 'AC', 'TV', 'Mini Bar'], available: true }];
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><h1 className="text-2xl font-bold text-foreground">Available Rooms</h1></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <div key={room.id} className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center"><BedDouble className="w-16 h-16 text-primary/50" /></div>
            <div className="p-4 space-y-4">
              <div><p className="text-xs text-muted-foreground">Room {room.number}</p><p className="text-lg font-semibold text-foreground">{room.type}</p></div>
              <div className="flex items-center justify-between text-sm"><div className="flex items-center gap-1"><Users className="w-4 h-4 text-muted-foreground" /><span>{room.capacity} Guest(s)</span></div><div className="flex items-center gap-1"><Wifi className="w-4 h-4 text-muted-foreground" /></div></div>
              <div className="border-t border-border pt-4 flex items-center justify-between"><p className="text-2xl font-bold text-primary">${room.price}</p><button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">Book Now</button></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
