#!/usr/bin/env python3
import argparse
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_ROOT = ROOT / "data"
CONTENT_ROOT = ROOT / "content"
TRANSCRIPT_ROOT = ROOT / "transcripts"
STATE_PATH = ROOT / "state" / "videos.json"


def git(*args: str) -> str:
    result = subprocess.run(["git"] + list(args), check=True, capture_output=True, text=True, cwd=ROOT)
    return result.stdout.strip()


def is_git_repo() -> bool:
    try:
        git("status")
        return True
    except subprocess.CalledProcessError:
        return False


def init_git_repo() -> None:
    if not (ROOT / ".git").exists():
        git("init")
        git("config", "user.email", "youtube-pipeline@example.com")
        git("config", "user.name", "YouTube Pipeline")
        (ROOT / ".gitignore").write_text("logs/\n__pycache__/\n*.pyc\n")
        git("add", ".gitignore")
        git("commit", "-m", "Initial commit with .gitignore")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--remote", help="Git remote URL (e.g., https://github.com/user/repo.git)")
    parser.add_argument("--branch", default="main", help="Branch name")
    parser.add_argument("--message", default="chore(youtube): update daily video summaries")
    args = parser.parse_args()

    if not is_git_repo():
        init_git_repo()

    # Add all new/changed files
    git("add", "data/", "content/", "transcripts/", "state/", "logs/")

    # Check if there are changes
    status = git("status", "--porcelain")
    if not status:
        print("No changes to commit")
        return

    # Commit
    git("commit", "-m", args.message)

    # Push if remote is set
    if args.remote:
        # Add remote if not exists
        try:
            git("remote", "get-url", "origin")
        except subprocess.CalledProcessError:
            git("remote", "add", "origin", args.remote)

        # Push
        git("push", "-u", "origin", args.branch)
        print(f"Pushed to {args.remote} branch {args.branch}")
    else:
        print("Committed locally (no remote specified)")


if __name__ == "__main__":
    try:
        main()
    except subprocess.CalledProcessError as e:
        print(f"Git error: {e.stderr}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
