import React, { useState, useEffect } from 'react';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';
import api from '../../../api/client';
import { Download, RotateCcw } from 'lucide-react';
import type { Branch } from '../../../types/models';

export const ReportsCenterPage: React.FC = () => {
  const [reportType, setReportType] = useState('enrollments');
  const [data, setData] = useState<any[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchFilter, setBranchFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchReport = async (type: string = reportType) => {
    setLoading(true);
    try {
      const res = await api.get(`/reports/${type}`, {
        params: {
          branch_uuid: branchFilter || undefined,
          from_date: fromDate || undefined,
          to_date: toDate || undefined,
        },
      });
      if (res.data.success) {
        setData(res.data.data.rows || []);
      }
    } catch (err) {
      console.error('Failed to load report data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.get('/branches').then((res) => setBranches(res.data.data || []));
  }, []);

  useEffect(() => {
    fetchReport(reportType);
  }, [reportType]);

  const handleDownloadCsv = async () => {
    try {
      const response = await api.get(`/reports/${reportType}/export`, {
        params: {
          branch_uuid: branchFilter || undefined,
          from_date: fromDate || undefined,
          to_date: toDate || undefined,
        },
        responseType: 'blob',
      });
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `report_${reportType}_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Failed to export CSV report:', err);
    }
  };

  const clearFilters = () => {
    setBranchFilter('');
    setFromDate('');
    setToDate('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Institutional Reports & Analytics</h1>
          <p className="text-xs text-slate-500">Generate multi-dimensional operational metrics and export clean CSV datasets.</p>
        </div>
        <button
          onClick={handleDownloadCsv}
          className="px-4 py-2.5 rounded-xl bg-[#73111b] hover:bg-[#5c0d15] text-xs font-bold text-white shadow-md shadow-[#73111b]/20 flex items-center gap-2 transition"
        >
          <Download className="h-4 w-4" />
          <span>Export CSV Dataset</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'enrollments', label: 'Enrollments Report' },
          { id: 'branches', label: 'Branch Performance' },
          { id: 'attendance', label: 'Attendance Rates' },
          { id: 'certificates', label: 'Issued Credentials' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setReportType(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              reportType === tab.id
                ? 'bg-[#73111b] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
          >
            <option value="">All Campus Branches</option>
            {branches.map((branch) => <option key={branch.uuid} value={branch.uuid}>{branch.name}</option>)}
          </select>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} aria-label="From date" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]" />
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} aria-label="To date" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]" />
          <div className="flex gap-2">
            <button onClick={() => fetchReport()} className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700">Apply Filters</button>
            <button onClick={clearFilters} title="Clear filters" className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100"><RotateCcw className="h-4 w-4" /></button>
          </div>
        </div>
      </Card>

      {/* Report Data Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-16 text-center text-xs text-slate-400">
              Generating dynamic report data...
            </div>
          ) : data.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400">
              No records returned for selected report parameters.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/70 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
                <tr>
                  {Object.keys(data[0] || {}).map((headerKey) => (
                    <th key={headerKey} className="py-3.5 px-4 capitalize">
                      {headerKey.replace(/_/g, ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition">
                    {Object.values(row).map((val: any, cIdx) => (
                      <td key={cIdx} className="py-3 px-4">
                        {typeof val === 'string' && (val === 'Active' || val === 'issued') ? (
                          <Badge variant="success">{val}</Badge>
                        ) : (
                          <span className="font-medium">{String(val ?? '—')}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
};
