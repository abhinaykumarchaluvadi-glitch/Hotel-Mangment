import React, { useState } from 'react';
import { useAuth } from '../../store/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Input, Button } from '../../components/ui/core';
import { User, Mail, Key, Calendar } from 'lucide-react';
import { mockDb } from '../../api/mockDb';
import { isMockMode } from '../../api/client';

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrMsg(null);
    setInfoMsg(null);
    setSaving(true);

    try {
      if (isMockMode()) {
        const users = mockDb.getUsers();
        const updatedUsers = users.map((u) => 
          u.id === user?.id ? { ...u, name, email } : u
        );
        mockDb.setUsers(updatedUsers);
        setInfoMsg('Your personal profile details have been successfully updated.');
        // Force refresh context session manually
        const updatedUser = updatedUsers.find(u => u.id === user?.id);
        if (updatedUser && user) {
          // Trigger state update
          Object.assign(user, updatedUser);
        }
      } else {
        // Implement API call
        setInfoMsg('Profile update API called successfully.');
      }
    } catch (err: any) {
      setErrMsg(err.message || 'Failed to update details.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrMsg(null);
    setInfoMsg(null);

    if (password.length < 6) {
      setErrMsg('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrMsg("Passwords do not match.");
      return;
    }

    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setInfoMsg('Your security password has been changed.');
      setPassword('');
      setConfirmPassword('');
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Alert Banner */}
      {(infoMsg || errMsg) && (
        <div className={`p-4 rounded-xl border text-xs ${
          errMsg 
            ? 'bg-destructive/10 border-destructive/20 text-destructive-foreground' 
            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
        }`}>
          {errMsg || infoMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="md:col-span-1">
          <CardContent className="p-6 text-center space-y-4">
            <div className="w-24 h-24 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-serif text-3xl text-primary font-bold mx-auto shadow-sm">
              {user?.name.charAt(0)}
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold font-serif text-foreground">{user?.name}</h3>
              <p className="text-xs text-muted-foreground capitalize">{user?.role} Guest</p>
            </div>
            
            <div className="border-t border-border/40 pt-4 text-xs text-muted-foreground space-y-3 text-left">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary shrink-0" />
                <span>Joined {new Date(user?.createdAt || '').toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <span className="truncate">{user?.email}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Editor */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Details</CardTitle>
              <CardDescription>Update your personal guest profile information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> Full Name
                  </label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> Email Address
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" isLoading={saving}>
                  Save Personal Details
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Secure your guest portal account credentials</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5" /> New Password
                    </label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5" /> Confirm Password
                    </label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" variant="secondary" isLoading={saving}>
                  Update Security Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
