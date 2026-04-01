#!/usr/bin/env python3
import argparse
import json
import os
import re
import subprocess
import sys
import urllib.error
import urllib.request
from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent.parent
WORKSPACE = ROOT.parent
SKILL_SCRIPT = WORKSPACE / "skills" / "bilibili-youtube-watcher" / "scripts" / "get_transcript.py"
CHANNELS_PATH = ROOT / "config" / "channels.json"
PROMPT_PATH = ROOT / "config" / "prompt_system.txt"
STATE_PATH = ROOT / "state" / "videos.json"
DATA_ROOT = ROOT / "data" / "youtube"
CONTENT_ROOT = ROOT / "content" / "youtube"
TRANSCRIPT_ROOT = ROOT / "transcripts" / "youtube"
LOGS_ROOT = ROOT / "logs"
DEFAULT_BASE_URL = "https://api.minimaxi.com/v1/text/chatcompletion_v2"


@dataclass
class Channel:
    name: str
    url: str
    category: str
    lang: str
    enabled: bool = True


@dataclass
class Video:
    video_id: str
    url: str
    title: str
    uploader: str
    upload_date: str
    duration: str
    channel: Channel


def load_json(path: Path) -> Any:
    if not path.exists():
        return {}
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def run_command(command: list[str]) -> str:
    result = subprocess.run(command, check=True, capture_output=True, text=True)
    return result.stdout.strip()


def month_text(date_str: str) -> str:
    dt = datetime.strptime(date_str, "%Y-%m-%d")
    return f"{dt.strftime('%b')} {dt.day}"


