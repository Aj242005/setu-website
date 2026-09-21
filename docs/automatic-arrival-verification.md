# Automatic India-to-demo opening

Verified locally on 21 September 2026 using a separate-profile Headless Edge
browser with SwiftShader WebGL2. This is website interaction verification, not
Android device testing, training or navigation-accuracy evidence.

## Requested behavior

- Show the complete, current India outline unobscured before zooming. The image
  must decode before the visible hold begins; the minimum hold is 1.5 seconds.
- Zoom to Atal Tunnel's south portal, 32.3632307 N, 77.1331123 E.
- Cover the viewport with white clouds, automatically scroll to the interactive
  board, then dissolve the clouds. No wheel gesture or second button is needed.
- Start one illustrative journey at the automatic handoff; retain Pause and
  Replay. Skip and reduced-motion users keep manual playback.
- Remove the photographic portal hero and the old 205-screen-percent spacer.
  The existing product utilities, architecture and real app capture remain.

## Browser results

| Check | Evidence and outcome |
| --- | --- |
| Desktop, tablet and phone | 1366×900, 768×844, 390×844 and 320×568: map/copy/footer bounds do not overlap; no horizontal overflow. Opening, opaque clouds and final board screenshots inspected. |
| Hold before zoom | Frame traces retain `0 0 900 900` and zero cloud coverage before 1500ms of animation time. First moving samples occur at 1517–1583ms. |
| Exact target | Final SVG viewport centre equals the projected south-portal coordinates on both axes. Existing geographic source is unchanged. |
| Hands-free transition | With no input, the cloud coverage reaches 1, the page scrolls, the overlay becomes hidden, and the board lands 24px below the viewport top with playback running. |
| Single renderer | One WebGL canvas remains inside the board throughout; no reparenting, snapshot or photographic hero element remains. |
| Reload and Skip | Reload returns to the full map. Skip/Escape reaches the paused demo and focuses Play. |
| Deliberate navigation | Wheel input cancels the sequence; waiting afterward does not trigger a delayed forced scroll or autoplay. |
| Accessibility and deep links | Initial and changed reduced-motion preferences bypass/cancel the opening. `#download` bypasses it and retains an enabled verified download. |
| Missing assets | A failed India image skips the opening. A failed 3D module still completes it automatically into the usable 2D map, without a photograph fallback or uncaught exception. |
| JavaScript disabled | The opening stays hidden; product content and the release-metadata link remain accessible. |
| Landscape, touch and background tabs | At 844×390, the whole map and demo controls remain visible. Native touch Skip focuses paused Play. Switching to another browser tab freezes the opening clock for the measured 1.8-second wait; returning resumes it. No portal photograph is requested. |
| Simulation regression | Phase controls, GPS masking, sensor bridge, gradual correction, pause/replay, timeline keyboard input, renderer failure/context recovery and responsive controls pass. |
| Tracking map and instruments | All 1803 truth/estimate/fix projections retain uniform scale and orientation; all 601 sensor frames remain deterministic, with GPS coordinates absent during the outage. Mobile sensor-panel playback and all eight Indian territory/island samples pass. |
| Download regression | Exact existing APK hash/filename remains selected. Fourteen malformed metadata variants and a network failure still fail closed. Deployment verifier confirms report integrity and hosted APK reachability. |

The nominal choreography is 1500ms hold + 2400ms flight + 350ms covered scroll +
850ms reveal. The animation caps individual visual steps at 100ms so a long frame
cannot swallow the entire reveal. On this software-rendered test environment,
the observed wall-clock map hold was 6.45–7.28 seconds; **5.1 seconds is not a
guaranteed total duration on slow devices**. Hidden tabs pause the clock. This
visual pacing does not change the simulation's real elapsed-time speed controls.
Redundant initial renderer settings no longer trigger identical redraws.

## Repeat the acceptance check

1. Open the root URL, without a fragment. Do not scroll or click. Confirm that
   the whole India map is readable before zooming and the demo appears by itself.
2. Reload from the completed demo. Confirm that the opening starts at India,
   not at the previous scroll position.
3. Try Skip and Escape; then try intentionally scrolling during a new opening.
   Confirm that the page never pulls you back after the interruption.
4. Open `#download` directly and enable reduced motion. Neither should force an
   opening or start playback automatically.
5. Test at 320px width and with the 3D module blocked. Controls and the 2D map
   should still work; no tunnel photograph or endless cloudy screen should appear.
6. Play the journey, switch sensor bridge/camera/zoom/speed, inspect the six sensor
   axes, then verify the existing download and release metadata.

The assertion harnesses and captured PNG/frame traces are kept in the local
`%LOCALAPPDATA%/SETU/website-tunnel` verification workspace. No browser automation
framework or build dependency was added to the static website.
