import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { foodApi } from '../../api/food';
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
import { Plus, Edit, Trash2, Coffee } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { foodItemSchema } from '../../schemas/admin';
import type { FoodItemFormData } from '../../schemas/admin';
import type { FoodItem } from '../../types';

export const FoodMenu: React.FC = () => {
  const queryClient = useQueryClient();
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch Menu
  const { data: menu = [], isLoading } = useQuery({
    queryKey: ['admin-food-menu'],
    queryFn: foodApi.getMenu,
  });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FoodItemFormData>({
    resolver: zodResolver(foodItemSchema),
    defaultValues: {
      isAvailable: true,
      category: 'breakfast',
    }
  });

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: foodApi.createItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-food-menu'] });
      setIsDialogOpen(false);
      reset();
    },
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FoodItemFormData }) => foodApi.updateItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-food-menu'] });
      setIsDialogOpen(false);
      setEditingItem(null);
      reset();
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: foodApi.deleteItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-food-menu'] });
    },
  });

  const handleOpenAddDialog = () => {
    setEditingItem(null);
    reset({
      name: '',
      description: '',
      price: 15,
      category: 'breakfast',
      isAvailable: true,
      image: '',
    });
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (item: FoodItem) => {
    setEditingItem(item);
    reset({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      isAvailable: item.isAvailable,
      image: item.image,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this menu item from room service records?')) {
      deleteMutation.mutate(id);
    }
  };

  const onSubmit = (data: FoodItemFormData) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold font-serif">Room Service Gastronomy</h2>
        <Button onClick={handleOpenAddDialog}>
          <Plus className="w-4 h-4 mr-2" /> Add Menu Item
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
              <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-2 border-primary animate-spin" />
              <p className="text-xs text-muted-foreground">Loading menu recipes...</p>
            </div>
          ) : menu.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Preview</TableHead>
                    <TableHead>Dish Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Available</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {menu.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-12 h-10 object-cover rounded border border-border"
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-semibold">{item.name}</p>
                          <p className="text-[10px] text-muted-foreground line-clamp-1">{item.description}</p>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize text-xs text-muted-foreground">{item.category}</TableCell>
                      <TableCell className="font-semibold text-primary">₹{item.price}</TableCell>
                      <TableCell>
                        {item.isAvailable ? (
                          <Badge variant="success">Available</Badge>
                        ) : (
                          <Badge variant="error">Sold Out</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditDialog(item)}
                            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
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
                <Coffee className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold font-serif">Menu Empty</h3>
                <p className="text-xs text-muted-foreground">Add gourmet dishes to initialize room service.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogHeader>
          <DialogTitle>{editingItem ? 'Edit Culinary Recipe' : 'Add New Culinary Recipe'}</DialogTitle>
          <DialogDescription>
            {editingItem ? 'Amend pricing, description, or status logs.' : 'Fill details to add to Room Service.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Dish Name</label>
              <Input
                type="text"
                placeholder="Avocado Toast"
                error={errors.name?.message}
                {...register('name')}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Price (₹)</label>
              <Input
                type="number"
                placeholder="15"
                error={errors.price?.message}
                {...register('price')}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Meal Category</label>
              <select
                {...register('category')}
                className="w-full h-10 px-3 py-2 bg-card border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="beverages">Beverages</option>
                <option value="snacks">Snacks</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Kitchen Availability</label>
              <select
                onChange={(e) => setValue('isAvailable', e.target.value === 'true')}
                defaultValue={editingItem?.isAvailable ? 'true' : 'false'}
                className="w-full h-10 px-3 py-2 bg-card border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="true">In Stock / Available</option>
                <option value="false">Sold Out / Disabled</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Image URL</label>
            <Input
              type="text"
              placeholder="https://images.unsplash.com/..."
              error={errors.image?.message}
              {...register('image')}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Gourmet Description</label>
            <Textarea
              placeholder="E.g., Crushed avocados with baby heirloom tomatoes..."
              error={errors.description?.message}
              {...register('description')}
            />
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-border/40">
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={editingItem ? updateMutation.isPending : createMutation.isPending}>
              {editingItem ? 'Save Recipe' : 'Add Recipe'}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
