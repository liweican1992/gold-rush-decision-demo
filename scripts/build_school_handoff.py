#!/usr/bin/env python3
"""Build the curated, verifiable school handoff ZIP from the current project."""

from __future__ import annotations

import argparse
import csv
import hashlib
import io
import json
import shutil
import subprocess
import sys
import zipfile
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
NAME = "最后十四天_学校交付包_20260924"
PAVO_ROOT = Path("手动Pavo生产包_FINAL_20260917")
D_ROOT = Path("video-production/08_team_handoff/D路线_Pavo组员制作包_v1.2")
PAVO_SECTIONS = (
    "03_公共段_逐片制作",
    "07_A路线_逐片制作",
    "08_B路线_逐片制作",
    "09_C路线_逐片制作",
    "10_共享段_逐片制作",
    "11_结局抵达_逐片制作",
)
WEB_PUBLIC = (
    "public/gold-rush-hero.jpg",
    "public/images/decision-stills",
    "public/images/final-story-keyframes",
    "public/images/story-map-endings",
    "public/videos/latest",
    "public/subtitles/latest",
)
WEB_FILES = (
    "README.md", "index.html", "package.json", "package-lock.json",
    "tokens.css", "tsconfig.json", "tsconfig.app.json", "tsconfig.node.json",
    "vite.config.ts", "vercel.json", ".vercelignore",
)
SKIP_NAMES = {".DS_Store", "Thumbs.db", "__pycache__"}
MEDIA_EXTENSIONS = {".mp4", ".png", ".jpg", ".jpeg", ".webp", ".wav", ".xlsx", ".zip"}


def source_commit() -> str:
    try:
        return subprocess.check_output(
            ["git", "rev-parse", "HEAD"], cwd=ROOT, text=True, stderr=subprocess.DEVNULL
        ).strip()
    except subprocess.CalledProcessError:
        return json.loads((ROOT / "dist/version.json").read_text(encoding="utf-8"))["commit"]


def add_file(plan: dict[str, Path], source: Path, destination: Path | None = None) -> None:
    absolute = ROOT / source
    if not absolute.is_file() or absolute.is_symlink():
        raise FileNotFoundError(f"Required regular file is missing: {source}")
    name = (destination or source).as_posix()
    if name in plan:
        raise ValueError(f"Duplicate destination: {name}")
    plan[name] = absolute


def add_tree(plan: dict[str, Path], source: Path, destination: Path | None = None) -> None:
    absolute = ROOT / source
    if not absolute.is_dir():
        raise FileNotFoundError(f"Required directory is missing: {source}")
    for path in sorted(absolute.rglob("*")):
        if any(part in SKIP_NAMES for part in path.relative_to(absolute).parts):
            continue
        if path.is_symlink():
            raise ValueError(f"Symlinks are not allowed in handoff: {path}")
        if path.is_file():
            relative = path.relative_to(absolute)
            add_file(plan, source / relative, (destination or source) / relative)


def plan_files() -> tuple[dict[str, Path], int]:
    plan: dict[str, Path] = {}

    # Current FINAL documents only; historic v0.x/v1.x and old ZIP snapshots stay out.
    add_file(plan, Path("新剧情共创记录/README.md"))
    add_tree(plan, Path("新剧情共创记录/最后十四天_FINAL_20260911"))

    add_file(plan, PAVO_ROOT / "00_统一设置与防漂移前缀.md")
    add_file(plan, PAVO_ROOT / "03_公共段_逐片制作/00_Pavo提示词编写规则.md")
    add_file(plan, PAVO_ROOT / "03_公共段_逐片制作/00_目录结构规则.md")
    add_file(plan, PAVO_ROOT / "06_验收/视频人工验收标准.md")
    for path in sorted((ROOT / PAVO_ROOT / "02_角色基准").iterdir()):
        if path.is_file() and path.name not in SKIP_NAMES:
            add_file(plan, path.relative_to(ROOT))
    add_tree(plan, PAVO_ROOT / "04_后续路线关键帧")
    add_tree(plan, PAVO_ROOT / "05_FINAL脚本与规则")

    clip_count = 0
    for section in PAVO_SECTIONS:
        section_path = ROOT / PAVO_ROOT / section
        for clip in sorted(section_path.iterdir()):
            if not clip.is_dir() or clip.name.startswith("_") or clip.name == "${root}":
                continue
            files = [p for p in clip.iterdir() if p.is_file() and p.name not in SKIP_NAMES]
            if not any(p.name == "03_Pavo提示词.md" for p in files):
                raise ValueError(f"Missing Pavo prompt: {clip}")
            if not any(p.name.startswith("01_首帧") and p.suffix.lower() == ".png" for p in files):
                raise ValueError(f"Missing first frame: {clip}")
            if not any(p.suffix.lower() == ".mp4" for p in files):
                raise ValueError(f"Missing finished clip: {clip}")
            for path in files:
                add_file(plan, path.relative_to(ROOT))
            clip_count += 1

    # The team's D-line package is retained as an identified production record.
    # Its pre-generation status and old first/last-frame rules are not current Web rules.
    add_tree(plan, D_ROOT)

    # Current editable Web source and the exact output of a fresh production build.
    for path in WEB_FILES:
        add_file(plan, Path(path))
    for path in ("src", "scripts", *WEB_PUBLIC, "dist"):
        relative = Path(path)
        if (ROOT / relative).is_file():
            add_file(plan, relative)
        else:
            add_tree(plan, relative)
    plan.pop("scripts/pavo-package.test.ts", None)  # historical v3.0 fixture is excluded
    return plan, clip_count


