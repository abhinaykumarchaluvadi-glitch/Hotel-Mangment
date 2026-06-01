import React from 'react';
import { CreditCard, CheckCircle } from 'lucide-react';

export const Payments: React.FC = () => {
  const payments = [{ id: '1', date: '2026-06-01', description: 'Room Booking #1', amount: '$450', status: 'completed' }];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Payment History</h1>
      <div className="space-y-4">
        {payments.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-12 text-center"><CreditCard className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" /><p className="text-muted-foreground">No payments yet.</p></div>
        ) : (
          payments.map((payment) => (
            <div key={payment.id} className="bg-card border border-border rounded-lg p-6 flex justify-between items-center"><div><p className="text-sm text-muted-foreground">{payment.date}</p><p className="font-semibold text-foreground">{payment.description}</p></div><div className="flex items-center gap-4"><p className="text-xl font-bold text-primary">{payment.amount}</p><CheckCircle className="w-5 h-5 text-emerald-500" /></div></div>
          ))
        )}
      </div>
    </div>
  );
};
