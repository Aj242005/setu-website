import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

try {
  const release = JSON.parse(await readFile('release.json', 'utf8'));
  assert.match(release.sha256, /^[a-f0-9]{64}$/);
  assert.equal(release.apk, `downloads/${release.sha256.slice(0, 16)}.apk`);
  assert(Number.isSafeInteger(release.bytes) && release.bytes > 0);
  assert(Number.isFinite(new Date(release.publishedAt).getTime()));
  assert.equal(release.navigationAccuracyApproved, false);
  assert.equal(release.verification?.sha256, release.sha256);
  assert.equal(release.verification?.bytes, release.bytes);
  for (const key of ['signatureVerified', 'zip16KiBAligned', 'installedSha256Matches']) {
    assert.equal(release.verification?.[key], true, `${key} is not verified`);
  }
  assert.equal(release.qa?.apkSha256, release.sha256);
  for (const [field, hashField, extension] of [
    ['report', 'markdownSha256', 'md'], ['reportPdf', 'pdfSha256', 'pdf'],
  ]) {
    const checksum = release.qa.artifacts?.[hashField];
    assert.match(checksum, /^[a-f0-9]{64}$/);
    assert.equal(release[field], `reports/${checksum.slice(0, 16)}.${extension}`);
    const contents = await readFile(release[field]);
    assert.equal(createHash('sha256').update(contents).digest('hex'), checksum,
      `${release[field]} does not match the verified report`);
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
  console.log(`Verified release ${release.sha256}: reports present; hosted APK reachable.`);
} catch (error) {
  console.error(`Incomplete beta deployment: ${error.message}`);
  console.error('Publish with --github-release, then include release.json and reports in the Git push.');
  process.exitCode = 1;
}
