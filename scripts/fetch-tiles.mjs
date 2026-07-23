// Mirror DZI tile pyramids from the asset server into public/images/tiles/
// so kiosk builds (VITE_IMAGE_BASE=./images) can run fully offline.
// Resumable: skips files already on disk, so re-running fills only the gaps.

import { mkdir, writeFile, stat, readFile } from 'node:fs/promises';
import { dirname } from 'node:path';

const REMOTE = 'https://assets.digitalgizmo.com/maine-maps/tiles';
const OUT = 'public/images/tiles';
const TILE_SIZE = 512;
const CONCURRENCY = 12;

const data = JSON.parse(await readFile('public/data/maps.json', 'utf8'));
const mapSets = Array.isArray(data) ? data : (data.results ?? data);

// Crop views reuse their base image's filename, so dedupe to distinct pyramids.
const pyramids = new Map();
for (const ms of mapSets) {
  for (const v of ms.views ?? []) {
    if (v.filename && v.image_width && v.image_height && !pyramids.has(v.filename)) {
      pyramids.set(v.filename, [v.image_width, v.image_height]);
    }
  }
}

// Enumerate every tile in a DZI pyramid: levels 0..ceil(log2(max(w,h))).
function tilesFor(w, h) {
  const out = [];
  const levels = Math.ceil(Math.log2(Math.max(w, h)));
  for (let level = 0; level <= levels; level++) {
    const scale = 2 ** (levels - level);
    const cols = Math.ceil(Math.ceil(w / scale) / TILE_SIZE);
    const rows = Math.ceil(Math.ceil(h / scale) / TILE_SIZE);
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) out.push(`${level}/${c}_${r}.jpeg`);
    }
  }
  return out;
}

const jobs = [];
for (const [filename, [w, h]] of pyramids) {
  for (const tile of tilesFor(w, h)) {
    jobs.push({
      url: `${REMOTE}/${filename}_files/${tile}`,
      path: `${OUT}/${filename}_files/${tile}`,
    });
  }
}

console.log(`${pyramids.size} pyramids, ${jobs.length} tiles to check`);

let done = 0, fetched = 0, skipped = 0, missing = 0;
const failures = [];

async function worker(queue) {
  for (const job of queue) {
    try {
      await stat(job.path);
      skipped++;
    } catch {
      try {
        const res = await fetch(job.url);
        if (res.status === 404) {
          // Generators sometimes omit tiles; not fatal.
          missing++;
        } else if (!res.ok) {
          failures.push(`${res.status} ${job.url}`);
        } else {
          await mkdir(dirname(job.path), { recursive: true });
          await writeFile(job.path, Buffer.from(await res.arrayBuffer()));
          fetched++;
        }
      } catch (e) {
        failures.push(`${e.message} ${job.url}`);
      }
    }
    if (++done % 200 === 0) {
      process.stdout.write(`\r  ${done}/${jobs.length}  fetched:${fetched} skipped:${skipped} 404:${missing} err:${failures.length}`);
    }
  }
}

const slices = Array.from({ length: CONCURRENCY }, (_, i) =>
  jobs.filter((_, j) => j % CONCURRENCY === i)
);
await Promise.all(slices.map(worker));

console.log(`\ndone — fetched:${fetched} skipped:${skipped} 404:${missing} errors:${failures.length}`);
if (failures.length) {
  console.log('failures (first 20):');
  for (const f of failures.slice(0, 20)) console.log('  ' + f);
  process.exitCode = 1;
}
