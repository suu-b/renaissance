"""
VCS API is the abstraction the fastapi process will make use of. The reason for making use of an abstraction layer is easy migration. Right now, we would need the user to have git on their machine for the application to work expectedly. However, this is a requirement which is silly given the target audience of the application are non-technical people primarily. 
For now, we have planned to mandate the installation of git. However, I have plans to later migrate to some pythonlib which mirrors enough git to fit in our usecase. I am using git rn because I want some standardized things user must be able to do in the MVP. If another alternative, in later examination, proves to be powerful enough I will create a provider of it and migrate using it.

Note: Default provider is git, can be changed using env override
"""

import os
import logging
from provider.git import GitProvider

logging.basicConfig(
    level=logging.INFO,
    format='%(levelname)s: %(asctime)s - %(name)s - %(message)s'
)
    
class VCS:
    def __init__(self, provider_code, repo_path):
        def _load_provider():
            if provider_code == 'GIT':
                return GitProvider(repo_path=repo_path)
        
        self._provider = _load_provider()
        self._logger = logging.getLogger(__name__)

    def init_user(self, repo_path):
        self._logger.info("Initializing user..")
        self._logger.info("Setup requires: user repo path")

        self._logger.info("Creating the user directory..")
        os.mkdir(repo_path)

        self._logger.info("Initializing a vcs repo in the user directory..")




