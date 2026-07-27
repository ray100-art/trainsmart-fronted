import { useQuery } from '@tanstack/react-query'
import { getMoodleInfo } from '@/api/moodle'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, ExternalLink, GraduationCap } from 'lucide-react'

export function MoodlePage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['moodle'],
    queryFn: getMoodleInfo,
  })

  if (isLoading) {
    return <p className="text-sm text-gray-500">Loading Moodle configuration…</p>
  }

  if (isError || !data) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-black text-gray-900">Moodle LMS</h1>
        <Card>
          <CardContent className="py-8 text-center text-sm text-red-700">
            Could not load Moodle configuration.
          </CardContent>
        </Card>
      </div>
    )
  }

  const categoriesUrl = data.url && data.categories_path ? `${data.url}${data.categories_path}` : null
  const coursesUrl = data.url && data.courses_path ? `${data.url}${data.courses_path}` : null

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Learning Management</p>
        <h1 className="mt-1 text-2xl font-black text-gray-900">Moodle LMS</h1>
        <p className="text-sm text-gray-500">Access national training courses and categories</p>
      </div>

      {data.enabled ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-brand-700" />
                <CardTitle>Course Categories</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">Browse Moodle course categories for national training content.</p>
              {categoriesUrl && (
                <Button asChild>
                  <a href={categoriesUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    Open Categories
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-brand-700" />
                <CardTitle>Course Search</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">Search and enrol in available Moodle training courses.</p>
              {coursesUrl && (
                <Button asChild>
                  <a href={coursesUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    Search Courses
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <GraduationCap className="h-10 w-10 text-gray-300" />
            <p className="text-sm font-semibold text-gray-700">Moodle is not configured</p>
            <p className="max-w-md text-sm text-gray-500">
              MOODLE_URL is not set on the server. Contact a system administrator to enable Moodle integration.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
