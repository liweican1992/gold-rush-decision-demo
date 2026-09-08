import { constants } from 'node:fs';
import { copyFile, lstat, mkdir, readFile, readdir, realpath, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const PUBLIC = 'public/images/choice-frames';
const LEGACY = '短剧制作资料/09_路线制作包';
const HASH = /^[a-f0-9]{64}$/;
export const STAGES = ['公共入口', '节点决策状态', '行动开始', '行动过程', '直接后果', '独立终局'];
export const CHECKS = ['时间', '地点', '人物', '装备', '伤势', '样本/资料', '天气', '不可逆后果'];
const DECISIONS = new Set(Array.from('ABCD').flatMap(route => [0, 1, 2, 3].map(index => `${route}${index}`)));
const ENDINGS = new Set(Array.from('ABCD').flatMap(route => [1, 2, 3].flatMap(index => (route === 'D' && index === 2 ? [1] : [1, 2, 3]).map(finale => `${route}${index}-${finale}`))));
function stageCompatible(usage) {
  if (['INTRO', 'PRIMARY'].includes(usage.nodeId)) return usage.stage === '公共入口';
  if (ENDINGS.has(usage.nodeId)) return usage.stage === '独立终局';
  return DECISIONS.has(usage.nodeId) && ['节点决策状态', '直接后果'].includes(usage.stage);
}
function eligible(asset, usage) {
  if (asset.watermark !== 'none' || usage.judgment === '禁止用于该节点' || usage.repair !== '无需修复待验' || usage.continuityIssues.length || usage.conflicts.length) return false;
  if (!CHECKS.every(key => ['visible', 'external'].includes(usage.checks[key].result) && usage.checks[key].evidence.trim())) return false;
  if (usage.placement === 'process') return DECISIONS.has(usage.nodeId) && ['行动开始', '行动过程'].includes(usage.stage);
  return usage.placement === 'main' && usage.judgment === '候选待审' && usage.stageMatchesNode && stageCompatible(usage);
}
export async function sha256(path) { return createHash('sha256').update(await readFile(path)).digest('hex'); }
export async function safePath(root, path) {
  if (typeof path !== 'string' || !path || isAbsolute(path) || path.split(/[\\/]/).includes('..')) throw new Error(`非法路径: ${path}`);
  const base = await realpath(root), full = resolve(base, path);
  if (!full.startsWith(base + sep)) throw new Error(`路径逃逸: ${path}`);
  let current = base;
  for (const part of relative(base, full).split(sep)) {
    current = resolve(current, part);
    try { if ((await lstat(current)).isSymbolicLink()) throw new Error(`禁止符号链接: ${path}`); }
    catch (error) { if (error.code === 'ENOENT') break; throw error; }
  }
  return full;
}
function validSource(path) { return (path.startsWith(`${LEGACY}/`) || (path.startsWith(`${PUBLIC}/`) && !path.slice(PUBLIC.length + 1).includes('/'))) && /\.(png|jpe?g|webp)$/i.test(path); }
function validTarget(path) { return typeof path === 'string' && new RegExp(`^${PUBLIC}/(review-only|legacy-candidates)/[^/]+\\.(png|jpe?g|webp)$`, 'i').test(path); }
export async function inventory(root) {
  const paths = [];
  async function walk(path, recursive) {
    const directory = await safePath(root, path);
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const child = `${path}/${entry.name}`;
      if (entry.isSymbolicLink()) throw new Error(`禁止符号链接: ${child}`);
      if (entry.isDirectory() && recursive) await walk(child, true);
      else if (entry.isFile() && /\.(png|jpe?g|webp)$/i.test(entry.name)) paths.push(child);
    }
  }
  await walk(PUBLIC, false); await walk(LEGACY, true);
  return Promise.all(paths.sort().map(async sourcePath => ({ sourcePath, sourceSha256: await sha256(await safePath(root, sourcePath)) })));
}
async function preflight(root, asset) {
  if (!validSource(asset.sourcePath) || !validTarget(asset.plannedTargetPath) || !HASH.test(asset.sourceSha256)) throw new Error(`资产路径或哈希无效: ${asset.id}`);
  if (asset.watermark !== 'none' && !asset.plannedTargetPath.startsWith(`${PUBLIC}/review-only/`)) throw new Error(`水印资产只能进入审查区: ${asset.id}`);
  const source = await safePath(root, asset.sourcePath), target = await safePath(root, asset.plannedTargetPath);
  if (await sha256(source) !== asset.sourceSha256) throw new Error(`源文件哈希不一致: ${asset.sourcePath}`);
  try { if (await sha256(target) !== asset.sourceSha256) throw new Error(`目标文件哈希冲突，停止且不覆盖: ${asset.plannedTargetPath}`); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  return { source, target };
}
export async function copyExact(root, asset) {
  const { source, target } = await preflight(root, asset);
  await mkdir(dirname(target), { recursive: true });
  await safePath(root, asset.plannedTargetPath);
  try { await copyFile(source, target, constants.COPYFILE_EXCL); }
  catch (error) { if (error.code !== 'EEXIST') throw error; }
  const targetSha256 = await sha256(target);
  if (targetSha256 !== asset.sourceSha256) throw new Error(`目标文件哈希冲突，停止且不覆盖: ${asset.plannedTargetPath}`);
  if (await sha256(source) !== asset.sourceSha256) throw new Error(`源文件复制期间哈希变化: ${asset.sourcePath}`);
  return { targetPath: asset.plannedTargetPath, targetSha256, verified: true };
}
export async function runManifest(root, manifest, mode) {
  if (!['copy', 'verify'].includes(mode)) throw new Error('未知模式');
  if (manifest.version !== 1 || !Array.isArray(manifest.assets) || !Array.isArray(manifest.usages)) throw new Error('清单结构无效');
  const ids = new Set(), sources = new Set(), targets = new Set();
  for (const asset of manifest.assets) {
    if (!asset.id || asset.version !== 1 || ids.has(asset.id) || sources.has(asset.sourcePath) || targets.has(asset.plannedTargetPath)) throw new Error('清单重复或资产版本无效');
    ids.add(asset.id); sources.add(asset.sourcePath); targets.add(asset.plannedTargetPath);
    if (!['none', 'pavo', 'unknown'].includes(asset.watermark) || !['target-image', 'video-frame', 'legacy-image'].includes(asset.origin)) throw new Error('清单资产枚举无效');
  }
  const usageIds = new Set(), mains = new Set();
  for (const usage of manifest.usages) {
    if (!usage.id || usageIds.has(usage.id) || !ids.has(usage.assetId)) throw new Error('清单用途引用无效');
    usageIds.add(usage.id);
    if (!STAGES.includes(usage.stage) || !['候选待审', '仅作参考', '禁止用于该节点'].includes(usage.judgment) || !['无需修复待验', '可裁切待复核', '可局部重绘待复核', '需换帧'].includes(usage.repair) || usage.acceptance !== '未验收') throw new Error('清单四维枚举无效或本批未经制作验收');
    if (!['main', 'process', 'review'].includes(usage.placement) || typeof usage.stageMatchesNode !== 'boolean' || !usage.nodeId || !usage.shotId || typeof usage.action !== 'string' || !usage.action.trim()) throw new Error('清单用途字段无效');
    if (!Array.isArray(usage.continuityIssues) || !Array.isArray(usage.conflicts) || ![...usage.continuityIssues, ...usage.conflicts].every(item => typeof item === 'string')) throw new Error('清单连续性字段无效');
    if (!CHECKS.every(key => usage.checks?.[key] && ['visible', 'external', 'pending', 'conflict'].includes(usage.checks[key].result) && typeof usage.checks[key].evidence === 'string' && (!['visible', 'external'].includes(usage.checks[key].result) || usage.checks[key].evidence.trim()))) throw new Error('清单八项核对或证据无效');
    if (usage.placement === 'main') {
      if (mains.has(usage.nodeId) || !stageCompatible(usage)) throw new Error('清单主图重复或正式节点阶段不兼容');
      mains.add(usage.nodeId);
    }
  }
  for (const asset of manifest.assets) {
    if (asset.plannedTargetPath?.startsWith(`${PUBLIC}/legacy-candidates/`)) {
      const uses = manifest.usages.filter(usage => usage.assetId === asset.id);
      const intended = uses.filter(usage => usage.placement !== 'review');
      if (!intended.length || intended.some(usage => !eligible(asset, usage))) throw new Error(`未通过用途准入，只能进入审查区: ${asset.id}`);
    }
  }
  const actual = await inventory(root);
  if (actual.length !== sources.size || actual.some(item => !sources.has(item.sourcePath))) throw new Error('清单与实际源文件集合不一致');
  for (const asset of manifest.assets) await preflight(root, asset);
  const result = structuredClone(manifest);
  for (const asset of result.assets) {
    if (mode === 'copy') asset.copy = await copyExact(root, asset);
    else {
      if (!asset.copy?.verified || asset.copy.targetPath !== asset.plannedTargetPath || asset.copy.targetSha256 !== asset.sourceSha256) throw new Error(`副本证据缺失或不一致: ${asset.id}`);
      if (await sha256(await safePath(root, asset.copy.targetPath)) !== asset.copy.targetSha256) throw new Error(`副本哈希不一致: ${asset.id}`);
    }
  }
  return result;
}
async function main() {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const mode = process.argv[2];
  if (mode === 'inventory') { console.log(JSON.stringify(await inventory(root), null, 2)); return; }
  if (!['copy', 'verify'].includes(mode)) throw new Error('用法: node scripts/keyframe-reuse-assets.mjs inventory|copy|verify');
  const path = await safePath(root, 'src/demo/keyframeReuseManifest.json');
  const manifest = JSON.parse(await readFile(path, 'utf8'));
  const result = await runManifest(root, manifest, mode);
  if (mode === 'copy') await writeFile(path, `${JSON.stringify(result, null, 2)}\n`);
  console.log(`${mode}: ${result.assets.length} sources, ${result.assets.filter(asset => asset.copy?.verified).length} verified copies; originals unchanged`);
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch(error => { console.error(error.message); process.exitCode = 1; });
