import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';
import api from '../../../api/client';
import { ArrowLeft } from 'lucide-react';

export const GradebookPage: React.FC = () => {
  const { batchUuid } = useParams<{ batchUuid: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGradebook = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/batches/${batchUuid}/gradebook`);
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load gradebook:', err);
      } finally {
        setLoading(false);
      }
    };

    if (batchUuid) fetchGradebook();
  }, [batchUuid]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center py-20 text-xs text-slate-400">
        Computing weighted gradebook matrix...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/batches')}
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-[#73111b]">{data.batch?.code}</span>
            <span className="text-xs text-slate-400">• {data.batch?.branch}</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Cohort Gradebook Matrix — {data.batch?.name}
          </h1>
        </div>
      </div>

      {/* Grade Matrix Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/70 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Student #</th>
                {data.assessments?.map((ass: any) => (
                  <th key={ass.uuid} className="py-3.5 px-4 text-center">
                    <div>{ass.title}</div>
                    <span className="text-[9px] text-[#73111b] font-semibold lowercase">
                      ({ass.type} • {ass.weight}%)
                    </span>
                  </th>
                ))}
                <th className="py-3.5 px-4 text-center">Weighted Score</th>
                <th className="py-3.5 px-4 text-center">Grade</th>
                <th className="py-3.5 px-4 text-center">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {data.matrix?.map((row: any) => (
                <tr key={row.student_uuid} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4 font-bold text-slate-900">{row.student_name}</td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{row.student_number}</td>

                  {data.assessments?.map((ass: any) => {
                    const mark = row.assessments?.[ass.uuid];
                    return (
                      <td key={ass.uuid} className="py-3 px-4 text-center font-mono font-medium">
                        {mark ? (
                          <span className="text-slate-800">{mark.score}</span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                    );
                  })}

                  <td className="py-3 px-4 text-center font-bold text-[#73111b]">
                    {row.total_weighted_score}%
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-lg text-xs font-black ${
                        row.final_grade === 'A'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : row.final_grade === 'B'
                          ? 'bg-[#fff1f2] text-[#73111b] border border-[#fecdd3]'
                          : row.final_grade === 'C'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {row.final_grade}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant={row.passed ? 'success' : 'danger'}>
                      {row.passed ? 'Passed' : 'Failed'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
