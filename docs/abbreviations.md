# Abbreviations

1. CGS (Common GitHub Store): A repo in my personal github account that would store all the user projects in one single monorepo. Each user would get their share in form of a subdir.

2. CAR (Common API Response): A common API response spec of our API. Data user requested if any would be inside data field of CAR.

3. CGS-local: A local copy of the CGS in remote service. User publish requests (patches) would be serially applied on it and queued to be pushed onto CGS. Essentially, it is a critical section but a proxy to disallow direct user engagement with the CGS.