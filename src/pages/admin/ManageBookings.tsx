import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsApi } from '../../api/bookings';
import { 
  Card, 
  CardContent, 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell, 
  Badge, 
  Button 
} from '../../components/ui/core';
import { CalendarRange, Search, SlidersHorizontal } from 'lucide-react';

export const ManageBookings: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  // Fetch all bookings
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: () => bookingsApi.getAll(),
  });

  // Update booking status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: any }) => 
      bookingsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-rooms'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });

  const handleCheckIn = (id: string) => {
    updateStatusMutation.mutate({ id, status: 'checked_in' });
  };

  const handleCheckOut = (id: string) => {
    updateStatusMutation.mutate({ id, status: 'checked_out' });
  };

  const handleCancel = (id: string) => {
    if (confirm('Cancel this guest reservation?')) {
      updateStatusMutation.mutate({ id, status: 'cancelled' });
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

  // Filter Logic
  const filteredBookings = bookings.filter((b) => {
    const guestName = b.user?.name || '';
    const guestEmail = b.user?.email || '';
    const roomNo = b.room?.roomNumber || '';

    const matchesSearch = 
      guestName.toLowerCase().includes(search.toLowerCase()) ||
      guestEmail.toLowerCase().includes(search.toLowerCase()) ||
      roomNo.includes(search);

    const matchesFilter = filterStatus === 'All' || b.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Filters header */}
      <div className="p-4 bg-card rounded-xl border border-border flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search guest name, email, room..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-lg bg-muted/50 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/45"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-3 w-full md:w-auto items-center justify-end">
          <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status:</span>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-10 px-3 py-1 text-sm bg-card border border-border rounded-lg text-foreground focus:outline-none"
          >
            <option value="All">All Bookings</option>
            <option value="confirmed">Confirmed</option>
            <option value="checked_in">Checked In</option>
            <option value="checked_out">Checked Out</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
              <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-2 border-primary animate-spin" />
              <p className="text-xs text-muted-foreground">Loading booking statements...</p>
            </div>
          ) : filteredBookings.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Guest Detail</TableHead>
                    <TableHead>Room #</TableHead>
                    <TableHead>Stay Dates</TableHead>
                    <TableHead>Total Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell>
                        <div>
                          <p className="font-semibold text-foreground">{b.user?.name || 'Loading Guest'}</p>
                          <p className="text-xs text-muted-foreground">{b.user?.email || 'N/A'}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-semibold">Room {b.room?.roomNumber}</p>
                          <p className="text-xs text-muted-foreground">{b.room?.type}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <p><span className="text-muted-foreground">In:</span> {b.checkIn}</p>
                          <p><span className="text-muted-foreground">Out:</span> {b.checkOut}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-primary">₹{b.totalPrice}</TableCell>
                      <TableCell>{getStatusBadge(b.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2 h-14 items-center">
                          {b.status === 'confirmed' && (
                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 text-xs text-white"
                              onClick={() => handleCheckIn(b.id)}
                            >
                              Check In
                            </Button>
                          )}
                          {b.status === 'checked_in' && (
                            <Button
                              size="sm"
                              className="bg-indigo-600 hover:bg-indigo-700 text-xs text-white"
                              onClick={() => handleCheckOut(b.id)}
                            >
                              Check Out
                            </Button>
                          )}
                          {(b.status === 'confirmed' || b.status === 'pending') && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleCancel(b.id)}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <CalendarRange className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold font-serif">No Reservations Located</h3>
                <p className="text-xs text-muted-foreground">Modify search query filters or wait for guest registrations.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
