import React from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export const ManageRooms: React.FC = () => {
  const rooms = [{ id: '1', number: '101', type: 'Single', price: 150, available: true }];
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><h1 className="text-2xl font-bold text-foreground">Manage Rooms</h1><button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"><Plus className="w-4 h-4" />Add Room</button></div>
      <div className="bg-card border border-border rounded-lg overflow-hidden"><table className="w-full"><thead className="bg-muted border-b border-border"><tr><th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Room #</th><th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Type</th><th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Price</th><th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th><th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Actions</th></tr></thead><tbody className="divide-y divide-border">{rooms.map((room) => (<tr key={room.id} className="hover:bg-muted/50 transition-colors"><td className="px-6 py-4 text-foreground font-semibold">{room.number}</td><td className="px-6 py-4 text-muted-foreground">{room.type}</td><td className="px-6 py-4 text-foreground">${room.price}</td><td className="px-6 py-4"><span className="px-2 py-1 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-600">Available</span></td><td className="px-6 py-4 text-right flex justify-end gap-2"><button className="p-2 hover:bg-muted rounded transition-colors"><Edit2 className="w-4 h-4 text-muted-foreground" /></button><button className="p-2 hover:bg-muted rounded transition-colors"><Trash2 className="w-4 h-4 text-destructive" /></button></td></tr>))}</tbody></table></div>
    </div>
  );
};
