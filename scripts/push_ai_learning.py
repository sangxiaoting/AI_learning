#!/usr/bin/env python3
import argparse
import subprocess
import sys
from pathlib import Path


def git(repo: Path, *args: str) -> str:
    result = subprocess.run(["git", *args], cwd=repo, check=True, capture_output=True, text=True)
    return result.stdout.strip()


def ensure_clean_rebase_push(repo: Path, branch: str, message: str) -> None:
    git(repo, "add", "public/data/youtube", "public/content/youtube", "public/transcripts/youtube")
    status = git(repo, "status", "--porcelain")
    if not status:
        print("AI_learning: no changes to commit")
        return

    git(repo, "commit", "-m", message)
    git(repo, "pull", "--rebase", "origin", branch)
    git(repo, "push", "origin", branch)
    print(f"AI_learning: pushed to origin/{branch}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo", default="/Users/sangxiaoting/.openclaw/workspace/AI_learning")
    parser.add_argument("--branch", default="main")
    parser.add_argument("--message", default="chore(youtube): sync generated YouTube content")
    args = parser.parse_args()

    repo = Path(args.repo).resolve()
    if not (repo / ".git").exists():
        raise RuntimeError(f"AI_learning repo not found: {repo}")

    ensure_clean_rebase_push(repo, args.branch, args.message)


if __name__ == "__main__":
    try:
        main()
    except subprocess.CalledProcessError as e:
        stderr = (e.stderr or "").strip()
        stdout = (e.stdout or "").strip()
        print(stderr or stdout or str(e), file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(str(e), file=sys.stderr)
        sys.exit(1)
