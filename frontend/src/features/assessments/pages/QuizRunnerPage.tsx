import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';
import { Modal } from '../../../components/common/Modal';
import api from '../../../api/client';
import confetti from 'canvas-confetti';
import {
  Clock,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Award,
  Flag,
  CheckCircle2,
  ListOrdered,
  RotateCcw,
  Check,
  Send,
  Eye,
  AlertTriangle,
  HelpCircle,
  GraduationCap,
} from 'lucide-react';

export const QuizRunnerPage: React.FC = () => {
  const { uuid } = useParams<{ uuid: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState<any>(null);
  const [assessment, setAssessment] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Student answers: { question_uuid: selected_option_id | text }
  const [answers, setAnswers] = useState<Record<string, any>>({});
  // Flagged questions: { question_uuid: boolean }
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [reviewOpen, setReviewOpen] = useState(false);

  // Timer in seconds
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
        setError(err.response?.data?.message || 'Failed to start examination attempt.');
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

  const toggleFlag = (questionUuid: string) => {
    setFlagged((prev) => ({ ...prev, [questionUuid]: !prev[questionUuid] }));
  };

  const clearCurrentAnswer = (questionUuid: string) => {
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[questionUuid];
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!attempt) return;
    setSubmitting(true);
    setReviewOpen(false);

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
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 },
          });
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit examination attempt.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const answeredCount = Object.keys(answers).length;
  const flaggedCount = Object.values(flagged).filter(Boolean).length;
  const unansweredCount = questions.length - answeredCount;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="h-12 w-12 rounded-2xl bg-[#fff1f2] border border-[#fecdd3] flex items-center justify-center animate-spin text-[#73111b]">
          <RotateCcw className="h-6 w-6" />
        </div>
        <p className="text-xs font-bold text-slate-700">Initializing Secure CBE Testing Environment...</p>
        <p className="text-[11px] text-slate-400">Loading verified question bank and encrypting candidate session</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="max-w-md mx-auto my-16 text-center p-8 border border-slate-200 shadow-xl rounded-3xl">
        <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-900 mb-1">Assessment Unavailable</h3>
        <p className="text-xs text-slate-500 mb-6">{error}</p>
        <button
          onClick={() => navigate('/assessments')}
          className="px-5 py-2.5 rounded-xl bg-[#73111b] text-xs font-bold text-white shadow-md shadow-[#73111b]/20"
        >
          Back to Assessments
        </button>
      </Card>
    );
  }

  // 1. RESULT SCREEN
  if (result) {
    const passThreshold = assessment?.pass_mark || 50;
    const isHonors = result.percentage >= 75;

    return (
      <div className="max-w-2xl mx-auto my-10 space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center shadow-xl">
          <div
            className={`h-20 w-20 rounded-3xl mx-auto flex items-center justify-center mb-5 ${
              result.passed
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-lg shadow-emerald-500/10'
                : 'bg-rose-50 text-rose-600 border border-rose-200 shadow-lg shadow-rose-500/10'
            }`}
          >
            {result.passed ? <Award className="h-10 w-10" /> : <AlertTriangle className="h-10 w-10" />}
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
            Official Examination Result
          </span>

          <h2 className="text-2xl font-black text-slate-900 mt-2">
            {result.passed ? (isHonors ? 'Passed with Distinction! 🎓' : 'Examination Passed! 🎉') : 'Examination Unsuccessful'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">{assessment?.title}</p>
          <p className="text-[11px] text-slate-400">Candidate: {user?.full_name} • ACCA CBE Assessment Suite</p>

          <div className="grid grid-cols-3 gap-4 my-8 p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div>
              <span className="text-[11px] text-slate-500 block font-semibold">Marks Achieved</span>
              <span className="text-2xl font-black text-[#73111b]">
                {result.score} <span className="text-sm font-normal text-slate-400">/ {assessment?.total_marks}</span>
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block font-semibold">Score Percentage</span>
              <span
                className={`text-2xl font-black ${
                  result.passed ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {result.percentage}%
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block font-semibold">Passing Standard</span>
              <span className="text-2xl font-black text-slate-700">{passThreshold}%</span>
            </div>
          </div>

          <div className="bg-amber-50/70 border border-amber-200/70 rounded-2xl p-4 text-left text-xs text-amber-900 mb-6">
            <p className="font-bold mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-amber-600" />
              Academic Grade Recorded in Transcript
            </p>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Your examination answers have been securely logged and aggregated into the intake gradebook matrix.
              Continuous assessment scores will be factored into your final ACCA qualification standing.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2.5 rounded-xl bg-[#73111b] hover:bg-[#5c0d15] text-xs font-bold text-white shadow-md shadow-[#73111b]/20 transition"
            >
              Return to Student Dashboard
            </button>
            <button
              onClick={() => navigate('/assessments')}
              className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition"
            >
              View All Assessments
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. QUIZ RUNNER CBE INTERACTION
  const currentQ = questions[currentIndex];
  const isCurrentFlagged = currentQ ? !!flagged[currentQ.uuid] : false;
  const isCurrentAnswered = currentQ ? answers[currentQ.uuid] !== undefined : false;

  return (
    <div className="max-w-6xl mx-auto space-y-5 pb-12">
      {/* Official CBE Top Examination Bar */}
      <header className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#73111b] text-white flex items-center justify-center font-bold text-sm shadow-xs">
            CBE
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-slate-900">{assessment?.title}</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#fff1f2] text-[#73111b] border border-[#fecdd3]">
                {assessment?.type}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Candidate: <span className="text-slate-700 font-bold">{user?.full_name}</span> • Total Marks: {assessment?.total_marks} • Pass Mark: {assessment?.pass_mark}%
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Timer pill */}
          {timeLeft !== null && (
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition ${
                timeLeft < 300
                  ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse'
                  : 'bg-[#fff1f2] border-[#fecdd3] text-[#73111b]'
              }`}
              title="Time remaining until automatic submission"
            >
              <Clock className="h-4 w-4" />
              <span>{formatTime(timeLeft)} remaining</span>
            </div>
          )}

          {/* Exam Summary / Review Navigator Modal Button */}
          <button
            type="button"
            onClick={() => setReviewOpen(true)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition"
          >
            <ListOrdered className="h-4 w-4 text-slate-500" />
            <span>Question Review ({answeredCount}/{questions.length})</span>
          </button>

          {/* Direct Finish button */}
          <button
            type="button"
            onClick={() => setReviewOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-xs flex items-center gap-1.5 transition"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Finish Exam</span>
          </button>
        </div>
      </header>

      {/* Main Grid: Question Stage (Left) & Palette (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left / Main Question Area */}
        <div className="lg:col-span-8 space-y-4">
          {currentQ ? (
            <Card className="p-6">
              {/* Question Sub-header */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-[#73111b]">
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                  <Badge variant="neutral">{currentQ.marks} Marks</Badge>
                  <Badge variant="info">{currentQ.question_type}</Badge>
                </div>

                <div className="flex items-center gap-2">
                  {/* Flag for Review Toggle */}
                  <button
                    type="button"
                    onClick={() => toggleFlag(currentQ.uuid)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
                      isCurrentFlagged
                        ? 'bg-amber-50 border-amber-300 text-amber-800'
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <Flag className={`h-3.5 w-3.5 ${isCurrentFlagged ? 'fill-amber-500 text-amber-600' : ''}`} />
                    <span>{isCurrentFlagged ? 'Flagged for Review' : 'Flag Question'}</span>
                  </button>

                  {isCurrentAnswered && (
                    <button
                      type="button"
                      onClick={() => clearCurrentAnswer(currentQ.uuid)}
                      className="text-[11px] text-slate-400 hover:text-rose-600 font-semibold transition"
                    >
                      Clear Answer
                    </button>
                  )}
                </div>
              </div>

              {/* Question Stem Text */}
              <h2 className="text-sm md:text-base font-bold text-slate-900 leading-relaxed mb-6">
                {currentQ.question_text}
              </h2>

              {/* Multiple Choice Options */}
              {currentQ.options && currentQ.options.length > 0 ? (
                <div className="space-y-3">
                  {currentQ.options.map((opt: any, optIndex: number) => {
                    const isSelected = answers[currentQ.uuid] === opt.id;
                    const letterLabel = String.fromCharCode(65 + optIndex); // A, B, C, D

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectOption(currentQ.uuid, opt.id)}
                        className={`w-full p-4 rounded-2xl text-left text-xs font-semibold border transition flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-[#fff1f2] border-[#73111b] text-[#73111b] shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50/70'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`h-7 w-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition ${
                              isSelected
                                ? 'bg-[#73111b] text-white'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {letterLabel}
                          </span>
                          <span className="leading-relaxed">{opt.option_text}</span>
                        </div>

                        <div
                          className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-[#73111b] bg-[#73111b]' : 'border-slate-300'
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3 text-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div>
                  <textarea
                    rows={5}
                    value={answers[currentQ.uuid] || ''}
                    onChange={(e) => handleTextAnswer(currentQ.uuid, e.target.value)}
                    placeholder="Provide your written accounting computation or answer explanation here..."
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#73111b]"
                  />
                </div>
              )}

              {/* Navigation Toolbar */}
              <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-25 flex items-center gap-2 transition"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center gap-2">
                  {currentIndex < questions.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, questions.length - 1))}
                      className="px-5 py-2.5 rounded-xl bg-[#73111b] hover:bg-[#5c0d15] text-xs font-bold text-white flex items-center gap-2 shadow-xs transition"
                    >
                      <span>Next Question</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setReviewOpen(true)}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white flex items-center gap-2 shadow-md shadow-emerald-600/20 transition"
                    >
                      <span>Review & Submit</span>
                      <CheckCircle2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center text-slate-400">No question selected.</Card>
          )}
        </div>

        {/* Right / CBE Question Navigator Palette */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Question Navigator
            </h3>

            {/* Legend */}
            <div className="grid grid-cols-3 gap-2 pb-3 mb-3 border-b border-slate-100 text-[10px] font-semibold">
              <div className="flex items-center gap-1.5 text-emerald-700">
                <div className="h-3 w-3 rounded-md bg-emerald-100 border border-emerald-300" />
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-700">
                <div className="h-3 w-3 rounded-md bg-amber-100 border border-amber-300" />
                <span>Flagged ({flaggedCount})</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-500">
                <div className="h-3 w-3 rounded-md bg-slate-100 border border-slate-300" />
                <span>Left ({unansweredCount})</span>
              </div>
            </div>

            {/* Matrix of Question buttons */}
            <div className="grid grid-cols-5 gap-2 max-h-[360px] overflow-y-auto p-1">
              {questions.map((q, idx) => {
                const isAnswered = answers[q.uuid] !== undefined;
                const isFlagged = !!flagged[q.uuid];
                const isCurrent = idx === currentIndex;

                return (
                  <button
                    key={q.uuid}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`relative h-10 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center ${
                      isCurrent
                        ? 'bg-[#73111b] text-white ring-2 ring-[#73111b]/30 shadow-xs'
                        : isFlagged
                        ? 'bg-amber-50 border border-amber-300 text-amber-800 hover:bg-amber-100'
                        : isAnswered
                        ? 'bg-emerald-50 border border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                        : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>{idx + 1}</span>
                    {isFlagged && (
                      <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-amber-500" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Fast Summary Progress */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
                <span className="font-semibold">Completion</span>
                <span className="font-bold text-[#73111b]">
                  {Math.round((answeredCount / (questions.length || 1)) * 100)}%
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#73111b] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(answeredCount / (questions.length || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={() => setReviewOpen(true)}
                className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center justify-center gap-2 transition"
              >
                <Eye className="h-4 w-4 text-slate-400" />
                <span>Open Exam Review Screen</span>
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* Review Modal before submission */}
      <Modal
        isOpen={reviewOpen}
        onClose={() => setReviewOpen(false)}
        title="Examination Progress & Review Summary"
        subtitle={`Review your answered questions before final submission for ${assessment?.title}`}
      >
        <div className="space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
              <span className="text-[10px] font-bold text-emerald-800 block uppercase">Answered</span>
              <span className="text-xl font-black text-emerald-700">{answeredCount}</span>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-center">
              <span className="text-[10px] font-bold text-amber-800 block uppercase">Flagged</span>
              <span className="text-xl font-black text-amber-700">{flaggedCount}</span>
            </div>
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-center">
              <span className="text-[10px] font-bold text-rose-800 block uppercase">Unanswered</span>
              <span className="text-xl font-black text-rose-700">{unansweredCount}</span>
            </div>
          </div>

          {unansweredCount > 0 && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Attention: </span>
                You still have {unansweredCount} unanswered questions. You can jump to them and answer before final submission.
              </div>
            </div>
          )}

          {/* List of questions for rapid jump */}
          <div className="max-h-[260px] overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-2xl bg-white">
            {questions.map((q, idx) => {
              const isAnswered = answers[q.uuid] !== undefined;
              const isFlagged = !!flagged[q.uuid];

              return (
                <div
                  key={q.uuid}
                  className="p-3 flex items-center justify-between hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-xs text-slate-800 w-7">Q{idx + 1}</span>
                    <span className="text-xs text-slate-600 line-clamp-1 max-w-[280px]">
                      {q.question_text}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isFlagged && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">
                        Flagged
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        isAnswered
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {isAnswered ? 'Answered' : 'Not Answered'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentIndex(idx);
                        setReviewOpen(false);
                      }}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                    >
                      Jump
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setReviewOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
            >
              Resume Examination
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmit}
              className="px-6 py-2.5 rounded-xl bg-[#73111b] hover:bg-[#5c0d15] text-xs font-bold text-white shadow-md shadow-[#73111b]/20 flex items-center gap-2 transition"
            >
              {submitting ? (
                <>
                  <RotateCcw className="h-4 w-4 animate-spin" />
                  <span>Submitting & Grading...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Submit Final Exam</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
