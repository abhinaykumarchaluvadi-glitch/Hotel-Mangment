import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsApi } from '../../api/bookings';
import { useAuth } from '../../store/AuthContext';
import { Card, CardContent, Table, TableHeader, TableBody, TableHead, TableRow, TableCell, Badge, Button } from '../../components/ui/core';
import { CalendarDays, Coffee } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Bookings: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['customer-bookings', user?.id],
    queryFn: () => bookingsApi.getAll(user?.id),
    enabled: !!user?.id,
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => bookingsApi.updateStatus(id, 'cancelled'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['rooms-catalog'] });
    },
  });

  const handleCancel = (id: string) => {
    if (confirm('Are you sure you want to cancel this booking?')) {
      cancelMutation.mutate(id);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'confirmed':
        return <Badge variant="default">Confirmed</Badge>;
      case 'checked_in':
        return <Badge variant="success">Checked In</Badge>;
      case 'checked_out':
        return <Badge variant="secondary">Checked Out</Badge>;
      case 'cancelled':
        return <Badge variant="error">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
              <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-2 border-primary animate-spin" />
              <p className="text-xs text-muted-foreground">Fetching your reservation history...</p>
            </div>
          ) : bookings.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Room</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Check-In</TableHead>
                    <TableHead>Check-Out</TableHead>
                    <TableHead>Total Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-semibold text-foreground">
                        Room {booking.room?.roomNumber || 'N/A'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {booking.room?.type || 'N/A'}
                      </TableCell>
                      <TableCell>{booking.checkIn}</TableCell>
                      <TableCell>{booking.checkOut}</TableCell>
                      <TableCell className="font-semibold text-primary">
                        ₹{booking.totalPrice}
                      </TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      <TableCell className="text-right flex items-center justify-end gap-2 h-14">
                        {booking.status === 'checked_in' && (
                          <Link to="/food-order">
                            <Button size="sm" className="bg-primary hover:bg-primary/95 text-xs text-primary-foreground font-semibold">
                              <Coffee className="w-3.5 h-3.5 mr-1" /> Order Food
                            </Button>
                          </Link>
                        )}
                        {(booking.status === 'confirmed' || booking.status === 'pending') && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleCancel(booking.id)}
                            isLoading={cancelMutation.isPending && cancelMutation.variables === booking.id}
                            className="text-xs"
                          >
                            Cancel
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <CalendarDays className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold font-serif">No Bookings Yet</h3>
                <p className="text-xs text-muted-foreground">
                  You haven't reserved any retreats yet. Browse our catalog and plan your stay.
                </p>
              </div>
              <Link to="/rooms">
                <Button size="sm">Browse Rooms</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