def generated_documents(commit: str, clip_count: int, video_count: int) -> dict[str, str]:
    intro = f"""# 《最后十四天》学校交付包｜先读

交付日期：2026-09-24
对应源码提交：`{commit}`
正式演示：[游戏](https://gold.thumem.top/) · [教师介绍页](https://gold.thumem.top/teacher) · [剧情地图](https://gold.thumem.top/docs/story-map)

本包用于学校审阅、教学演示及后续维护。它同时包含**当前 FINAL 大纲与完整剧情**、**Pavo 按片输入及通过版原片**、**当前 Web 源码**和**可部署网页文件**。本包不含账号、密钥、Git 历史、`node_modules`、旧版试作或制作中间状态。

## 建议先看什么

1. 教师先打开在线[教师介绍页](https://gold.thumem.top/teacher)，了解设计目标和课程概念映射。
2. 在[游戏](https://gold.thumem.top/)试玩一条路线，并打开结算后的决策报告。
3. 用[剧情地图](https://gold.thumem.top/docs/story-map)核对所有分支和登记所的五种影像结局。
4. 离线审阅从 `新剧情共创记录/最后十四天_FINAL_20260911/00_最终版文档目录_FINAL.md` 开始；剧情以该目录下的总文档、04 完整文字剧情及 14 登记所结局补充为准。旧 v0.x/v1.x 总纲不是当前剧本。

## 包内结构

| 目录 | 用途 |
| --- | --- |
| `新剧情共创记录/最后十四天_FINAL_20260911/` | 课程定位、教师事实边界、时间轴、完整剧情、交互文案、教学映射和最新登记所尾声。 |
| `手动Pavo生产包_FINAL_20260917/` | {clip_count} 个当前分片的输入图、提示词与通过版原片；另有角色基准、路线关键帧和制作规则。已排除 `_中间资料`、旧验收合片与过时进度说明。 |
| `{D_ROOT.as_posix()}/` | 组员 D 线 v1.2 原投喂包，保留制作溯源；它含待补首帧与当时的首尾帧规则，**不是当前重新生成 D 线的直接操作规范**。当前实际 D 线成片以网页视频为准。 |
| `src/`、`scripts/`、`public/` 与根目录配置 | 可编辑的 Web 项目源码和当前使用的媒体；`public/videos/latest/` 含 {video_count} 个压缩成片。 |
| `dist/` | 已构建的静态网页；部署服务器须将未知路径回退到 `index.html`，使 `/teacher` 和 `/docs/story-map` 可以直接访问。 |
| `03_成片清单.csv` | 当前网页视频和 Pavo 主包原片的文件路径、大小与时长。 |
| `交付清单.json`、`SHA256SUMS.txt` | 每个文件的大小与 SHA-256，用于解压后核验。 |

## 在新电脑运行与部署

安装 Node.js 和 npm 后，在本包根目录执行：

```bash
npm ci
npm run dev -- --host 127.0.0.1
```

浏览器访问命令打印的本地地址。要重新生成静态网页，执行 `npm run build`；若用 Vercel 等平台发布，部署本包根目录并按 `vercel.json` 的 SPA 回退规则配置。`dist/` 已可交给静态托管方，直接上传时也必须保留该回退规则。字幕校验还需 FFmpeg/ffprobe。

域名、Vercel 项目和 Pavo 账号的管理权限**不在 ZIP 中**。如果学校要独立长期运营，应将域名、托管项目与账号权限另行交接；不要把 ZIP 当作账号权限凭证。包内 Pavo 提示词与旧制作记录可能引用制作者电脑的绝对路径，学校应按本包相对目录查找同名文件。

## 版本和范围

当前 Web 的五种影像结局为白天/夜间按期确认、白天/夜间超期得知矿权将重新拍卖，以及主动放弃后的安全返程。超期不等于登记所关门；到达也不等于本人已完成最后确认。Pavo 分片是制作素材，学生实际观看的是 `public/videos/latest/` 中经剪辑压缩的版本。

旧 Pavo v3.0 测试夹具及其专用测试文件、历史媒体没有纳入交付。学校可用 `npm test -- --run`、`npm run typecheck` 和 `npm run build` 检查本包当前网页源码。
"""
    teaching = """# 教师演示与课堂讨论建议

《最后十四天》让学生作为队长，在矿权期权截止前作路线、等待和调整决策。它不把结局字母当成绩；同一选择要同时看原目标、人员安全、时间、信息和后续行动空间。

| 可展示的片段 | 引出的战略管理问题 |
| --- | --- |
| 开局选择翻山、山谷、等天气信息或安全返回 | 先说清目标和不能突破的底线；环境条件与自身能力是否匹配？ |
| A 线持续翻山 | 已经投入的时间是否构成继续的理由？受伤后何时应调整承诺？ |
| B 线稳走山谷与提速 | 降低现场风险是否会放大期限风险？稳妥行动能否实现原目标？ |
| C 线等待信息 | 更准确的信息是否值得支付时间成本？何时已经有足够的信息行动？ |
| D 线等待后重新评估 | 战略一致性是重复原行动，还是在新证据下服务原目标？ |
| 登记所办理、重新拍卖和安全返程 | 到达与完成确认有何区别？保住原窗口、保住团队和保留下一轮机会分别意味着什么？ |

演示顺序建议：先用 `teacher` 页交代课程关联，学生试玩并记录选择理由，最后打开游戏自动生成的报告，讨论“当时知道什么—后来发生什么—何时调整—保住与牺牲了什么”。概念与教师原案的边界详见 `新剧情共创记录/最后十四天_FINAL_20260911/05_学生复盘与教学映射_FINAL.md`。
"""
    pavo = """# Pavo 素材阅读说明

当前主生产包中，每个片段顶层只保留该段首帧、可选尾帧、`03_Pavo提示词.md` 和已保存的成片；`_中间资料` 与旧验收预览不随学校包交付。片段编号是本地管理标识，粘贴提示词到 Pavo 时以正文中的“参考图”称呼为准。

主生产包覆盖公共段、A/B/C 线、共享段与登记所结局。D 线由组员另行制作，所附 v1.2 包用于说明当时制作方法；部分首帧标记“待补”，并非可直接批量重生成的最终包。当前网页播放的 D 线压缩成片在 `public/videos/latest/`。如需重做某个镜头，先以当前 FINAL 剧情、游戏实际状态、相邻真实视频和角色基准核对，不照抄历史制作状态。

具体上传规则见主生产包 `00_统一设置与防漂移前缀.md` 和 `03_公共段_逐片制作/00_Pavo提示词编写规则.md`；结局剧情事实以 FINAL 文档中的 `14_登记所结局场景补充_20260924.md` 为准。
"""
    d_warning = """# 学校交付提示：这是 D 线组员当时的制作记录

本目录的 v1.2 提示词、首尾帧规则与“待补”状态保留原貌，仅用于追溯组员的制作过程。它不是当前 Web 版本重新生成 D 线的直接操作清单；不要按 `00_先读我.md` 直接批量重做。当前可玩的 D 线视频见包根目录 `public/videos/latest/`，剧情规则以 `新剧情共创记录/最后十四天_FINAL_20260911/` 为准。
"""
    return {
        "00_交付说明_先读.md": intro,
        "01_教师演示建议.md": teaching,
        "02_Pavo素材阅读说明.md": pavo,
        f"{D_ROOT.as_posix()}/00_学校交付提示.md": d_warning,
    }


