from __future__ import annotations

import hashlib
import json
import re
import shutil
import zipfile
from dataclasses import dataclass
from datetime import date
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
SOURCE_TS = ROOT / "src" / "demo" / "finalStoryMap.ts"
FINAL_ROOT = ROOT / "WebGPT当前封版_隔离工作集_20260912"
OUTPUT = FINAL_ROOT / "06_WebGPT最终地图复核包_20260914"
ZIP_PATH = FINAL_ROOT / "WebGPT最终关键帧地图复核包_20260914.zip"
PUBLIC_FRAMES = ROOT / "public" / "images" / "final-story-keyframes"

ROUTE_NAMES = {
    "PUBLIC": "公共",
    "A": "A路线",
    "B": "B路线",
    "C": "C路线",
    "D": "D路线",
    "SHARED": "共享",
}
EXPECTED_ROUTE_COUNTS = {"PUBLIC": 8, "A": 12, "B": 8, "C": 11, "D": 10, "SHARED": 6}


@dataclass(frozen=True)
class Frame:
    id: str
    route: str
    file: str
    title: str


@dataclass(frozen=True)
class Option:
    id: str
    label: str
    cost: str
    result: str
    target: str


@dataclass(frozen=True)
class Node:
    id: str
    route: str
    title: str
    kind: str
    time: str
    location: str
    facts: str
    question: str
    knowledge: str
    frame_ids: tuple[str, ...]
    options: tuple[Option, ...]


@dataclass(frozen=True)
class Branch:
    id: str
    route: str
    name: str
    sequence: str
    completion: str
    deadline: str
    people: str
    tradeoff: str
    review: str
    frame_ids: tuple[str, ...]
    frame_variants: tuple["BranchFrameVariant", ...]


@dataclass(frozen=True)
class BranchFrameVariant:
    label: str
    frame_ids: tuple[str, ...]


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def string_field(block: str, name: str, required: bool = True) -> str:
    match = re.search(rf"\b{name}: '([^']*)'", block)
    if not match:
        if required:
            raise ValueError(f"Missing {name} in block: {block[:80]}")
        return ""
    return match.group(1)


def list_field(block: str, name: str) -> tuple[str, ...]:
    match = re.search(rf"\b{name}: \[([^\]]*)\]", block, flags=re.S)
    if not match:
        raise ValueError(f"Missing {name} in block: {block[:80]}")
    return tuple(re.findall(r"'([^']+)'", match.group(1)))


def section(text: str, start: str, end: str) -> str:
    start_index = text.index(start)
    end_index = text.index(end, start_index)
    return text[start_index:end_index]


def call_blocks(text: str, marker: str) -> list[str]:
    starts = [match.start() for match in re.finditer(re.escape(marker), text)]
    blocks: list[str] = []
    for index, start in enumerate(starts):
        stop = starts[index + 1] if index + 1 < len(starts) else len(text)
        blocks.append(text[start:stop])
    return blocks


def parse_source() -> tuple[list[Frame], list[Node], list[Branch]]:
    text = SOURCE_TS.read_text(encoding="utf-8")
    frame_section = section(text, "export const FINAL_KEYFRAMES", "const opt")
    frames = [
        Frame(*match.groups()[:4])
        for match in re.finditer(
            r"frame\('([^']+)', '([^']+)', '([^']+)', '([^']+)'(?:, true)?\)",
            frame_section,
        )
    ]

    node_section = section(text, "export const FINAL_NODES", "const branch")
    nodes: list[Node] = []
    for block in call_blocks(node_section, "node({ id:"):
        options = tuple(
            Option(*match.groups())
            for match in re.finditer(
                r"opt\('([^']+)', '([^']+)', '([^']+)', '([^']+)', '([^']+)'\)", block
            )
        )
        nodes.append(
            Node(
                id=string_field(block, "id"),
                route=string_field(block, "route"),
                title=string_field(block, "title"),
                kind=string_field(block, "kind"),
                time=string_field(block, "time"),
                location=string_field(block, "location"),
                facts=string_field(block, "facts"),
                question=string_field(block, "question", required=False),
                knowledge=string_field(block, "knowledge"),
                frame_ids=list_field(block, "frameIds"),
                options=options,
            )
        )

    branch_section = section(text, "export const FINAL_BRANCHES", "export const ROUTE_META")
    branches: list[Branch] = []
    for block in call_blocks(branch_section, "branch({ id:"):
        variants = tuple(
            BranchFrameVariant(
                label=match.group(1),
                frame_ids=tuple(re.findall(r"'([^']+)'", match.group(2))),
            )
            for match in re.finditer(
                r"\{ label: '([^']+)', frameIds: \[([^\]]*)\] \}", block
            )
        )
        branches.append(
            Branch(
                id=string_field(block, "id"),
                route=string_field(block, "route"),
                name=string_field(block, "name"),
                sequence=string_field(block, "sequence"),
                completion=string_field(block, "completion"),
                deadline=string_field(block, "deadline"),
                people=string_field(block, "people"),
                tradeoff=string_field(block, "tradeoff"),
                review=string_field(block, "review"),
                frame_ids=list_field(block, "frameIds"),
                frame_variants=variants,
            )
        )
    return frames, nodes, branches


