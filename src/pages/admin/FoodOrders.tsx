import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { foodApi } from '../../api/food';
import { Card, CardContent, Table, TableHeader, TableBody, TableHead, TableRow, TableCell, Badge, Button } from '../../components/ui/core';
import { ChefHat, Flame, Truck, CheckCircle2 } from 'lucide-react';

export const FoodOrders: React.FC = () => {
  const queryClient = useQueryClient();

  // Fetch all orders
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-food-orders'],
    queryFn: () => foodApi.getOrders(),
  });

  // Update order status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: any }) => 
      foodApi.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-food-orders'] });
    },
  });

  const handleUpdateStatus = (id: string, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Order Placed</Badge>;
      case 'preparing':
        return <Badge variant="default">In Kitchen</Badge>;
      case 'delivered':
        return <Badge variant="success">Delivered</Badge>;
      case 'cancelled':
        return <Badge variant="error">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Sort orders: show pending/preparing first
  const sortedOrders = [...orders].sort((a, b) => {
    const statusOrder: { [key: string]: number } = { pending: 0, preparing: 1, delivered: 2, cancelled: 3 };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
              <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-2 border-primary animate-spin" />
              <p className="text-xs text-muted-foreground">Syncing kitchen monitor...</p>
            </div>
          ) : sortedOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Room #</TableHead>
                    <TableHead>Items (Qty)</TableHead>
                    <TableHead>Billing Amount</TableHead>
                    <TableHead>Order Time</TableHead>
                    <TableHead>Kitchen Status</TableHead>
                    <TableHead className="text-right">Progress Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs font-semibold uppercase">
                        {order.id.slice(-6)}
                      </TableCell>
                      <TableCell className="font-bold text-foreground">
                        Room {order.roomNumber}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs space-y-0.5">
                          {order.items.map((it, idx) => (
                            <p key={idx} className="text-muted-foreground">
                              {it.name} <span className="font-bold text-foreground">&times; {it.quantity}</span>
                            </p>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-primary">
                        ₹{order.totalAmount}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2 h-14 items-center">
                          {order.status === 'pending' && (
                            <Button
                              size="sm"
                              className="bg-amber-600 hover:bg-amber-700 text-white text-xs"
                              onClick={() => handleUpdateStatus(order.id, 'preparing')}
                            >
                              <Flame className="w-3.5 h-3.5 mr-1" /> Start Cooking
                            </Button>
                          )}
                          {order.status === 'preparing' && (
                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                              onClick={() => handleUpdateStatus(order.id, 'delivered')}
                            >
                              <Truck className="w-3.5 h-3.5 mr-1" /> Send Delivery
                            </Button>
                          )}
                          {order.status !== 'delivered' && order.status !== 'cancelled' && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                            >
                              Reject
                            </Button>
                          )}
                          {order.status === 'delivered' && (
                            <span className="text-xs text-emerald-500 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" /> Served
                            </span>
                          )}
                          {order.status === 'cancelled' && (
                            <span className="text-xs text-destructive font-semibold">Cancelled</span>
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
                <ChefHat className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold font-serif">Kitchen Monitor Empty</h3>
                <p className="text-xs text-muted-foreground">Guest food service orders will display here in real-time.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
