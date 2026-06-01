import { apiClient, isMockMode, mockDelay } from './client';
import { mockDb } from './mockDb';
import type { FoodItem, FoodOrder, FoodOrderStatus } from '../types';
import type { FoodItemFormData } from '../schemas/admin';

export const foodApi = {
  getMenu: async (): Promise<FoodItem[]> => {
    if (isMockMode()) {
      await mockDelay(300);
      return mockDb.getFoodItems();
    }
    const response = await apiClient.get<FoodItem[]>('/food/menu');
    return response.data;
  },

  createItem: async (data: FoodItemFormData): Promise<FoodItem> => {
    if (isMockMode()) {
      await mockDelay(500);
      const items = mockDb.getFoodItems();
      const newItem: FoodItem = {
        id: `fd-${Date.now()}`,
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        isAvailable: data.isAvailable,
        image: data.image,
      };
      mockDb.setFoodItems([...items, newItem]);
      return newItem;
    }
    const response = await apiClient.post<FoodItem>('/food/menu', data);
    return response.data;
  },

  updateItem: async (id: string, data: Partial<FoodItemFormData>): Promise<FoodItem> => {
    if (isMockMode()) {
      await mockDelay(400);
      const items = mockDb.getFoodItems();
      const index = items.findIndex((i) => i.id === id);
      if (index === -1) throw new Error('Menu item not found');

      const updatedItem = { ...items[index], ...data } as FoodItem;
      const newItems = [...items];
      newItems[index] = updatedItem;
      mockDb.setFoodItems(newItems);
      return updatedItem;
    }
    const response = await apiClient.put<FoodItem>(`/food/menu/${id}`, data);
    return response.data;
  },

  deleteItem: async (id: string): Promise<void> => {
    if (isMockMode()) {
      await mockDelay(300);
      const items = mockDb.getFoodItems();
      mockDb.setFoodItems(items.filter((i) => i.id !== id));
      return;
    }
    await apiClient.delete(`/food/menu/${id}`);
  },

  getOrders: async (bookingId?: string): Promise<FoodOrder[]> => {
    if (isMockMode()) {
      await mockDelay(400);
      const orders = mockDb.getFoodOrders();
      if (bookingId) {
        return orders.filter((o) => o.bookingId === bookingId);
      }
      return orders;
    }
    const response = await apiClient.get<FoodOrder[]>('/food/orders', {
      params: bookingId ? { bookingId } : {},
    });
    return response.data;
  },

  placeOrder: async (data: { bookingId: string; roomNumber: string; items: { foodItemId: string; name: string; price: number; quantity: number }[] }): Promise<FoodOrder> => {
    if (isMockMode()) {
      await mockDelay(600);
      const orders = mockDb.getFoodOrders();
      const totalAmount = data.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

      const newOrder: FoodOrder = {
        id: `ord-${Date.now()}`,
        bookingId: data.bookingId,
        roomNumber: data.roomNumber,
        items: data.items,
        totalAmount,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      mockDb.setFoodOrders([...orders, newOrder]);
      return newOrder;
    }
    const response = await apiClient.post<FoodOrder>('/food/orders', data);
    return response.data;
  },

  updateOrderStatus: async (id: string, status: FoodOrderStatus): Promise<FoodOrder> => {
    if (isMockMode()) {
      await mockDelay(400);
      const orders = mockDb.getFoodOrders();
      const index = orders.findIndex((o) => o.id === id);
      if (index === -1) throw new Error('Order not found');

      const updatedOrder = { ...orders[index], status };
      const newOrders = [...orders];
      newOrders[index] = updatedOrder;
      mockDb.setFoodOrders(newOrders);
      return updatedOrder;
    }
    const response = await apiClient.put<FoodOrder>(`/food/orders/${id}/status`, { status });
    return response.data;
  },
};
