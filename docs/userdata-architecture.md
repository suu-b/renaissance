# User Project Data Handling Architecture

## Background
Data inside Renaissance could be classified into various categories. One of those many categories is User Data. This means personal, not necessarily critical, data of the user. For example, a user's credentials are critical user data, whereas their projects are non-critical user data.

## User Project Data
User project data is a kind of non-critical user data that involves information about and the content of their projects.

## Agenda
This document outlines the requirements for user project data in terms of versioning, collaboration, and storage, and various implementation options to fulfill those requirements. Importantly, these options are incremental and evolutionary. So, an option may not be the best one, but it may be a good stepping stone for a better implementation. 

## The Requirements

### Versioning & Collaboration
One of the selling points of the product is that each user project is versioned and collaborative. Therefore, we would require a service in our backend for versioning and collaboration. 

To handle such data, we need a robust, time-proven, and reliable tool. The de facto tool for this purpose is Git. So, as a first step, we will use Git to handle user project data. Also, for now, we have decided to mandate git installation on the user's device as a dependency. 

### Storage
Our product is local-first, which means that user project data will primarily live on the user's device. However, they may want to back up their data on the cloud or collaborate with others. To support that, we need a reliable service that could be used to handle these storage-related methods.

And since our versioning & collaboration is handled by Git, the cloud storage, for now, is GitHub. 

## Scaling
These two options - Git for versioning & collaboration and GitHub for cloud storage - are good for MVP but may not scale well. For example, a user may not want to download Git on their device. 

Therefore, we must count our options and prioritize them incrementally for an ideal product. Following is a roadmap I have come up with. I am using V&C as an acronym for Versioning and Collaboration.

1. Git On User Machine (V&C) + Git Hosting Platform - GitHub/GitLab/BitBucket, etc. (Storage)
2. Lightweight Git Impl bundled in the product (V&C) + Git Hosting Platform - GitHub/GitLab/BitBucket, etc. (Storage)
3. Lightweight Git Impl bundled in the product (V&C) + Cloud Storage - AWS S3 etc. (Storage)
4. Cloud Native Backend (for both V&C and Storage)

We can easily scale the project to the third point. The fourth point is an El Dorado for us - it may not be possible for us to reach there, but we will keep that in our minds and try to keep our code base modular and scalable enough to reach there.

This further implies that we may need an elegant, decoupled design for the two core services - V&C and Storage. I have decided to have an abstraction (an interface in our TS sense) for both of these services. Core backend would refer to this abstraction only, while we are free to replace the actual provider behind it. 

Interestingly, this design choice has unexpectedly provided us another feature offering: we can allow users to choose between various cloud providers. It is upon their will to choose between AWS, GitHub, etc. 