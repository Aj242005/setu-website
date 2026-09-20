# Website tunnel demo and supplied APK verification

Date: 2026-09-21 (Asia/Kolkata).
Scope: website, synthetic browser simulation, release metadata and public APK
artifact. **Not Android device QA or navigation-accuracy certification.**

## Automated and visual checks

Local HTTP server, separate temporary-profile headless Microsoft Edge, software
WebGL (SwiftShader). No personal browser profile or phone recordings were used.
Node assertions and Chrome DevTools Protocol drove the checks; no test framework
or browser runtime is shipped with the website.

| Check | Result |
| --- | --- |
| All authored JavaScript modules parse | Pass |
| Deterministic synthetic sensor integration, finite estimates | Pass |
| GPS fixes absent throughout the tunnel; last fix retained | Pass |
| Drift grows during outage; GPS recovery corrects gradually, not instantly | Pass |
| Sensor bridge off freezes the dot, then follows returning GPS directly | Pass |
| Phase buttons, timeline, keyboard arrow, play/pause, replay and restart | Pass |
| Reduced-motion preference starts paused; offscreen playback pauses | Pass |
| Overview/follow camera and tunnel interior toggle | Pass, desktop/mobile screenshots inspected |
| 320, 360, 390, 768 and 1366 px widths | Pass: no horizontal overflow or map/play collision |
| WebGL context loss | Pass: map/controls remain usable; rendering restores |
| Renderer module blocked | Pass: explicit 2D fallback and disabled 3D-only controls |
| New download metadata and actual button-selected filename/path | Pass |
| Artifact-only UI has no inherited device-results table | Pass |
| Valid preview plus 14 invalid release-metadata mutations | Pass: invalid metadata rejected |
| Missing release metadata | Pass: download fails closed, simulation remains separate |
| Vercel build verifier | Pass: matching inspection report, public APK status and bytes |

Visual review fixes: narrow-screen map/play overlap; GPS-only recovery wording;
restart label after reaching the end; controls changed before renderer readiness;
mobile GPS-label and fallback-message placement; thin-roof self-shadow artifacts.
The primary play control fits a normal desktop first viewport. Small-screen
overview intentionally shows the whole journey; Follow car provides the close view.

## Exact supplied APK

### Tracking-map projection regression

The original inset negated world Z and used unequal axis scales, mirroring and
stretching the road. It now uses +X to the right and +Z down at a uniform scale.
All 1803 truth/estimate/last-fix positions across 601 frames matched an independent
Three.js orthographic camera looking straight down. Browser checks confirmed the
road/tunnel paths, marker and uncertainty at four phases, stable orientation when
switching 3D cameras, and identical map geometry with WebGL unavailable. Desktop
and mobile screenshots were reviewed; the existing interaction checks also passed.

## Exact supplied APK artifact

- Filename: `setu-v0.1.0.apk`; package `com.setu.navigator`; version 0.1.0 / code 1.
- Bytes: 211636530.
- SHA-256: `1dd5fbfd0a83517c57d7899d218a9b7f2473006e93a0a58602fc76219704b8c2`.
- Android SDK Build Tools 37.0.0 signature verification: exit 0, v2 scheme verified.
- `zipalign -c -P 16 4`: exit 0.
- GitHub upload digest and size matched; a **full public HTTP download** was streamed
  and hashed independently, matching both the supplied file's SHA-256 and byte count.
- Report: `reports/9232934d7944a1bc.md`, independently hash-checked by the build.
- Development signing; not installed or tested on a phone in this website task.

## Repeat the user-facing check

### Live deployment check

Commit `5fd554a` was pushed to `Aj242005/setu-website` and verified on
`https://seamless-egomotion-tracking-for-unavailable-gnss.vercel.app/`.
The live WebGL scene and all three phase buttons worked. At 1366 × 768, Play was
visible in the first viewport. Live metadata was non-cacheable and the report
hash matched. Clicking the real website download button completed a 211636530-byte
APK download, whose SHA-256 matched the supplied artifact. The browser saved its
immutable asset name, `1dd5fbfd0a83517c.apk`. Global Privacy Control suppressed the
analytics script. This verifies website delivery, not Android runtime behavior.

### Manual reproduction

1. Serve this directory with `python -m http.server 4173 --bind 127.0.0.1`.
2. Open the page. Nothing should animate before Play; check the concept disclaimer.
3. Play through entry, tunnel and exit. The inset map must show GPS, then an IMU
   estimate, then returning GPS and a gradual current-position correction.
4. Jump to GPS lost, disable Sensor bridge, and scrub within the tunnel: the dot
   stays at the last fix. Jump to GPS returns: the text explains direct GPS following.
5. Try Follow car, the interior toggle, keyboard timeline, restart and a narrow
   viewport. Scroll away while playing; playback should stop.
6. Block `tunnel-scene.mjs` and reload: the map/timeline remain interactive.
7. Block `release.json` and reload: no APK is offered. Unblock it: confirm the
   new file's hash, preview warning and inspection link; the old QA table stays hidden.
8. Run `node scripts/verify-release.mjs`, then check the deployed download redirects
   to the hash-named GitHub asset. Compare the downloaded SHA-256 with the value above.

## Limits

No physical mobile-GPU, Safari/iOS, screen-reader or sustained battery benchmark
was performed. Software-rendered headless checks are not a mobile-performance
certification. The timeline, sensor noise and uncertainty radius are deliberately
illustrative, not a calibrated model. No 10–90-second real GPS-off accuracy is
inferred from this demo. A real Android emulator on the website is not implemented;
it needs a separately hosted Android session service and operational decisions.
