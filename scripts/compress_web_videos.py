#!/usr/bin/env python3
"""Create and validate web-ready MP4 copies without touching the source files."""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path


def probe(path: Path) -> dict:
    result = subprocess.run(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration:stream=codec_type,codec_name,width,height",
            "-of",
            "json",
            str(path),
        ],
        check=True,
        capture_output=True,
        text=True,
    )
    return json.loads(result.stdout)


def stream(info: dict, kind: str) -> dict | None:
    return next((item for item in info.get("streams", []) if item.get("codec_type") == kind), None)


def has_faststart(path: Path) -> bool:
    data = path.read_bytes()
    moov = data.find(b"moov")
    mdat = data.find(b"mdat")
    return moov >= 0 and mdat >= 0 and moov < mdat


def encode(source: Path, destination: Path) -> dict:
    temporary = destination.with_suffix(".encoding.mp4")
    subprocess.run(
        [
            "ffmpeg",
            "-hide_banner",
            "-loglevel",
            "error",
            "-y",
            "-i",
            str(source),
            "-map",
            "0:v:0",
            "-map",
            "0:a:0?",
            "-c:v",
            "libx264",
            "-preset",
            "medium",
            "-crf",
            "23",
            "-profile:v",
            "high",
            "-level:v",
            "3.1",
            "-pix_fmt",
            "yuv420p",
            "-c:a",
            "aac",
            "-b:a",
            "96k",
            "-movflags",
            "+faststart",
            str(temporary),
        ],
        check=True,
    )

    source_size = source.stat().st_size
    encoded_size = temporary.stat().st_size
    retained_original = encoded_size >= source_size
    if retained_original:
        shutil.copy2(source, destination)
        temporary.unlink()
    else:
        temporary.replace(destination)

    source_info = probe(source)
    output_info = probe(destination)
    source_video = stream(source_info, "video") or {}
    output_video = stream(output_info, "video") or {}
    source_audio = stream(source_info, "audio")
    output_audio = stream(output_info, "audio")
    duration_delta = abs(float(source_info["format"]["duration"]) - float(output_info["format"]["duration"]))

    checks = {
        "duration_delta_lte_0_15s": duration_delta <= 0.15,
        "same_dimensions": (source_video.get("width"), source_video.get("height"))
        == (output_video.get("width"), output_video.get("height")),
        "h264_video": output_video.get("codec_name") == "h264",
        "audio_preserved": source_audio is None or output_audio is not None,
        "faststart": has_faststart(destination),
    }
    if not all(checks.values()):
        raise RuntimeError(f"Validation failed for {source.name}: {checks}")

    final_size = destination.stat().st_size
    return {
        "name": source.name,
        "source_bytes": source_size,
        "output_bytes": final_size,
        "saved_percent": round((1 - final_size / source_size) * 100, 2),
        "retained_original": retained_original,
        "duration_delta_seconds": round(duration_delta, 4),
        "checks": checks,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("destination", type=Path)
    parser.add_argument("--workers", type=int, default=2)
    args = parser.parse_args()

    sources = sorted(args.source.glob("*.mp4"))
    if not sources:
        raise SystemExit(f"No MP4 files found in {args.source}")
    args.destination.mkdir(parents=True, exist_ok=True)

    completed: list[dict] = []
    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        futures = {pool.submit(encode, source, args.destination / source.name): source for source in sources}
        for count, future in enumerate(as_completed(futures), 1):
            item = future.result()
            completed.append(item)
            print(
                f"[{count:02d}/{len(sources):02d}] {item['name']}  "
                f"-{item['saved_percent']:.1f}%",
                flush=True,
            )

    completed.sort(key=lambda item: item["name"])
    source_total = sum(item["source_bytes"] for item in completed)
    output_total = sum(item["output_bytes"] for item in completed)
    report = {
        "settings": "H.264 libx264 CRF 23 medium; AAC 96 kbps; faststart",
        "files": len(completed),
        "source_bytes": source_total,
        "output_bytes": output_total,
        "saved_percent": round((1 - output_total / source_total) * 100, 2),
        "items": completed,
    }
    (args.destination / "compression-report.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(json.dumps({key: report[key] for key in ("files", "source_bytes", "output_bytes", "saved_percent")}), flush=True)


if __name__ == "__main__":
    main()
