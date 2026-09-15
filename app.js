const downloadButton = document.querySelector('#download-apk');
const hashLabel = document.querySelector('#apk-hash');
const copyButton = document.querySelector('#copy-hash');

async function loadRelease() {
  try {
    const response = await fetch('release.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Release metadata unavailable');
    const release = await response.json();
    if (!/^[a-f0-9]{64}$/.test(release.sha256) ||
        !/^downloads\/[a-f0-9]{16}\.apk$/.test(release.apk) ||
        release.apk !== `downloads/${release.sha256.slice(0, 16)}.apk` ||
        !Number.isSafeInteger(release.bytes) || release.bytes <= 0 ||
        release.navigationAccuracyApproved !== false ||
        release.verification?.sha256 !== release.sha256 ||
        release.verification?.bytes !== release.bytes ||
        !['signatureVerified', 'zip16KiBAligned', 'installedSha256Matches'].every(
          key => release.verification?.[key] === true)) {
      throw new Error('Invalid beta metadata');
    }
    const date = new Date(release.publishedAt);
    if (!Number.isFinite(date.getTime())) throw new Error('Invalid release date');
    document.querySelector('#release-meta').textContent =
      `${date.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })} · ${(release.bytes / 1048576).toFixed(1)} MB · ${release.sha256.slice(0, 8)}`;
    hashLabel.textContent = release.sha256;
    copyButton.disabled = false;
    downloadButton.disabled = false;
    downloadButton.textContent = 'Download Android APK ↓';
    downloadButton.addEventListener('click', () => {
      const link = document.createElement('a');
      link.href = release.apk;
      link.download = 'SETU-latest-beta.apk';
      document.body.append(link);
      link.click();
      link.remove();
    });
    const failures = release.verification.combined?.failures ?? release.verification.deviceFailures;
    const warnings = [];
    if (release.verification.backgroundCaptureApproved === false) {
      warnings.push('Keep SETU visible while recording: background sensor gaps remain.');
    }
    if (failures > 0) warnings.push('An earlier combined map test exceeded the memory budget.');
    warnings.push('GPS-free accuracy is not approved.');
    document.querySelector('#release-warning').textContent = warnings.join(' ');
    const rows = release.qa?.durations;
    if (Array.isArray(rows) && rows.length === 6) {
      for (const row of rows) {
        const element = document.createElement('tr');
        for (const value of [`${row.seconds} s`, `${row.jointSuccessPercent.toFixed(2)}%`,
          `${row.available.toLocaleString()} / ${row.expected.toLocaleString()}`]) {
          const cell = document.createElement('td');
          cell.textContent = value;
          element.append(cell);
        }
        document.querySelector('#results-body').append(element);
      }
      document.querySelector('#results-table').hidden = false;
      document.querySelector('#results-status').textContent = 'Measured on the OnePlus Nord CE3 Lite.';
      if (/^reports\/[a-f0-9]{16}\.md$/.test(release.report)) {
        document.querySelector('#report-link').href = release.report;
        document.querySelector('#report-link').hidden = false;
      }
      if (/^reports\/[a-f0-9]{16}\.pdf$/.test(release.reportPdf)) {
        document.querySelector('#pdf-report-link').href = release.reportPdf;
        document.querySelector('#pdf-report-link').hidden = false;
      }
    } else {
      document.querySelector('#results-status').textContent =
        'The six-duration report is not attached to this build yet. No accuracy figures are claimed.';
    }
  } catch {
    downloadButton.disabled = true;
    copyButton.disabled = true;
    document.querySelector('#release-meta').textContent = 'The latest release could not be verified.';
    downloadButton.textContent = 'Download temporarily unavailable';
    document.querySelector('#release-warning').textContent = 'Refresh this page or contact the team on GitHub. No unverified file is offered.';
    document.querySelector('#results-status').textContent = 'Verification results are temporarily unavailable.';
  }
}

copyButton.addEventListener('click', async () => {
  const status = document.querySelector('#copy-status');
  try {
    await navigator.clipboard.writeText(hashLabel.textContent);
    status.textContent = 'SHA-256 copied.';
  } catch {
    status.textContent = 'Clipboard access is unavailable. Select and copy the hash above.';
  }
});

loadRelease();
