import { apiClient, isMockMode, mockDelay } from './client';
import { mockDb } from './mockDb';
import type { DashboardStats } from '../types';

export const reportsApi = {
  getStats: async (): Promise<DashboardStats> => {
    if (isMockMode()) {
      await mockDelay(600);
      const rooms = mockDb.getRooms();
      const bookings = mockDb.getBookings();
      const payments = mockDb.getPayments();

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
      const revenueMap: { [key: string]: number } = {
        'Jan': 4200,
        'Feb': 5100,
        'Mar': 6200,
        'Apr': 7800,
        'May': 9500,
      };

      // Add actual payments from mockDb to current month (May)
      revenueMap['May'] = (revenueMap['May'] || 0) + payments
        .filter((p) => p.status === 'paid' && p.createdAt.includes('2026-05'))
        .reduce((sum, p) => sum + p.amount, 0);

      const revenueByMonth = Object.keys(revenueMap).map((m) => ({
        month: m,
        revenue: revenueMap[m],
      }));

      // Occupancy by room type
      const typeCounts: { [key: string]: number } = {};
      rooms.forEach((r) => {
        const type = r.type.split(' ')[1] || r.type; // extract deluxe, suite, etc.
        typeCounts[type] = (typeCounts[type] || 0) + (r.status === 'occupied' ? 1 : 0);
      });
      // Fallback values if 0
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
        // Count bookings created on this day
        const dayIso = d.toISOString().split('T')[0];
        const count = bookings.filter((b) => b.createdAt.startsWith(dayIso)).length;
        return {
          date: dateStr,
          bookings: count + Math.floor(Math.random() * 3) + 1, // seed data + randomized base to look rich
        };
      }).reverse();

      return {
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
      };
    }

    const response = await apiClient.get<DashboardStats>('/reports/dashboard-stats');
    return response.data;
  },
};
