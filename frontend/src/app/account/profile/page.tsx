'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/axios';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import toast from 'react-hot-toast';
import { Save } from 'lucide-react';

export default function AccountProfilePage() {
  const { user, setUser } = useAuthStore();

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const handleUpdateProfile = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/auth/profile', { firstName, lastName, phone });
      setUser(data.data);
      toast.success('Profile updated');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setChangingPassword(true);
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white border border-steel-100 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-steel-900">Profile Information</h2>
          <div className="flex items-center gap-2">
            <Badge variant={user?.userType === 'trade' ? 'info' : 'default'}>
              {user?.userType}
            </Badge>
            {user?.isVerified && <Badge variant="success">Verified</Badge>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          <Input label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>
        <Input label="Email" value={user?.email || ''} disabled helperText="Email cannot be changed" />
        <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />

        {user?.userType === 'trade' && (
          <div className="grid grid-cols-2 gap-4">
            <Input label="Company" value={user?.company || ''} disabled />
            <Input label="ABN" value={user?.abn || ''} disabled />
          </div>
        )}

        <div className="flex justify-end">
          <Button onClick={handleUpdateProfile} isLoading={saving} leftIcon={<Save className="h-4 w-4" />}>
            Save Changes
          </Button>
        </div>
      </div>

      <div className="rounded-xl bg-white border border-steel-100 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-steel-900">Change Password</h2>
        <Input
          label="Current Password"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <div className="flex justify-end">
          <Button variant="outline" onClick={handleChangePassword} isLoading={changingPassword}>
            Change Password
          </Button>
        </div>
      </div>
    </div>
  );
}
