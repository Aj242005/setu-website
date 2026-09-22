# SETU product site

Static, light-default product and download companion to the Android app. Explains
implemented utilities, signal-loss limits, the capture/estimation/training
architecture and build-specific evidence. A synthetic 3D tunnel journey leads
the page. No build dependencies, account database or
automatic location-data uploads. Website-only Vercel Web Analytics is described
below; it is not Android telemetry.

From this directory: `python -m http.server 4173 --bind 127.0.0.1`.
Open `http://127.0.0.1:4173`. This is local hosting, not a public deployment.
Local hosting serves `downloads` directly. The Vercel deployment serves the site
and reports from Git and redirects APK downloads to the public GitHub Release.
For the current supplied preview, local download testing needs a copy of
`setu-v0.1.0.apk` at `downloads/1dd5fbfd0a83517c.apk`. The APK remains ignored by
Git and Vercel; the live download uses the hash-pinned GitHub asset instead.

## Interactive tunnel journey

Fresh root visits and reloads start a skippable, fully automatic opening.
`arrival.mjs` waits for the self-hosted India image to decode, holds the complete
map as a subtle, centred full-screen background for 0.65 seconds, then zooms to the actual OSM south-endpoint coordinates over
2.4 seconds. Full-screen white clouds cover a 350ms automatic scroll to the demo;
an 850ms dissolve reveals it and starts one illustrative journey. No scrolling,
second click, photographic hero or separate portal reveal is required.
`#simulation` and `#download` links, reduced-motion preferences and no-JavaScript
visits bypass the opening. Skip/Escape reaches the paused demo; manual scrolling,
keyboard navigation or a changed section link cancels the sequence. Hidden tabs
pause the opening clock. A missing map skips it rather than blocking the page.
The only WebGL canvas stays in the demo; no renderer reparenting or snapshot is needed.

The 0.65-second hold uses elapsed time; zoom and reveal steps are capped at 100ms
so a slow GPU cannot skip them. Its nominal 4.25-second sequence can take longer on a busy device; this does
not change the sensor journey's elapsed-time playback or its speed controls.

`landscape.mjs` builds photo-referenced portal geometry, terrain, ridges, rocks
and instanced vegetation using local licensed assets. This is not a surveyed
digital twin or a full-length reconstruction of the 9.02 km tunnel. See
[`docs/landscape-sources.md`](docs/landscape-sources.md) for coordinates, photo
attributions, texture sources and the distinction between real geography and
the compressed fictional sensor trip. If 3D is unavailable, the opening still
completes on time and the board retains its 2D simulation, without a photo fallback.
The browser test matrix and limitations are recorded in
[`docs/automatic-arrival-verification.md`](docs/automatic-arrival-verification.md).

The India outline follows the official Indian territorial depiction using
DataMeet's open-licensed country composite, with OSM-derived Lakshadweep
coastlines. It replaces Natural Earth's India polygon. The official reference,
source commits, licences and original file hashes are in the source document;
Survey of India's permission-restricted artwork is not redistributed.

The right-side **Inside the car** panel uses the same 0.05-second timeline as the
scene. GPS latitude/longitude are generated only for available simulated fixes;
both readouts become dashes during seconds 9–21. Coordinates use a local tangent
approximation anchored at the south portal, with a representative 19° bearing.
They illustrate a short path near the tunnel, not a surveyed Atal Tunnel route.

**Edge-device ML** shows explicitly simulated model readings: speed (m/s), signed
track-relative heading (degrees, zero along scene +X) and uncertainty radius (m).
These reuse the browser estimator's current frame; they are not learned inference,
a measured confidence interval or an Android performance benchmark. The status
shows GPS anchoring, sensor-only estimation and returning-GPS correction. With
the sensor bridge off, the readings remain visible as a labelled preview rather
than being represented as the map's active position source. They share the same
pause, restart, scrubbing and speed controls as the sensor readings.

The flat phone's axes are X right, Y forward and Z up. Acceleration is in m/s²
and includes approximately 9.80665 m/s² gravity on Z. Gyroscope values are in °/s;
phone Z yaw has the opposite sign to the simulation's clockwise world heading.
Forward acceleration and yaw correspond to the existing planar estimator;
the additional axes provide deterministic illustrative vibration/lateral motion,
not a new six-axis Android fusion model. Pause, scrub and playback speed apply
to these readings too. The browser never requests the visitor's sensors or GPS.
The feed keeps running while the stacked mobile panel is visible, with an explicit
Playing/Paused indicator. Playback pauses outside the entire demo or in a hidden
tab; offscreen 3D drawing is skipped while the panel remains in use.

