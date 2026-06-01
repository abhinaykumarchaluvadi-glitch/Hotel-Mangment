import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsApi } from '../../api/payments';
import { Card, CardContent, Table, TableHeader, TableBody, TableHead, TableRow, TableCell, Badge, Button } from '../../components/ui/core';
import { Receipt, Coins } from 'lucide-react';

export const ManagePayments: React.FC = () => {
  const queryClient = useQueryClient();

  // Fetch Payments
  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: paymentsApi.getAll,
  });

  // Refund Mutation (admin controls)
  const refundMutation = useMutation({
    mutationFn: (id: string) => paymentsApi.updateStatus(id, 'refunded'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });

  const handleRefund = (id: string) => {
    if (confirm('Issue a total financial refund for this transaction?')) {
      refundMutation.mutate(id);
    }
  };

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

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
              <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-2 border-primary animate-spin" />
              <p className="text-xs text-muted-foreground">Compiling ledger statements...</p>
            </div>
          ) : payments.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction Reference</TableHead>
                    <TableHead>Booking Reference</TableHead>
                    <TableHead>Billing Method</TableHead>
                    <TableHead>Received Date</TableHead>
                    <TableHead>Invoice Sum</TableHead>
                    <TableHead>Ledger Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-mono text-xs font-semibold uppercase text-foreground">
                        {payment.transactionId}
                      </TableCell>
                      <TableCell className="font-mono text-xs uppercase text-muted-foreground">
                        {payment.bookingId}
                      </TableCell>
                      <TableCell className="text-xs">{payment.method}</TableCell>
                      <TableCell className="text-xs">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-semibold text-primary">
                        ₹{payment.amount}
                      </TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell className="text-right">
                        {payment.status === 'paid' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRefund(payment.id)}
                            isLoading={refundMutation.isPending && refundMutation.variables === payment.id}
                            className="text-xs font-semibold"
                          >
                            <Coins className="w-3.5 h-3.5 mr-1" /> Issue Refund
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">No Actions</span>
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
                <Receipt className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold font-serif">Ledger Empty</h3>
                <p className="text-xs text-muted-foreground">Financial payment invoices will capture here.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
