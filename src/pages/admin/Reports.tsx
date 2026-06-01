import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../../api/reports';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Table, TableHeader, TableBody, TableHead, TableRow, TableCell, Button } from '../../components/ui/core';
import { Printer, Download, Star, Percent, Calendar } from 'lucide-react';

export const Reports: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: reportsApi.getStats,
  });

  if (isLoading || !stats) {
    return (
      <div className="space-y-6 animate-pulse">
        <Card className="h-[200px] bg-muted" />
        <Card className="h-[300px] bg-muted" />
      </div>
    );
  }

  // Financial calculations
  // ADR (Average Daily Rate) = Room Revenue / Rooms Sold
  const roomsSold = stats.occupiedRooms || 1; // prevent divide by zero
  const estimatedRoomRevenue = stats.totalRevenue * 0.85; // assume food/amenities is 15%
  const adr = Math.round(estimatedRoomRevenue / roomsSold);

  // RevPAR (Revenue Per Available Room) = ADR * Occupancy Rate
  const revpar = Math.round(adr * (stats.occupancyRate / 100));

  const reportKpis = [
    { label: 'Average Daily Rate (ADR)', value: `₹${adr}`, icon: Star, desc: 'Average billing per occupied room' },
    { label: 'RevPAR', value: `₹${revpar}`, icon: Percent, desc: 'Revenue per available physical room' },
    { label: 'Total Stays Registered', value: stats.totalBookings, icon: Calendar, desc: 'Cumulative check-in count' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-4 rounded-xl border border-border">
        <div>
          <h2 className="text-xl font-bold font-serif">Operations Statement Audit</h2>
          <p className="text-xs text-muted-foreground">Comprehensive lodging metrics & cash statement summaries</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="w-3.5 h-3.5 mr-1" /> Print Report
          </Button>
          <Button size="sm" onClick={() => alert('Exporting XLS Data sheet...')}>
            <Download className="w-3.5 h-3.5 mr-1" /> Export Data
          </Button>
        </div>
      </div>

      {/* KPI stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reportKpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Card key={idx}>
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
                  <p className="text-3xl font-bold font-serif text-foreground">{kpi.value}</p>
                  <p className="text-[10px] text-muted-foreground">{kpi.desc}</p>
                </div>
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-primary">
                  <Icon className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Breakdowns table */}
      <Card>
        <CardHeader>
          <CardTitle>Physical Inventory Lodging Performance</CardTitle>
          <CardDescription>Performance index broken down by room specifications</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Specification Room Tier</TableHead>
                <TableHead>Total Keys</TableHead>
                <TableHead>Active Stays</TableHead>
                <TableHead>Offline (Maintenance)</TableHead>
                <TableHead>Occupancy Ratio</TableHead>
                <TableHead>Tier Earnings Contribution</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-semibold">Single Standard</TableCell>
                <TableCell>{stats.totalRooms > 2 ? 2 : 1}</TableCell>
                <TableCell>{stats.occupiedRooms > 1 ? 1 : 0}</TableCell>
                <TableCell>0</TableCell>
                <TableCell>50%</TableCell>
                <TableCell className="font-semibold text-emerald-600 dark:text-emerald-400">18.5%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">Double Deluxe</TableCell>
                <TableCell>2</TableCell>
                <TableCell>1</TableCell>
                <TableCell>0</TableCell>
                <TableCell>50%</TableCell>
                <TableCell className="font-semibold text-emerald-600 dark:text-emerald-400">32.0%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">Executive Suite</TableCell>
                <TableCell>1</TableCell>
                <TableCell>1</TableCell>
                <TableCell>0</TableCell>
                <TableCell>100%</TableCell>
                <TableCell className="font-semibold text-emerald-600 dark:text-emerald-400">49.5%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">Presidential Suite</TableCell>
                <TableCell>1</TableCell>
                <TableCell>0</TableCell>
                <TableCell>1</TableCell>
                <TableCell>0%</TableCell>
                <TableCell className="font-semibold text-muted-foreground italic">0.0% (Maintenance)</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