`simulation-model.mjs` generates a deterministic 30-second fictional trip.
Synthetic GPS is available before second 9, absent from seconds 9–21, and returns
at second 21. Biased synthetic acceleration and yaw-rate measurements integrate
speed, heading and position during that gap. Returning fixes correct the current
estimate gradually; they do not rewrite its past trail. These times, errors and
uncertainty radii are illustration parameters, not supported APK outage durations.
The inset is a top-down view of the same world-space track: +X points right and
+Z points down, with the same scale on both axes. Road, tunnel, fixes, estimates
and uncertainty use that common projection, rather than a mirrored or stretched
copy. Its orientation stays fixed when the 3D camera changes.

`tunnel-scene.mjs` uses self-hosted Three.js 0.186.0 (MIT, `vendor/LICENSE`) to draw
the terrain, curved tunnel and car. It loads for the opening or when the demo enters view.
The sensor model, controls, accessible text and inset SVG map remain usable if
WebGL or the renderer module is unavailable. There is no visitor GPS request,
phone-sensor access, CDN dependency or Android/AI inference in this illustration.

- Play/pause, restart or scrub the timeline; phase buttons jump to the key events.
- Disable **Sensor bridge** to see the position freeze at the last GPS fix.
- **Reveal tunnel interior** opens the near half of the roof from GPS loss onward,
  keeping the car visible through recovery; turn it off to inspect the full shell.
- **Follow car** switches from the overview to a close tracking camera.
  Narrow screens start in the follow view so the car stays legible; **Overview**
  remains available for the full scene.
- **View zoom** offers 1×, 2×, 3× and 4× in both cameras; **Playback speed** offers
  1×, 2× and 3× without changing the generated sensor data.
- Journey motion starts only on request and pauses when hidden/offscreen. Keyboard and
  reduced-motion users can explore without playback; device pixel ratio is capped.

A real browser Android demo is **not implemented**. A static Vercel deployment
does not provide a running Android device. That requires a hosted emulator/session
service and an account, concurrency/cost limits and privacy decisions. Do not label
the 3D scene or a screenshot as the APK running in the browser.

## Current supplied preview

The owner-supplied `setu-v0.1.0.apk` is the active download, not the earlier QA APK.
Package `com.setu.navigator`, version `0.1.0` (code 1), 211636530 bytes, SHA-256:
`1dd5fbfd0a83517c57d7899d218a9b7f2473006e93a0a58602fc76219704b8c2`.
It is Android-development-signed. Signature, 16 KiB ZIP alignment, package/version,
file digest and public GitHub download were checked. No fresh device or accuracy
test is claimed. See `reports/9232934d7944a1bc.md` for the exact inspection.

`release-validation.mjs` is shared by the browser and deployment verifier. An
explicit `artifact-only` release must have signature/alignment evidence, matching
hash/bytes, a hash-linked inspection report and **false** installation/device-test
flags. It cannot carry a `qa` report. The existing `device-tested` path still
requires matching installed-APK evidence and both hash-verified device reports.
Unknown levels and mismatches fail closed. Keep old immutable releases/reports
for history; do not present their evidence as belonging to the new APK.

To publish another supplied preview: inspect that exact APK with the Android SDK
commands in the report, publish it using the sibling SETU repository's
`tools.publish_github_apk.publish_asset`, create a new hash-named inspection report
and matching `artifact-only` metadata, then run `node scripts/verify-release.mjs`.
Commit/push metadata, report and website code only. Do not change hashes to evade
a failed check, reuse old evidence, or run an old-artifact watcher over this preview.

## Deploy to Vercel from GitHub

The original deployment omitted `release.json`, `reports` and `downloads`
because they were ignored by Git. That caused the disabled download button.
Metadata and reports must now be committed; APK binaries remain outside Git.

1. Publish the matching APK to GitHub Releases: use the supplied-preview procedure
   above, or the device-verified publisher below with `--github-release`.
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
