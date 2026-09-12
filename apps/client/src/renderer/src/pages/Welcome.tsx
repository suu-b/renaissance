import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { OAuthService } from "../services/oauthService"
import { useAuth } from "../context/AuthContext"
import { useWorkspace } from "../context/WorkspaceContext"

import Page from "../components/layout/Page"
import Button from "../components/ui/Button"
import Typography from "../components/ui/Typography"

export default function Welcome(): React.JSX.Element {
    const { authenticated, checkAuth, setAuthenticatedUser } = useAuth();
    const { setWorkspacePath, setIndexFilePath } = useWorkspace();

    const navigate = useNavigate();
    const [setupStatus, setSetupStatus] = useState<'idle' | 'checking' | 'setup_needed' | 'doing_setup' | 'complete' | 'error' | 'leftovers_detected'>('idle');
    const [setupStep, setSetupStep] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');

    const handleContinue = () => {
        window.api.maximizeWindow();
        navigate("/dashboard");
    };

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
            // Check if git is installed
            setSetupStep('Preparing your workspace...');
            console.log('Checking git installation...');
            const gitInstalled = await window.api.checkGitInstalled();
            console.log('Git installed:', gitInstalled);
            
            if (!gitInstalled) {
                console.log('Git not installed, setting error');
                setSetupStatus('error');
                setErrorMessage('Git is required to begin. Please install it first.');
                return;
            }
            
            // Check if renaissance folder exists
            setSetupStep('Seeking your creative space...');
            console.log('Checking renaissance folder...');
            const folderExists = await window.api.folderExists('renaissance');
            console.log('Renaissance folder exists:', folderExists);
            
            if (folderExists) {
                // Folder exists, proceed to dashboard
                console.log('Folder exists, proceeding to dashboard');
                setSetupStatus('complete');
                setTimeout(() => {
                    window.api.maximizeWindow();
                    navigate("/dashboard");
                }, 500);
            } else {
                // Folder doesn't exist, do setup
                console.log('Folder does not exist, setting setup_needed');
                setSetupStatus('setup_needed');
            }
        } catch (error) {
            console.error('Setup check failed:', error);
            setSetupStatus('error');
            setErrorMessage('Setup check failed');
        }
    };

    const performSetup = async () => {
        setSetupStatus('doing_setup');
        setSetupStep('Creating your sanctuary...');
        
        try {
            // Pass false for withAccount since this is the "Continue without Account" flow
            const result = await window.api.doSetup(false);
            
            if (result.success) {
                // Setup successful, verify again
                await checkUserSetup();
                setWorkspacePath(result.workspacePath || null);
                setIndexFilePath(result.indexFilePath || null);
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

    const performAuthenticatedSetup = async () => {
        setSetupStatus('doing_setup');
        setSetupStep('Creating your sanctuary...');
        
        try {
            // Pass true for withAccount since this is the authenticated flow
            const result = await window.api.doSetup(true);
            
            if (result.success) {
                // Setup successful, verify again
                await checkUserSetup();
                setWorkspacePath(result.workspacePath || null);
                setIndexFilePath(result.indexFilePath || null);
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
        try {
            const oauthService = OAuthService.getInstance();
            const authUrl = await oauthService.startOAuthFlow();
            window.api.startOAuth(authUrl);
        } catch (error) {
            console.error("Error starting OAuth flow:", error);
        }
    };

    useEffect(() => {
        const handleOAuthCallback = async (result: {
        success: boolean;
        data?: {
            authenticated?: boolean;
            email?: string;
        };
    }) => {
            console.debug('OAuth result received in renderer:', result);
            if (
            result.success &&
            result.data?.authenticated &&
            result.data?.email
            ) {
                console.log('OAuth callback successful, authenticated via local server');
                await setAuthenticatedUser(result.data.email);
            } else {
                console.error('OAuth callback failed: authentication unsuccessful');
            } 

            if (window.api?.onOAuthCallback) {
                console.log('Setting up OAuth callback listener');
                window.api.onOAuthCallback(handleOAuthCallback);
            }

            return () => {
                if(window.api?.removeOAuthCallback) {
                    window.api.removeOAuthCallback();
                }
            }
        };
        
        if (window.api?.onOAuthCallback) {
            console.log('Setting up OAuth callback listener');
            window.api.onOAuthCallback(handleOAuthCallback);
        }

        return () => {
            if(window.api?.removeOAuthCallback) {
                window.api.removeOAuthCallback();
            }
        };
    }, [setAuthenticatedUser]);


    useEffect(() => {
        if (authenticated && setupStatus === 'idle') {
            checkUserSetup();
        }
    }, [authenticated, setupStatus, checkUserSetup]);

    return (
        <Page alignment="center" showSkeleton={false}>
            <div className="flex flex-col gap-3 max-w-[50vw]">
                <Typography variant="h1">Renaissance</Typography>

                <Typography variant="lead" className="text-muted-foreground">
                    A bower for thee. A quiet place for thought, creation, and things worth keeping.
                </Typography>

                {authenticated === null ? (
                    <div className="flex justify-start items-center gap-4 mt-8">
                        <div className="animate-pulse flex space-x-1">
                            <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <Typography variant="muted">
                            Loading...
                        </Typography>
                    </div>
                ) : setupStatus !== 'idle' ? (
                    // Show setup flow for both authenticated and non-authenticated users when setup is in progress
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
                                    onClick={authenticated ? performAuthenticatedSetup : performSetup}
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
                                    onClick={authenticated ? performAuthenticatedSetup : performSetup}
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
                ) : authenticated ? (
                    // Authenticated user with idle status
                    <div className="flex flex-col justify-start items-start gap-6 mt-8">
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={handleContinue}
                        >
                            Continue to Dashboard
                        </Button>
                    </div>
                ) : (
                    // Not authenticated with idle status - show sign in options
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