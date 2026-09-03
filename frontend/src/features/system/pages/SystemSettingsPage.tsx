import React, { useState, useEffect } from 'react';
import { Card, CardHeader } from '../../../components/common/Card';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/client';
import { Save, CheckCircle2 } from 'lucide-react';

export const SystemSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [org, setOrg] = useState<any>(null);
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const [orgRes, setRes] = await Promise.all([api.get('/organization'), api.get('/settings')]);
        if (orgRes?.data?.success) setOrg(orgRes.data.data);
        if (setRes?.data?.success) setSettings(setRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/settings', { settings });
      if (org) {
        await api.put('/organization', org);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save settings.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">System & Institution Configuration</h1>
          <p className="text-xs text-slate-500">Manage institution branding, default grading criteria, and branch policies.</p>
        </div>
        {saved && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Settings Saved
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Organization Info */}
        {org && (
          <Card>
            <CardHeader title="Institution Profile" subtitle="Primary organizational identity" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Institution Name</label>
                <input
                  type="text"
                  value={org.name || ''}
                  onChange={(e) => setOrg({ ...org, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Official Email</label>
                <input
                  type="email"
                  value={org.email || ''}
                  onChange={(e) => setOrg({ ...org, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Contact</label>
                <input
                  type="text"
                  value={org.phone || ''}
                  onChange={(e) => setOrg({ ...org, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Website URL</label>
                <input
                  type="url"
                  value={org.website || ''}
                  onChange={(e) => setOrg({ ...org, website: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
                />
              </div>
            </div>
          </Card>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-[#73111b] hover:bg-[#5c0d15] text-xs font-bold text-white shadow-md shadow-[#73111b]/20 flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            <span>Save Configurations</span>
          </button>
        </div>
      </form>
    </div>
  );
};