def validate(frames: list[Frame], nodes: list[Node], branches: list[Branch]) -> None:
    assert len(frames) == 55, len(frames)
    assert len(nodes) == 33, len(nodes)
    assert len(branches) == 18, len(branches)
    assert sum(len(node.options) for node in nodes) == 28
    frame_ids = {frame.id for frame in frames}
    node_ids = {node.id for node in nodes}
    assert len(frame_ids) == 55
    assert len(node_ids) == 33
    for route, expected in EXPECTED_ROUTE_COUNTS.items():
        assert sum(frame.route == route for frame in frames) == expected
    used: set[str] = set()
    for node in nodes:
        assert node.frame_ids
        assert set(node.frame_ids) <= frame_ids
        used.update(node.frame_ids)
        for option in node.options:
            assert option.target in node_ids, option
    for branch in branches:
        sequences = (
            [branch.frame_ids + variant.frame_ids for variant in branch.frame_variants]
            if branch.frame_variants
            else [branch.frame_ids]
        )
        assert all(sequences)
        for sequence in sequences:
            assert set(sequence) <= frame_ids
            used.update(sequence)
            if branch.route == "A":
                positions = [sequence.index(frame_id) for frame_id in ("A02A", "A02B", "A02C")]
                assert positions == sorted(positions) and len(set(positions)) == 3, (branch.id, sequence)
    withdrawal = next(branch for branch in branches if branch.id == "A-05")
    assert len(withdrawal.frame_variants) == 2
    for variant in withdrawal.frame_variants:
        sequence = withdrawal.frame_ids + variant.frame_ids
        assert not ({"A03R-D3", "A03R-D5"} <= set(sequence)), variant
    assert used == frame_ids, sorted(frame_ids - used)
    for frame in frames:
        path = PUBLIC_FRAMES / frame.file
        assert path.is_file(), path
    assert all(frame.file.endswith("_v02.png") for frame in frames if frame.route == "A")
    night = next(frame for frame in frames if frame.id == "SH-TOWN-NIGHT")
    assert night.file.endswith("_v03.png")


def get_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        "/System/Library/Fonts/PingFang.ttc",
        "/System/Library/Fonts/STHeiti Medium.ttc",
        "/System/Library/Fonts/Supplemental/Arial Unicode.ttf",
    ]
    for candidate in candidates:
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size=size, index=1 if bold and candidate.endswith(".ttc") else 0)
    return ImageFont.load_default()


def fit_text(draw: ImageDraw.ImageDraw, text: str, max_width: int, size: int) -> str:
    font = get_font(size)
    if draw.textlength(text, font=font) <= max_width:
        return text
    trimmed = text
    while trimmed and draw.textlength(trimmed + "…", font=font) > max_width:
        trimmed = trimmed[:-1]
    return trimmed + "…"


