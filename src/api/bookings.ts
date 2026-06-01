import { apiClient, isMockMode, mockDelay } from './client';
import { mockDb } from './mockDb';
import type { Booking, BookingStatus } from '../types';
import type { BookingFormData } from '../schemas/booking';

export const bookingsApi = {
  getAll: async (userId?: string): Promise<Booking[]> => {
    if (isMockMode()) {
      await mockDelay(500);
      let bookings = mockDb.getBookings();
      const rooms = mockDb.getRooms();
      const users = mockDb.getUsers();

      // Hydrate bookings with room and user details
      bookings = bookings.map((b) => ({
        ...b,
        room: rooms.find((r) => r.id === b.roomId),
        user: users.find((u) => u.id === b.userId),
      }));

      if (userId) {
        return bookings.filter((b) => b.userId === userId);
      }
      return bookings;
    }

    const response = await apiClient.get<Booking[]>('/bookings', {
      params: userId ? { userId } : {},
    });
    return response.data;
  },

  create: async (data: BookingFormData & { userId: string }): Promise<Booking> => {
    if (isMockMode()) {
      await mockDelay(600);
      const bookings = mockDb.getBookings();
      const rooms = mockDb.getRooms();
      const room = rooms.find((r) => r.id === data.roomId);
      if (!room) throw new Error('Room not found');

      // Calculate total price based on date difference
      const inDate = new Date(data.checkIn);
      const outDate = new Date(data.checkOut);
      const diffTime = Math.abs(outDate.getTime() - inDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
      const totalPrice = diffDays * room.price;

      const newBooking: Booking = {
        id: `bkg-${Date.now()}`,
        userId: data.userId,
        roomId: data.roomId,
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        totalPrice,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
      };

      // Create a virtual payment for it
      const payments = mockDb.getPayments();
      const newPayment = {
        id: `pay-${Date.now()}`,
        bookingId: newBooking.id,
        amount: totalPrice,
        status: 'paid' as const,
        method: data.paymentMethod || 'Credit Card',
        transactionId: `TXN-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        createdAt: new Date().toISOString(),
      };
      mockDb.setPayments([...payments, newPayment]);

      mockDb.setBookings([...bookings, newBooking]);
      return newBooking;
    }

    const response = await apiClient.post<Booking>('/bookings', data);
    return response.data;
  },

  updateStatus: async (id: string, status: BookingStatus): Promise<Booking> => {
    if (isMockMode()) {
      await mockDelay(400);
      const bookings = mockDb.getBookings();
      const index = bookings.findIndex((b) => b.id === id);
      if (index === -1) throw new Error('Booking not found');

      const updatedBooking = { ...bookings[index], status };
      const newBookings = [...bookings];
      newBookings[index] = updatedBooking;
      mockDb.setBookings(newBookings);

      // Reactive update to Room status based on booking status
      const rooms = mockDb.getRooms();
      const roomIndex = rooms.findIndex((r) => r.id === updatedBooking.roomId);
      if (roomIndex !== -1) {
        const newRooms = [...rooms];
        if (status === 'checked_in') {
          newRooms[roomIndex].status = 'occupied';
        } else if (status === 'checked_out' || status === 'cancelled') {
          newRooms[roomIndex].status = 'available';
        }
        mockDb.setRooms(newRooms);
      }

      return updatedBooking;
    }

    const response = await apiClient.put<Booking>(`/bookings/${id}/status`, { status });
    return response.data;
  },
};
