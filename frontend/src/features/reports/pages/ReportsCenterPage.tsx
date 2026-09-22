import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';
import api from '../../../api/client';
import { Download, RotateCcw, CalendarRange, TrendingUp } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import type { Branch } from '../../../types/models';

const quickRanges = [
  { id: '7d', label: 'Last 7 days' },
  { id: '30d', label: 'Last 30 days' },
  { id: '90d', label: 'Last 90 days' },
  { id: 'this-month', label: 'This month' },
  { id: 'this-quarter', label: 'This quarter' },
];

const formatDate = (date: Date) => date.toISOString().slice(0, 10);

const getRangeDates = (rangeId: string) => {
  const now = new Date();
  const endDate = new Date(now);

  switch (rangeId) {
    case '7d': {
      const start = new Date(now);
      start.setDate(now.getDate() - 6);
      return { from: formatDate(start), to: formatDate(endDate) };
    }
    case '30d': {
      const start = new Date(now);
      start.setDate(now.getDate() - 29);
      return { from: formatDate(start), to: formatDate(endDate) };
    }
    case '90d': {
      const start = new Date(now);
      start.setDate(now.getDate() - 89);
      return { from: formatDate(start), to: formatDate(endDate) };
    }
    case 'this-month': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: formatDate(start), to: formatDate(endDate) };
    }
    case 'this-quarter': {
      const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
      const start = new Date(now.getFullYear(), quarterStartMonth, 1);
      return { from: formatDate(start), to: formatDate(endDate) };
    }
    default:
      return { from: '', to: '' };
  }
};

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

  const summaryCards = useMemo(() => {
    const rows = data ?? [];

    switch (reportType) {
      case 'enrollments': {
        const total = rows.length;
        const active = rows.filter((row) => String(row.status || '').toLowerCase() === 'active').length;
        const avgScore = rows
          .map((row) => Number(row.final_score ?? 0))
          .filter((value) => Number.isFinite(value) && value > 0)
          .reduce((sum, value) => sum + value, 0);
        return [
          { label: 'Total enrollments', value: total.toLocaleString(), hint: 'records in view' },
          { label: 'Active students', value: active.toLocaleString(), hint: 'currently active' },
          { label: 'Average score', value: total ? `${Math.round(avgScore / total)}%` : '0%', hint: 'completion benchmark' },
          { label: 'Latest cohort', value: rows[0]?.batch || 'N/A', hint: rows[0]?.branch || 'No data' },
        ];
      }
      case 'branches': {
        const totalStudents = rows.reduce((sum, row) => sum + Number(row.total_students || 0), 0);
        const totalEnrollments = rows.reduce((sum, row) => sum + Number(row.total_enrollments || 0), 0);
        const activeCohorts = rows.reduce((sum, row) => sum + Number(row.active_cohorts || 0), 0);
        return [
          { label: 'Branch count', value: rows.length.toLocaleString(), hint: 'campuses in scope' },
          { label: 'Students tracked', value: totalStudents.toLocaleString(), hint: 'across selected branches' },
          { label: 'Enrollments', value: totalEnrollments.toLocaleString(), hint: 'total student intake' },
          { label: 'Active cohorts', value: activeCohorts.toLocaleString(), hint: 'ongoing batches' },
        ];
      }
      case 'attendance': {
        const rates = rows
          .map((row) => Number(String(row.average_attendance_rate || '0').replace('%', '')))
          .filter((val) => Number.isFinite(val));
        const averageRate = rates.length ? rates.reduce((sum, val) => sum + val, 0) / rates.length : 0;
        return [
          { label: 'Sessions tracked', value: rows.length.toLocaleString(), hint: 'cohorts in view' },
          { label: 'Average attendance', value: `${averageRate.toFixed(1)}%`, hint: 'across all batches' },
          { label: 'Students present', value: rows.length ? `${Math.round(averageRate)}%` : '0%', hint: 'attendance benchmark' },
          { label: 'Operational pulse', value: averageRate >= 75 ? 'Healthy' : 'Monitor', hint: averageRate >= 75 ? 'above threshold' : 'below target' },
        ];
      }
      case 'certificates': {
        const issued = rows.filter((row) => String(row.status || '').toLowerCase() === 'issued').length;
        const verified = rows.filter((row) => String(row.status || '').toLowerCase() === 'verified').length;
        return [
          { label: 'Certificates', value: rows.length.toLocaleString(), hint: 'records in view' },
          { label: 'Issued', value: issued.toLocaleString(), hint: 'already released' },
          { label: 'Verified', value: verified.toLocaleString(), hint: 'valid credentials' },
          { label: 'Executive view', value: rows[0]?.branch || 'All', hint: 'latest active branch' },
        ];
      }
      default:
        return [];
    }
  }, [data, reportType]);

  const chartData = useMemo(() => {
    if (!data.length) return [];

    switch (reportType) {
      case 'enrollments': {
        const counts = data.reduce<Record<string, number>>((acc, row) => {
          const key = String(row.status || 'Unknown');
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {});
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
      }
      case 'branches': {
        return data.slice(0, 8).map((row) => ({
          name: String(row.branch_name || row.branch || 'Branch'),
          value: Number(row.total_enrollments || row.total_students || 0),
        }));
      }
      case 'attendance': {
        return data.slice(0, 8).map((row) => ({
          name: String(row.cohort || row.branch || 'Batch'),
          value: Number(String(row.average_attendance_rate || '0').replace('%', '')) || 0,
        }));
      }
      case 'certificates': {
        const counts = data.reduce<Record<string, number>>((acc, row) => {
          const key = String(row.status || 'Unknown');
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {});
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
      }
      default:
        return [];
    }
  }, [data, reportType]);

  useEffect(() => {
    api.get('/branches').then((res) => setBranches(res.data.data || []));
  }, []);

  useEffect(() => {
    fetchReport(reportType);
  }, [reportType]);

  useEffect(() => {
    fetchReport(reportType);
  }, [branchFilter, fromDate, toDate]);

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

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {summaryCards.map((card) => (
          <Card key={card.label} className="p-4">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wide text-slate-500">
              <span>{card.label}</span>
              <TrendingUp className="h-3.5 w-3.5 text-[#73111b]" />
            </div>
            <div className="mt-3 text-2xl font-bold text-slate-900">{card.value}</div>
            <div className="mt-1 text-[11px] text-slate-500">{card.hint}</div>
          </Card>
        ))}
      </div>

      <Card className="p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Trend snapshot</h2>
            <p className="mt-1 text-xs text-slate-500">Current view by category</p>
          </div>
        </div>

        {chartData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 12, left: -18, bottom: 14 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#475569' }} interval={0} angle={-10} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 10, fill: '#475569' }} />
                <Tooltip
                  formatter={(value: any) => [value ?? 0, 'Value']}
                  contentStyle={{ borderRadius: 12, borderColor: '#e2e8f0', fontSize: 11 }}
                />
                <Bar dataKey="value" fill="#73111b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="py-10 text-center text-xs text-slate-400">No chart data available for this report.</div>
        )}
      </Card>

      <Card className="p-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
            <CalendarRange className="h-3.5 w-3.5" />
            Quick date ranges
          </div>
          <div className="flex flex-wrap gap-2">
            {quickRanges.map((range) => (
              <button
                key={range.id}
                type="button"
                onClick={() => {
                  const { from, to } = getRangeDates(range.id);
                  setFromDate(from);
                  setToDate(to);
                }}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:border-[#73111b] hover:text-[#73111b]"
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-3">
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
