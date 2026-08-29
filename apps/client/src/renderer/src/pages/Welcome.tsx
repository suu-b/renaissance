import React from "react"
import { useNavigate } from "react-router-dom"

import Page from "../components/layout/Page"
import Button from "../components/ui/Button"
import Typography from "../components/ui/Typography"

export default function Welcome(): React.JSX.Element {
    const navigate = useNavigate()

    const handleContinue = () => {
        window.api.maximizeWindow()
        navigate('/dashboard')
    }

    return (
        <Page alignment="center">
            <div className="flex flex-col gap-2 max-w-[50vw]">
                <Typography variant="h1">Renaissance</Typography>
                <Typography variant="muted">A bower for thee. A quiet place for thought, creation, and things worth keeping.</Typography>

                <div className="flex justify-start items-center gap-4 mt-5">
                    <Button variant="primary" size="sm" onClick={handleContinue}>Continue</Button>
                    <Button variant="secondary" size="sm" href="http://localhost:3000/join" external>Sign up</Button>
                </div>
            </div>
        </Page>
    )
}