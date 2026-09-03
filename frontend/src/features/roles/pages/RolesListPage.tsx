import React, { useState, useEffect } from 'react';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';
import { RoleEditorModal } from '../components/RoleEditorModal';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/client';
import { ShieldCheck, Plus, Copy, Edit2, Trash2, Users } from 'lucide-react';
import type { Role } from '../../../types/models';

export const RolesListPage: React.FC = () => {
  const { hasPermission } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await api.get('/roles');
      if (res.data.success) {
        setRoles(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load roles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleDuplicate = async (role: Role) => {
    const newName = prompt(`Enter name for duplicated role:`, `${role.name} Copy`);
    if (!newName) return;

    try {
      await api.post(`/roles/${role.uuid}/duplicate`, {
        name: newName,
        display_name: newName,
      });
      fetchRoles();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to duplicate role.');
    }
  };

  const handleDelete = async (role: Role) => {
    if (!confirm(`Are you sure you want to delete role "${role.display_name}"?`)) return;

    try {
      await api.delete(`/roles/${role.uuid}`);
      fetchRoles();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete role.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Dynamic Roles & Access Control</h1>
          <p className="text-xs text-slate-500">
            Create arbitrary organizational roles and configure granular permissions without developer code changes.
          </p>
        </div>
        {hasPermission('roles.create') && (
          <button
            onClick={() => {
              setSelectedRole(null);
              setEditorOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-[#73111b] hover:bg-[#5c0d15] text-xs font-bold text-white shadow-md shadow-[#73111b]/20 flex items-center gap-2 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Create Custom Role</span>
          </button>
        )}
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-16 text-center text-xs text-slate-400">
            Loading dynamic role hierarchy...
          </div>
        ) : (
          roles.map((role) => (
            <Card key={role.uuid} className="flex flex-col justify-between hover:border-slate-300 transition">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-[#fff1f2] border border-[#fecdd3] flex items-center justify-center text-[#73111b]">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{role.display_name}</h3>
                      <span className="text-[10px] font-mono text-slate-500 font-medium">{role.name}</span>
                    </div>
                  </div>
                  {role.is_system_protected && <Badge variant="warning">System</Badge>}
                </div>

                <p className="text-xs text-slate-500 mt-3 line-clamp-2 min-h-[32px]">
                  {role.description || 'Custom organizational permission bundle.'}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-slate-400" />
                    <span>{role.users_count || 0} Users</span>
                  </span>
                  <span className="font-bold text-[#73111b]">
                    {role.permissions_count || role.permissions?.length || 0} Permissions
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleDuplicate(role)}
                  title="Duplicate Role"
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => {
                    setSelectedRole(role);
                    setEditorOpen(true);
                  }}
                  title="Edit Permissions"
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-[#73111b] hover:bg-[#fff1f2] transition"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                {!role.is_system_protected && (
                  <button
                    onClick={() => handleDelete(role)}
                    title="Delete Role"
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      <RoleEditorModal
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        roleToEdit={selectedRole}
        onSuccess={fetchRoles}
      />
    </div>
  );
};
