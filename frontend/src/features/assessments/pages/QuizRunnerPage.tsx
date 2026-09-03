import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';
import api from '../../../api/client';
import confetti from 'canvas-confetti';
import {
  Clock,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Award,
} from 'lucide-react';

export const QuizRunnerPage: React.FC = () => {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState<any>(null);
  const [assessment, setAssessment] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Student answers: { question_uuid: selected_option_id | text }
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Timer
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    const startQuiz = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.post(`/student/assessments/${uuid}/start`);
        if (res.data.success) {
          setAttempt(res.data.data.attempt);
          setAssessment(res.data.data.assessment);
          setQuestions(res.data.data.questions || []);

          if (res.data.data.attempt.time_limit) {
            setTimeLeft(res.data.data.attempt.time_limit * 60);
          }
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to start quiz attempt.');
      } finally {
        setLoading(false);
      }
    };

    if (uuid) startQuiz();
  }, [uuid]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || result) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev !== null && prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev !== null ? prev - 1 : null;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, result]);

  const handleSelectOption = (questionUuid: string, optionId: number) => {
    setAnswers((prev) => ({ ...prev, [questionUuid]: optionId }));
  };

  const handleTextAnswer = (questionUuid: string, text: string) => {
    setAnswers((prev) => ({ ...prev, [questionUuid]: text }));
  };

  const handleSubmit = async () => {
    if (!attempt) return;
    setSubmitting(true);

    const formattedAnswers = Object.entries(answers).map(([qUuid, ans]) => ({
      question_uuid: qUuid,
      selected_option_id: typeof ans === 'number' ? ans : null,
      text_answer: typeof ans === 'string' ? ans : null,
    }));

    try {
      const res = await api.post(`/student/assessment-attempts/${attempt.uuid}/submit`, {
        answers: formattedAnswers,
      });

      if (res.data.success) {
        setResult(res.data.data);
        if (res.data.data.passed) {
          confetti({
            particleCount: 120,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit quiz attempt.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-xs text-slate-400">
        Preparing secure examination environment...
      </div>
    );
  }

  if (error) {
    return (
      <Card className="max-w-md mx-auto my-12 text-center p-8">
        <AlertCircle className="h-10 w-10 text-rose-500 mx-auto mb-3" />
        <h3 className="text-sm font-bold text-slate-900 mb-1">Assessment Unavailable</h3>
        <p className="text-xs text-slate-500 mb-4">{error}</p>
        <button
          onClick={() => navigate('/assessments')}
          className="px-4 py-2 rounded-xl bg-slate-100 text-xs font-semibold text-slate-700"
        >
          Back to Assessments
        </button>
      </Card>
    );
  }

  // 1. RESULT SCREEN
  if (result) {
    return (
      <Card className="max-w-xl mx-auto my-8 p-8 text-center bg-white border border-slate-200 animate-in zoom-in-95 shadow-xl">
        <div
          className={`h-16 w-16 rounded-3xl mx-auto flex items-center justify-center mb-4 ${
            result.passed
              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
              : 'bg-rose-50 text-rose-600 border border-rose-200'
          }`}
        >
          {result.passed ? <Award className="h-8 w-8" /> : <AlertCircle className="h-8 w-8" />}
        </div>

        <h2 className="text-xl font-bold text-slate-900">
          {result.passed ? 'Assessment Passed! 🎉' : 'Assessment Completed'}
        </h2>
        <p className="text-xs text-slate-500 mt-1">{assessment?.title}</p>

        <div className="grid grid-cols-2 gap-4 my-6 p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div>
            <span className="text-[11px] text-slate-500 block font-medium">Final Score</span>
            <span className="text-2xl font-black text-[#73111b]">
              {result.score} / {assessment?.total_marks}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block font-medium">Score Percentage</span>
            <span className="text-2xl font-black text-emerald-600">{result.percentage}%</span>
          </div>
        </div>

        <div className="flex justify-center gap-3">
          <button
            onClick={() => navigate('/assessments')}
            className="px-6 py-2.5 rounded-xl bg-[#73111b] hover:bg-[#5c0d15] text-xs font-bold text-white shadow-md shadow-[#73111b]/20"
          >
            Done & Return to Assessments
          </button>
        </div>
      </Card>
    );
  }

  // 2. QUIZ RUNNER INTERACTION
  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Bar with Timer */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-sm font-bold text-slate-900">{assessment?.title}</h2>
          <span className="text-[11px] text-slate-500 font-medium">
            Question {currentIndex + 1} of {questions.length} • {answeredCount} Answered
          </span>
        </div>

        {timeLeft !== null && (
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold ${
              timeLeft < 300
                ? 'bg-rose-50 border-rose-200 text-rose-700 animate-pulse'
                : 'bg-[#fff1f2] border-[#fecdd3] text-[#73111b]'
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>{formatTime(timeLeft)}</span>
          </div>
        )}
      </div>

      {/* Question Card */}
      {currentQ && (
        <Card className="p-6">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <span className="text-xs font-bold text-[#73111b]">
              Question {currentIndex + 1} ({currentQ.marks} Marks)
            </span>
            <Badge variant="neutral">{currentQ.question_type}</Badge>
          </div>

          <h3 className="text-sm font-bold text-slate-900 leading-relaxed mb-6">
            {currentQ.question_text}
          </h3>

          {/* Multiple Choice / True-False Options */}
          {currentQ.options && currentQ.options.length > 0 ? (
            <div className="space-y-3">
              {currentQ.options.map((opt: any) => {
                const isSelected = answers[currentQ.uuid] === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectOption(currentQ.uuid, opt.id)}
                    className={`w-full p-4 rounded-xl text-left text-xs font-semibold border transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#fff1f2] border-[#73111b] text-[#73111b] shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span>{opt.option_text}</span>
                    <div
                      className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-[#73111b] bg-[#73111b]' : 'border-slate-300'
                      }`}
                    >
                      {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div>
              <textarea
                rows={4}
                value={answers[currentQ.uuid] || ''}
                onChange={(e) => handleTextAnswer(currentQ.uuid, e.target.value)}
                placeholder="Type your structured answer here..."
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
              />
            </div>
          )}

          {/* Question Nav & Submit buttons */}
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-100">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(currentIndex - 1)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-20 flex items-center gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" /> Previous
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentIndex(currentIndex + 1)}
                className="px-5 py-2.5 rounded-xl bg-[#73111b] hover:bg-[#5c0d15] text-xs font-bold text-white flex items-center gap-1.5"
              >
                Next <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmit}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-md shadow-emerald-600/30 flex items-center gap-1.5"
              >
                {submitting ? 'Grading Answers...' : 'Submit Assessment'}
              </button>
            )}
          </div>
        </Card>
      )}

      {/* Question Number Pills */}
      <div className="flex flex-wrap gap-2 justify-center p-3 rounded-2xl bg-white border border-slate-200 shadow-sm">
        {questions.map((q, idx) => {
          const isAnswered = answers[q.uuid] !== undefined;
          const isCurrent = idx === currentIndex;
          return (
            <button
              key={q.uuid}
              onClick={() => setCurrentIndex(idx)}
              className={`h-8 w-8 rounded-lg text-xs font-bold transition ${
                isCurrent
                  ? 'bg-[#73111b] text-white ring-2 ring-[#73111b]/40'
                  : isAnswered
                  ? 'bg-emerald-50 border border-emerald-300 text-emerald-700'
                  : 'bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
};
