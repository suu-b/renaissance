import { useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Typography from '../ui/Typography'
import { FiGitBranch, FiArrowRight, FiCheckCircle, FiLoader } from 'react-icons/fi'
import { config } from '../../config'

type MergeWizardProps = {
  isOpen: boolean
  projectId?: string
  branchName: string
  currentBranchId?: string
  mainBranchId?: string
  onClose: () => void
}

export default function MergeWizard({ isOpen, projectId, branchName, currentBranchId, mainBranchId, onClose }: MergeWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null)
  const [changedFiles, setChangedFiles] = useState<Array<{ filePath: string; chapterId: string; chapterName: string }>>([])
  const [fileDiffs, setFileDiffs] = useState<Array<{ filePath: string; chapterId: string; chapterName: string; diff: string }>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchChangedFiles = async () => {
    if (!projectId || !currentBranchId || !mainBranchId || !config.serverUrl) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${config.serverUrl}/api/v1/user/data/project/branches/diff`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectId,
          sourceBranch: currentBranchId,
          targetBranch: mainBranchId
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error?.message || result.error || 'Failed to fetch changed files')
      }

      const files = result.data.changedFiles || []
      const diffs = result.data.diffs || []
      setChangedFiles(files)
      setFileDiffs(diffs)

      return files.length > 0
    } catch (err) {
      console.error('Failed to fetch changed files:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch changed files')
      return false
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmMerge = async () => {
    const hasChanges = await fetchChangedFiles()
    if (hasChanges) {
      setCurrentStep(2)
    } else {
      // No changes to merge
      setCurrentStep(4)
    }
  }

  const handleStartMerge = async () => {
    setCurrentStep(3)
    // Simulate merge process
    setTimeout(() => {
      setCurrentStep(4)
    }, 3000)
  }

  const handleClose = () => {
    setCurrentStep(1)
    setSelectedChapter(null)
    setChangedFiles([])
    setFileDiffs([])
    setError(null)
    onClose()
  }

  const renderStep1 = () => (
    <div className="flex flex-col items-center py-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-foreground/10 border-2 border-foreground/30 flex items-center justify-center mb-2">
            <FiGitBranch className="text-foreground text-2xl" />
          </div>
          <Typography variant="small" className="text-muted-foreground">
            {branchName}
          </Typography>
        </div>

        <FiArrowRight className="text-foreground text-3xl" />

        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center mb-2">
            <FiGitBranch className="text-primary text-2xl" />
          </div>
          <Typography variant="small" className="text-muted-foreground">
            main
          </Typography>
        </div>
      </div>

      <Typography variant="p" className="text-center mb-6">
        Merge changes from <span className="font-semibold text-foreground">{branchName}</span> into
        main branch
      </Typography>

      <Typography variant="muted" className="text-center">
        This action will merge all changes from the branch into the main branch.
      </Typography>
    </div>
  )

  const renderStep2 = () => (
    <div className="py-4">
      {loading && (
        <div className="flex flex-col items-center py-8">
          <FiLoader className="text-4xl text-foreground animate-spin mb-4" />
          <Typography variant="muted">Loading changes...</Typography>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <Typography variant="small" className="text-red-600">
            {error}
          </Typography>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="mb-4">
            <Typography variant="muted" className="mb-2">
              Found {changedFiles.length} files with changes:
            </Typography>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto mb-4">
            {changedFiles.map((file) => (
              <div
                key={file.chapterId}
                className="border border-foreground/20 rounded-lg overflow-hidden bg-background"
              >
                <button
                  onClick={() => setSelectedChapter(selectedChapter === file.chapterId ? null : file.chapterId)}
                  className={`w-full p-4 flex items-center justify-between transition-colors text-left ${
                    selectedChapter === file.chapterId ? 'bg-foreground/10' : 'hover:bg-foreground/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <Typography variant="p" className="font-medium">
                        {file.chapterName}
                      </Typography>
                      <Typography variant="small" className="text-muted-foreground">
                        Modified in branch
                      </Typography>
                    </div>
                  </div>
                  <div
                    className={`w-2 h-2 rounded-full transition-transform ${
                      selectedChapter === file.chapterId ? 'rotate-90 bg-foreground' : 'bg-foreground/30'
                    }`}
                  />
                </button>

                {selectedChapter === file.chapterId && (
                  <div className="border-t border-foreground/20 bg-foreground/[0.02]">
                    <div className="p-4">
                      {(() => {
                        const diff = fileDiffs.find(d => d.chapterId === file.chapterId)?.diff
                        if (!diff) return <div className="text-sm text-muted-foreground">No diff available</div>

                        const lines = diff.split('\n')
                        return (
                          <div className="font-mono text-sm bg-background/50 p-3 rounded border border-foreground/10 overflow-x-auto">
                            {lines.map((line, index) => {
                              if (line.startsWith('diff --git')) {
                                return (
                                  <div key={index} className="text-blue-600 font-semibold py-0.5">
                                    {line}
                                  </div>
                                )
                              }
                              if (line.startsWith('index ')) {
                                return (
                                  <div key={index} className="text-gray-500 py-0.5">
                                    {line}
                                  </div>
                                )
                              }
                              if (line.startsWith('---') || line.startsWith('+++')) {
                                return (
                                  <div key={index} className="text-gray-600 py-0.5">
                                    {line}
                                  </div>
                                )
                              }
                              if (line.startsWith('@@')) {
                                return (
                                  <div key={index} className="text-purple-600 font-semibold py-0.5">
                                    {line}
                                  </div>
                                )
                              }
                              if (line.startsWith('+')) {
                                return (
                                  <div key={index} className="text-green-600 bg-green-50 py-0.5 px-1">
                                    {line}
                                  </div>
                                )
                              }
                              if (line.startsWith('-')) {
                                return (
                                  <div key={index} className="text-red-600 bg-red-50 py-0.5 px-1">
                                    {line}
                                  </div>
                                )
                              }
                              return (
                                <div key={index} className="py-0.5">
                                  {line}
                                </div>
                              )
                            })}
                          </div>
                        )
                      })()}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <Typography variant="small" className="text-foreground font-semibold">
            This action is not reversible
          </Typography>

          <Typography variant="muted" className="mb-4">
            Please review all changes before continuing.
          </Typography>
        </>
      )}
    </div>
  )



  const renderStep3 = () => (
    <div className="flex flex-col items-center py-8">
      <FiLoader className="text-4xl text-foreground animate-spin mb-4" />
      <Typography variant="h3" className="mb-2">
        Merging Changes
      </Typography>
      <Typography variant="muted">Please wait while we merge the changes...</Typography>

      <div className="w-full bg-foreground/10 rounded-full h-2 mt-6">
        <div
          className="bg-foreground h-2 rounded-full transition-all duration-1000 animate-pulse"
          style={{ width: '70%' }}
        />
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="flex flex-col items-center py-8">
      <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
        <FiCheckCircle className="text-foreground text-3xl" />
      </div>
      <Typography variant="h3" className="mb-2">
        Merge Successful
      </Typography>
      <Typography variant="p" className="text-center mb-6">
        Changes from <span className="font-semibold">{branchName}</span> have been successfully
        merged into main.
      </Typography>
      <Typography variant="muted" className="text-center">
        {changedFiles.length} files were updated in the process.
      </Typography>
    </div>
  )

  const getModalTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Merge Branch'
      case 2:
        return 'Review Changes'
      case 3:
        return 'Merging...'
      case 4:
        return 'Success'
      default:
        return 'Merge Branch'
    }
  }

  const getOnConfirm = () => {
    switch (currentStep) {
      case 1:
        return handleConfirmMerge
      case 2:
        return handleStartMerge
      case 3:
        return () => {} // No action during progress
      case 4:
        return handleClose
      default:
        return () => {}
    }
  }

  const getOnCancel = () => {
    switch (currentStep) {
      case 3:
        return () => {} // Can't cancel during progress
      default:
        return handleClose
    }
  }

  const getShowButtons = () => {
    return currentStep !== 3 // Hide buttons during progress
  }

  const getConfirmButtonText = () => {
    switch (currentStep) {
      case 1:
        return 'Review Changes'
      case 2:
        return 'Continue'
      case 4:
        return 'Close'
      default:
        return 'Confirm'
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      title={getModalTitle()}
      onConfirm={getOnConfirm()}
      onCancel={getOnCancel()}
      maxWidth={currentStep === 3 ? 'max-w-lg' : 'max-w-5xl'}
      showDefaultButtons={false}
    >
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}
      {currentStep === 4 && renderStep4()}

      {getShowButtons() && (
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" size="sm" onClick={getOnCancel()}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={getOnConfirm()}>
            {getConfirmButtonText()}
          </Button>
        </div>
      )}
    </Modal>
  )
}
