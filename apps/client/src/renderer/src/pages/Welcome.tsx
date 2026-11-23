import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { useWorkspace } from "../context/WorkspaceContext"

import Page from "../components/layout/Page"
import Button from "../components/ui/Button"
import Typography from "../components/ui/Typography"

export default function Welcome(): React.JSX.Element {
    const { setWorkspacePath } = useWorkspace();

    const navigate = useNavigate();
    const [setupStatus, setSetupStatus] = useState<'idle' | 'checking' | 'setup_needed' | 'doing_setup' | 'complete' | 'error' | 'leftovers_detected'>('idle');
    const [setupStep, setSetupStep] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');

    const handleContinueWithoutAccount = async () => {
        console.log('Continue without Account button clicked');
        // Check for leftovers from previous installations
        try {
            console.log('Calling checkLeftovers...');
            const leftovers = await window.api.checkLeftovers();
            console.log('Leftovers result:', leftovers);

            if (leftovers) {
                // User has previous workspace, show message
                console.log('Setting status to leftovers_detected');
                setSetupStatus('leftovers_detected');
            } else {
                // No leftovers, proceed with setup
                console.log('No leftovers, calling checkUserSetup');
                checkUserSetup();
            }
        } catch (error) {
            console.error('Error checking leftovers:', error);
            // On error, proceed with setup
            console.log('Error occurred, proceeding with setup anyway');
            checkUserSetup();
        }
    };

    const checkUserSetup = async () => {
        console.log('checkUserSetup called');
        setSetupStatus('checking');
        console.log('Status set to checking');

        try {
            setSetupStep('Checking your setup state...');
            const setupState = await window.api.checkSetupState();
            console.log('Setup state:', setupState);

            if (setupState.setupComplete) {
                // Setup already complete, proceed to dashboard
                console.log('Setup already complete, proceeding to dashboard');
                setSetupStatus('complete');
                setTimeout(() => {
                    window.api.maximizeWindow();
                    navigate("/dashboard");
                }, 500);
            } else {
                // Setup needed
                console.log('Setup needed, setting setup_needed');
                setSetupStatus('setup_needed');
            }
        } catch (error) {
            console.error('Setup check failed:', error);
            setSetupStatus('setup_needed'); // Fallback to setup on error
        }
    };

    const performSetup = async () => {
        setSetupStatus('doing_setup');
        setSetupStep('Installing dependencies...');

        try {
            // Pass false for withAccount since this is the "Continue without Account" flow
            const result = await window.api.completeSetup(false);

            if (result.success) {
                // Setup successful, verify again
                setSetupStep('Finalizing setup...');
                await checkUserSetup();
                setWorkspacePath(result.workspacePath || null);
            } else {
                setSetupStatus('error');
                setErrorMessage(result.error || 'Setup failed');
            }
        } catch (error) {
            console.error('Setup failed:', error);
            setSetupStatus('error');
            setErrorMessage('Setup failed');
        }
    };

    const handleSignIn = async () => {
        // OAuth removed - button is unresponsive
        console.log("Sign In button clicked - OAuth functionality removed");
    };

    useEffect(() => {
        if (setupStatus === 'idle') {
            checkUserSetup();
        }
    }, [setupStatus, checkUserSetup]);

    return (
        <Page alignment="center">
            <div className="flex flex-col gap-3 max-w-[50vw]">
                <Typography variant="h1">Renaissance</Typography>

                <Typography variant="lead" className="text-muted-foreground">
                    A bower for thee. A quiet place for thought, creation, and things worth keeping.
                </Typography>

                {setupStatus !== 'idle' ? (
                    <div className="flex flex-col justify-start items-start gap-6 mt-8">
                        {setupStatus === 'checking' ? (
                            <div className="flex flex-col gap-4 w-full">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full"></div>
                                    </div>
                                    <Typography variant="muted" className="transition-all duration-300">
                                        {setupStep}
                                    </Typography>
                                </div>
                                <div className="h-1 bg-foreground/10 rounded-full overflow-hidden w-48">
                                    <div className="h-full bg-current animate-pulse rounded-full" style={{ width: '60%' }}></div>
                                </div>
                            </div>
                        ) : setupStatus === 'setup_needed' ? (
                            <div className="flex flex-col gap-4 w-full">
                                <div className="flex items-center gap-2">
                                    <div className="text-2xl mt-1">�</div>
                                    <Typography variant="muted" className="mt-1">
                                        Your workspace awaits creation
                                    </Typography>
                                </div>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={performSetup}
                                >
                                    Begin Setup
                                </Button>
                            </div>
                        ) : setupStatus === 'leftovers_detected' ? (
                            <div className="flex flex-col gap-4 w-full">
                                <div className="flex items-start gap-3">
                                    <div className="text-2xl mt-1">📁</div>
                                    <div className="flex flex-col gap-2">
                                        <Typography variant="muted">
                                            We found your previous workspace
                                        </Typography>
                                        <Typography variant="small" className="text-muted-foreground/70">
                                            It looks like you've used Renaissance before. We found your existing workspace folder.
                                        </Typography>
                                    </div>
                                </div>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={performSetup}
                                >
                                    Still Continue
                                </Button>
                            </div>
                        ) : setupStatus === 'doing_setup' ? (
                            <div className="flex flex-col gap-4 w-full">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full"></div>
                                    </div>
                                    <Typography variant="muted" className="transition-all duration-300">
                                        {setupStep}
                                    </Typography>
                                </div>
                                <div className="h-1 bg-foreground/10 rounded-full overflow-hidden w-48">
                                    <div className="h-full bg-current animate-pulse rounded-full" style={{ width: '80%' }}></div>
                                </div>
                            </div>
                        ) : setupStatus === 'complete' ? (
                            <div className="flex items-center gap-4 animate-fade-in">
                                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                                    <div className="text-green-500 text-lg">✓</div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <Typography variant="muted">
                                        Setup complete
                                    </Typography>
                                    <Typography variant="small" className="text-muted-foreground/70">
                                        Redirecting to dashboard...
                                    </Typography>
                                </div>
                            </div>
                        ) : setupStatus === 'error' ? (
                            <div className="flex flex-col gap-4 w-full">
                                <div className="flex items-start gap-3">
                                    <div className="text-2xl mt-1">⚠️</div>
                                    <div className="flex flex-col gap-2">
                                        <Typography variant="muted" className="text-red-400">
                                            {errorMessage}
                                        </Typography>
                                        <Typography variant="small" className="text-muted-foreground/70">
                                            Please resolve the issue and try again.
                                        </Typography>
                                    </div>
                                </div>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={checkUserSetup}
                                >
                                    Retry Setup
                                </Button>
                            </div>
                        ) : null}
                    </div>
                ) : (
                    <div className="flex flex-col gap-6 mt-8">
                        <div className="h-px bg-foreground/10 w-full"></div>
                        <div className="flex justify-start items-center gap-4">
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={handleSignIn}
                            >
                                Sign In
                            </Button>

                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={handleContinueWithoutAccount}
                            >
                                Continue without Account
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </Page>
    );
}