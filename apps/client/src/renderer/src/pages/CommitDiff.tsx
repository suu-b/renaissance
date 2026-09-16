import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Page from '@renderer/components/layout/Page'
import BackLink from '@renderer/components/ui/BackLink'
import Typography from '@renderer/components/ui/Typography'
import { useBreadcrumb } from '@renderer/context/BreadcrumbContext'
import { config } from '@renderer/config'

type CommitDiffData = {
  diff: string
  hash: string
  filePath: string
}

export default function CommitDiff() {
  const { projectId, hash } = useParams<{
    projectId: string
    chapterId: string
    hash: string
  }>()

  const navigate = useNavigate()
  const { setBreadcrumbs } = useBreadcrumb()

  const [diffData, setDiffData] = useState<CommitDiffData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'Project', path: `/project/${projectId}` },
      { label: 'Milestone' }
    ])
  }, [projectId, setBreadcrumbs])

  useEffect(() => {
    const fetchDiff = async () => {
      if (!projectId || !hash || !config.serverUrl) {
        setError('Missing required parameters or server configuration')
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const filePath = `${projectId}.json`
        const response = await fetch(`${config.serverUrl}/api/v1/user/data/project/diff`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            project: projectId,
            filePath,
            hash
          })
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch diff: ${response.status}`)
        }

        const result = await response.json()
        const data = result.data || result

        if (!data) {
          throw new Error('No diff data received')
        }

        setDiffData(data)
      } catch (error) {
        console.error('Failed to fetch commit diff:', error)
        setError(error instanceof Error ? error.message : 'Failed to load commit diff')
      } finally {
        setLoading(false)
      }
    }

    fetchDiff()
  }, [projectId, hash])

  const parseDiff = (diff: string) => {
    const lines = diff.split('\n')
    const parsedLines = lines.map((line, index) => {
      const trimmedLine = line.trim()
      if (trimmedLine.startsWith('commit ') || trimmedLine.startsWith('Author:') || trimmedLine.startsWith('Date:') || trimmedLine.startsWith('+++') || trimmedLine.startsWith('---') || trimmedLine.startsWith('@@')) {
        return { type: 'header', content: line, key: index }
      } else if (trimmedLine.startsWith('+') && !trimmedLine.startsWith('+++')) {
        return { type: 'addition', content: line, key: index }
      } else if (trimmedLine.startsWith('-') && !trimmedLine.startsWith('---')) {
        return { type: 'deletion', content: line, key: index }
      } else {
        return { type: 'context', content: line, key: index }
      }
    })
    return parsedLines
  }

  return (
    <Page alignment="default" className="mx-auto max-w-4xl">
      <div className="mb-6">
        <BackLink fallbackPath={`/project/${projectId}}`} />
      </div>

      <div className="mb-6">
        <Typography variant="h2" className="text-foreground">
          Milestone Diff
        </Typography>
        <Typography variant="small" className="text-muted-foreground mt-1">
          {hash ? `Milestone: ${hash.slice(0, 8)}...` : 'Unknown commit'}
        </Typography>
      </div>

      {loading && (
        <div className="py-10 text-center text-muted-foreground">
          Loading milestone diff...
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {!loading && !error && diffData && (
        <div className="space-y-4">
          <div className="rounded-lg border border-foreground/15 bg-background overflow-hidden">
            <div className="border-b border-foreground/10 bg-muted/30 px-4 py-3">
              <Typography variant="small" className="text-foreground/70">
                File: {diffData.filePath}
              </Typography>
            </div>
            <div className="p-4 max-h-[600px] overflow-auto">
              <div className="font-mono text-sm whitespace-pre-wrap">
                {parseDiff(diffData.diff).map((line) => (
                  <div
                    key={line.key}
                    className={`py-0.5 px-1 ${
                      line.type === 'addition'
                        ? 'bg-green-50 text-green-700'
                        : line.type === 'deletion'
                        ? 'bg-red-50 text-red-700'
                        : line.type === 'header'
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-foreground/80'
                    }`}
                  >
                    {line.content || '\u00A0'}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </Page>
  )
}