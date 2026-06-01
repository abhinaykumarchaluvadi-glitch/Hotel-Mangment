import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../../api/reports';
import { StatCard } from '../../components/ui/../StatCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/core';
import { 
  IndianRupee, 
  CalendarCheck, 
  Bed, 
  Wrench, 
  Activity 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  Legend 
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: reportsApi.getStats,
  });

  if (isLoading || !stats) {
    return (
      <div className="space-y-6">
        {/* Skeleton cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="h-32 bg-muted animate-pulse" />
          ))}
        </div>
        {/* Skeleton charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 h-[350px] bg-muted animate-pulse" />
          <Card className="h-[350px] bg-muted animate-pulse" />
        </div>
      </div>
    );
  }

  // Luxury Theme Colors
  const COLORS = ['#D4AF37', '#8E7618', '#AA8C2C', '#C5A028'];

  // Custom tooltips for Recharts (premium UI details)
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-card border border-border rounded-lg shadow-md text-xs">
          <p className="font-bold text-foreground mb-1">{label}</p>
          {payload.map((p: any, idx: number) => (
            <p key={idx} className="text-primary font-semibold">
              {p.name}: {p.name.includes('Revenue') ? `₹${p.value.toLocaleString()}` : p.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const dashboardCards = [
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: IndianRupee,
      description: 'Gross billing collected this year',
      trend: { value: 14.2, isPositive: true },
    },
    {
      title: 'Active Bookings',
      value: stats.activeBookings,
      icon: CalendarCheck,
      description: 'Confirmed stays & active check-ins',
      trend: { value: 6.8, isPositive: true },
    },
    {
      title: 'Occupancy Rate',
      value: `${stats.occupancyRate}%`,
      icon: Bed,
      description: 'Current percentage of rooms booked',
      trend: { value: 3.4, isPositive: true },
    },
    {
      title: 'Under Maintenance',
      value: stats.maintenanceRooms,
      icon: Wrench,
      description: 'Rooms offline for service audits',
      trend: { value: 1.2, isPositive: false },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardCards.map((card, idx) => (
          <StatCard
            key={idx}
            title={card.title}
            value={card.value}
            icon={card.icon}
            description={card.description}
            trend={card.trend}
            delay={idx * 0.1}
          />
        ))}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Performance Area Chart */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" /> Revenue Performance
            </CardTitle>
            <CardDescription>Monthly billing overview in INR</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.revenueByMonth}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  name="Revenue"
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Occupancy Share Pie Chart */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Occupancy Share</CardTitle>
            <CardDescription>Occupied rooms broken down by suite tier</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.occupancyByRoomType}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.occupancyByRoomType.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle" 
                  iconSize={8}
                  formatter={(value) => <span className="text-xs text-muted-foreground font-medium">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Booking Trend Weekly Bar Chart */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Daily Reservations Intake</CardTitle>
          <CardDescription>Number of reservations booked daily over the past week</CardDescription>
        </CardHeader>
        <CardContent className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.bookingTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="bookings" 
                name="Bookings"
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={45}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
