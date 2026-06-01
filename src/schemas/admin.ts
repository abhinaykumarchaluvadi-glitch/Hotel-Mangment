import { z } from 'zod';

export const roomSchema = z.object({
  roomNumber: z.string().min(1, 'Room number is required'),
  type: z.string().min(1, 'Room type is required'),
  price: z.preprocess((val) => Number(val), z.number().positive('Price must be greater than 0')),
  status: z.enum(['available', 'occupied', 'maintenance']).default('available'),
  amenities: z.array(z.string()).min(1, 'Select at least one amenity'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  image: z.string().url('Please enter a valid image URL').or(z.string().min(1, 'Image is required')),
});

export type RoomFormData = z.infer<typeof roomSchema>;

export const foodItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  price: z.preprocess((val) => Number(val), z.number().positive('Price must be greater than 0')),
  category: z.enum(['breakfast', 'lunch', 'dinner', 'beverages', 'snacks']),
  isAvailable: z.boolean().default(true),
  image: z.string().url('Please enter a valid image URL').or(z.string().min(1, 'Image is required')),
});

export type FoodItemFormData = z.infer<typeof foodItemSchema>;
