import subprocess
from pathlib import Path

class GitProvider:
    def __init__(self, repo_path: str):
        self.repo_path = Path(repo_path)

    def init(self):
        self.repo_path.mkdir(parents=True, exist_ok=True)
        self._run_git(["init"])

    def is_repo(self) -> bool:
        return (self.repo_path / ".git").exists()

    def ensure_repo(self):
        if not self.is_repo():
            self.init()

    def set_user(self, name: str, email: str):
        self._run_git(["config", "user.name", name])
        self._run_git(["config", "user.email", email])

    def add(self, paths=None):
        paths = paths or ["."]
        self._run_git(["add"] + paths)

    def commit(self, message: str):
        self._run_git(["commit", "-m", message])

    def commit_all(self, message: str):
        self.add(["."])
        self.commit(message)

    def status(self):
        return self._run_git(["status", "--porcelain"], check=False)

    def log(self, n=10):
        return self._run_git(["log", f"-n{n}", "--oneline"], check=False)

    def current_branch(self):
        return self._run_git(["rev-parse", "--abbrev-ref", "HEAD"])

    def create_branch(self, name: str):
        self._run_git(["branch", name])

    def checkout(self, name: str):
        self._run_git(["checkout", name])

    def get_head_commit(self):
        return self._run_git(["rev-parse", "HEAD"])

    def has_changes(self) -> bool:
        return bool(self.status())
    
    def _run_git(self, args, cwd=None, check=True):
        result = subprocess.run(
            ["git"] + args,
            cwd=cwd or self.repo_path,
            text=True,
            capture_output=True
        )

        if check and result.returncode != 0:
            raise RuntimeError(result.stderr.strip())

        return result.stdout.strip()