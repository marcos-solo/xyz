import React, { useState, useEffect } from 'react';
import { Card } from '../../../components/common/Card';
import { Pagination } from '../../../components/common/Pagination';
import { Modal } from '../../../components/common/Modal';
import api from '../../../api/client';
import { RotateCcw } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('');
  const [entityType, setEntityType] = useState('');
  const [entityId, setEntityId] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/audit-logs', { params: { page, search: search || undefined, action: action || undefined, entity_type: entityType || undefined, entity_id: entityId || undefined, from_date: fromDate || undefined, to_date: toDate || undefined } });
      if (res.data.success) {
        setLogs(res.data.data);
        if (res.data.meta) setPagination(res.data.meta);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, search, action, entityType, entityId, fromDate, toDate]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Administrative Audit Trail</h1>
        <p className="text-xs text-slate-500">Complete immutable record of critical mutations, logins, grading, and certificate issuances.</p>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-slate-100"><div className="grid grid-cols-1 sm:grid-cols-7 gap-3"><input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search actor, action, entity, IP" className="sm:col-span-2 w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs" /><input value={action} onChange={(e) => { setAction(e.target.value); setPage(1); }} placeholder="Action" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs" /><input value={entityType} onChange={(e) => { setEntityType(e.target.value); setPage(1); }} placeholder="Entity type" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs" /><input value={entityId} onChange={(e) => { setEntityId(e.target.value); setPage(1); }} placeholder="Entity ID" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs" /><input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(1); }} aria-label="From date" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs" /><div className="flex gap-2"><input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(1); }} aria-label="To date" className="min-w-0 w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs" /><button onClick={() => { setSearch(''); setAction(''); setEntityType(''); setEntityId(''); setFromDate(''); setToDate(''); setPage(1); }} title="Clear filters" className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100"><RotateCcw className="h-4 w-4" /></button></div></div></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/70 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Operator</th>
                <th className="py-3.5 px-4">Target Entity</th>
                <th className="py-3.5 px-4">IP Address</th>
                <th className="py-3.5 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr><td colSpan={5} className="py-10 text-center text-slate-400">Loading audit trail...</td></tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono font-bold text-[#73111b]">{log.action}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{log.user?.full_name || 'System Operator'}</td>
                    <td className="py-3 px-4 text-slate-600 font-medium">{log.entity_type ? log.entity_type.split('\\').pop() : 'System'} #{log.entity_id || ''}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{log.ip_address || '127.0.0.1'}</td>
                    <td className="py-3 px-4 text-slate-500"><button onClick={() => setSelectedLog(log)} className="text-left hover:text-[#73111b]">{new Date(log.created_at).toLocaleString()}</button></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-100">
          <Pagination
            currentPage={pagination.current_page}
            lastPage={pagination.last_page}
            total={pagination.total}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      </Card>
      <Modal isOpen={Boolean(selectedLog)} onClose={() => setSelectedLog(null)} title="Audit Record Details">
        {selectedLog && <div className="space-y-4 text-xs"><div className="grid grid-cols-2 gap-3"><div><span className="text-slate-400">Action</span><p className="font-bold text-slate-900">{selectedLog.action}</p></div><div><span className="text-slate-400">Operator</span><p className="font-bold text-slate-900">{selectedLog.user?.full_name || 'System Operator'}</p></div><div><span className="text-slate-400">Entity</span><p className="font-medium text-slate-800">{selectedLog.entity_type} #{selectedLog.entity_id}</p></div><div><span className="text-slate-400">IP address</span><p className="font-mono text-slate-800">{selectedLog.ip_address || 'Unavailable'}</p></div></div><div><p className="font-bold text-slate-700 mb-1">Previous values</p><pre className="max-h-40 overflow-auto rounded-xl bg-slate-50 p-3 text-[11px]">{JSON.stringify(selectedLog.old_values || {}, null, 2)}</pre></div><div><p className="font-bold text-slate-700 mb-1">New values</p><pre className="max-h-40 overflow-auto rounded-xl bg-slate-50 p-3 text-[11px]">{JSON.stringify(selectedLog.new_values || {}, null, 2)}</pre></div><div><p className="font-bold text-slate-700 mb-1">User agent</p><p className="text-slate-600 break-words">{selectedLog.user_agent || 'Unavailable'}</p></div></div>}
      </Modal>
    </div>
  );
};
