import logging
from datetime import datetime

from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel

from vcs.main import VCS

logger = logging.getLogger(__name__)

vcs_router = APIRouter(prefix="/vcs", tags=["vcs"])

def get_vcs(request: Request) -> VCS:
    config = request.app.state.config
    return VCS(
        provider_code=config.provider,
        repo_path=config.user_data
    )


class ProjectCreate(BaseModel):
    name: str
    description: str


class FileCreate(BaseModel):
    project_name: str
    relative_path: str
    label: str
    content: str = ""


class FolderCreate(BaseModel):
    project_name: str
    relative_path: str
    label: str


class CommitAllRequest(BaseModel):
    message: str


class CommitRequest(BaseModel):
    path: str
    message: str



@vcs_router.post("/init")
def init_user(vcs: VCS = Depends(get_vcs)):
    logger.info("Initializing VCS for current user")

    vcs.init_user()

    return {
        "status": "success"
    }


@vcs_router.post("/project")
def create_project(payload: ProjectCreate, vcs: VCS = Depends(get_vcs)):
    logger.info(f"Creating project '{payload.name}'")

    created_at = datetime.now()
    vcs.create_project(
        name=payload.name,
        description=payload.description,
        created_at=created_at
    )

    return {
        "status": "success",
        "project_name": payload.name,
        "description": payload.description,
        "created_at": created_at.isoformat()
    }


@vcs_router.post("/file")
def create_file(payload: FileCreate, vcs: VCS = Depends(get_vcs)):
    logger.info(f"Creating file '{payload.label}' in project '{payload.project_name}'")

    vcs.create_file(
        project_name=payload.project_name,
        relative_path=payload.relative_path,
        label=payload.label,
        content=payload.content
    )

    return {
        "status": "success",
        "project_name": payload.project_name,
        "relative_path": payload.relative_path,
        "label": payload.label
    }


@vcs_router.post("/folder")
def create_folder(payload: FolderCreate, vcs: VCS = Depends(get_vcs)):
    logger.info(f"Creating folder '{payload.label}' in project '{payload.project_name}'")

    vcs.create_folder(
        project_name=payload.project_name,
        relative_path=payload.relative_path,
        label=payload.label
    )

    return {
        "status": "success",
        "project_name": payload.project_name,
        "relative_path": payload.relative_path,
        "label": payload.label
    }


@vcs_router.post("/commit-all")
def commit_all(payload: CommitAllRequest, vcs: VCS = Depends(get_vcs)):
    logger.info(f"Committing all changes: {payload.message}")

    vcs.commit_all(message=payload.message)

    return {
        "status": "success",
        "message": payload.message,
        "committed_at": datetime.now().isoformat()
    }


@vcs_router.post("/commit")
def commit(payload: CommitRequest, vcs: VCS = Depends(get_vcs)):
    logger.info(f"Committing path '{payload.path}': {payload.message}")

    vcs.commit(path=payload.path, message=payload.message)

    return {
        "status": "success",
        "path": payload.path,
        "message": payload.message,
        "committed_at": datetime.now().isoformat()
    }