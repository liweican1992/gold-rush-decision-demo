#!/usr/bin/env python3
"""Create local, word-timestamped transcripts for the latest playable videos."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import mlx_whisper


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--videos", type=Path, default=Path("public/videos/latest"))
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--model", required=True)
    parser.add_argument("--only", nargs="*")
    args = parser.parse_args()

    args.output.mkdir(parents=True, exist_ok=True)
    wanted = set(args.only or [])
    videos = [path for path in sorted(args.videos.glob("*.mp4")) if not wanted or path.name in wanted]
    initial_prompt = "阿拉斯加勘探队，队长，沈岚，老周，阿杰，山口，山谷，暴风，期权，十四天。"

    for index, video in enumerate(videos, start=1):
        destination = args.output / f"{video.stem}.json"
        print(f"[{index}/{len(videos)}] {video.name}", flush=True)
        result = mlx_whisper.transcribe(
            str(video),
            path_or_hf_repo=args.model,
            language="zh",
            task="transcribe",
            verbose=False,
            temperature=0.0,
            condition_on_previous_text=False,
            word_timestamps=True,
            initial_prompt=initial_prompt,
            hallucination_silence_threshold=1.0,
        )
        destination.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"  -> {result.get('text', '').strip()}", flush=True)


if __name__ == "__main__":
    main()
