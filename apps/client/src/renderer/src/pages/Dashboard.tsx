import React from "react"
import pfp from "../assets/pfp.jpeg"

import Page from "../components/layout/Page"
import Typography from "../components/ui/Typography"
import ProjectList from "../components/common/ProjectList"
import SearchBar from "../components/ui/SearchBar"
import ArtistOfTheDay from "../components/common/ArtistOfTheDay"
import Activity from "../components/common/Activity"

export default function Dashboard(): React.JSX.Element {
  return (
    <Page alignment="default" className="flex gap-4">
        <div className="mx-auto w-[60vw]">
        <div className="flex items-baseline justify-between">
          <div>
            <Typography variant="h1" >Welcome</Typography>
            <Typography variant="h1"><span className="text-primary italic">Shubham</span>!</Typography>
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
        <ProjectList itemsPerPage={4} size="sm" className="my-5" />
        </div>
        <div className="mx-auto w-[25vw]">
             <ArtistOfTheDay className="ml-auto mb-5" />
            <Activity/>
        </div>
    </Page>
  )
}
