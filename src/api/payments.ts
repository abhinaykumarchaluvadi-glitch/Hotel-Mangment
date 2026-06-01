import { apiClient, isMockMode, mockDelay } from './client';
import { mockDb } from './mockDb';
import type { Payment } from '../types';

export const paymentsApi = {
  getAll: async (): Promise<Payment[]> => {
    if (isMockMode()) {
      await mockDelay(400);
      return mockDb.getPayments();
    }
    const response = await apiClient.get<Payment[]>('/payments');
    return response.data;
  },

  getByBookingId: async (bookingId: string): Promise<Payment[]> => {
    if (isMockMode()) {
      await mockDelay(300);
      const payments = mockDb.getPayments();
      return payments.filter((p) => p.bookingId === bookingId);
    }
    const response = await apiClient.get<Payment[]>(`/payments/booking/${bookingId}`);
    return response.data;
  },

  updateStatus: async (id: string, status: string): Promise<Payment> => {
    if (isMockMode()) {
      await mockDelay(500);
      const list = mockDb.getPayments();
      const index = list.findIndex((p) => p.id === id);
      if (index === -1) throw new Error('Payment record not found');
      const updated = [...list];
      updated[index].status = status as any;
      mockDb.setPayments(updated);
      return updated[index];
    }
    const response = await apiClient.put<Payment>(`/payments/${id}/status`, { status });
    return response.data;
  },
};
