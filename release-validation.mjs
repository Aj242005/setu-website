const hashPattern = /^[a-f0-9]{64}$/;

export function validateRelease(release) {
  if (!release || !hashPattern.test(release.sha256) ||
      release.apk !== `downloads/${release.sha256.slice(0, 16)}.apk` ||
      !Number.isSafeInteger(release.bytes) || release.bytes <= 0 ||
      typeof release.publishedAt !== 'string' ||
      !Number.isFinite(new Date(release.publishedAt).getTime()) ||
      release.navigationAccuracyApproved !== false ||
      release.verification?.sha256 !== release.sha256 ||
      release.verification?.bytes !== release.bytes ||
      release.verification.signatureVerified !== true ||
      release.verification.zip16KiBAligned !== true ||
      (release.downloadName !== undefined && !/^[a-zA-Z0-9._-]+\.apk$/.test(release.downloadName))) {
    throw new Error('Invalid APK verification metadata');
  }
  const level = release.verificationLevel ?? 'device-tested';
  if (level === 'artifact-only') {
    if (release.verification.installedSha256Matches !== false ||
        release.verification.deviceTestsPerformed !== false || release.qa != null ||
        release.packageName !== 'com.setu.navigator' ||
        !hashPattern.test(release.verification.signerCertificateSha256) ||
        !hashPattern.test(release.inspectionReportSha256) ||
        release.report !== `reports/${release.inspectionReportSha256.slice(0, 16)}.md`) {
      throw new Error('Invalid artifact-only inspection metadata');
    }
  } else if (level === 'device-tested') {
    if (release.verification.installedSha256Matches !== true || release.qa?.apkSha256 !== release.sha256) {
      throw new Error('Device evidence does not match this APK');
    }
    for (const [field, hashField, extension] of [
      ['report', 'markdownSha256', 'md'], ['reportPdf', 'pdfSha256', 'pdf'],
    ]) {
      const checksum = release.qa.artifacts?.[hashField];
      if (!hashPattern.test(checksum) || release[field] !== `reports/${checksum.slice(0, 16)}.${extension}`) {
        throw new Error('Invalid device report reference');
      }
    }
  } else {
    throw new Error('Unknown verification level');
  }
  return level;
}
