'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/axios';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Shield } from 'lucide-react';

interface AdminUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: { _id: string; name: string; displayName: string } | string;
  isActive: boolean;
  createdAt: string;
}

interface Role {
  _id: string;
  name: string;
  displayName: string;
  permissions: Array<{ resource: string; actions: string[] }>;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  // User form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  // Role form
  const [roleName, setRoleName] = useState('');
  const [roleDisplayName, setRoleDisplayName] = useState('');
  const [rolePermissions, setRolePermissions] = useState<Array<{ resource: string; actions: string[] }>>([]);

  const resources = ['products', 'categories', 'attributes', 'orders', 'customers', 'imports', 'users', 'roles', 'settings', 'reports'];
  const actions = ['create', 'read', 'update', 'delete'];

  const getRoleName = (role: AdminUser['role']) => typeof role === 'string' ? role : role.name;
  const getRoleId = (role: AdminUser['role']) => typeof role === 'string' ? role : role._id;

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, rolesRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/roles'),
      ]);
      setUsers(usersRes.data.data || []);
      setRoles(rolesRes.data.data || []);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Search existing user by email to assign role
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResult, setSearchResult] = useState<AdminUser | null>(null);
  const [searching, setSearching] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignRoleId, setAssignRoleId] = useState('');

  const handleSearchUser = async () => {
    if (!searchEmail.trim()) return;
    setSearching(true);
    setSearchResult(null);
    try {
      const { data } = await api.get(`/admin/users/search?email=${encodeURIComponent(searchEmail.trim())}`);
      if (data.data) {
        setSearchResult(data.data);
        setAssignRoleId(getRoleId(data.data.role));
      } else {
        toast.error('No user found with this email');
      }
    } catch {
      toast.error('User not found');
    } finally {
      setSearching(false);
    }
  };

  const handleAssignRole = async () => {
    if (!searchResult || !assignRoleId) return;
    setSaving(true);
    try {
      await api.put(`/admin/users/${searchResult._id}`, { role: assignRoleId });
      toast.success(`Role assigned to ${searchResult.email}`);
      setShowAssignModal(false);
      setSearchEmail('');
      setSearchResult(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to assign role');
    } finally {
      setSaving(false);
    }
  };

  const openCreateUser = () => {
    setEditingUser(null);
    setFirstName('');
    setLastName('');
    setEmail('');
    setPassword('');
    setRoleId('');
    setIsActive(true);
    setShowUserModal(true);
  };

  const openEditUser = (user: AdminUser) => {
    setEditingUser(user);
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setEmail(user.email);
    setPassword('');
    setRoleId(getRoleId(user.role));
    setIsActive(user.isActive);
    setShowUserModal(true);
  };

  const handleSaveUser = async () => {
    if (!firstName || !lastName || !email) {
      toast.error('First name, last name, and email are required');
      return;
    }
    // Password only required for brand new users (not existing email)
    setSaving(true);
    try {
      const payload: any = { firstName, lastName, email, role: roleId, isActive };
      if (password) payload.password = password;

      if (editingUser) {
        await api.put(`/admin/users/${editingUser._id}`, payload);
        toast.success('User updated');
      } else {
        await api.post('/admin/users', payload);
        toast.success('User created');
      }
      setShowUserModal(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Delete this admin user?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('User deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete user');
    }
  };

  const openEditRole = (role: Role) => {
    setEditingRole(role);
    setRoleName(role.name);
    setRoleDisplayName(role.displayName);
    setRolePermissions(role.permissions.map((p) => ({ ...p })));
    setShowRoleModal(true);
  };

  const togglePermission = (resource: string, action: string) => {
    const updated = [...rolePermissions];
    const existing = updated.find((p) => p.resource === resource);
    if (existing) {
      if (existing.actions.includes(action)) {
        existing.actions = existing.actions.filter((a) => a !== action);
        if (existing.actions.length === 0) {
          const idx = updated.indexOf(existing);
          updated.splice(idx, 1);
        }
      } else {
        existing.actions.push(action);
      }
    } else {
      updated.push({ resource, actions: [action] });
    }
    setRolePermissions(updated);
  };

  const hasPermission = (resource: string, action: string) => {
    return rolePermissions.some((p) => p.resource === resource && p.actions.includes(action));
  };

  const handleSaveRole = async () => {
    setSaving(true);
    try {
      await api.put(`/admin/roles/${editingRole!._id}`, {
        displayName: roleDisplayName,
        permissions: rolePermissions,
      });
      toast.success('Role updated');
      setShowRoleModal(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save role');
    } finally {
      setSaving(false);
    }
  };

  const roleColor = (name: string) => {
    switch (name) {
      case 'super_admin': return 'danger';
      case 'admin': return 'warning';
      case 'manager': return 'info';
      default: return 'default';
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-steel-900">Users & Roles</h1>
          <p className="text-sm text-steel-500">Manage admin users and role permissions</p>
        </div>
        <Button size="sm" onClick={openCreateUser} leftIcon={<Plus className="h-4 w-4" />}>
          Add Admin User
        </Button>
      </div>

      {/* Assign Role to Existing User */}
      <div className="mt-6 rounded-xl bg-white border border-steel-100 p-5">
        <h2 className="text-base font-semibold text-steel-900 mb-3">Assign Role to Existing User</h2>
        <p className="text-xs text-steel-500 mb-3">Search by email to change a registered user's role</p>
        <div className="flex gap-2">
          <input
            type="email"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearchUser()}
            placeholder="Enter user email..."
            className="flex-1 rounded-lg border border-steel-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
          <Button size="sm" onClick={handleSearchUser} isLoading={searching}>Search</Button>
        </div>
        {searchResult && (
          <div className="mt-4 rounded-lg border border-brand-200 bg-brand-50/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-steel-900">{searchResult.firstName} {searchResult.lastName}</p>
                <p className="text-xs text-steel-500">{searchResult.email}</p>
                <p className="text-xs text-steel-400 mt-0.5">
                  Current role: <Badge variant={roleColor(getRoleName(searchResult.role)) as any}>{getRoleName(searchResult.role).replace('_', ' ')}</Badge>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={assignRoleId}
                  onChange={(e) => setAssignRoleId(e.target.value)}
                  className="rounded-lg border border-steel-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                >
                  <option value="">Select role</option>
                  {roles.map((r) => (
                    <option key={r._id} value={r._id}>{r.displayName}</option>
                  ))}
                </select>
                <Button size="sm" onClick={handleAssignRole} isLoading={saving} disabled={!assignRoleId}>
                  Assign
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Admin Users */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-steel-900 mb-3">Admin Users</h2>
        <div className="rounded-xl bg-white border border-steel-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-steel-50 text-left text-xs font-medium text-steel-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-steel-50">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-4 py-4"><div className="h-4 w-full animate-pulse rounded bg-steel-100" /></td></tr>
                ))
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-steel-50/50">
                    <td className="px-4 py-3 font-medium text-steel-900">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="px-4 py-3 text-steel-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant={roleColor(getRoleName(user.role)) as any}>
                        {getRoleName(user.role).replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={user.isActive ? 'success' : 'danger'}>
                        {user.isActive ? 'Active' : 'Disabled'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-steel-500 text-xs">
                      {new Date(user.createdAt).toLocaleDateString('en-AU')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEditUser(user)} className="rounded p-1.5 text-steel-400 hover:bg-brand-50 hover:text-brand-600">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDeleteUser(user._id)} className="rounded p-1.5 text-steel-400 hover:bg-red-50 hover:text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Roles */}
      {/* <div className="mt-8">
        <h2 className="text-lg font-semibold text-steel-900 mb-3">Roles & Permissions</h2>
        <div className="grid gap-4">
          {roles.map((role) => (
            <div key={role._id} className="rounded-xl bg-white border border-steel-100 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-brand-500" />
                  <div>
                    <h3 className="font-semibold text-steel-900">{role.displayName}</h3>
                    <p className="text-xs text-steel-500">{role.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-steel-500">
                    {role.permissions.reduce((sum, p) => sum + p.actions.length, 0)} permissions
                  </span>
                  {role.name !== 'super_admin' && (
                    <button onClick={() => openEditRole(role)} className="rounded p-1.5 text-steel-400 hover:bg-brand-50 hover:text-brand-600">
                      <Edit className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {role.permissions.map((p) =>
                  p.actions.map((a) => (
                    <span key={`${p.resource}-${a}`} className="px-2 py-0.5 rounded text-[10px] bg-steel-100 text-steel-600">
                      {p.resource}:{a}
                    </span>
                  ))
                )}
                {role.name === 'super_admin' && (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-brand-100 text-brand-700">ALL PERMISSIONS</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div> */}

      {/* User Modal */}
      <Modal isOpen={showUserModal} onClose={() => setShowUserModal(false)} title={editingUser ? 'Edit Admin User' : 'New Admin User'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            <Input label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </div>
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input
            label={editingUser ? 'New Password (leave blank to keep)' : 'Password (only for new users)'}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            helperText="Leave blank if user already has an account"
          />
          <div>
            <label className="block text-sm font-medium text-steel-700 mb-1">Role</label>
            <select
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              className="w-full rounded-lg border border-steel-300 bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
            >
              <option value="">Select role</option>
              {roles.map((r) => (
                <option key={r._id} value={r._id}>{r.displayName}</option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded" />
            Active
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowUserModal(false)}>Cancel</Button>
            <Button onClick={handleSaveUser} isLoading={saving}>{editingUser ? 'Update' : 'Create'}</Button>
          </div>
        </div>
      </Modal>

      {/* Role Permissions Modal */}
      <Modal isOpen={showRoleModal} onClose={() => setShowRoleModal(false)} title={`Edit Role: ${editingRole?.displayName}`} size="lg">
        <div className="space-y-4">
          <Input label="Display Name" value={roleDisplayName} onChange={(e) => setRoleDisplayName(e.target.value)} />
          <div>
            <label className="block text-sm font-medium text-steel-700 mb-2">Permission Matrix</label>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left py-2 pr-4 text-xs text-steel-500">Resource</th>
                    {actions.map((a) => (
                      <th key={a} className="px-3 py-2 text-xs text-steel-500 capitalize">{a}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {resources.map((resource) => (
                    <tr key={resource} className="border-t border-steel-100">
                      <td className="py-2 pr-4 font-medium text-steel-700 capitalize">{resource}</td>
                      {actions.map((action) => (
                        <td key={action} className="px-3 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={hasPermission(resource, action)}
                            onChange={() => togglePermission(resource, action)}
                            className="rounded"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowRoleModal(false)}>Cancel</Button>
            <Button onClick={handleSaveRole} isLoading={saving}>Save Permissions</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
