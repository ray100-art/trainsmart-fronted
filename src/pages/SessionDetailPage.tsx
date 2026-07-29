import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import {
  approveReport, approveSession, completeSession, getSession, rejectReport, rejectSession, submitReport,
} from '@/api/sessions'
import { addParticipant, removeParticipant, toggleAttendance, updateScores } from '@/api/participants'
import { listPeople } from '@/api/people'
import { addTrainer, issueCertificates, removeTrainer, signCertificates } from '@/api/certificates'
import { useAuth } from '@/hooks/useAuth'
import { hasPermission } from '@/lib/roles'
import { CADRE_OPTIONS } from '@/lib/constants'
import { ParticipantBulkImport } from '@/components/sessions/ParticipantBulkImport'
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
import {
  ArrowLeft, Award, Printer, Trash2, MapPin, CalendarDays,
  Users, CheckCircle, XCircle, AlertTriangle, UserPlus, UserCheck, PenLine, Flag,
} from 'lucide-react'
import type { Participant } from '@/types'
import { cn } from '@/lib/utils'

export function SessionDetailPage() {
  const { sessionId = '' } = useParams()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [error, setError] = useState('')
  const [rejectNote, setRejectNote] = useState('')
  const [reportForm, setReportForm] = useState({ summary: '', challenges: '', recommendations: '' })
  const [participantForm, setParticipantForm] = useState({
    name: '', cadre: CADRE_OPTIONS[0], facility: '', staff_number: '', person_id: '',
  })
  const [peopleSearch, setPeopleSearch] = useState('')
  const [trainerForm, setTrainerForm] = useState({ name: '', cadre: CADRE_OPTIONS[0], phone: '' })
  const [printTarget, setPrintTarget] = useState<Participant | null>(null)

  const { data: session, isLoading, isError, error: loadError, refetch } = useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => getSession(sessionId),
    enabled: !!sessionId,
  })

  const { data: peopleMatches } = useQuery({
    queryKey: ['people', 'picker', peopleSearch, user?.county],
    queryFn: () => listPeople({ q: peopleSearch, county: user?.county, limit: 8 }),
    enabled: peopleSearch.trim().length >= 2,
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['session', sessionId] })
    queryClient.invalidateQueries({ queryKey: ['sessions'] })
  }

  const runMutation = async (fn: () => Promise<unknown>) => {
    setError('')
    try { await fn(); invalidate() }
    catch (err) { setError(getApiErrorMessage(err)) }
  }

  const approveSessionMut = useMutation({
    mutationFn: () => approveSession(sessionId),
    onSuccess: invalidate,
    onError: (err) => setError(getApiErrorMessage(err)),
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-100" />
        <div className="h-32 animate-pulse rounded-xl bg-gray-100" />
        <div className="h-64 animate-pulse rounded-xl bg-gray-100" />
      </div>
    )
  }

  if (isError || !session) {
    return (
      <div className="space-y-4 rounded-xl border border-red-200 bg-red-50 px-5 py-8">
        <p className="text-sm font-semibold text-red-800">Could not load this session.</p>
        <p className="text-sm text-red-700">{getApiErrorMessage(loadError) || 'Session not found or you do not have access.'}</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/sessions">Back to sessions</Link>
          </Button>
        </div>
      </div>
    )
  }

  const canManageSession = hasPermission(user!.role, 'sessions:create') && !session.certificates_issued
  const canApprove       = hasPermission(user!.role, 'sessions:approve')
  const canIssueCerts    = hasPermission(user!.role, 'certificates:issue')
  const canComplete      = canManageSession && session.approval_status === 'APPROVED' && session.status !== 'COMPLETED'
  const canSignCerts     = canIssueCerts && session.certificates_issued && !session.certificates_signed

  const eligibleCount = session.participants.filter(
    (p) => p.status === 'PRESENT' && (p.post_test_score ?? 0) >= 80 && !p.certificate_serial,
  ).length

  return (
    <div className="space-y-6">
      {/* ── Back + heading ── */}
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-3 -ml-1 text-gray-500 hover:text-gray-900">
          <Link to="/sessions">
            <ArrowLeft className="h-4 w-4" />
            Back to sessions
          </Link>
        </Button>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-black leading-tight text-gray-900">{session.title}</h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
              {session.program_code && (
                <span className="rounded bg-brand-50 px-2 py-0.5 font-mono text-xs font-semibold text-brand-700 ring-1 ring-brand-200">
                  {session.program_code}
                  {session.program_name ? ` · ${session.program_name}` : ''}
                </span>
              )}
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {session.facility}, {session.county}
              </span>
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" />
                {formatDate(session.start_date)} – {formatDate(session.end_date)}
              </span>
              {session.venue && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> Venue: {session.venue}
                </span>
              )}
              {session.funding_source && (
                <span className="flex items-center gap-1">
                  Funding: {session.funding_source}
                </span>
              )}
              {session.sponsor_name && (
                <span className="flex items-center gap-1">
                  Sponsor: {session.sponsor_name}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {session.trainee_count} participant{session.trainee_count !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant={statusBadgeVariant(session.status)} dot>
              {session.status.replace(/_/g, ' ')}
            </Badge>
            <Badge variant={statusBadgeVariant(session.approval_status)} dot>
              Session: {session.approval_status}
            </Badge>
          </div>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl bg-red-50 px-4 py-3 ring-1 ring-red-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Workflow stepper */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-bold uppercase tracking-widest text-gray-400">
            Workflow Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-5">
          <WorkflowStepper session={session} />
        </CardContent>
      </Card>

      {/* Approval action card */}
      {canApprove && session.approval_status === 'PENDING' && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <CardTitle className="text-amber-900">County approval required</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button
              onClick={() => approveSessionMut.mutate()}
              disabled={approveSessionMut.isPending}
              className="flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Approve Session
            </Button>
            <div className="flex flex-1 flex-wrap items-end gap-2">
              <div className="min-w-50 flex-1 space-y-1">
                <Label className="text-xs">Rejection reason</Label>
                <Input
                  value={rejectNote}
                  onChange={(e) => setRejectNote(e.target.value)}
                  placeholder="Describe reason for rejection…"
                />
              </div>
              <Button
                variant="danger"
                disabled={!rejectNote.trim()}
                onClick={() => runMutation(() => rejectSession(sessionId, rejectNote))}
                className="flex items-center gap-2"
              >
                <XCircle className="h-4 w-4" />
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {canComplete && (
        <Card className="border-brand-200 bg-brand-50/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-brand-700" />
              <CardTitle className="text-brand-900">Mark training complete</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-brand-800">
              This session is approved. Mark it as completed when training has finished.
            </p>
            <Button onClick={() => runMutation(() => completeSession(sessionId))}>
              <CheckCircle className="h-4 w-4" />
              Complete Session
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── Tabs ── */}
      <Tabs defaultValue="overview">
        <TabsList className="w-full justify-start overflow-x-auto rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="participants">
            Participants
            <span className="ml-1.5 rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-600">
              {session.participants.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="trainers">
            Trainers
            <span className="ml-1.5 rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-600">
              {session.trainers.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="report">Report</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
        </TabsList>

        {/* Overview tab */}
        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <dl className="grid gap-5 sm:grid-cols-2">
                {[
                  ['Facility',      session.facility],
                  ['County',        session.county],
                  session.venue ? ['Venue', session.venue] : null,
                  session.funding_source ? ['Funding Source', session.funding_source] : null,
                  session.sponsor_name ? ['Sponsor', session.sponsor_name] : null,
                  ['Start Date',    formatDate(session.start_date)],
                  ['End Date',      formatDate(session.end_date)],
                  ['Participants',  String(session.trainee_count)],
                  ['Certificates',  session.certificates_issued
                    ? (session.certificates_signed ? 'Issued & signed ✓' : 'Issued (pending sign)')
                    : 'Not issued'],
                  session.approved_by_name ? ['Reviewed by', session.approved_by_name] : null,
                ].filter((x): x is string[] => x !== null).map(([k, v]) => (
                  <div key={k!}>
                    <dt className="text-[11px] font-bold uppercase tracking-widest text-gray-400">{k}</dt>
                    <dd className="mt-1 text-sm font-semibold text-gray-900">{v}</dd>
                  </div>
                ))}
                {session.approval_note && (
                  <div className="sm:col-span-2">
                    <dt className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Approval note</dt>
                    <dd className="mt-1 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">{session.approval_note}</dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Participants tab */}
        <TabsContent value="participants" className="mt-4 space-y-4">
          {canManageSession && session.approval_status !== 'APPROVED' && (
            <Card className="border-amber-200 bg-amber-50/50">
              <CardContent className="flex items-start gap-3 py-4">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                <div>
                  <p className="font-semibold text-amber-900">Session approval required</p>
                  <p className="mt-1 text-sm text-amber-800">
                    Participants can only be added after a County Officer approves this session.
                    Current status: <strong>{session.approval_status}</strong>.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
          {canManageSession && session.approval_status === 'APPROVED' && (
            <ParticipantBulkImport sessionId={sessionId} onImported={invalidate} />
          )}
          {canManageSession && session.approval_status === 'APPROVED' && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-brand-700" />
                  <CardTitle>Add participant</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2 space-y-2">
                  <Label>Find in people registry</Label>
                  <Input
                    placeholder="Search by name or National ID…"
                    value={peopleSearch}
                    onChange={(e) => setPeopleSearch(e.target.value)}
                  />
                  {peopleMatches && peopleMatches.items.length > 0 && (
                    <div className="max-h-40 overflow-y-auto rounded-lg border bg-white text-sm">
                      {peopleMatches.items.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          className="flex w-full flex-col items-start gap-0.5 border-b px-3 py-2 text-left last:border-0 hover:bg-brand-50"
                          onClick={() => {
                            const fullName = [p.first_name, p.middle_name, p.last_name].filter(Boolean).join(' ')
                            setParticipantForm({
                              person_id: p.id,
                              name: fullName,
                              cadre: p.qualification,
                              facility: p.facility,
                              staff_number: '',
                            })
                            setPeopleSearch(`${fullName} (${p.national_id})`)
                          }}
                        >
                          <span className="font-medium text-gray-900">
                            {p.first_name} {p.last_name}
                          </span>
                          <span className="text-xs text-gray-500">
                            ID {p.national_id} · {p.qualification} · {p.facility}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                  {participantForm.person_id && (
                    <p className="text-xs text-brand-700">
                      Linked to people registry. Clear search to add manually instead.
                    </p>
                  )}
                </div>
                <Input
                  placeholder="Full name *"
                  value={participantForm.name}
                  onChange={(e) => setParticipantForm({ ...participantForm, name: e.target.value, person_id: '' })}
                />
                <Select
                  value={participantForm.cadre}
                  onValueChange={(v) => setParticipantForm({ ...participantForm, cadre: v, person_id: participantForm.person_id })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CADRE_OPTIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Health facility *"
                  value={participantForm.facility}
                  onChange={(e) => setParticipantForm({ ...participantForm, facility: e.target.value, person_id: '' })}
                />
                <Input
                  placeholder="Staff / National ID (optional)"
                  value={participantForm.staff_number}
                  onChange={(e) => setParticipantForm({ ...participantForm, staff_number: e.target.value })}
                />
                <Button
                  className="sm:col-span-2"
                  disabled={!participantForm.person_id && (!participantForm.name || !participantForm.facility)}
                  onClick={() => runMutation(async () => {
                    await addParticipant(sessionId, {
                      person_id: participantForm.person_id || undefined,
                      name: participantForm.name || undefined,
                      cadre: participantForm.cadre || undefined,
                      facility: participantForm.facility || undefined,
                      staff_number: participantForm.staff_number || undefined,
                    })
                    setParticipantForm({ name: '', cadre: CADRE_OPTIONS[0], facility: '', staff_number: '', person_id: '' })
                    setPeopleSearch('')
                  })}
                >
                  <UserPlus className="h-4 w-4" />
                  Add Participant
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm md:block">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  {['Name', 'Cadre', 'Attendance', 'Pre-test', 'Post-test', 'Certificate', canManageSession ? '' : null]
                    .filter((x) => x !== null)
                    .map((h) => (
                      <th key={h ?? 'action'} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-gray-400">
                        {h}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {session.participants.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-gray-900">{p.name}</td>
                    <td className="px-4 py-3 text-gray-600">{p.cadre}</td>
                    <td className="px-4 py-3">
                      {canManageSession ? (
                        <button
                          type="button"
                          onClick={() => runMutation(() => toggleAttendance(sessionId, p.id))}
                          className="cursor-pointer transition-opacity hover:opacity-80"
                          title="Click to toggle attendance"
                        >
                          <Badge variant={statusBadgeVariant(p.status)} dot>
                            {p.status}
                          </Badge>
                        </button>
                      ) : (
                        <Badge variant={statusBadgeVariant(p.status)} dot>{p.status}</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {canManageSession ? (
                        <Input
                          type="number"
                          className="h-8 w-20 text-center"
                          defaultValue={p.pre_test_score ?? ''}
                          onBlur={(e) => {
                            const pre = parseFloat(e.target.value) || 0
                            runMutation(() => updateScores(sessionId, p.id, { pre_test_score: pre, post_test_score: p.post_test_score ?? 0 }))
                          }}
                        />
                      ) : (
                        <span className="text-gray-700">{p.pre_test_score ?? '—'}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {canManageSession ? (
                        <Input
                          type="number"
                          className={cn('h-8 w-20 text-center', p.post_test_score != null && p.post_test_score >= 80 ? 'border-brand-300 bg-brand-50 text-brand-800' : '')}
                          defaultValue={p.post_test_score ?? ''}
                          onBlur={(e) => {
                            const post = parseFloat(e.target.value) || 0
                            runMutation(() => updateScores(sessionId, p.id, { pre_test_score: p.pre_test_score ?? 0, post_test_score: post }))
                          }}
                        />
                      ) : (
                        <span className={cn('font-medium', p.post_test_score != null && p.post_test_score >= 80 ? 'text-brand-700' : 'text-gray-700')}>
                          {p.post_test_score ?? '—'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-brand-700">
                      {p.certificate_serial ?? '—'}
                    </td>
                    {canManageSession && (
                      <td className="px-4 py-3">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => runMutation(() => removeParticipant(sessionId, p.id))}
                          className="text-red-400 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {session.participants.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-12 text-center">
                <Users className="h-8 w-8 text-gray-300" />
                <p className="text-sm text-gray-500">No participants registered yet.</p>
              </div>
            )}
          </div>

          {/* Mobile stacked cards */}
          <div className="space-y-3 md:hidden">
            {session.participants.length === 0 && (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white py-12 text-center">
                <Users className="h-8 w-8 text-gray-300" />
                <p className="text-sm text-gray-500">No participants registered yet.</p>
              </div>
            )}
            {session.participants.map((p) => (
              <div key={p.id} className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-gray-900">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.cadre}</p>
                  </div>
                  {canManageSession ? (
                    <button
                      type="button"
                      onClick={() => runMutation(() => toggleAttendance(sessionId, p.id))}
                      className="shrink-0"
                    >
                      <Badge variant={statusBadgeVariant(p.status)} dot>{p.status}</Badge>
                    </button>
                  ) : (
                    <Badge variant={statusBadgeVariant(p.status)} dot>{p.status}</Badge>
                  )}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[11px] uppercase tracking-wide text-gray-400">Pre-test</Label>
                    {canManageSession ? (
                      <Input
                        type="number"
                        inputMode="decimal"
                        className="h-11 text-center"
                        defaultValue={p.pre_test_score ?? ''}
                        onBlur={(e) => {
                          const pre = parseFloat(e.target.value) || 0
                          runMutation(() => updateScores(sessionId, p.id, { pre_test_score: pre, post_test_score: p.post_test_score ?? 0 }))
                        }}
                      />
                    ) : (
                      <p className="text-sm text-gray-700">{p.pre_test_score ?? '—'}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] uppercase tracking-wide text-gray-400">Post-test</Label>
                    {canManageSession ? (
                      <Input
                        type="number"
                        inputMode="decimal"
                        className={cn(
                          'h-11 text-center',
                          p.post_test_score != null && p.post_test_score >= 80 ? 'border-brand-300 bg-brand-50 text-brand-800' : '',
                        )}
                        defaultValue={p.post_test_score ?? ''}
                        onBlur={(e) => {
                          const post = parseFloat(e.target.value) || 0
                          runMutation(() => updateScores(sessionId, p.id, { pre_test_score: p.pre_test_score ?? 0, post_test_score: post }))
                        }}
                      />
                    ) : (
                      <p className={cn('text-sm font-medium', p.post_test_score != null && p.post_test_score >= 80 ? 'text-brand-700' : 'text-gray-700')}>
                        {p.post_test_score ?? '—'}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2 border-t border-gray-100 pt-3">
                  <p className="font-mono text-xs font-semibold text-brand-700">
                    {p.certificate_serial ?? 'No certificate'}
                  </p>
                  {canManageSession && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => runMutation(() => removeParticipant(sessionId, p.id))}
                      className="text-red-500 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Trainers tab */}
        <TabsContent value="trainers" className="mt-4 space-y-4">
          {canManageSession && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-brand-700" />
                  <CardTitle>Add co-trainer</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-3">
                <Input
                  placeholder="Full name *"
                  value={trainerForm.name}
                  onChange={(e) => setTrainerForm({ ...trainerForm, name: e.target.value })}
                />
                <Select
                  value={trainerForm.cadre}
                  onValueChange={(v) => setTrainerForm({ ...trainerForm, cadre: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CADRE_OPTIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Phone *"
                  value={trainerForm.phone}
                  onChange={(e) => setTrainerForm({ ...trainerForm, phone: e.target.value })}
                />
                <Button
                  className="sm:col-span-3"
                  disabled={!trainerForm.name || !trainerForm.phone}
                  onClick={() => runMutation(async () => {
                    await addTrainer(sessionId, trainerForm)
                    setTrainerForm({ name: '', cadre: CADRE_OPTIONS[0], phone: '' })
                  })}
                >
                  <UserCheck className="h-4 w-4" />
                  Add Co-trainer
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="space-y-2">
            {session.trainers.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3.5 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                    {t.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.cadre} · {t.phone}</p>
                  </div>
                </div>
                {canManageSession && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => runMutation(() => removeTrainer(sessionId, t.id))}
                    className="text-red-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            ))}
            {session.trainers.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-12 text-center">
                <UserCheck className="h-8 w-8 text-gray-300" />
                <p className="text-sm text-gray-500">No co-trainers added.</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Report tab */}
        <TabsContent value="report" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Training Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {session.report_summary && session.report_approval_status !== 'REJECTED' ? (
                <>
                  {[
                    ['Summary', session.report_summary],
                    session.report_challenges ? ['Challenges', session.report_challenges] : null,
                    session.report_recommendations ? ['Recommendations', session.report_recommendations] : null,
                  ].filter((x): x is string[] => x !== null).map(([label, text]) => (
                    <div key={label} className="rounded-xl bg-gray-50 px-4 py-3">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">{label}</p>
                      <p className="mt-1.5 text-sm leading-relaxed whitespace-pre-wrap text-gray-800">{text}</p>
                    </div>
                  ))}
                  <Badge variant={statusBadgeVariant(session.report_approval_status)} dot>
                    {session.report_approval_status}
                  </Badge>
                  {session.report_approval_note && (
                    <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800 ring-1 ring-red-200">
                      <strong>Note:</strong> {session.report_approval_note}
                    </div>
                  )}
                </>
              ) : canManageSession && session.approval_status === 'APPROVED' && !session.certificates_issued ? (
                <>
                  {session.report_approval_status === 'REJECTED' && session.report_approval_note && (
                    <div className="flex items-start gap-3 rounded-xl bg-red-50 px-4 py-3 ring-1 ring-red-200">
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                      <p className="text-sm text-red-800">
                        <strong>Report rejected:</strong> {session.report_approval_note}. Please revise and resubmit.
                      </p>
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-widest text-gray-500">Summary *</Label>
                    <Textarea
                      rows={4}
                      value={reportForm.summary}
                      onChange={(e) => setReportForm({ ...reportForm, summary: e.target.value })}
                      placeholder="Describe training outcomes, key topics covered, and participant engagement…"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-widest text-gray-500">Challenges</Label>
                    <Textarea
                      rows={3}
                      value={reportForm.challenges}
                      onChange={(e) => setReportForm({ ...reportForm, challenges: e.target.value })}
                      placeholder="Any challenges encountered during the training…"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-widest text-gray-500">Recommendations</Label>
                    <Textarea
                      rows={3}
                      value={reportForm.recommendations}
                      onChange={(e) => setReportForm({ ...reportForm, recommendations: e.target.value })}
                      placeholder="Recommendations for future sessions…"
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
                <div className="flex flex-col items-center gap-2 py-10 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                    <Award className="h-5 w-5 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">No report submitted yet.</p>
                </div>
              )}

              {canApprove && session.report_submitted_at && session.report_approval_status === 'PENDING' && (
                <div className="flex flex-wrap gap-3 rounded-xl bg-amber-50 px-4 py-4 ring-1 ring-amber-200">
                  <Button
                    onClick={() => runMutation(() => approveReport(sessionId))}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve Report
                  </Button>
                  <div className="flex flex-1 flex-wrap items-end gap-2">
                    <div className="min-w-50 flex-1 space-y-1">
                      <Label className="text-xs">Rejection note</Label>
                      <Input value={rejectNote} onChange={(e) => setRejectNote(e.target.value)} />
                    </div>
                    <Button
                      variant="danger"
                      disabled={!rejectNote.trim()}
                      onClick={() => runMutation(() => rejectReport(sessionId, rejectNote))}
                      className="flex items-center gap-2"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject Report
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Certificates tab */}
        <TabsContent value="certificates" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-brand-700" />
                <CardTitle>Certificates</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {session.certificates_issued ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 rounded-xl bg-brand-50 px-4 py-3 ring-1 ring-brand-200">
                    <CheckCircle className="h-4 w-4 text-brand-600" />
                    <p className="text-sm font-semibold text-brand-800">
                      Certificates have been issued for this session.
                      {session.certificates_signed && ' They have been signed by national admin.'}
                    </p>
                  </div>
                  {canSignCerts && (
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-amber-50 px-4 py-3 ring-1 ring-amber-200">
                      <p className="text-sm text-amber-900">Certificates are awaiting national signature.</p>
                      <Button onClick={() => runMutation(() => signCertificates(sessionId))}>
                        <PenLine className="h-4 w-4" />
                        Sign Certificates
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-gray-50 px-4 py-3">
                  <p className="text-sm text-gray-600">
                    <span className="font-bold text-brand-700">{eligibleCount}</span> eligible
                    participant{eligibleCount !== 1 ? 's' : ''}{' '}
                    <span className="text-gray-400">(PRESENT + post-test ≥ 80%)</span>
                  </p>
                  {canIssueCerts && session.report_approval_status === 'APPROVED' && (
                    <Button
                      onClick={() => runMutation(() => issueCertificates(sessionId))}
                      disabled={eligibleCount === 0}
                    >
                      <Award className="h-4 w-4" />
                      Issue Certificates
                    </Button>
                  )}
                </div>
              )}

              <div className="space-y-2">
                {session.participants
                  .filter((p) => p.certificate_serial)
                  .map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm"
                    >
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{p.name}</p>
                        <p className="font-mono text-xs font-semibold text-brand-700">
                          {p.certificate_serial}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/verify/${p.certificate_serial}`}>Verify</Link>
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setPrintTarget(p)}>
                          <Printer className="h-3.5 w-3.5" />
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

      {/* Print modal */}
      {printTarget && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl">
            <div className="mb-4 flex justify-end gap-2 print:hidden">
              <Button onClick={() => window.print()}>
                <Printer className="h-4 w-4" />
                Print Certificate
              </Button>
              <Button variant="outline" onClick={() => setPrintTarget(null)}>
                Close
              </Button>
            </div>
            <CertificatePrint session={session} participant={printTarget} />
          </div>
        </div>
      )}
    </div>
  )
}
