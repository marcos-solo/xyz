import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/common/Modal';
import api from '../../../api/client';
import type { Role, PermissionGroup } from '../../../types/models';

interface RoleEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  roleToEdit?: Role | null;
  onSuccess: () => void;
}

export const RoleEditorModal: React.FC<RoleEditorModalProps> = ({
  isOpen,
  onClose,
  roleToEdit,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setError('');
      api.get('/permissions').then((res) => {
        setPermissionGroups(res.data.data || []);
      });

      if (roleToEdit) {
        setName(roleToEdit.name);
        setDisplayName(roleToEdit.display_name);
        setDescription(roleToEdit.description || '');
        setSelectedPermissions(roleToEdit.permissions || []);
      } else {
        setName('');
        setDisplayName('');
        setDescription('');
        setSelectedPermissions([]);
      }
    }
  }, [isOpen, roleToEdit]);

  const handleTogglePermission = (permName: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permName) ? prev.filter((p) => p !== permName) : [...prev, permName]
    );
  };

  const handleToggleGroup = (groupPerms: string[]) => {
    const allChecked = groupPerms.every((p) => selectedPermissions.includes(p));
    if (allChecked) {
      setSelectedPermissions((prev) => prev.filter((p) => !groupPerms.includes(p)));
    } else {
      setSelectedPermissions((prev) => Array.from(new Set([...prev, ...groupPerms])));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (roleToEdit) {
        await api.put(`/roles/${roleToEdit.uuid}`, {
          name,
          display_name: displayName,
          description,
          permissions: selectedPermissions,
        });
      } else {
        await api.post('/roles', {
          name,
          display_name: displayName,
          description,
          permissions: selectedPermissions,
        });
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save role.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={roleToEdit ? `Edit Role: ${roleToEdit.display_name}` : 'Create New Custom Role'}
      subtitle="Granular RBAC Permission Matrix Configuration"
      maxWidth="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">System Role Identifier *</label>
            <input
              type="text"
              required
              disabled={roleToEdit?.is_system_protected}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Regional Training Coordinator"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b] disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Display Name *</label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Regional Training Coordinator"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Operational scope of this custom role..."
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
          />
        </div>

        {/* Permission Matrix Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Permission Matrix ({selectedPermissions.length} selected)
            </h4>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
            {permissionGroups.map((group) => {
              const groupPermNames = group.permissions.map((p) => p.name);
              const allChecked = groupPermNames.every((p) => selectedPermissions.includes(p));

              return (
                <div key={group.group} className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
                    <span className="text-xs font-bold text-[#73111b]">{group.group}</span>
                    <button
                      type="button"
                      onClick={() => handleToggleGroup(groupPermNames)}
                      className="text-[11px] font-bold text-slate-500 hover:text-slate-900"
                    >
                      {allChecked ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {group.permissions.map((perm) => {
                      const isChecked = selectedPermissions.includes(perm.name);
                      return (
                        <div
                          key={perm.name}
                          onClick={() => handleTogglePermission(perm.name)}
                          className={`p-2.5 rounded-xl border text-left cursor-pointer transition flex items-start gap-2.5 ${
                            isChecked
                              ? 'bg-[#fff1f2] border-[#fecdd3]'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="mt-0.5 rounded border-slate-300 text-[#73111b] focus:ring-[#73111b]"
                          />
                          <div>
                            <p className="text-xs font-bold text-slate-900">{perm.display_name}</p>
                            <p className="text-[10px] text-slate-500 font-mono">{perm.name}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || selectedPermissions.length === 0}
            className="px-6 py-2.5 rounded-xl bg-[#73111b] hover:bg-[#5c0d15] text-xs font-bold text-white shadow-md shadow-[#73111b]/20 disabled:opacity-50"
          >
            {loading ? 'Saving Role...' : 'Save Role Permissions'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
