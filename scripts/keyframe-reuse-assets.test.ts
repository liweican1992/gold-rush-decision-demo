import { afterEach, describe, expect, it } from 'vitest';
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { copyExact, sha256, safePath, runManifest, inventory, STAGES as SCRIPT_STAGES, CHECKS as SCRIPT_CHECKS } from './keyframe-reuse-assets.mjs';
import { STAGES, CHECKS } from '../src/demo/keyframeReuse.types';
import { REDESIGNED_STORY } from '../src/demo/redesignedStory';

function usage(assetId: string) {
  return { id: 'usage', assetId, nodeId: 'A0', shotId: 'decision', stage: '节点决策状态', action: '决定路线', judgment: '候选待审', repair: '无需修复待验', acceptance: '未验收', checks: Object.fromEntries(['时间', '地点', '人物', '装备', '伤势', '样本/资料', '天气', '不可逆后果'].map(key => [key, { result: 'visible', evidence: '逐项审查证据' }])), continuityIssues: [], conflicts: [], stageMatchesNode: true, placement: 'main' };
}

const roots: string[] = [];
async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'keyframe-test-')); roots.push(root);
  await mkdir(join(root, 'public/images/choice-frames'), { recursive: true });
  await mkdir(join(root, '短剧制作资料/09_路线制作包'), { recursive: true });
  await mkdir(join(root, '短剧制作资料/17_正式Pavo制作包_v3.0'), { recursive: true });
  const sourcePath = 'public/images/choice-frames/test.webp';
  await writeFile(join(root, sourcePath), 'fixture bytes');
  const asset = { id: 'test', version: 1, sourcePath, sourceSha256: await sha256(join(root, sourcePath)), origin: 'legacy-image', watermark: 'unknown', plannedTargetPath: 'public/images/choice-frames/review-only/test.webp' };
  return { root, asset, manifest: { version: 1, assets: [asset], usages: [] } };
}
afterEach(async () => { await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true }))); });
describe('immutable keyframe copies', () => {
  it('keeps script stage/check definitions aligned with the Web schema', () => {
    expect(SCRIPT_STAGES).toEqual(STAGES); expect(SCRIPT_CHECKS).toEqual(CHECKS);
  });
  it('accepts all formal main stages after complete checks without approving production', async () => {
    const { root, asset, manifest } = await fixture();
    asset.watermark = 'none'; asset.plannedTargetPath = 'public/images/choice-frames/legacy-candidates/test.webp';
    const nodes = [
      ...REDESIGNED_STORY.common.map(node => ({ id: node.id, stage: '公共入口' })),
      ...REDESIGNED_STORY.routes.flatMap(route => [route.situation, ...route.outcomes].map(node => ({ id: node.id, stage: '节点决策状态' }))),
      ...REDESIGNED_STORY.routes.flatMap(route => route.outcomes.flatMap(node => node.finales.map(finale => ({ id: finale.id, stage: '独立终局' })))),
    ];
    const revised = { ...manifest, usages: nodes.map(node => ({ ...usage(asset.id), id: node.id, nodeId: node.id, stage: node.stage })) };
    const copied = await runManifest(root, revised, 'copy');
    await expect(runManifest(root, copied, 'verify')).resolves.toMatchObject({ version: 1 });
    expect(copied.usages.every(row => row.acceptance === '未验收')).toBe(true);
  });
  it('accepts an audited finale K02 as process-only material without approving production', async () => {
    const { root, asset, manifest } = await fixture();
    asset.watermark = 'none'; asset.plannedTargetPath = 'public/images/choice-frames/legacy-candidates/test.webp';
    const row = { ...usage(asset.id), nodeId: 'A1-1', stage: '行动过程', placement: 'process', shotId: 'K02-action-composition-candidate' };
    const copied = await runManifest(root, { ...manifest, usages: [row] }, 'copy');
    expect(copied.usages[0]).toMatchObject({ nodeId: 'A1-1', placement: 'process', acceptance: '未验收' });
  });
  it.each(['stage', 'evidence', 'acceptance', 'duplicate', 'node'])('rejects invalid usage %s', async kind => {
    const { root, asset, manifest } = await fixture();
    const row = usage(asset.id);
    if (kind === 'stage') row.stage = '整装';
    if (kind === 'evidence') row.checks['时间'].evidence = '';
    if (kind === 'acceptance') row.acceptance = '关键帧已验收';
    if (kind === 'node') row.nodeId = 'F1';
    const revised = { ...manifest, usages: kind === 'duplicate' ? [row, { ...row, id: 'duplicate' }] : [row] };
    await expect(runManifest(root, revised, 'copy')).rejects.toThrow();
  });
  it.each(['pending', 'conflict', 'continuity', 'review'])('prevents ineligible %s assets from candidate directory', async kind => {
    const { root, asset, manifest } = await fixture();
    asset.watermark = 'none'; asset.plannedTargetPath = 'public/images/choice-frames/legacy-candidates/test.webp';
    const row = usage(asset.id);
    if (kind === 'pending' || kind === 'conflict') row.checks['时间'].result = kind;
    if (kind === 'continuity') (row.continuityIssues as string[]).push('左手未核对');
    if (kind === 'review') row.placement = 'review';
    await expect(runManifest(root, { ...manifest, usages: [row] }, 'copy')).rejects.toThrow(/审查区/);
  });
  it('copies exact bytes, records hashes and supports idempotent rerun', async () => {
    const { root, asset } = await fixture();
    const first = await copyExact(root, asset);
    expect(first.targetSha256).toBe(asset.sourceSha256);
    expect(first.verified).toBe(true);
    expect(await copyExact(root, asset)).toEqual(first);
    expect(await readFile(join(root, asset.sourcePath), 'utf8')).toBe('fixture bytes');
  });
  it('registers generated production keyframes as immutable candidate sources', async () => {
    const { root, asset, manifest } = await fixture();
    const sourcePath = '短剧制作资料/17_正式Pavo制作包_v3.0/03_B路线/B1/关键帧/K03_目标尾帧候选_v1.png';
    await mkdir(join(root, '短剧制作资料/17_正式Pavo制作包_v3.0/03_B路线/B1/关键帧'), { recursive: true });
    await writeFile(join(root, sourcePath), 'generated keyframe');
    const generated = { ...asset, id: 'generated', sourcePath, sourceSha256: await sha256(join(root, sourcePath)), origin: 'target-image', watermark: 'none', plannedTargetPath: 'public/images/choice-frames/review-only/generated.png' };
    const copied = await runManifest(root, { ...manifest, assets: [asset, generated] }, 'copy');
    expect(copied.assets.find(row => row.id === 'generated')?.copy?.verified).toBe(true);
  });
  it('rejects a different existing target without overwriting', async () => {
    const { root, asset } = await fixture();
    await mkdir(join(root, 'public/images/choice-frames/review-only'));
    await writeFile(join(root, asset.plannedTargetPath), 'do not overwrite');
    await expect(copyExact(root, asset)).rejects.toThrow(/目标.*哈希/);
    expect(await readFile(join(root, asset.plannedTargetPath), 'utf8')).toBe('do not overwrite');
  });
  it('rejects changed sources and traversal or symlink paths', async () => {
    const { root, asset } = await fixture();
    await writeFile(join(root, asset.sourcePath), 'changed');
    await expect(copyExact(root, asset)).rejects.toThrow(/源.*哈希/);
    await expect(safePath(root, '../outside')).rejects.toThrow();
    await symlink(tmpdir(), join(root, 'escape'));
    await expect(safePath(root, 'escape/test')).rejects.toThrow(/符号链接/);
  });
  it('preflights the whole batch before creating any copy', async () => {
    const { root, asset, manifest } = await fixture();
    const second = { ...asset, id: 'second', sourcePath: 'public/images/choice-frames/second.webp', plannedTargetPath: 'public/images/choice-frames/review-only/second.webp' };
    await writeFile(join(root, second.sourcePath), 'fixture bytes');
    manifest.assets.push(second);
    await mkdir(join(root, 'public/images/choice-frames/review-only'));
    await writeFile(join(root, second.plannedTargetPath), 'conflict');
    await expect(runManifest(root, manifest, 'copy')).rejects.toThrow(/目标.*哈希/);
    await expect(readFile(join(root, asset.plannedTargetPath))).rejects.toThrow();
  });
  it('verifies registered sources, actual inventory and copied evidence', async () => {
    const { root, manifest } = await fixture();
    const copied = await runManifest(root, manifest, 'copy');
    await expect(runManifest(root, copied, 'verify')).resolves.toMatchObject({ version: 1 });
    expect((await inventory(root)).length).toBe(1);
    await writeFile(join(root, 'public/images/choice-frames/new.png'), 'new');
    await expect(runManifest(root, copied, 'verify')).rejects.toThrow(/清单.*不一致/);
  });
  it('rejects unverified or tampered copies and watermarked candidate targets', async () => {
    const { root, asset, manifest } = await fixture();
    await expect(runManifest(root, manifest, 'verify')).rejects.toThrow(/副本证据/);
    await expect(copyExact(root, { ...asset, plannedTargetPath: 'public/images/choice-frames/legacy-candidates/test.webp' })).rejects.toThrow(/水印/);
    const copied = await runManifest(root, manifest, 'copy');
    await writeFile(join(root, asset.plannedTargetPath), 'tampered');
    await expect(runManifest(root, copied, 'verify')).rejects.toThrow(/目标.*哈希/);
  });
  it('rejects source and destination symlinks even when their contents match', async () => {
    const { root, asset } = await fixture();
    await mkdir(join(root, 'public/images/choice-frames/review-only'));
    await symlink(join(root, asset.sourcePath), join(root, asset.plannedTargetPath));
    await expect(copyExact(root, asset)).rejects.toThrow(/符号链接/);
  });
});