def build_contact_sheet(route: str, frames: list[Frame], output_dir: Path) -> Path:
    route_frames = [frame for frame in frames if frame.route == route]
    cols = 2
    tile_w, image_w, image_h, label_h = 760, 720, 405, 105
    header_h, gap = 116, 20
    rows = (len(route_frames) + cols - 1) // cols
    tile_h = image_h + label_h + gap * 2
    sheet = Image.new("RGB", (tile_w * cols, header_h + rows * tile_h), "#10141a")
    draw = ImageDraw.Draw(sheet)
    route_name = ROUTE_NAMES[route]
    draw.text((28, 16), f"FINAL关键帧地图复核｜{route_name}｜{len(route_frames)}张", font=get_font(36, bold=True), fill="#f7f8fa")
    draw.text((28, 66), "与本地Web同一批有效绑定文件｜WebGPT历史视觉复核：55 PASS / 0待改 / 0废弃", font=get_font(20), fill="#b4bfcc")

    for index, frame in enumerate(route_frames):
        col, row = index % cols, index // cols
        x, y = col * tile_w, header_h + row * tile_h
        card = (x + 10, y + 10, x + tile_w - 10, y + tile_h - 10)
        draw.rounded_rectangle(card, radius=18, fill="#202731")
        source_path = PUBLIC_FRAMES / frame.file
        with Image.open(source_path) as source:
            rendered = ImageOps.contain(source.convert("RGB"), (image_w, image_h), method=Image.Resampling.LANCZOS)
        canvas = Image.new("RGB", (image_w, image_h), "#090c10")
        canvas.paste(rendered, ((image_w - rendered.width) // 2, (image_h - rendered.height) // 2))
        sheet.paste(canvas, (x + 20, y + 20))
        label_y = y + image_h + 32
        draw.text((x + 24, label_y), frame.id, font=get_font(26, bold=True), fill="#75c9ff")
        title = fit_text(draw, frame.title, image_w - 30, 23)
        draw.text((x + 24, label_y + 38), title, font=get_font(23), fill="#f7f8fa")
        filename = Path(frame.file).name
        draw.text((x + 24, label_y + 72), fit_text(draw, filename, image_w - 30, 16), font=get_font(16), fill="#9ca8b6")

    target = output_dir / f"{route_name}_{len(route_frames)}张.jpg"
    sheet.save(target, format="JPEG", quality=92, optimize=True, progressive=True)
    return target


def md_escape(text: str) -> str:
    return text.replace("|", "\uff5c").replace("\n", " ")


def build_mapping(frames: list[Frame], nodes: list[Node], branches: list[Branch]) -> str:
    lines = [
        "# 《最后十四天》FINAL关键帧地图映射审阅稿",
        "",
        f"> 导出日期：{date.today().isoformat()}  ",
        "> 用途：供无法打开本地 Web 的 WebGPT 独立复核。  ",
        "> 数据源：当前 Web 实际使用的 `finalStoryMap.ts`；不从旧版剧本或旧视频反推。",
        "",
        "## 1. 核对摘要",
        "",
        f"- 逻辑节点：{len(nodes)}",
        f"- 选项／有向流转：{sum(len(node.options) for node in nodes)}",
        f"- 代表性完整路径：{len(branches)}",
        f"- 有效关键帧：{len(frames)}",
        "- 覆盖规则：每个逻辑节点至少绑定1张图；每条代表路径至少绑定1张图；55张图全部被节点或路径使用。",
        "- 版本约束：A路线只使用v02；SH-TOWN-NIGHT只使用v03。",
        "",
        "## 2. 55张有效关键帧",
        "",
        "| 帧ID | 区域 | 画面任务 | 有效文件名 |",
        "|---|---|---|---|",
    ]
    for frame in frames:
        lines.append(f"| {frame.id} | {ROUTE_NAMES[frame.route]} | {md_escape(frame.title)} | {md_escape(Path(frame.file).name)} |")

    lines += ["", "## 3. 33个逻辑节点与28个选项", ""]
    for node in nodes:
        lines += [
            f"### {node.id} · {node.title}",
            "",
            f"- 区域／类型：{ROUTE_NAMES[node.route]} · {node.kind}",
            f"- 时间／地点：{node.time} · {node.location}",
            f"- 学生可见事实：{node.facts}",
            f"- 知识点：{node.knowledge}",
            f"- 关键帧绑定：{', '.join(node.frame_ids)}",
        ]
        if node.question:
            lines.append(f"- 决策问题：{node.question}")
        if node.options:
            lines += ["", "| 选项ID | 按钮 | 代价 | 结果／时间 | 下一节点 |", "|---|---|---|---|---|"]
            for option in node.options:
                lines.append(
                    f"| {option.id} | {md_escape(option.label)} | {md_escape(option.cost)} | {md_escape(option.result)} | {option.target} |"
                )
        lines.append("")

    lines += ["## 4. 18条代表性完整路径", ""]
    for branch in branches:
        lines += [
            f"### {branch.id} · {branch.name}",
            "",
            f"- 选择序列：{branch.sequence}",
            f"- 完成／返程时间：{branch.completion}",
            f"- 期限结果：{branch.deadline}",
            f"- 人员／能力状态：{branch.people}",
            f"- 核心取舍：{branch.tradeoff}",
            f"- 推荐复盘：{branch.review}",
        ]
        if branch.frame_variants:
            lines.append(f"- 共同前情帧：{' → '.join(branch.frame_ids)}")
            lines.append("- 互斥关键帧链（二选一，不得串联）：")
            for variant in branch.frame_variants:
                lines.append(f"  - {variant.label}：{' → '.join(branch.frame_ids + variant.frame_ids)}")
        else:
            lines.append(f"- 关键帧链：{' → '.join(branch.frame_ids)}")
        lines.append("")

    lines += [
        "## 5. 本稿不证明什么",
        "",
        "- 它不证明 Pavo 视频已验收。",
        "- 它不证明中文对白、口型、音频或人物连续性已验收。",
        "- 它不授权批量生成视频或消耗任何积分。",
        "- 它只用于检查当前剧情节点、选项、结局路径和关键帧绑定是否相互一致。",
        "",
    ]
    return "\n".join(lines)


def instructions_text() -> str:
    return """# WebGPT最终关键帧地图复核包｜上传与使用说明

这个包是本地页面 `/docs/story-map/` 的离线审阅等价物，不需要 WebGPT 访问 localhost。

## 建议上传顺序

1. `02_WebGPT最终映射复核Prompt.md`
2. `01_FINAL关键帧地图映射审阅稿.md`
3. `03_关键帧联系表/`中六张 JPG
4. `04_依据文档/`中的 FINAL 文档

WebGPT 如果限制单次上传数量，先上传 Prompt、映射审阅稿和六张联系表；它要求核查世界规则时，再补充依据文档。

## 范围说明

- 包内地图数据来自当前 Web 实际映射，不是旧版剧本汇总。
- 六张联系表覆盖当前有效55张图：公共8、A12、B8、C11、D10、共享6。
- A路线只包含v02；夜间办事地点只包含SH-TOWN-NIGHT v03。
- 旧关键帧、旧视频、Pavo废片不在此包内。
- 本次只审映射逻辑与画面适配；不审音频、中文对白、口型或视频生成。

## 完整性

`05_包内文件与SHA256.json` 记录包内文件哈希。构建器在生成前强制检查33节点、28选项、18路径、55关键帧及所有指向。
"""


def prompt_text() -> str:
    return """# WebGPT复核Prompt｜FINAL关键帧地图

你是《最后十四天》互动教学游戏的独立验收评委。我会上传一份映射审阅稿、6张关键帧联系表和若干 FINAL 依据文档。你不能访问我的 localhost，所以请将这些上传文件视为本地页面的完整离线快照。

## 本轮只复核什么

1. 计数与覆盖：33个逻辑节点、28个选项／流转、18条代表性完整路径、55张有效关键帧。
2. 图结构：每个选项的下一节点存在；没有断链、无法到达的必要节点或相互矛盾的路径结果。
3. 映射适配：每个节点和每条代表路径的关键帧能表达该时间、地点、天气、人员状态和行动阶段，不会暗示错误剧情。
4. 跨路线共用：共享山路、共享谷地、安全返程、办事地点等母版只共享场景语义，不把不同路线的历史或结果“清零”。
5. 教学因果：关键帧链是否支持当前节点的战略管理知识点，且不把某个选项直接视为唯一正确答案。

## 必查的敏感点

- P02：玩家手里是土地购买期权，不是已拥有土地或采矿权；矿石是发现证据，不是办手续凭证。
- P02：“本人到场、远程不可替代”是故事世界规则，不宣称为现实阿拉斯加法律。
- P05：伤手是偶发失力的能力边界，不应在所有画面持续特写。
- A线：只审v02，山路阶段、Day 3风雪、暂避／继续／撤回的前后因果必须能区分；不得出现医疗十字道具。
- B线：谷地“稳”只表示较低行动风险，不表示能在14天内稳稳完成；Day 6、Day 9不应视觉混为同一阶段。
- C线：等待是Day 0→2→3的信息购买过程，不能视觉写成A线已在高地暴风中。
- D线：Day 5天气只是“短暂改善窗口”，不是确定安全；选择反转不能洗掉已经花掉的5天。
- SH-TOWN-NIGHT：只审v03；入口应可读为普通可进入，但不应从画面推断是否办成手续。
- 结算：到达画面不等于自动获得土地；最终成功／超期／主动放弃必须由路径状态和结算文字决定。

## 明确不复核的事项

- 不重写剧本，不增加竞争者、野兽、交易团队、通讯或交通捷径。
- 不要求重新生成所有55张图；只在有明确节点证据时提出“定点修改”。
- 不审批Pavo模型、中文对白、口型、音频、视频时长或视频可复用性。
- 不把已有“55 PASS”当成必须继续通过的理由；如映射后出现新矛盾，仍应报告。

## 依据优先级

1. `02_教师原案事实与改编边界_FINAL.md`
2. `03_共享世界与十四天时间轴_FINAL.md`
3. `04_完整文字剧情_FINAL.md`
4. `08_互动节点总表_FINAL.xlsx`
5. `13_FINAL一致性收口与封版说明.md`
6. 本次的 `01_FINAL关键帧地图映射审阅稿.md`（它是待验收对象，不能反过来覆盖真源）

如不同依据文档之间出现表述差异，请单独列为“真源一致性问题”，不要自行选一个改写。

## 必须输出的格式

### 1. 总结论

只允许三种：`PASS`、`有条件通过`、`FAIL`。

### 2. 数量与覆盖对账

列出你实际读到的节点数、选项数、路径数、关键帧数，以及无图节点、无图路径、未绑定图的数量。

### 3. 问题表

| 等级 | 节点／路径 | 帧ID | 证据 | 影响 | 最小修复 |
|---|---|---|---|---|---|

等级仅用：高（会误导剧情或产生断链）、中（会弱化状态／教学因果）、低（可读性或标签问题）。没有问题就写“无”，不要为了显得严格而虚构。

### 4. 分路线判定

对公共段、A、B、C、D、共享母版各给一句判定。

### 5. 放行建议

明确回答：这份关键帧地图是否可以进入“人工最终确认→单条低成本Pavo打样”，还是必须先做定点修改。你的PASS不等于批量Pavo授权。
"""


def repair_note_text(branches: list[Branch]) -> str:
    selected = {branch.id: branch for branch in branches if branch.id in {"A-03", "A-04", "A-05"}}
    lines = [
        "# A线映射定点修复后复核摘要",
        "",
        "> 本轮只修改 story-map 关键帧链；没有改 FINAL 剧情、55张关键帧或代表路径数量。",
        "",
        "## 修复1：A02共同事实帧",
        "",
        "A-01至A-05的每个实际关键帧链现在都按顺序包含 `A02A → A02B → A02C`。另外发现原A-02也漏了A02C，已一并补齐。",
        "",
        "## 修复2：A-05互斥撤回时点",
        "",
        "A-05仍然是1条代表路径，但页面内明确显示为两条互斥镜头链，中间用“或”隔开，不再把Day3与Day5–6两次撤回串联。",
        "",
    ]
    for branch_id in ("A-03", "A-04", "A-05"):
        branch = selected[branch_id]
        lines += [f"### {branch.id} · {branch.name}", "", f"- 选择序列：{branch.sequence}"]
        if branch.frame_variants:
            for variant in branch.frame_variants:
                lines.append(f"- {variant.label}：{' → '.join(branch.frame_ids + variant.frame_ids)}")
        else:
            lines.append(f"- 关键帧链：{' → '.join(branch.frame_ids)}")
        lines.append("")
    lines += [
        "## 请只回答",
        "",
        "1. A-03、A-04是否已补回A02B，且A02A→A02B→A02C顺序正确；",
        "2. A-05的两条链是否互斥且时序成立；",
        "3. 18条代表路径、55张有效关键帧数量是否保持；",
        "4. 结论是 `PASS` 还是仍需定点修改。",
        "",
    ]
    return "\n".join(lines)


def copy_basis_docs(target: Path) -> list[Path]:
    sources = [
        FINAL_ROOT / "01_剧情与教学真源" / "02_教师原案事实与改编边界_FINAL.md",
        FINAL_ROOT / "01_剧情与教学真源" / "03_共享世界与十四天时间轴_FINAL.md",
        FINAL_ROOT / "01_剧情与教学真源" / "04_完整文字剧情_FINAL.md",
        FINAL_ROOT / "01_剧情与教学真源" / "05_学生复盘与教学映射_FINAL.md",
        FINAL_ROOT / "01_剧情与教学真源" / "08_互动节点总表_FINAL.xlsx",
        FINAL_ROOT / "00_入口与边界" / "13_FINAL一致性收口与封版说明.md",
        FINAL_ROOT / "05_WebGPT复核材料" / "WebGPT关键帧返修闭环复审_20260913.md",
        FINAL_ROOT / "05_WebGPT复核材料" / "关键帧返修闭环清单_20260913.json",
    ]
    copied: list[Path] = []
    for source in sources:
        if not source.is_file():
            raise FileNotFoundError(source)
        destination = target / source.name
        shutil.copy2(source, destination)
        copied.append(destination)
    return copied


def write_manifest() -> Path:
    files = sorted(path for path in OUTPUT.rglob("*") if path.is_file())
    manifest = {
        "schema_version": 1,
        "generated_at": date.today().isoformat(),
        "scope": "FINAL story-map offline review pack",
        "counts": {"nodes": 33, "options": 28, "representative_paths": 18, "effective_keyframes": 55},
        "excludes": ["old scripts", "old keyframes", "Pavo outputs", "discarded videos"],
        "files": [
            {
                "path": str(path.relative_to(OUTPUT)),
                "bytes": path.stat().st_size,
                "sha256": sha256(path),
            }
            for path in files
        ],
    }
    target = OUTPUT / "05_包内文件与SHA256.json"
    target.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return target


def zip_output() -> None:
    if ZIP_PATH.exists():
        ZIP_PATH.unlink()
    with zipfile.ZipFile(ZIP_PATH, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=8) as archive:
        for path in sorted(OUTPUT.rglob("*")):
            if path.is_file():
                archive.write(path, Path(OUTPUT.name) / path.relative_to(OUTPUT))


def main() -> None:
    frames, nodes, branches = parse_source()
    validate(frames, nodes, branches)
    if OUTPUT.exists():
        shutil.rmtree(OUTPUT)
    sheets = OUTPUT / "03_关键帧联系表"
    basis = OUTPUT / "04_依据文档"
    sheets.mkdir(parents=True)
    basis.mkdir(parents=True)
    (OUTPUT / "00_上传与使用说明.md").write_text(instructions_text(), encoding="utf-8")
    (OUTPUT / "01_FINAL关键帧地图映射审阅稿.md").write_text(
        build_mapping(frames, nodes, branches), encoding="utf-8"
    )
    (OUTPUT / "02_WebGPT最终映射复核Prompt.md").write_text(prompt_text(), encoding="utf-8")
    for route in ROUTE_NAMES:
        build_contact_sheet(route, frames, sheets)
    copy_basis_docs(basis)
    (OUTPUT / "06_A线映射定点修复后复核摘要.md").write_text(repair_note_text(branches), encoding="utf-8")
    write_manifest()
    zip_output()
    print(json.dumps({
        "output": str(OUTPUT),
        "zip": str(ZIP_PATH),
        "nodes": len(nodes),
        "options": sum(len(node.options) for node in nodes),
        "paths": len(branches),
        "keyframes": len(frames),
        "zip_bytes": ZIP_PATH.stat().st_size,
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
