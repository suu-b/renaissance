import logging
import json
from pathlib import Path
from datetime import datetime
from pydantic import BaseModel
import uuid

from vcs.provider.git import GitProvider
from util.provider import Provider


class Project(BaseModel):
    name: str
    description: str
    created_at: datetime


class VCS:
    def __init__(self, provider_code, repo_path):
        def _load_provider():
            if provider_code == Provider.GIT:
                return GitProvider(repo_path=repo_path)
            raise RuntimeError(f"Invalid Provider code: {provider_code}")

        self._provider = _load_provider()
        self._base_repo_path = Path(repo_path)
        self._logger = logging.getLogger(__name__)

    def get_projects_file_path(self):
        return self._base_repo_path / "projects.json"

    def init_user(self):
        self._logger.info("Initializing user..")

        self._base_repo_path.mkdir(parents=True, exist_ok=True)

        projects_file = self.get_projects_file_path()
        if not projects_file.exists():
            projects_file.write_text(json.dumps([], indent=2))

        self._provider.init()

    def create_project(self, name, description, created_at):
        self._logger.info("Creating project..")

        project_dir = self._base_repo_path / name
        project_dir.mkdir(parents=True, exist_ok=True)

        projects_file = self.get_projects_file_path()

        data = json.loads(projects_file.read_text()) if projects_file.exists() else []

        project = Project(
            name=name,
            description=description,
            created_at=created_at
        )

        data.append(project.model_dump(mode="json"))
        projects_file.write_text(json.dumps(data, indent=2))

    def _resolve(self, project_name: str, relative_path: str):
        return (self._base_repo_path / project_name) / relative_path

    def _meta_path(self, path: Path):
        return path.parent / f"{path.name}.json"

    def _content_path(self, path: Path):
        return path.parent / f"{path.name}.md"

    def _write_metadata(self, path: Path, meta: dict):
        path.write_text(json.dumps(meta, indent=2))

    def _create_metadata(self, file_id: str, label: str, node_type: str):
        return {
            "id": file_id,
            "label": label,
            "type": node_type,
            "created_at": datetime.now().isoformat()
        }

    def create_file(self, project_name: str, relative_path: str, label: str, content: str = ""):
        self._logger.info("Creating file..")

        base = self._resolve(project_name, relative_path)

        file_id = str(uuid.uuid4())

        md_file = self._content_path(base)
        json_file = self._meta_path(base)

        md_file.parent.mkdir(parents=True, exist_ok=True)

        md_file.write_text(content)

        self._write_metadata(
            json_file,
            self._create_metadata(file_id, label, "file")
        )

    def create_folder(self, project_name: str, relative_path: str, label: str):
        self._logger.info("Creating folder..")

        base = self._resolve(project_name, relative_path)

        folder_id = str(uuid.uuid4())

        md_file = self._content_path(base)
        json_file = self._meta_path(base)

        md_file.parent.mkdir(parents=True, exist_ok=True)

        md_file.write_text("")

        self._write_metadata(
            json_file,
            self._create_metadata(folder_id, label, "folder")
        )

    def commit_all(self, message: str):
        self._logger.info(f"Committing all changes: {message}")
        self._provider.add(["."])
        self._provider.commit(message)


    def commit(self, path: str, message: str):
        self._logger.info(f"Committing path {path}: {message}")

        self._provider.add([path])
        self._provider.commit(message)