import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { paymentsApi } from '../../api/payments';
import { bookingsApi } from '../../api/bookings';
import { useAuth } from '../../store/AuthContext';
import { Card, CardContent, Table, TableHeader, TableBody, TableHead, TableRow, TableCell, Badge } from '../../components/ui/core';
import { Receipt, Download } from 'lucide-react';

export const Payments: React.FC = () => {
  const { user } = useAuth();

  // Fetch customer bookings
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['customer-bookings', user?.id],
    queryFn: () => bookingsApi.getAll(user?.id),
    enabled: !!user?.id,
  });

  // Fetch all payments
  const { data: payments = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ['customer-payments'],
    queryFn: paymentsApi.getAll,
  });

  // Filter payments that match current customer bookings
  const customerBookingIds = bookings.map((b) => b.id);
  const customerPayments = payments.filter((p) => customerBookingIds.includes(p.bookingId));

  const isLoading = bookingsLoading || paymentsLoading;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="success">Paid</Badge>;
      case 'failed':
        return <Badge variant="error">Failed</Badge>;
      case 'refunded':
        return <Badge variant="warning">Refunded</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getBookingDetails = (bookingId: string) => {
    const bkg = bookings.find((b) => b.id === bookingId);
    if (!bkg) return 'N/A';
    return `Room ${bkg.room?.roomNumber || 'N/A'} (${bkg.checkIn} to ${bkg.checkOut})`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
              <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-2 border-primary animate-spin" />
              <p className="text-xs text-muted-foreground">Compiling invoice records...</p>
            </div>
          ) : customerPayments.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Reservation Details</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Processed Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Invoice</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-mono text-xs text-foreground uppercase">
                        {payment.transactionId}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {getBookingDetails(payment.bookingId)}
                      </TableCell>
                      <TableCell className="text-xs text-foreground">
                        {payment.method}
                      </TableCell>
                      <TableCell className="text-xs">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-semibold text-primary">
                        ₹{payment.amount}
                      </TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell className="text-right">
                        <button
                          onClick={() => alert(`Downloading Invoice: ${payment.transactionId}.pdf`)}
                          className="inline-flex items-center text-xs font-semibold text-primary hover:underline gap-1"
                        >
                          <Download className="w-3.5 h-3.5" /> PDF
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Receipt className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold font-serif">No Invoices Yet</h3>
                <p className="text-xs text-muted-foreground">
                  You do not have any transaction billing history. Book a room to initiate a statement invoice.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
