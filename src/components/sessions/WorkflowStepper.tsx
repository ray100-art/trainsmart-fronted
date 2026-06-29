import type { TrainingSession } from '@/types'
import { Badge, statusBadgeVariant } from '@/components/ui/badge'
import { CheckCircle2, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = [
  { key: 'approval', label: 'Session Approval', getStatus: (s: TrainingSession) => s.approval_status },
  { key: 'training', label: 'Training', getStatus: (s: TrainingSession) => s.status },
  { key: 'report', label: 'Report', getStatus: (s: TrainingSession) => s.report_submitted_at ? 'SUBMITTED' : 'PENDING' },
  { key: 'reportApproval', label: 'Report Approval', getStatus: (s: TrainingSession) => s.report_approval_status },
  { key: 'certificates', label: 'Certificates', getStatus: (s: TrainingSession) => s.certificates_issued ? 'ISSUED' : 'PENDING' },
]

function stepState(status: string, index: number, session: TrainingSession) {
  if (status === 'REJECTED') return 'rejected'
  if (status === 'APPROVED' || status === 'COMPLETED' || status === 'ISSUED' || status === 'SUBMITTED') return 'done'
  if (index === 0) return 'current'
  const prev = STEPS[index - 1]
  const prevStatus = prev.getStatus(session)
  const prevDone = ['APPROVED', 'COMPLETED', 'ISSUED', 'SUBMITTED'].includes(prevStatus)
  return prevDone ? 'current' : 'upcoming'
}

export function WorkflowStepper({ session }: { session: TrainingSession }) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex min-w-[640px] items-center gap-2">
        {STEPS.map((step, i) => {
          const status = step.getStatus(session)
          const state = stepState(status, i, session)
          return (
            <div key={step.key} className="flex flex-1 items-center gap-2">
              <div className="flex flex-col items-center gap-1 text-center">
                {state === 'done' ? (
                  <CheckCircle2 className="h-6 w-6 text-brand-700" />
                ) : (
                  <Circle
                    className={cn(
                      'h-6 w-6',
                      state === 'current' ? 'text-brand-500' : state === 'rejected' ? 'text-kenya-red' : 'text-gray-300',
                    )}
                  />
                )}
                <span className="text-[10px] font-medium text-gray-600">{step.label}</span>
                <Badge variant={statusBadgeVariant(status)} className="text-[10px]">
                  {status.replace('_', ' ')}
                </Badge>
              </div>
              {i < STEPS.length - 1 && <div className="mb-6 h-px flex-1 bg-gray-200" />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
