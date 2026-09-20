# SETU product site

Static, light-default product and download companion to the Android app. Explains
implemented utilities, signal-loss limits, the capture/estimation/training
architecture and measured results. No build dependencies, account database or
automatic location-data uploads. Website-only Vercel Web Analytics is described
below; it is not Android telemetry.

From this directory: `python -m http.server 4173 --bind 127.0.0.1`.
Open `http://127.0.0.1:4173`. This is local hosting, not a public deployment.
Local hosting serves `downloads` directly. The Vercel deployment serves the site
and reports from Git and redirects APK downloads to the public GitHub Release.

## Deploy to Vercel from GitHub

The original deployment omitted `release.json`, `reports` and `downloads`
because they were ignored by Git. That caused the disabled download button.
Metadata and reports must now be committed; APK binaries remain outside Git.

1. Publish the verified APK with the command below, including `--github-release`.
2. From this website repository, commit and push `.gitignore`, `.vercelignore`,
   `vercel.json`, `scripts/verify-release.mjs`, `release.json`, `reports` and this
   README. Include any intentional UI changes separately. Never force-add an APK.
3. In Vercel, use Framework Preset **Other**, repository root directory, build
   command `node scripts/verify-release.mjs`, output directory `.`, and no install
   command. `vercel.json` supplies these settings; remove conflicting dashboard
   overrides. Redeploy the new commit, not the preceding failed commit.

## Enable website analytics

`analytics.js` uses Vercel's static-site queue and production script at
`/_vercel/insights/script.js`; no React integration, package install or API key is
needed. Keep it separate from `app.js` so a blocked analytics script never blocks
release verification or APK downloads.

1. In the Vercel project dashboard, open **Analytics** and choose **Enable**.
2. Commit/push the intended website changes and redeploy. Activation creates the
   analytics routes on the next deployment. `vercel.json` configures the build,
   security/cache headers and APK redirect; it does **not** enable the dashboard
   product or send measurements by itself.
3. Visit the deployed HTTPS site without an analytics blocker or browser privacy
   opt-out. Confirm the script returns 200 and a page-view request is sent; Vercel
   may use a generated endpoint path. Check the Analytics dashboard for visits.
   A local Python server is not an analytics deployment and does not load it.
4. Also check with Do Not Track or Global Privacy Control enabled: no analytics
   script should load, and APK download verification should still work.

Only page views are allowed; no custom click/download events are emitted (custom
events also depend on the Vercel plan). Query strings and fragments are removed
from event URLs before sending. Invalid URLs/events are dropped. Browser DNT/GPC
signals suppress loading; HTTPS localhost is excluded as well. The website
discloses analytics at `#privacy`, does not use analytics cookies, does not request
location and does not send trip files, sensor data or device identifiers from
Android. Vercel still processes request-derived visit information; this is not a
claim of zero data collection. The owner must review applicable privacy duties.

Official references: [static-site setup](https://vercel.com/docs/analytics/quickstart?framework=other),
[beforeSend](https://vercel.com/docs/analytics/package#beforesend),
[redacting URLs](https://vercel.com/docs/analytics/redacting-sensitive-data), and
[privacy](https://vercel.com/docs/analytics/privacy-policy).

### Preserve report checksums across Windows and Linux

Reports are verified byte-for-byte. `reports/.gitattributes` disables Git text
conversion for that directory. Without it, Windows CRLF reports become LF in
Git, causing a Vercel checksum failure even when a local build passes.
When adding this rule to an existing checkout, run `git add reports/.gitattributes`
and `git add --renormalize reports` before committing and pushing the fix.
This preserves the original verified bytes; do not change the published hashes
or remove checksum validation to make a build pass.

The build fails if metadata or reports are missing/tampered, or the matching
GitHub APK is absent. The GitHub publisher verifies the hosted asset's SHA-256
and size before updating metadata. No GitHub token is needed in Vercel or the
browser. Publishing locally uses your existing Git Credential Manager sign-in.
The APK release is https://github.com/Aj242005/setu-website/releases/tag/android-beta.
The build's public HEAD check verifies reachability/size, not a fresh APK hash;
testers can compare the downloaded file against the published SHA-256.

## Update the latest beta after every verified build

Run from the sibling SETU repository, using the actual new artifact/evidence:

```powershell
python -m tools.publish_beta dist/android/SETU-qa-beta.apk `
  docs/verification/android/rigorous-qa/apk-verification.json `
  --site ../setu-website --github-release `
  --report docs/verification/android/rigorous-qa/report.json
```

Use the matching report for each new build. The publisher copies
the matching coordinate-free Markdown and PDF reports automatically. It verifies
their hashes against the JSON manifest, so an in-progress report generation is
never mixed with the preceding report. It also verifies
the exact APK hash, bytes, device installation, signature and 16 KiB alignment
evidence. Versioned APKs are immutable; `release.json` is replaced atomically
only after a verified copy, so a failed update retains the preceding download.
The publisher does not create evidence or sign an APK. Never fabricate passing
checks. The site always says development beta, never approved navigation.

The server must not cache `release.json`; `vercel.json` supplies Vercel rules and
`_headers` supports compatible other static hosts. Existing users refresh to see
the latest published build. Add `--watch 30` to check for verified artifact changes
every 30 seconds while the publisher is running. Failed checks keep the preceding
download. Stop with Ctrl+C; no persistent background service is installed.
The watcher updates local metadata and GitHub assets only. Commit/push the new
`release.json` and reports to trigger a new Vercel deployment; it does not
automatically commit, push or deploy your website.

Feedback uses the existing project’s GitHub issues. A private training-data
handoff must be arranged by the team; do not solicit raw public GPS uploads.
