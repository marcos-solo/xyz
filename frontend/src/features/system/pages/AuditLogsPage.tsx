import React, { useState, useEffect } from 'react';
import { Card } from '../../../components/common/Card';
import { Pagination } from '../../../components/common/Pagination';
import api from '../../../api/client';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/audit-logs', { params: { page } });
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
  }, [page]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Administrative Audit Trail</h1>
        <p className="text-xs text-slate-500">Complete immutable record of critical mutations, logins, grading, and certificate issuances.</p>
      </div>

      <Card className="p-0 overflow-hidden">
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
                    <td className="py-3 px-4 text-slate-600 font-medium">{log.auditable_type ? log.auditable_type.split('\\').pop() : 'System'}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{log.ip_address || '127.0.0.1'}</td>
                    <td className="py-3 px-4 text-slate-500">{new Date(log.created_at).toLocaleString()}</td>
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
    </div>
  );
};
