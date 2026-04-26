import logging
import json
from pathlib import Path
from datetime import datetime
from pydantic import BaseModel
import uuid

from vcs.provider.git import GitProvider
from util.provider import Provider


class Project(BaseModel):
    id: str
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

        project_id = str(uuid.uuid4())
        project_dir = self._base_repo_path / project_id
        project_dir.mkdir(parents=True, exist_ok=True)

        projects_file = self.get_projects_file_path()
        data = json.loads(projects_file.read_text()) if projects_file.exists() else []

        project = Project(
            id=project_id,
            name=name,
            description=description,
            created_at=created_at
        )

        data.append(project.model_dump(mode="json"))
        projects_file.write_text(json.dumps(data, indent=2))

        return project_id

    def _resolve(self, project_id: str, relative_path: str):
        base = (self._base_repo_path / project_id).resolve()

        if not relative_path:
            return base

        target = (base / relative_path).resolve()

        if not str(target).startswith(str(base)):
            raise RuntimeError("Invalid path")

        if not target.exists():
            raise RuntimeError(f"Path does not exist: {relative_path}")

        if not target.is_dir():
            raise RuntimeError(f"Path is not a directory: {relative_path}")

        return target

    def _write_metadata(self, path: Path, meta: dict):
        path.write_text(json.dumps(meta, indent=2))

    def _create_metadata(self, file_id: str, label: str, node_type: str):
        return {
            "id": file_id,
            "label": label,
            "type": node_type,
            "created_at": datetime.now().isoformat()
        }

    def create_file(self, project_id: str, relative_path: str, label: str, content: str = ""):
        self._logger.info("Creating file..")

        file_uuid = str(uuid.uuid4())

        dir_path = self._resolve(project_id, relative_path)

        md_file = dir_path / f"{file_uuid}.md"
        json_file = dir_path / f"{file_uuid}.json"

        if md_file.exists() or json_file.exists():
            raise RuntimeError("File already exists")

        md_file.write_text(content)

        self._write_metadata(
            json_file,
            self._create_metadata(file_uuid, label, "file")
        )

        return file_uuid

    def create_folder(self, project_id: str, relative_path: str, label: str):
        self._logger.info("Creating folder..")

        folder_uuid = str(uuid.uuid4())

        parent_dir = self._resolve(project_id, relative_path)
        folder_path = parent_dir / folder_uuid

        if folder_path.exists():
            raise RuntimeError("Folder already exists")

        folder_path.mkdir()

        return folder_uuid

    def commit_all(self, message: str):
        self._logger.info(f"Committing all changes: {message}")
        self._provider.add(["."])
        self._provider.commit(message)

    def commit(self, project_id: str, path: str, message: str):
        self._logger.info(f"Committing path {path}: {message}")

        base = (self._base_repo_path / project_id).resolve()
        target = (base / path).resolve()

        if not str(target).startswith(str(base)):
            raise RuntimeError("Invalid path")

        if not target.exists():
            raise RuntimeError("Path does not exist")

        # rel_path = target.relative_to(base)

        self._provider.add([str(target)])
        self._provider.commit(message)