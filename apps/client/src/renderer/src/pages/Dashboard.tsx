import React from "react"
import pfp from "../assets/pfp.jpeg"

import Page from "../components/layout/Page"
import Image from "../components/ui/Image"
import ProjectList from "../components/common/ProjectList"

export default function Dashboard(): React.JSX.Element {
    return (
        <Page alignment="default">
            <Image src={pfp} alt="Profile" variant="pfp" size="xl" className="mx-auto"/>
            <ProjectList size="lg" className="w-[50vw] mx-auto my-5"/>

        </Page>
    )
}
