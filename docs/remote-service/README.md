# Remote Service

Remote Service will be a Node backend service running on some cloud. It would act as a layer between various user instances of Renaissance on their machines and CGS-Repo & Supabase.

## How it fits in the user flow?
Currently, as per V1 scope.

Generally, it would come into picture in the following usecases:

1. User wants to push their local work to CGS-repo. Instead of allowing their local Node server to directly interact with CGS-repo, they would submit a push request to the remote service. Remote Service would first validate it for security reasons (like checking if the push is allowed & the user is legit) and then queue the request.

2. User wants to query metadata or their own personal data. This means fetching data from Supabase.

3. User wants to register or signup. This means interacting with Supabase.


Any way, I do not want user to directly deal with these remote services for security reasons. Because enabling so would mean embedding secrets in the shipped product which is a terrible idea.