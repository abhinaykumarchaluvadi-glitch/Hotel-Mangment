import React from 'react';
import { Users, BookOpen, DollarSign, TrendingUp } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const stats = [{ label: 'Total Guests', value: '156', icon: Users }, { label: 'Active Bookings', value: '42', icon: BookOpen }, { label: 'Revenue Today', value: '$3,250', icon: DollarSign }, { label: 'Occupancy Rate', value: '85%', icon: TrendingUp }];
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-6"><h1 className="text-2xl font-serif font-bold text-primary mb-2">Admin Dashboard</h1><p className="text-muted-foreground">Manage rooms, bookings, and guest services efficiently.</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-card border border-border rounded-lg p-6 space-y-2"><div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">{stat.label}</p><Icon className="w-5 h-5 text-primary" /></div><p className="text-2xl font-bold text-foreground">{stat.value}</p></div>
          );
        })}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6"><h3 className="font-semibold text-foreground mb-4">Recent Bookings</h3><div className="space-y-3 text-sm"><p className="text-muted-foreground">No recent bookings to display</p></div></div>
        <div className="bg-card border border-border rounded-lg p-6"><h3 className="font-semibold text-foreground mb-4">Room Status</h3><div className="space-y-3 text-sm"><p className="text-muted-foreground">Monitoring room availability</p></div></div>
      </div>
    </div>
  );
};
