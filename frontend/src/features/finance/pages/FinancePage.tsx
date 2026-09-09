import React, { useEffect, useState } from 'react';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/client';
import { CreditCard, RefreshCw } from 'lucide-react';

type FinanceRecord = {
  id: number;
  enrollment_id: number;
  total_fee: string;
  amount_paid: string;
  currency: string;
  status: string;
  enrollment?: {
    uuid: string;
    enrollment_number: string;
    student?: { full_name: string };
    batch?: { name: string };
  };
};

export const FinancePage: React.FC = () => {
  const { hasPermission } = useAuth();
  const [records, setRecords] = useState<FinanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUuid, setSelectedUuid] = useState('');
  const [fee, setFee] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('mpesa');

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const response = await api.get('/finance/enrollments', { params: { per_page: 100 } });
      setRecords(response.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const selectedRecord = records.find((record) => record.enrollment?.uuid === selectedUuid);

  const updateFee = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedRecord || !fee) return;
    await api.put(`/finance/enrollments/${selectedRecord.enrollment?.uuid}/fee`, { total_fee: fee });
    setFee('');
    await fetchRecords();
  };

  const recordPayment = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedUuid || !amount) return;
    await api.post('/finance/payments', { enrollment_uuid: selectedUuid, amount, method });
    setAmount('');
    await fetchRecords();
  };

  if (!hasPermission('finance.view')) {
    return <div className="text-sm text-slate-500">You do not have access to finance records.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Finance & Fee Clearance</h1>
          <p className="text-xs text-slate-500">Track balances, receipts, and clearance before training begins.</p>
        </div>
        <button onClick={fetchRecords} title="Refresh finance records" className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <select value={selectedUuid} onChange={(event) => setSelectedUuid(event.target.value)} className="md:col-span-2 w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800">
            <option value="">Select enrollment</option>
            {records.map((record) => <option key={record.id} value={record.enrollment?.uuid}>{record.enrollment?.enrollment_number} - {record.enrollment?.student?.full_name}</option>)}
          </select>
          {hasPermission('finance.update') && <form onSubmit={updateFee} className="flex gap-2"><input required type="number" min="0" step="0.01" value={fee} onChange={(event) => setFee(event.target.value)} placeholder="Total fee" className="min-w-0 w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs" /><button title="Set enrollment fee" className="px-3 rounded-xl bg-[#73111b] text-white text-xs font-bold">Set</button></form>}
          {hasPermission('finance.create') && <form onSubmit={recordPayment} className="flex gap-2"><input required type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="Payment" className="min-w-0 w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs" /><select value={method} onChange={(event) => setMethod(event.target.value)} className="w-28 px-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"><option value="mpesa">M-Pesa</option><option value="cash">Cash</option><option value="bank_transfer">Bank</option><option value="card">Card</option></select><button title="Record payment" className="px-3 rounded-xl bg-emerald-700 text-white text-xs font-bold"><CreditCard className="h-4 w-4" /></button></form>}
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="border-b border-slate-100 bg-slate-50/70 text-slate-500 uppercase text-[10px] tracking-wider font-bold"><tr><th className="py-3.5 px-4">Enrollment</th><th className="py-3.5 px-4">Student</th><th className="py-3.5 px-4">Fee</th><th className="py-3.5 px-4">Paid</th><th className="py-3.5 px-4">Balance</th><th className="py-3.5 px-4">Status</th></tr></thead><tbody className="divide-y divide-slate-100 text-slate-700">{loading ? <tr><td colSpan={6} className="py-10 text-center text-slate-400">Loading finance records...</td></tr> : records.map((record) => { const balance = Math.max(0, Number(record.total_fee) - Number(record.amount_paid)); return <tr key={record.id} className="hover:bg-slate-50/70"><td className="py-3 px-4 font-mono font-bold text-[#73111b]">{record.enrollment?.enrollment_number}</td><td className="py-3 px-4 font-bold text-slate-900">{record.enrollment?.student?.full_name}</td><td className="py-3 px-4">{record.currency} {Number(record.total_fee).toLocaleString()}</td><td className="py-3 px-4">{record.currency} {Number(record.amount_paid).toLocaleString()}</td><td className="py-3 px-4 font-semibold">{record.currency} {balance.toLocaleString()}</td><td className="py-3 px-4"><Badge variant={record.status === 'cleared' || record.status === 'waived' ? 'success' : 'primary'}>{record.status.replace('_', ' ')}</Badge></td></tr>; })}</tbody></table></div>
      </Card>
    </div>
  );
};
