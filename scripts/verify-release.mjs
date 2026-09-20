import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { validateRelease } from '../release-validation.mjs';

try {
  const release = JSON.parse(await readFile('release.json', 'utf8'));
  const level = validateRelease(release);
  const reports = level === 'artifact-only' ? [[release.report, release.inspectionReportSha256]] : [
    [release.report, release.qa.artifacts.markdownSha256], [release.reportPdf, release.qa.artifacts.pdfSha256],
  ];
  for (const [path, checksum] of reports) {
    const contents = await readFile(path);
    assert.equal(createHash('sha256').update(contents).digest('hex'), checksum,
      `${path} does not match the verified report`);
    if (level === 'artifact-only') assert(contents.toString('utf8').includes(release.sha256), 'Inspection must identify this APK');
  }
  const config = JSON.parse(await readFile('vercel.json', 'utf8'));
  const redirect = config.redirects.find(rule => rule.source === '/downloads/:asset*');
  const base = 'https://github.com/Aj242005/setu-website/releases/download/android-beta/';
  assert.equal(redirect?.destination, `${base}:asset*`);
  const response = await fetch(base + release.apk.slice('downloads/'.length), {
    method: 'HEAD', signal: AbortSignal.timeout(60000),
  });
  assert.equal(response.status, 200, 'Publish the matching APK to GitHub Releases first');
  assert.equal(Number(response.headers.get('content-length')), release.bytes,
    'The hosted APK has the wrong size');
  console.log(`Verified ${level} release ${release.sha256}: reports present; hosted APK reachable.`);
} catch (error) {
  console.error(`Incomplete beta deployment: ${error.message}`);
  console.error('Publish the matching GitHub Release asset, then include release.json and its hash-matched reports in the Git push.');
  process.exitCode = 1;
}
