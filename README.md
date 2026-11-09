# GRE Mock Lab

A static GRE practice and mock-test web app built from the KMF question bank:

- 1,499 Text Completion / Sentence Equivalence questions (most of the 1,300 KMF originals include translated explanations)
- 347 RC passages with 770 questions (passages 1–300 include explanations)
- 911 Quant questions (KMF Math Sprint, Special Exercises by test point, Latest 170 puzzles), shown as images
- Timed Analytical Writing practice with 42 original Issue-style prompts; essays can be copied for marking elsewhere

It runs entirely in the browser with no backend. Your progress is saved in your browser's localStorage.

## Run locally
Open `index.html` directly in a browser. All data is bundled as `.js` files, so it works from `file://` as well.

## Deploy to GitHub Pages
1. Create a new repository on GitHub, e.g. `gre-mock`.
2. Upload **the contents of this folder** (`index.html`, `app.js`, `style.css`, `data/`, `qimg/`, `.nojekyll`, `robots.txt`) to the repository root.
   - The easiest way is the web uploader: **Add file → Upload files**, then drag the files and folders in.
   - Or use git: `git init && git add . && git commit -m "GRE mock" && git branch -M main && git remote add origin https://github.com/<you>/gre-mock.git && git push -u origin main`
3. Go to **Settings → Pages → Build and deployment**, set **Source: Deploy from a branch**, and choose **Branch: main / (root)**.
4. After a minute the site is live at `https://<you>.github.io/gre-mock/`.

The site is about 14 MB.

## Notes
- `robots.txt` and a `noindex` meta tag keep search engines from listing the site. Anyone with the link can still open it.
- Scaled scores (130–170) are rough estimates, not official ETS conversions.
- Writing practice is timed for 30 minutes and intentionally has no built-in grading. Finish a response to copy it for external feedback.
- Use **History → Export my data** to move your progress to another browser or device.
