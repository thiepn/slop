# SLOPOCALYPSE — The Artificial Internet

A deliberately absurd, fictional, interconnected AI-slop website with 44 interactive HTML pages. This repository contains the Phase 10 exact site files plus deployment configuration; the original site assets are unchanged.

## Live site

Once the `main` branch is pushed, **Settings → Pages → Build and deployment → Source → GitHub Actions** is selected, and the deployment workflow succeeds, the expected URL is:

**https://thiepn.github.io/slop/**

This URL is **not live or verified** until GitHub Pages reports a successful deployment.

## Local use

Run `python3 START_LOCAL_SERVER.py` or use the Windows/Mac/Linux launch scripts. The site uses in-browser localStorage: progress is isolated by browser and origin, so a localhost save will **not** automatically transfer to GitHub Pages. Export a verified backup in the existing Control Center before switching origins, then import it on the hosted site.

## Publishing

1. Create a public repository named `slop` under GitHub account `thiepn` (default branch `main`).
2. Push the **contents** of this directory to the repository root (`index.html` must be in the root, not in a nested `slop/` directory).
3. Select **GitHub Actions** under repository **Settings → Pages → Build and deployment → Source**.
4. Run or inspect **Actions → Deploy SLOPOCALYPSE to GitHub Pages** and wait for a successful deployment.
5. Verify the homepage and internal links at `https://thiepn.github.io/slop/`.

The workflow publishes only runtime `.html`, `.css`, and `.js` files to GitHub Pages; QA evidence and Python test tools remain in the repository but are not copied into the public site artifact.

## Status and scope

All fictional events, people, accounts, financial transactions, and markets are simulated. No live AI service or real payment service is included. The site is static and can be served via GitHub Pages; no Node.js or API server is required.

The Phase 10 QA report documents unresolved native same-origin concurrency qualification and other browser limitations. GitHub Pages deployment by itself does not resolve those issues.
