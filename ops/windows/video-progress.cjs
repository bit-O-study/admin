const fs = require('node:fs');
function read(file) { return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '')); }
function videoProgress(base = 'C:/Users/pc/agent-workspace', alive = pid => { try { process.kill(pid, 0); return true; } catch { return false; } }) {
  try {
    const batch = read(`${base}/health-video/tools/media/imports/all-remaining-20261116/batch.json`);
    const completed = batch.entries.filter(x => x.status === 'registered-local').length;
    const total = batch.totalExercises, reviewed = batch.baselineReviewed + completed;
    if (!Number.isInteger(total) || total <= 0 || !Number.isInteger(reviewed) || reviewed < 0 || reviewed > total || batch.baselineReviewed + batch.entries.length !== total) throw Error('Invalid counts');
    let worker = {}; try { worker = read(`${base}/video-control/status.json`); } catch { /* Counts remain available without worker state. */ }
    const states = ['running', 'between-iterations', 'complete', 'blocked', 'failed', 'stopped', 'prepared-awaiting-release'];
    let state = states.includes(worker.status) ? worker.status : 'unknown';
    if (['running', 'between-iterations'].includes(state) && (!Number.isInteger(worker.pid) || !alive(worker.pid))) state = 'interrupted';
    return { available: true, total, reviewed, remaining: total - reviewed, percent: Math.round(reviewed / total * 1000) / 10, batchCompleted: completed, batchTotal: batch.entries.length, state, updatedAt: typeof worker.updatedAt === 'string' && Number.isFinite(Date.parse(worker.updatedAt)) ? worker.updatedAt : null };
  } catch { return { available: false }; }
}
module.exports = { videoProgress };
