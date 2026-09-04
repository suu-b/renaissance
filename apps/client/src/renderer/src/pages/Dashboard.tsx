import React from "react"

import Page from "../components/layout/Page"
import Typography from "../components/ui/Typography"
import ProjectList from "../components/common/ProjectList"
import SearchBar from "../components/ui/SearchBar"
import Activity from "../components/common/Activity"
import Explore from "../components/common/Explore"
import TextHighlight from "../components/ui/TextHighlight"

export default function Dashboard(): React.JSX.Element {
  return (
    <Page alignment="default" className="flex gap-4">
        <div className="mx-auto w-[62vw]">
        <div className="flex items-baseline justify-between">
          <div>
            <Typography variant="h1" >Welcome</Typography>
            <Typography variant="h1">
              <TextHighlight color="bg-primary" intensity={60}>
                Shubham!
              </TextHighlight>
            </Typography>
          </div>
          <div className="flex flex-col gap-1 text-right">
            <Typography variant="muted" className="text-muted-foreground">Words this week <span className="text-primary font-bold">253</span></Typography>
            <Typography variant="muted" className="text-muted-foreground">New chapters <span className="text-primary font-bold">2</span></Typography>
            <Typography variant="muted" className="text-muted-foreground">Branches created <span className="text-primary font-bold">5</span></Typography>
          </div>
        </div>

        <SearchBar placeholder="Search projects..." size="md" onChange={() => {
            console.log("Hey")
          }}
          className="my-5"
        />
        <ProjectList itemsPerPage={5} size="sm" className="my-5" />
        </div>
        <div className="mx-auto w-[25vw]">
             {/* <ArtistOfTheDay className="ml-auto mb-5" /> */}
            <Explore className="mb-4" />
            <Activity className="max-h-[40vh] overflow-y-auto" />
        </div>
    </Page>
  )
}
