import { useParams, useNavigate } from "react-router-dom"
import Page from "@renderer/components/layout/Page"
import ChapterReader from "@renderer/components/ui/ChapterReader"
import BackLink from "@renderer/components/ui/BackLink"
import Breadcrumbs from "@renderer/components/ui/Breadcrumbs"

// Sample chapter content - this would come from API in real usage
const sampleChapterContent = `The morning sun cast long shadows across the cobblestone streets as Eleanor made her way through the ancient city. She had lived here for all of her twenty-three years, yet each dawn brought with it a sense of wonder that never seemed to fade.

The marketplace was already bustling with activity when she arrived. Merchants called out their wares in a dozen different languages, the air thick with the scent of fresh bread, exotic spices, and the unmistakable aroma of coffee brewing in the corner café.

"Good morning, Eleanor!" called old Mr. Henderson from his flower stall. "The roses are particularly fine today."

She smiled and waved, continuing on her path. She had a destination in mind, one that had occupied her thoughts for weeks now. The old library at the edge of town held secrets that she was determined to uncover.

The library was a magnificent structure, its stone walls covered in climbing ivy and its windows tall and arched. Inside, the air was cool and smelled of old paper and leather bindings. Eleanor had spent countless hours here, lost in worlds that existed only between the covers of ancient books.

But today was different. Today she was looking for something specific—a manuscript that had been mentioned in her grandfather's journals, a text that supposedly held the key to understanding the strange symbols that had been appearing throughout the city.

She moved through the aisles with purpose, her fingers trailing along the spines of countless volumes until she found what she was seeking. There, tucked away in a forgotten corner, was a book bound in dark leather with silver lettering that seemed to shimmer in the dim light.

With trembling hands, she pulled it from the shelf and opened it to the first page. The writing was unlike anything she had ever seen— flowing and elegant, yet somehow alien. As she began to read, she felt a strange sensation wash over her, as if she were being pulled into the very words themselves.

The chapter of her life was about to change in ways she could never have imagined.`

export default function Chapter() {
  const { projectId, chapterId } = useParams<{ projectId: string; chapterId: string }>()
  const navigate = useNavigate()

  const chapterNumber = parseInt(chapterId || "1")
  const totalChapters = 20 // This would come from project data

  const handlePrevious = () => {
    if (chapterNumber > 1) {
      navigate(`/project/${projectId}/chapter/${chapterNumber - 1}`)
    }
  }

  const handleNext = () => {
    if (chapterNumber < totalChapters) {
      navigate(`/project/${projectId}/chapter/${chapterNumber + 1}`)
    }
  }

  const handleEdit = () => {
    // This would navigate to an edit page or open an edit mode
    console.log("Edit chapter", chapterId)
  }

  return (
    <Page alignment="default" className="max-w-4xl mx-auto">
      <div className="mb-6">
        <BackLink fallbackPath={`/project/${projectId}`} />
        <Breadcrumbs
          items={[
            { label: 'Dashboard', path: '/dashboard' },
            { label: `Project ${projectId}`, path: `/project/${projectId}` },
            { label: `Chapter ${chapterNumber}` }
          ]}
        />
      </div>

      <ChapterReader
        title={`Chapter ${chapterNumber}: The Beginning`}
        content={sampleChapterContent}
        chapterNumber={chapterNumber}
        totalChapters={totalChapters}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onEdit={handleEdit}
      />
    </Page>
  )
}
