import React from "react"

import Page from "../components/layout/Page"
import Typography from "../components/ui/Typography"

export default function Dashboard(): React.JSX.Element {
    return (
        <Page alignment="center">
            <div className="flex flex-col gap-4 max-w-[50vw]">
                <Typography variant="h1">Dashboard</Typography>
                <Typography variant="p">Welcome to your Renaissance workspace.</Typography>
                <Typography variant="muted">This is a placeholder for the main application interface.</Typography>
            </div>
        </Page>
    )
}
