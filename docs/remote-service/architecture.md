# Remote Service Architecture

## Lifecycle

1. Before listening, I would like the Node service to clone the CGS repo in some session directory. This is CGS-local. Once it is cloned, then only the service must start listening.
2. A graceful shutdown would involve the service deleting CGS-local. Our initial choice for deployment of the service is render. Render allows ephemeral storage. But to not shock our code in case we later migrate to some persisting storage, we are manually wiping away the data for now. But this has its implications - in case we up many sibling node services this model fails as there are multiple copies of CGS-local. We would need to ensure atomicity in push requests, which is hard. At least theoretical solutions can be thought of. <br/> For this, maybe retries are sufficient as well to avoid race conditions. 


