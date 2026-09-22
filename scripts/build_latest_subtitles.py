#!/usr/bin/env python3
"""Build WebVTT files from the checked latest-video subtitle source."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "src" / "demo" / "latestSubtitles.json"
OUTPUT = ROOT / "public" / "subtitles" / "latest"


def timestamp(seconds: float) -> str:
    milliseconds = round(seconds * 1000)
    hours, milliseconds = divmod(milliseconds, 3_600_000)
    minutes, milliseconds = divmod(milliseconds, 60_000)
    whole_seconds, milliseconds = divmod(milliseconds, 1000)
    return f"{hours:02}:{minutes:02}:{whole_seconds:02}.{milliseconds:03}"


def main() -> None:
    data = json.loads(SOURCE.read_text(encoding="utf-8"))
    OUTPUT.mkdir(parents=True, exist_ok=True)

    expected = set()
    for filename, track in data["videos"].items():
        destination = OUTPUT / f"{Path(filename).stem}.vtt"
        expected.add(destination)
        lines = ["WEBVTT", ""]
        for index, cue in enumerate(track["cues"], start=1):
            lines.extend(
                [
                    str(index),
                    f"{timestamp(cue['start'])} --> {timestamp(cue['end'])}",
                    cue["text"],
                    "",
                ]
            )
        destination.write_text("\n".join(lines), encoding="utf-8")

    for stale in OUTPUT.glob("*.vtt"):
        if stale not in expected:
            stale.unlink()

    print(f"Built {len(expected)} calibrated WebVTT files in {OUTPUT}")


if __name__ == "__main__":
    main()