def media_inventory(stage: Path) -> str:
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["类别", "相对路径", "字节数", "时长秒"])
    videos = sorted((stage / "public/videos/latest").glob("*.mp4"))
    pavo_videos = sorted(path for path in (stage / PAVO_ROOT).rglob("*.mp4") if "逐片制作" in path.as_posix())
    for kind, files in (("网页压缩成片", videos), ("Pavo分片原片", pavo_videos)):
        for path in files:
            result = subprocess.run(
                ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", str(path)],
                capture_output=True, text=True, check=True,
            )
            writer.writerow([kind, path.relative_to(stage).as_posix(), path.stat().st_size, f"{float(result.stdout.strip()):.3f}"])
    return output.getvalue()


def hash_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def build(output_parent: Path, audit_only: bool) -> None:
    plan, clip_count = plan_files()
    total = sum(path.stat().st_size for path in plan.values())
    videos = list((ROOT / "public/videos/latest").glob("*.mp4"))
    commit = source_commit()
    print(f"Planned: {len(plan)} source files, {clip_count} Pavo clips, {len(videos)} Web videos, {total / 1048576:.1f} MiB", flush=True)
    if audit_only:
        return
    built_commit = json.loads((ROOT / "dist/version.json").read_text(encoding="utf-8"))["commit"]
    if built_commit != commit:
        raise ValueError(f"dist was built from {built_commit}, but source is {commit}; run npm run build first")

    stage = output_parent / NAME
    archive = output_parent / f"{NAME}.zip"
    if stage.exists() or archive.exists():
        raise FileExistsError(f"Output already exists: {stage} or {archive}")
    stage.mkdir(parents=True)

    for index, (relative, source) in enumerate(sorted(plan.items()), 1):
        destination = stage / relative
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, destination)
        if index % 100 == 0:
            print(f"Copied {index}/{len(plan)} files", flush=True)

    for relative, content in generated_documents(commit, clip_count, len(videos)).items():
        destination = stage / relative
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_text(content, encoding="utf-8")
    (stage / "03_成片清单.csv").write_text(media_inventory(stage), encoding="utf-8-sig")

    rows = []
    for index, path in enumerate(sorted(p for p in stage.rglob("*") if p.is_file()), 1):
        relative = path.relative_to(stage).as_posix()
        rows.append({"path": relative, "bytes": path.stat().st_size, "sha256": hash_file(path)})
        if index % 100 == 0:
            print(f"Hashed {index} files", flush=True)
    manifest = {
        "title": "最后十四天学校交付包",
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "sourceCommit": commit,
        "fileCount": len(rows),
        "totalBytes": sum(row["bytes"] for row in rows),
        "files": rows,
    }
    (stage / "交付清单.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (stage / "SHA256SUMS.txt").write_text(
        "".join(f"{row['sha256']}  {row['path']}\n" for row in rows), encoding="utf-8"
    )

    with zipfile.ZipFile(archive, "w", allowZip64=True) as bundle:
        files = sorted(path for path in stage.rglob("*") if path.is_file())
        for index, path in enumerate(files, 1):
            kind = zipfile.ZIP_STORED if path.suffix.lower() in MEDIA_EXTENSIONS else zipfile.ZIP_DEFLATED
            bundle.write(path, arcname=f"{NAME}/{path.relative_to(stage).as_posix()}", compress_type=kind, compresslevel=6)
            if index % 100 == 0:
                print(f"Archived {index}/{len(files)} files", flush=True)

    archive_hash = hash_file(archive)
    (output_parent / f"{NAME}.zip.sha256").write_text(f"{archive_hash}  {archive.name}\n", encoding="utf-8")
    print(f"Built: {archive} ({archive.stat().st_size / 1048576:.1f} MiB)", flush=True)
    print(f"SHA-256: {archive_hash}", flush=True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output-parent", type=Path, default=ROOT.parent)
    parser.add_argument("--audit", action="store_true", help="Show selected file counts without copying")
    args = parser.parse_args()
    try:
        build(args.output_parent.expanduser().resolve(), args.audit)
    except (FileNotFoundError, FileExistsError, ValueError) as error:
        print(f"Handoff build stopped: {error}", file=sys.stderr)
        raise SystemExit(1)
