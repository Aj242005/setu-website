# India arrival and tunnel presentation verification

Historical checkpoint: the scroll-driven opening and photograph fallback below
are superseded by the [automatic opening verification](automatic-arrival-verification.md).
The geographic data, sensor panel and model remain unchanged.

Checked on 21 September 2026 in a separate, temporary-profile Headless Edge
browser using WebGL2/SwiftShader. This is website verification, **not new Android
device testing, model training or positioning-accuracy evidence**.

## Scope and outcome

| Check | Outcome |
| --- | --- |
| Fresh visit and reload | India fly-in starts; reload resets the opening rather than restoring its completed scroll position. |
| Geographic target | Final viewport centre and marker match the projection of OSM node 4082425413: 32.3632307, 77.1331123. |
| Scroll and skip | Mist clears into the 3D portal; the continue button advances into the journey; skip focuses Play. |
| Renderer handoff | Exactly one WebGL canvas moves into the board; the introduction retains a still image. |
| View controls | 1×–4× zoom works in overview and follow views; mobile defaults to follow. 320px/4× was visually checked for car visibility. |
| Playback | 1×–3× speed, pause, replay, timeline and phase jumps work; hidden/offscreen playback pauses. |
| Sensor illustration | GPS-only comparison freezes at the last fix; synthetic IMU integration continues; returning fixes reduce drift gradually. |
| Existing tracking map | All 1,803 truth/estimate/fix points agree with an independent Three.js top-down projection; equal scale on both axes, no mirroring. |
| Responsive layout | 320, 360, 390, 768 and 1366px checks: no horizontal overflow or play/map collision. Zoom/speed targets are at least 44px. |
| Accessibility | Keyboard timeline and zoom controls work. Reduced-motion preferences bypass the intro, including when changed during it. |
| Failure paths | Missing 3D module retains the photo/2D fallback; texture failures use solid materials; WebGL context loss preserves controls/map and restores rendering. |
| Deep links and no JavaScript | Section links bypass the introduction; no-JavaScript content is not covered by it. |
| Release | Supplied APK metadata/hash remain unchanged; malformed metadata fails closed; deployment verifier confirms report integrity and public APK reachability. |

Playback sample, measured by the browser clock at play/pause, with the displayed
simulation time quantised to its existing 0.05-second sensor frames:

| Setting | Elapsed real time | Displayed simulation time |
| --- | ---: | ---: |
| 1× | 1.8159 s | 1.80 s |
| 2× | 1.8074 s | 3.60 s |
| 3× | 1.8014 s | 5.40 s |

These are playback timing checks, not a GPU performance benchmark. Hardware
frame rates, Safari and real mobile browser behavior were not measured here.

## Issues corrected during verification

### Added scope: country outline and live instruments

The right-hand panel was checked at 1366, 1050, 768, 390 and 320px. All 601
generated frames have finite, deterministic X/Y/Z acceleration and gyroscope
values. The panel matches the exact source frame at 0, 5, 9, 15, 20.95, 21 and
30 seconds; GPS coordinates are absent during the outage and return with GPS.
The local-coordinate origin maps exactly to the south portal. Gravity remains
on the phone's vertical axis. Desktop uses a sidebar; narrower views stack the
panel after the controls without horizontal overflow.
Playback also continues when the mobile user scrolls from the 3D stage to the
sensor panel. The Playing/Paused indicator follows that state; leaving the whole
demo pauses it. Offscreen 3D drawing is skipped while the readings keep updating.

The replacement India source includes samples in Gilgit, the Shaksgam region,
Aksai Chin, Ladakh and Arunachal Pradesh. Islands are retained; Lakshadweep uses
the more detailed OSM-derived source after the coarse composite missed a test
point on Kavaratti. Andaman/Nicobar coverage includes Port Blair and Great Nicobar.
This checks the requested territorial depiction, not survey-level border accuracy.
All eight coverage samples pass against the **rendered SVG path**, not just the
source dataset. Island strokes are strengthened without moving their coordinates.

### Earlier corrections

- Floating terrain edges, intrusive foreground scenery and obstructed car views.
- Placeholder foliage, overly symmetric frontage and weak mountain silhouettes.
- Bollards intersecting the car path and unsupported lamps in the cutaway.
- A high-zoom label outside the viewport and portal walls obscuring mobile follow view.
- Elapsed time being discarded on slow frames, pause and speed changes.
- Reload scroll restoration skipping the opening and a reveal button that could
  not advance to the next section after its first press.
- Narrow-screen credits touching the continue button and a missing nearby
  synthetic-data qualifier at the playback controls.

The finish review checked the screenshots against the approved location,
reference photograph, product constraints and design contract. The scene remains
an authored, photo-referenced reconstruction with lightweight vegetation cards,
not scanned terrain or a survey-accurate digital twin. The fictional 30-second
route is not the real 9.02 km tunnel journey. See [sources](landscape-sources.md).

## Repeat the checks

1. Run `python -m http.server 4173 --bind 127.0.0.1` from the website directory.
2. Open the root URL, reload, skip, scroll through the reveal, then follow the
   continue button. Repeat at 320px and with reduced motion enabled.
3. Run the journey at each speed. Scrub before entry, inside the tunnel, during
   recovery and after recovery; compare sensor-on and GPS-only modes.
4. Check all zoom levels in both cameras, especially mobile follow with the
   tunnel interior revealed. Check keyboard operation and pause after scrolling away.
5. Block `tunnel-scene.mjs`, then texture requests, and inspect the fallbacks.
   Simulate a lost/restored WebGL context; the map and timeline must remain usable.
6. Run `node scripts/verify-release.mjs`. Confirm that the download still selects
   SHA-256 `1dd5fbfd0a83517c57d7899d218a9b7f2473006e93a0a58602fc76219704b8c2`.

The existing full-download verification belongs to the supplied preview's
artifact report. This website-only change does not claim a fresh 211 MB download
hash check or transfer another APK's phone-test results to this one.

## Live deployment

The implementation in `05f33a5` was verified on the public Vercel website on
21 September 2026. The deployed modules, styles and country SVG matched the
local committed implementation. The opening/zoom/speed checks, six-axis panel,
mobile feed continuity, eight boundary-coverage samples and all 1,803 tracking-map
projection comparisons also passed against the deployed URL.

The live download button selected the expected artifact and filename. Its
redirected public HEAD response reported **211636530 bytes**; release metadata
retained the original SHA-256. No browser runtime exceptions were recorded in
these successful live checks. The scene remains photo-referenced and illustrative,
not a claim of photorealistic scanning or verified Android navigation accuracy.
