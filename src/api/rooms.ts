import { apiClient, isMockMode, mockDelay } from './client';
import { mockDb } from './mockDb';
import type { Room } from '../types';
import type { RoomFormData } from '../schemas/admin';

export const roomsApi = {
  getAll: async (): Promise<Room[]> => {
    if (isMockMode()) {
      await mockDelay(400);
      return mockDb.getRooms();
    }
    const response = await apiClient.get<Room[]>('/rooms');
    return response.data;
  },

  getById: async (id: string): Promise<Room> => {
    if (isMockMode()) {
      await mockDelay(200);
      const room = mockDb.getRooms().find((r) => r.id === id);
      if (!room) throw new Error('Room not found');
      return room;
    }
    const response = await apiClient.get<Room>(`/rooms/${id}`);
    return response.data;
  },

  create: async (data: RoomFormData): Promise<Room> => {
    if (isMockMode()) {
      await mockDelay(600);
      const rooms = mockDb.getRooms();
      
      const newRoom: Room = {
        id: `rm-${Date.now()}`,
        roomNumber: data.roomNumber,
        type: data.type,
        price: data.price,
        status: data.status,
        amenities: data.amenities,
        image: data.image,
        description: data.description,
      };

      mockDb.setRooms([...rooms, newRoom]);
      return newRoom;
    }

    const response = await apiClient.post<Room>('/rooms', data);
    return response.data;
  },

  update: async (id: string, data: Partial<RoomFormData>): Promise<Room> => {
    if (isMockMode()) {
      await mockDelay(500);
      const rooms = mockDb.getRooms();
      const index = rooms.findIndex((r) => r.id === id);
      if (index === -1) throw new Error('Room not found');

      const updatedRoom: Room = {
        ...rooms[index],
        ...data,
      } as Room;

      const newRooms = [...rooms];
      newRooms[index] = updatedRoom;
      mockDb.setRooms(newRooms);
      return updatedRoom;
    }

    const response = await apiClient.put<Room>(`/rooms/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    if (isMockMode()) {
      await mockDelay(400);
      const rooms = mockDb.getRooms();
      const filtered = rooms.filter((r) => r.id !== id);
      mockDb.setRooms(filtered);
      return;
    }

    await apiClient.delete(`/rooms/${id}`);
  },
};
