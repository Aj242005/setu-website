# SETU product website

Audience: people discovering SETU, Android users, project evaluators and potential
training-data contributors. Explain the problem, useful workflows, engineering
approach and differentiation before offering the verified development APK.
Marketing must distinguish implemented utilities from experimental positioning.
Do not assert superiority to competitors without a like-for-like benchmark.

Current truth: offline Delhi/NCR maps, GPS navigation, sensor recording, bounded
experimental fallback, step-based walking, local export and synthetic demo.
The agreed 90%-within-10-m GPS-free target is not met. New CPU training is
research-only. No unsupported accuracy, release-readiness or autonomy claims.

Primary presentation: an interactive, synthetic 3D tunnel journey in a green
landscape. Show GPS before entry, IMU-only drift in the tunnel, and gradual GPS
correction after exit, with an inset tracking map. This browser illustration does
not run the Android filter or model and is not field-accuracy evidence. Keep that
distinction visible beside the controls. Pause, replay, timeline, sensor comparison,
cutaway and camera controls must work with keyboard and touch. The larger board
offers 1×–4× view zoom and 1×–3× elapsed-time playback speed.

Opening, approved by the owner: on a fresh root visit or reload, fly from India
to Atal Tunnel's mapped south portal (32.3632307, 77.1331123), fill the viewport
with mist, then reveal the photo-referenced 3D landscape on scroll. Keep a clear
skip button and reduced-motion/deep-link bypass. This is an artistic reconstruction,
not surveyed terrain; the 30-second route is not the real 9.02 km tunnel length.
Use real licensed material references, self-host assets and disclose provenance.

The owner-supplied `setu-v0.1.0.apk` replaces the older download. Publish its actual
signature/alignment/hash inspection, never transfer the old APK's device-test
results. An artifact-checked preview is not a device-verified navigation release.
Browser Android hosting needs a separate emulator service; do not fake it with
screenshots or claim the Three.js scene runs the APK.

Pinned identity: Android's daylight forest-green theme, light default, native
sans typography, clear hierarchy and user-friendly controls. Primary action:
download the latest verified beta. Secondary actions: understand the architecture,
inspect measured evidence and explore the source. Feedback goes through GitHub
without posting raw GPS data. No fabricated signup backend or approval badges.

The parent repository's publisher updates local release metadata after verified
builds. Git pushes trigger Vercel deployments; immutable APKs use GitHub Releases.
Vercel Web Analytics is for website page views only, not Android telemetry or
training. No custom events, GPS logs or recording uploads. Strip query strings
and fragments, respect browser Do Not Track / Global Privacy Control signals,
and disclose analytics on the page. Dashboard activation remains a deployment step.
