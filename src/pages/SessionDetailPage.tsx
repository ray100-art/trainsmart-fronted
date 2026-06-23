import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import {
  approveReport, approveSession, getSession, rejectReport, rejectSession, submitReport,
} from '@/api/sessions'
import { addParticipant, removeParticipant, toggleAttendance, updateScores } from '@/api/participants'
import { addTrainer, issueCertificates, removeTrainer } from '@/api/certificates'
import { useAuth } from '@/hooks/useAuth'
import { hasPermission } from '@/lib/roles'
import { CADRE_OPTIONS } from '@/lib/constants'
import { WorkflowStepper } from '@/components/sessions/WorkflowStepper'
import { Badge, statusBadgeVariant } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatDate, getApiErrorMessage } from '@/lib/utils'
import { CertificatePrint } from '@/components/certificates/CertificatePrint'
import { ArrowLeft, Award, Printer, Trash2 } from 'lucide-react'
import type { Participant } from '@/types'

export function SessionDetailPage() {
  const { sessionId = '' } = useParams()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [error, setError] = useState('')
  const [rejectNote, setRejectNote] = useState('')
  const [reportForm, setReportForm] = useState({ summary: '', challenges: '', recommendations: '' })
  const [participantForm, setParticipantForm] = useState({
    name: '', cadre: CADRE_OPTIONS[0], facility: '', staff_number: '',
  })
  const [trainerForm, setTrainerForm] = useState({ name: '', cadre: CADRE_OPTIONS[0], phone: '' })
  const [printTarget, setPrintTarget] = useState<Participant | null>(null)

  const { data: session, isLoading } = useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => getSession(sessionId),
    enabled: !!sessionId,
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['session', sessionId] })
    queryClient.invalidateQueries({ queryKey: ['sessions'] })
  }

  const runMutation = async (fn: () => Promise<unknown>) => {
    setError('')
    try {
      await fn()
      invalidate()
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
  }

  const approveSessionMut = useMutation({
    mutationFn: () => approveSession(sessionId),
    onSuccess: invalidate,
    onError: (err) => setError(getApiErrorMessage(err)),
  })

  if (isLoading || !session) {
    return <p className="text-sm text-gray-500">Loading session…</p>
  }

  const canManageSession = hasPermission(user!.role, 'sessions:create') && !session.certificates_issued
  const canApprove = hasPermission(user!.role, 'sessions:approve')
  const canIssueCerts = hasPermission(user!.role, 'certificates:issue')

  const eligibleCount = session.participants.filter(
    (p) => p.status === 'PRESENT' && (p.post_test_score ?? 0) >= 80 && !p.certificate_serial,
  ).length

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2">
          <Link to="/sessions">
            <ArrowLeft className="h-4 w-4" />
            Back to sessions
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">{session.title}</h1>
        <p className="text-sm text-gray-500">
          {session.facility}, {session.county} · {formatDate(session.start_date)} – {formatDate(session.end_date)}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Badge variant={statusBadgeVariant(session.status)}>{session.status.replace('_', ' ')}</Badge>
          <Badge variant={statusBadgeVariant(session.approval_status)}>
            Session: {session.approval_status}
          </Badge>
        </div>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <Card>
        <CardContent className="pt-6">
          <WorkflowStepper session={session} />
        </CardContent>
      </Card>

      {canApprove && session.approval_status === 'PENDING' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">County approval required</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button onClick={() => approveSessionMut.mutate()} disabled={approveSessionMut.isPending}>
              Approve Session
            </Button>
            <div className="flex flex-1 flex-wrap items-end gap-2">
              <div className="min-w-[200px] flex-1 space-y-1">
                <Label>Rejection note</Label>
                <Input value={rejectNote} onChange={(e) => setRejectNote(e.target.value)} placeholder="Reason for rejection" />
              </div>
              <Button
                variant="danger"
                disabled={!rejectNote.trim()}
                onClick={() => runMutation(() => rejectSession(sessionId, rejectNote))}
              >
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="participants">Participants ({session.participants.length})</TabsTrigger>
          <TabsTrigger value="trainers">Trainers ({session.trainers.length})</TabsTrigger>
          <TabsTrigger value="report">Report</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">Facility</p>
                <p className="font-medium">{session.facility}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">County</p>
                <p className="font-medium">{session.county}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">Trainees</p>
                <p className="font-medium">{session.trainee_count}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">Certificates</p>
                <p className="font-medium">{session.certificates_issued ? 'Issued' : 'Not issued'}</p>
              </div>
              {session.approved_by_name && (
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-500">Reviewed by</p>
                  <p className="font-medium">{session.approved_by_name}</p>
                </div>
              )}
              {session.approval_note && (
                <div className="sm:col-span-2">
                  <p className="text-xs font-semibold uppercase text-gray-500">Approval note</p>
                  <p className="text-sm text-gray-700">{session.approval_note}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="participants">
          {canManageSession && session.approval_status === 'APPROVED' && (
            <Card className="mb-4">
              <CardHeader><CardTitle className="text-base">Add participant</CardTitle></CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <Input placeholder="Full name" value={participantForm.name} onChange={(e) => setParticipantForm({ ...participantForm, name: e.target.value })} />
                <Select value={participantForm.cadre} onValueChange={(v) => setParticipantForm({ ...participantForm, cadre: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CADRE_OPTIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input placeholder="Facility" value={participantForm.facility} onChange={(e) => setParticipantForm({ ...participantForm, facility: e.target.value })} />
                <Input placeholder="Staff number (optional)" value={participantForm.staff_number} onChange={(e) => setParticipantForm({ ...participantForm, staff_number: e.target.value })} />
                <Button
                  className="sm:col-span-2"
                  disabled={!participantForm.name || !participantForm.facility}
                  onClick={() => runMutation(async () => {
                    await addParticipant(sessionId, {
                      ...participantForm,
                      staff_number: participantForm.staff_number || undefined,
                    })
                    setParticipantForm({ name: '', cadre: CADRE_OPTIONS[0], facility: '', staff_number: '' })
                  })}
                >
                  Add Participant
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="overflow-x-auto rounded-xl border bg-white">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="border-b bg-gray-50 text-left text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Cadre</th>
                  <th className="px-4 py-3">Attendance</th>
                  <th className="px-4 py-3">Pre-test</th>
                  <th className="px-4 py-3">Post-test</th>
                  <th className="px-4 py-3">Certificate</th>
                  {canManageSession && <th className="px-4 py-3" />}
                </tr>
              </thead>
              <tbody>
                {session.participants.map((p) => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3">{p.cadre}</td>
                    <td className="px-4 py-3">
                      {canManageSession ? (
                        <button
                          type="button"
                          onClick={() => runMutation(() => toggleAttendance(sessionId, p.id))}
                          className="cursor-pointer"
                        >
                          <Badge variant={statusBadgeVariant(p.status)}>{p.status}</Badge>
                        </button>
                      ) : (
                        <Badge variant={statusBadgeVariant(p.status)}>{p.status}</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {canManageSession ? (
                        <Input
                          type="number"
                          className="h-8 w-20"
                          defaultValue={p.pre_test_score ?? ''}
                          onBlur={(e) => {
                            const pre = parseFloat(e.target.value) || 0
                            const post = p.post_test_score ?? 0
                            runMutation(() => updateScores(sessionId, p.id, { pre_test_score: pre, post_test_score: post }))
                          }}
                        />
                      ) : (
                        p.pre_test_score ?? '—'
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {canManageSession ? (
                        <Input
                          type="number"
                          className="h-8 w-20"
                          defaultValue={p.post_test_score ?? ''}
                          onBlur={(e) => {
                            const post = parseFloat(e.target.value) || 0
                            const pre = p.pre_test_score ?? 0
                            runMutation(() => updateScores(sessionId, p.id, { pre_test_score: pre, post_test_score: post }))
                          }}
                        />
                      ) : (
                        p.post_test_score ?? '—'
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-brand-700">
                      {p.certificate_serial ?? '—'}
                    </td>
                    {canManageSession && (
                      <td className="px-4 py-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => runMutation(() => removeParticipant(sessionId, p.id))}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {session.participants.length === 0 && (
              <p className="p-6 text-center text-sm text-gray-500">No participants registered yet.</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="trainers">
          {canManageSession && (
            <Card className="mb-4">
              <CardHeader><CardTitle className="text-base">Add co-trainer</CardTitle></CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-3">
                <Input placeholder="Name" value={trainerForm.name} onChange={(e) => setTrainerForm({ ...trainerForm, name: e.target.value })} />
                <Select value={trainerForm.cadre} onValueChange={(v) => setTrainerForm({ ...trainerForm, cadre: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CADRE_OPTIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input placeholder="Phone" value={trainerForm.phone} onChange={(e) => setTrainerForm({ ...trainerForm, phone: e.target.value })} />
                <Button
                  className="sm:col-span-3"
                  disabled={!trainerForm.name || !trainerForm.phone}
                  onClick={() => runMutation(async () => {
                    await addTrainer(sessionId, trainerForm)
                    setTrainerForm({ name: '', cadre: CADRE_OPTIONS[0], phone: '' })
                  })}
                >
                  Add Trainer
                </Button>
              </CardContent>
            </Card>
          )}
          <div className="space-y-2">
            {session.trainers.map((t) => (
              <Card key={t.id}>
                <CardContent className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-medium">{t.name}</p>
                    <p className="text-sm text-gray-500">{t.cadre} · {t.phone}</p>
                  </div>
                  {canManageSession && (
                    <Button variant="ghost" size="icon" onClick={() => runMutation(() => removeTrainer(sessionId, t.id))}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
            {session.trainers.length === 0 && (
              <p className="text-sm text-gray-500">No co-trainers added.</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="report">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Training report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {session.report_summary && session.report_approval_status !== 'REJECTED' ? (
                <>
                  <div>
                    <p className="text-xs font-semibold uppercase text-gray-500">Summary</p>
                    <p className="mt-1 text-sm whitespace-pre-wrap">{session.report_summary}</p>
                  </div>
                  {session.report_challenges && (
                    <div>
                      <p className="text-xs font-semibold uppercase text-gray-500">Challenges</p>
                      <p className="mt-1 text-sm whitespace-pre-wrap">{session.report_challenges}</p>
                    </div>
                  )}
                  {session.report_recommendations && (
                    <div>
                      <p className="text-xs font-semibold uppercase text-gray-500">Recommendations</p>
                      <p className="mt-1 text-sm whitespace-pre-wrap">{session.report_recommendations}</p>
                    </div>
                  )}
                  <Badge variant={statusBadgeVariant(session.report_approval_status)}>
                    {session.report_approval_status}
                  </Badge>
                  {session.report_approval_note && (
                    <p className="text-sm text-red-700">Note: {session.report_approval_note}</p>
                  )}
                </>
              ) : canManageSession && session.approval_status === 'APPROVED' && !session.certificates_issued ? (
                <>
                  {session.report_approval_status === 'REJECTED' && session.report_approval_note && (
                    <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                      Report rejected: {session.report_approval_note}. Please revise and resubmit.
                    </p>
                  )}
                  <div className="space-y-2">
                    <Label>Summary *</Label>
                    <Textarea
                      value={reportForm.summary}
                      onChange={(e) => setReportForm({ ...reportForm, summary: e.target.value })}
                      placeholder="Describe training outcomes…"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Challenges</Label>
                    <Textarea
                      value={reportForm.challenges}
                      onChange={(e) => setReportForm({ ...reportForm, challenges: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Recommendations</Label>
                    <Textarea
                      value={reportForm.recommendations}
                      onChange={(e) => setReportForm({ ...reportForm, recommendations: e.target.value })}
                    />
                  </div>
                  <Button
                    disabled={!reportForm.summary.trim()}
                    onClick={() => runMutation(() => submitReport(sessionId, reportForm))}
                  >
                    {session.report_approval_status === 'REJECTED' ? 'Resubmit Report' : 'Submit Report'}
                  </Button>
                </>
              ) : (
                <p className="text-sm text-gray-500">No report submitted yet.</p>
              )}

              {canApprove && session.report_submitted_at && session.report_approval_status === 'PENDING' && (
                <div className="flex flex-wrap gap-3 border-t pt-4">
                  <Button onClick={() => runMutation(() => approveReport(sessionId))}>
                    Approve Report
                  </Button>
                  <div className="flex flex-1 flex-wrap items-end gap-2">
                    <div className="min-w-[200px] flex-1 space-y-1">
                      <Label>Rejection note</Label>
                      <Input value={rejectNote} onChange={(e) => setRejectNote(e.target.value)} />
                    </div>
                    <Button
                      variant="danger"
                      disabled={!rejectNote.trim()}
                      onClick={() => runMutation(() => rejectReport(sessionId, rejectNote))}
                    >
                      Reject Report
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificates">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Award className="h-4 w-4 text-brand-700" />
                Certificates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {session.certificates_issued ? (
                <p className="text-sm text-brand-700 font-medium">Certificates have been issued for this session.</p>
              ) : (
                <>
                  <p className="text-sm text-gray-600">
                    {eligibleCount} eligible participant{eligibleCount !== 1 ? 's' : ''} (PRESENT, post-test ≥ 80%)
                  </p>
                  {canIssueCerts && session.report_approval_status === 'APPROVED' && (
                    <Button
                      onClick={() => runMutation(() => issueCertificates(sessionId))}
                      disabled={eligibleCount === 0}
                    >
                      Issue Certificates
                    </Button>
                  )}
                </>
              )}
              <div className="space-y-2">
                {session.participants
                  .filter((p) => p.certificate_serial)
                  .map((p) => (
                    <div key={p.id} className="flex items-center justify-between rounded-lg border px-4 py-3">
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="font-mono text-xs text-brand-700">{p.certificate_serial}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/verify/${p.certificate_serial}`}>Verify</Link>
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setPrintTarget(p)}>
                          <Printer className="h-4 w-4" />
                          Print
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {printTarget && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4">
          <div className="w-full max-w-3xl">
            <div className="mb-4 flex justify-end gap-2 print:hidden">
              <Button variant="outline" onClick={() => window.print()}>Print</Button>
              <Button variant="ghost" onClick={() => setPrintTarget(null)}>Close</Button>
            </div>
            <CertificatePrint session={session} participant={printTarget} />
          </div>
        </div>
      )}
    </div>
  )
}
