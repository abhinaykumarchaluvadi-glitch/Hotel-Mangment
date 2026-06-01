import { z } from 'zod';

export const bookingSchema = z.object({
  roomId: z.string().min(1, 'Room is required'),
  checkIn: z.string().min(1, 'Check-in date is required'),
  checkOut: z.string().min(1, 'Check-out date is required'),
  paymentMethod: z.enum(['Credit Card', 'PayPal', 'Cash']).default('Credit Card'),
}).refine((data) => {
  const checkInDate = new Date(data.checkIn);
  const checkOutDate = new Date(data.checkOut);
  return checkOutDate > checkInDate;
}, {
  message: "Check-out date must be after check-in date",
  path: ['checkOut'],
});

export type BookingFormData = z.infer<typeof bookingSchema>;
