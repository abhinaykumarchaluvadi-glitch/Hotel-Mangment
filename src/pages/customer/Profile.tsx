import React, { useState } from 'react';
import { useAuth } from '../../store/AuthContext';
import { User, Mail, Phone, MapPin } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing] = useState(false);
  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
      <div className="bg-card border border-border rounded-lg p-8 space-y-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center"><span className="text-3xl font-bold text-primary">{user?.name.charAt(0)}</span></div>
          <div><p className="text-2xl font-bold text-foreground">{user?.name}</p><p className="text-sm text-muted-foreground capitalize">{user?.role}</p></div>
        </div>
        <div className="space-y-4 border-t border-border pt-6">
          <div className="flex items-center gap-3"><Mail className="w-5 h-5 text-primary" /><div><p className="text-xs text-muted-foreground">Email</p><p className="font-semibold text-foreground">{user?.email}</p></div></div>
          <div className="flex items-center gap-3"><Phone className="w-5 h-5 text-primary" /><div><p className="text-xs text-muted-foreground">Phone</p><p className="font-semibold text-foreground">{user?.phone || 'Not provided'}</p></div></div>
          <div className="flex items-center gap-3"><MapPin className="w-5 h-5 text-primary" /><div><p className="text-xs text-muted-foreground">Address</p><p className="font-semibold text-foreground">{user?.address || 'Not provided'}</p></div></div>
        </div>
      </div>
    </div>
  );
};
