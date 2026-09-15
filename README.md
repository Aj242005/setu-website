# SETU beta site

Static, light-default companion to the Android app. No build dependencies,
tracking scripts, account database or automatic location-data uploads.

From this directory: `python -m http.server 4173 --bind 127.0.0.1`.
Open `http://127.0.0.1:4173`. This is local hosting, not a public deployment.
For public hosting, deploy the directory to your chosen static host, including
the generated `downloads`, `reports` and `release.json` files.

## Update the latest beta after every verified build

Run from the sibling SETU repository, using the actual new artifact/evidence:

```powershell
python -m tools.publish_beta dist/android/SETU-qa-beta.apk `
  docs/verification/android/rigorous-qa/apk-verification.json `
  --site ../setu-website
```

For the rigorous QA build add
`--report docs/verification/android/rigorous-qa/report.json`. The publisher copies
the matching coordinate-free Markdown and PDF reports automatically. It verifies
their hashes against the JSON manifest, so an in-progress report generation is
never mixed with the preceding report. It also verifies
the exact APK hash, bytes, device installation, signature and 16 KiB alignment
evidence. Versioned APKs are immutable; `release.json` is replaced atomically
only after a verified copy, so a failed update retains the preceding download.
The publisher does not create evidence or sign an APK. Never fabricate passing
checks. The site always says development beta, never approved navigation.

The server must not cache `release.json`; `_headers` supplies compatible static
host rules. Hashed APKs may be cached. Existing users refresh the page to see
the latest published build. Add `--watch 30` to check for verified artifact changes
every 30 seconds while the publisher is running. Failed checks keep the preceding
download. Stop with Ctrl+C; no persistent background service is installed.

Feedback uses the existing project’s GitHub issues. A private training-data
handoff must be arranged by the team; do not solicit raw public GPS uploads.
