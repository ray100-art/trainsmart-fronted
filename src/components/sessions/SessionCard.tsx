import type { TrainingSession } from '@/types'
import { Badge, statusBadgeVariant } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'
import { Link } from 'react-router-dom'
import { ChevronRight, MapPin, Users } from 'lucide-react'

interface SessionCardProps {
  session: TrainingSession
}

export function SessionCard({ session }: SessionCardProps) {
  return (
    <Link to={`/sessions/${session.id}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="line-clamp-2 text-base">{session.title}</CardTitle>
            <ChevronRight className="h-5 w-5 shrink-0 text-gray-400" />
          </div>
          <CardDescription className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {session.facility}, {session.county}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-xs text-gray-500">
            {formatDate(session.start_date)} – {formatDate(session.end_date)}
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant={statusBadgeVariant(session.status)}>{session.status.replace('_', ' ')}</Badge>
            <Badge variant={statusBadgeVariant(session.approval_status)}>
              Session: {session.approval_status}
            </Badge>
            {session.report_submitted_at && (
              <Badge variant={statusBadgeVariant(session.report_approval_status)}>
                Report: {session.report_approval_status}
              </Badge>
            )}
          </div>
          <p className="mt-3 flex items-center gap-1 text-xs text-gray-600">
            <Users className="h-3.5 w-3.5" />
            {session.trainee_count} participant{session.trainee_count !== 1 ? 's' : ''}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}
