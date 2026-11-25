const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), os = require('node:os'), path = require('node:path');
const { videoProgress } = require('./video-progress.cjs');
test('live counts, missing/corrupt data, process exit and no private fields', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'video-progress-'));
  try {
    assert.deepEqual(videoProgress(root), { available: false });
    const dir = root + '/health-video/tools/media/imports/all-remaining-20261116';
    fs.mkdirSync(dir, { recursive: true }); fs.mkdirSync(root + '/video-control');
    const batch = { totalExercises: 1351, baselineReviewed: 504, entries: Array.from({ length: 847 }, (_, i) => ({ status: i < 176 ? 'registered-local' : 'pending' })) };
    fs.writeFileSync(dir + '/batch.json', JSON.stringify(batch));
    fs.writeFileSync(root + '/video-control/status.json', JSON.stringify({ status: 'running', pid: 42, log: 'private', error: 'private' }));
    let result = videoProgress(root, () => true);
    assert.equal(result.percent, 50.3); assert.equal(result.reviewed, 680); assert.equal(result.remaining, 671); assert.equal(result.state, 'running'); assert.equal(result.log, undefined); assert.equal(result.error, undefined);
    assert.equal(videoProgress(root, () => false).state, 'interrupted');
    batch.entries.forEach(x => x.status = 'registered-local'); fs.writeFileSync(dir + '/batch.json', JSON.stringify(batch));
    result = videoProgress(root); assert.equal(result.percent, 100); assert.equal(result.remaining, 0);
    fs.writeFileSync(dir + '/batch.json', '{'); assert.deepEqual(videoProgress(root), { available: false });
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
