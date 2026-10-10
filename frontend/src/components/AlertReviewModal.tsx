import React, { useState } from 'react';
import { api } from '../api';
import { X, ShieldCheck, CheckCircle2, AlertOctagon, RotateCcw } from 'lucide-react';

interface AlertReviewModalProps {
  studentId: number;
  studentName: string;
  rollNumber: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AlertReviewModal: React.FC<AlertReviewModalProps> = ({
  studentId,
  studentName,
  rollNumber,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [action, setAction] = useState<string>('confirmed');
  const [reason, setReason] = useState<string>('');
  const [studentContext, setStudentContext] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide a clear professional justification for this alert decision.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await api.reviewAlert({
        student_id: studentId,
        action,
        reason,
        student_context: studentContext || undefined,
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 text-slate-800">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600 border border-teal-200">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                False-Alarm Review & Safeguard Review
              </h2>
              <p className="text-xs text-slate-500">
                {studentName} ({rollNumber})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="py-4 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Faculty Decision Action
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'confirmed', label: 'Confirm Alert', icon: CheckCircle2, color: 'border-teal-600 bg-teal-50 text-teal-700 ring-1 ring-teal-600' },
                { id: 'edited', label: 'Edit / Adjust', icon: RotateCcw, color: 'border-amber-600 bg-amber-50 text-amber-800 ring-1 ring-amber-600' },
                { id: 'dismissed', label: 'Dismiss Alert', icon: AlertOctagon, color: 'border-rose-600 bg-rose-50 text-rose-800 ring-1 ring-rose-600' },
              ].map((opt) => {
                const Icon = opt.icon;
                const isSelected = action === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setAction(opt.id)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all ${
                      isSelected
                        ? opt.color
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Faculty Justification & Evidence Rationale *
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Student provided valid medical certificate for absence; lab assessment completed during consultation..."
              className="w-full rounded-xl bg-white border border-slate-300 p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Student-Provided Context (Optional)
            </label>
            <input
              type="text"
              value={studentContext}
              onChange={(e) => setStudentContext(e.target.value)}
              placeholder="e.g. Inter-college hackathon participant; makeup lab scheduled"
              className="w-full rounded-xl bg-white border border-slate-300 px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
            This review will be permanently logged in the institutional audit trail with your actor credentials.
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-xs font-semibold text-white shadow-sm disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Recording Decision...' : 'Save Review Decision'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
