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
