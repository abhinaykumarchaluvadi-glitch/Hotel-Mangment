import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roomsApi } from '../../api/rooms';
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
  Button,
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Input,
  Textarea
} from '../../components/ui/core';
import { Plus, Edit, Trash2, BedDouble } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { roomSchema } from '../../schemas/admin';
import type { RoomFormData } from '../../schemas/admin';
import type { Room } from '../../types';

export const ManageRooms: React.FC = () => {
  const queryClient = useQueryClient();
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch Rooms
  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ['admin-rooms'],
    queryFn: roomsApi.getAll,
  });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<RoomFormData>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      status: 'available',
      amenities: ['WiFi'],
    }
  });

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: roomsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rooms'] });
      setIsDialogOpen(false);
      reset();
    },
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: RoomFormData }) => roomsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rooms'] });
      setIsDialogOpen(false);
      setEditingRoom(null);
      reset();
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: roomsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rooms'] });
    },
  });

  const handleOpenAddDialog = () => {
    setEditingRoom(null);
    reset({
      roomNumber: '',
      type: 'Single Standard',
      price: 100,
      status: 'available',
      amenities: ['WiFi'],
      description: '',
      image: '',
    });
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (room: Room) => {
    setEditingRoom(room);
    reset({
      roomNumber: room.roomNumber,
      type: room.type,
      price: room.price,
      status: room.status,
      amenities: room.amenities,
      description: room.description,
      image: room.image,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this room? This action is irreversible.')) {
      deleteMutation.mutate(id);
    }
  };

  const onSubmit = (data: RoomFormData) => {
    if (editingRoom) {
      updateMutation.mutate({ id: editingRoom.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge variant="success">Available</Badge>;
      case 'occupied':
        return <Badge variant="error">Occupied</Badge>;
      case 'maintenance':
        return <Badge variant="warning">Maintenance</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold font-serif">Room Inventory</h2>
        <Button onClick={handleOpenAddDialog}>
          <Plus className="w-4 h-4 mr-2" /> Add New Room
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
              <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-2 border-primary animate-spin" />
              <p className="text-xs text-muted-foreground">Loading room catalogs...</p>
            </div>
          ) : rooms.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Preview</TableHead>
                    <TableHead>Room #</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Price / Night</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amenities</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rooms.map((room) => (
                    <TableRow key={room.id}>
                      <TableCell>
                        <img 
                          src={room.image} 
                          alt={room.type} 
                          className="w-12 h-10 object-cover rounded border border-border"
                        />
                      </TableCell>
                      <TableCell className="font-semibold">{room.roomNumber}</TableCell>
                      <TableCell className="text-muted-foreground">{room.type}</TableCell>
                      <TableCell className="font-semibold text-primary">₹{room.price}</TableCell>
                      <TableCell>{getStatusBadge(room.status)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {room.amenities.slice(0, 3).map((a) => (
                            <span key={a} className="px-1.5 py-0.5 text-[9px] bg-muted border border-border/50 text-muted-foreground rounded">
                              {a}
                            </span>
                          ))}
                          {room.amenities.length > 3 && (
                            <span className="px-1.5 py-0.5 text-[9px] bg-primary/10 text-primary font-bold rounded">
                              +{room.amenities.length - 3} more
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditDialog(room)}
                            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(room.id)}
                            className="p-1.5 rounded hover:bg-destructive/10 text-destructive transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
                <BedDouble className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold font-serif">No Rooms In Inventory</h3>
                <p className="text-xs text-muted-foreground">Add rooms to populate the system hotel records.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogHeader>
          <DialogTitle>{editingRoom ? 'Update Room Details' : 'Create New Room Record'}</DialogTitle>
          <DialogDescription>
            {editingRoom ? 'Modify fields to save inventory logs.' : 'Populate all specs to list a new suite option.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Room Number</label>
              <Input
                type="text"
                placeholder="101"
                error={errors.roomNumber?.message}
                {...register('roomNumber')}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Price / Night</label>
              <Input
                type="number"
                placeholder="150"
                error={errors.price?.message}
                {...register('price')}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Room Type</label>
              <select
                {...register('type')}
                className="w-full h-10 px-3 py-2 bg-card border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="Single Standard">Single Standard</option>
                <option value="Double Deluxe">Double Deluxe</option>
                <option value="Executive Suite">Executive Suite</option>
                <option value="Presidential Suite">Presidential Suite</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</label>
              <select
                {...register('status')}
                className="w-full h-10 px-3 py-2 bg-card border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Amenities (comma separated)</label>
            <input
              type="text"
              placeholder="WiFi, TV, AC, Mini Bar"
              onChange={(e) => {
                const arr = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                setValue('amenities', arr);
              }}
              defaultValue={editingRoom?.amenities.join(', ') || 'WiFi, TV, AC'}
              className="flex h-10 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            {errors.amenities && <p className="text-xs text-destructive">{errors.amenities.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Room Image URL</label>
            <Input
              type="text"
              placeholder="https://images.unsplash.com/..."
              error={errors.image?.message}
              {...register('image')}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Description</label>
            <Textarea
              placeholder="Provide a luxurious and detailed description..."
              error={errors.description?.message}
              {...register('description')}
            />
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-border/40">
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={editingRoom ? updateMutation.isPending : createMutation.isPending}>
              {editingRoom ? 'Update Room' : 'Add Room'}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