def slugify(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-") or "video"


def load_channels() -> list[Channel]:
    raw = load_json(CHANNELS_PATH)
    channels = []
    for item in raw.get("channels", []):
        channels.append(Channel(**item))
    return [channel for channel in channels if channel.enabled]


def resolve_latest_urls(channel: Channel, limit_per_channel: int) -> list[str]:
    output = run_command([
        "yt-dlp",
        "--flat-playlist",
        "--playlist-end",
        str(limit_per_channel),
        "--print",
        "webpage_url",
        channel.url,
    ])
    return [line.strip() for line in output.splitlines() if line.strip()]


def fetch_video_metadata(url: str, channel: Channel) -> Video:
    output = run_command([
        "yt-dlp",
        "--skip-download",
        "--print",
        "%(id)s\t%(title)s\t%(uploader)s\t%(upload_date)s\t%(duration_string)s",
        url,
    ])
    video_id, title, uploader, upload_date, duration = output.split("\t", 4)
    formatted_date = datetime.strptime(upload_date, "%Y%m%d").strftime("%Y-%m-%d")
    return Video(
        video_id=video_id,
        url=url,
        title=title,
        uploader=uploader,
        upload_date=formatted_date,
        duration=duration,
        channel=channel,
    )


def fetch_transcript(video_url: str, lang: str) -> str:
    if not SKILL_SCRIPT.exists():
        raise FileNotFoundError(f"missing transcript script: {SKILL_SCRIPT}")
    result = subprocess.run(
        [sys.executable, str(SKILL_SCRIPT), video_url, "--lang", lang],
        check=True,
        capture_output=True,
        text=True,
    )
    return result.stdout.strip()


def build_user_prompt(video: Video, transcript: str) -> str:
    return (
        f"Video Title: {video.title}\n"
        f"Channel Name: {video.uploader}\n"
        f"Video ID: {video.video_id}\n"
        f"Date: {video.upload_date}\n"
        f"Duration: {video.duration}\n\n"
        f"Transcript:\n{transcript}\n"
    )


def call_minimax(system_prompt: str, user_prompt: str) -> dict[str, Any]:
    api_key = os.environ.get("MINIMAX_API_KEY")
    if not api_key:
        raise RuntimeError("MINIMAX_API_KEY is not set")
    model = os.environ.get("MINIMAX_MODEL", "MiniMax-M2.5")
    base_url = os.environ.get("YOUTUBE_PIPELINE_BASE_URL", DEFAULT_BASE_URL)
    payload = {
        "model": model,
        "temperature": 0.2,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
    }
    body = json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(
        base_url,
        data=body,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=180) as response:
            raw = response.read().decode("utf-8")
    except urllib.error.HTTPError as error:
        detail = error.read().decode("utf-8", errors="ignore")
        raise RuntimeError(f"MiniMax HTTP {error.code}: {detail}") from error
    data = json.loads(raw)
    content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
    if not content:
        raise RuntimeError(f"MiniMax empty response: {raw}")
    return json.loads(content)


def render_markdown(summary: dict[str, Any]) -> str:
    lines = [
        f"# {summary['title']}",
        "",
        f"- Author: `{summary['author']}`",
        f"- Date: `{summary['date']}`",
        f"- Duration: `{summary['duration']}`",
        f"- Link: {summary['link']}",
        f"- Tags: {', '.join(summary.get('tags', []))}",
        "",
        "## TL;DR",
        "",
        summary["tldr"],
        "",
        "## Takeaways",
        "",
    ]
    for takeaway in summary.get("takeaways", []):
        lines.append(f"- {takeaway}")
    lines.extend(["", "## Quote", "", f"> {summary['quote']}", "", "## Detailed Breakdown", ""])
    for section in summary.get("detailedBreakdown", []):
        lines.append(f"### {section['subtitle']}")
        lines.append("")
        for point in section.get("points", []):
            lines.append(f"- **{point['label']}**: {point['content']}")
        lines.append("")
    return "\n".join(lines).strip() + "\n"


def validate_summary(summary: dict[str, Any], video: Video) -> dict[str, Any]:
    required = ["id", "type", "title", "author", "date", "dateText", "duration", "tldr", "takeaways", "quote", "link", "tags", "detailedBreakdown"]
    missing = [key for key in required if key not in summary]
    if missing:
        raise RuntimeError(f"summary missing keys: {missing}")

    cleaned_breakdown = []
    for section in summary.get("detailedBreakdown") or []:
        if not section or not isinstance(section, dict):
            continue
        subtitle = section.get("subtitle") or "未命名章节"
        cleaned_points = []
        for point in section.get("points") or []:
            if not point or not isinstance(point, dict):
                continue
            label = point.get("label") or "核心观点归纳"
            content = point.get("content") or point.get("value") or ""
            if not content:
                continue
            cleaned_points.append({"label": label, "content": content})
        if cleaned_points:
            cleaned_breakdown.append({"subtitle": subtitle, "points": cleaned_points})

    summary["id"] = video.video_id
    summary["type"] = "youtube"
    summary["title"] = video.title
    summary["author"] = video.uploader
    summary["date"] = video.upload_date
    summary["dateText"] = month_text(video.upload_date)
    summary["duration"] = video.duration
    summary["link"] = video.url
    summary["takeaways"] = [item for item in (summary.get("takeaways") or []) if item][:5]
    summary["tags"] = [item for item in (summary.get("tags") or []) if item][:6]
    summary["detailedBreakdown"] = cleaned_breakdown[:6]
    return summary


def write_outputs(video: Video, transcript: str, summary: dict[str, Any]) -> None:
    day_dir = video.upload_date
    slug = slugify(video.channel.name)
    json_path = DATA_ROOT / day_dir / f"{slug}-{video.video_id}.json"
    md_path = CONTENT_ROOT / day_dir / f"{slug}-{video.video_id}.md"
    transcript_path = TRANSCRIPT_ROOT / day_dir / f"{video.video_id}.txt"
    save_json(json_path, summary)
    md_path.parent.mkdir(parents=True, exist_ok=True)
    md_path.write_text(render_markdown(summary), encoding="utf-8")
    transcript_path.parent.mkdir(parents=True, exist_ok=True)
    transcript_path.write_text(transcript, encoding="utf-8")


def update_latest_index() -> None:
    items = []
    for path in sorted(DATA_ROOT.glob("*/*.json"), reverse=True):
        items.append(load_json(path))
    save_json(DATA_ROOT / "latest.json", items[:50])


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit-per-channel", type=int, default=1)
    parser.add_argument("--discover-only", action="store_true")
    args = parser.parse_args()

    state = load_json(STATE_PATH)
    videos_state = state.setdefault("videos", {})
    channels = load_channels()
    system_prompt = PROMPT_PATH.read_text(encoding="utf-8")
    processed = 0

    for channel in channels:
        try:
            latest_urls = resolve_latest_urls(channel, args.limit_per_channel)
        except Exception as error:
            print(f"[warn] resolve channel failed: {channel.name}: {error}")
            continue
        for url in latest_urls:
            try:
                video = fetch_video_metadata(url, channel)
            except Exception as error:
                print(f"[warn] metadata failed: {url}: {error}")
                continue
            if video.video_id in videos_state and videos_state[video.video_id].get("status") == "done":
                continue
            record = {
                "title": video.title,
                "channel": video.uploader,
                "url": video.url,
                "date": video.upload_date,
                "duration": video.duration,
                "status": "discovered" if args.discover_only else "pending",
                "updatedAt": datetime.now(UTC).isoformat().replace("+00:00", "Z"),
            }
            videos_state[video.video_id] = record
            save_json(STATE_PATH, state)
            print(f"[info] discovered {video.video_id} {video.title}")
            if args.discover_only:
                continue
            try:
                transcript = fetch_transcript(video.url, channel.lang)
                summary = call_minimax(system_prompt, build_user_prompt(video, transcript))
                summary = validate_summary(summary, video)
                write_outputs(video, transcript, summary)
                videos_state[video.video_id]["status"] = "done"
                videos_state[video.video_id]["outputJson"] = str((DATA_ROOT / video.upload_date / f"{slugify(video.channel.name)}-{video.video_id}.json").relative_to(ROOT))
                save_json(STATE_PATH, state)
                processed += 1
                print(f"[ok] processed {video.video_id}")
            except Exception as error:
                videos_state[video.video_id]["status"] = "failed"
                videos_state[video.video_id]["error"] = str(error)
                save_json(STATE_PATH, state)
                print(f"[error] process failed {video.video_id}: {error}")

    if not args.discover_only:
        update_latest_index()
    print(f"[done] processed={processed}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
