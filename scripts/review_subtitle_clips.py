#!/usr/bin/env python3
"""Run a small set of subtitle-review clips without an initial prompt."""

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
    parser.add_argument("names", nargs="+")
    args = parser.parse_args()

    args.output.mkdir(parents=True, exist_ok=True)
    for name in args.names:
        video = args.videos / name
        result = mlx_whisper.transcribe(
            str(video),
            path_or_hf_repo=args.model,
            language="zh",
            task="transcribe",
            verbose=False,
            temperature=0.0,
            condition_on_previous_text=False,
            word_timestamps=True,
            hallucination_silence_threshold=1.0,
        )
        (args.output / f"{video.stem}.json").write_text(
            json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8"
        )
        print(f"{name}: {result.get('text', '').strip()}")


if __name__ == "__main__":
    main()
