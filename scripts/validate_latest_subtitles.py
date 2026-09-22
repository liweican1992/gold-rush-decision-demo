#!/usr/bin/env python3
"""Validate video coverage, cue boundaries and generated WebVTT files."""

from __future__ import annotations

import json
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
VIDEO_DIR = ROOT / "public" / "videos" / "latest"
VTT_DIR = ROOT / "public" / "subtitles" / "latest"
SOURCE = ROOT / "src" / "demo" / "latestSubtitles.json"


def duration(path: Path) -> float:
    output = subprocess.check_output(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            str(path),
        ],
        text=True,
    )
    return float(output.strip())


def main() -> None:
    videos = {path.name: path for path in VIDEO_DIR.glob("*.mp4")}
    tracks = json.loads(SOURCE.read_text(encoding="utf-8"))["videos"]
    issues: list[str] = []

    missing = sorted(set(videos) - set(tracks))
    extra = sorted(set(tracks) - set(videos))
    if missing:
        issues.append(f"missing subtitle data: {', '.join(missing)}")
    if extra:
        issues.append(f"subtitle data without video: {', '.join(extra)}")

    cue_count = 0
    for filename, track in sorted(tracks.items()):
        video = videos.get(filename)
        if video is None:
            continue
        actual_duration = duration(video)
        if abs(actual_duration - float(track["duration"])) > 0.06:
            issues.append(
                f"{filename}: actual duration {actual_duration:.3f}, "
                f"declared {track['duration']:.3f}"
            )

        previous_end = 0.0
        for cue in track["cues"]:
            cue_count += 1
            start = float(cue["start"])
            end = float(cue["end"])
            if start < previous_end or end <= start or end > actual_duration + 0.02:
                issues.append(f"{filename}: invalid cue {cue}")
            previous_end = end

        vtt = VTT_DIR / f"{Path(filename).stem}.vtt"
        if not vtt.exists():
            issues.append(f"{filename}: VTT missing")
        else:
            vtt_text = vtt.read_text(encoding="utf-8")
            if not vtt_text.startswith("WEBVTT\n"):
                issues.append(f"{filename}: invalid VTT header")
            for cue in track["cues"]:
                if cue["text"] not in vtt_text:
                    issues.append(f"{filename}: VTT missing cue {cue['text']}")

    print(f"validated videos={len(videos)} cues={cue_count} issues={len(issues)}")
    for issue in issues:
        print(issue)
    if issues:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
