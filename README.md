# Git Browser
Git Browser is a different way of viewing GitHub repositories in your browser. Have you ever wanted to look at a specific file on Github? Have you ever wanted to browse a few different files across multiple folders? Probably not but I have! No more cloning a repo then opening it up in your editor of choice just to browse a couple of files.

# Features
Similar to GitHub, this project supports not only viewing code, but rendering files. Want to see what an mp3 sounds like without downloading it from GitHub? You got it! Want to preview a font without leaving your browser? Sure!

Here's a list of all file types that support live previews:
- Various forms of images (png, jpg, apng, svg, ico, etc...)
- GIFs (It's pronounced GIF by the way)
- Video (mp4 / webm)
- Audio (mp3, wav, ogg, and aac)
- Fonts (only ttf, otf, woff, and woff2)
- Documents (doc / docx)
- PowerPoints (ppt / pptx)
- Spreadsheets (xls / xlsx) 
- CSV / TSV
    - Thanks to [papaparse](https://github.com/mholt/PapaParse) 🎉
- Markdown (as well as mdx, kinda...)
    - Thanks to [markdown-it](https://github.com/markdown-it/markdown-it) 🎉
- PDFs
    - Thanks to [pdfjs](https://github.com/mozilla/pdf.js/) 🎉
- AsciiDoc
    - Thanks to [Asciidoctor](https://github.com/asciidoctor/asciidoctor.js) 🎉
- Zip
    - Thanks to [zip.js](https://github.com/gildas-lormeau/zip.js) 🎉
- Jupyter Notebook
    - Thanks to [notebookjs](https://github.com/jsvine/notebookjs) 🎉
- PSD (Photoshop)
    - Thanks to [psd.js](https://github.com/meltingice/psd.js) 🎉
- GLTF/GLB Models (Experimental)
    - Thanks to [model-viewer](https://github.com/google/model-viewer) 🎉
- WebAssembly (wasm can be viewed as text)
    - Thanks to [wabt.js](https://github.com/AssemblyScript/wabt.js/) 🎉

# How do I build this?
Besides [yarn](https://yarnpkg.com/getting-started), there aren't that many prerequisites. You can still build and run this project without a `.env` file, however, before you get started, you may want to generate a [personal access token](https://docs.github.com/en/free-pro-team@latest/github/authenticating-to-github/creating-a-personal-access-token#creating-a-token). This is because the GitHub API limits non-authenticated users to only 60 requests per hour, but authenticated users get 5000 requests per hour. When you generate the token, you don't have to select any of the options for this project to work. This project also uses [Firebase](https://firebase.google.com/) to handle authentication. Don't worry though, you don't need to include any Firebase keys in the `env` file for this project to work.
## Building
1. Clone this repo with `git clone https://github.com/ctcuff/git-browser.git`
2. In the root directory, create a file called `.env` that looks like this:
```properties
OAUTH_TOKEN=GITHUB_TOKEN_HERE
# (Optional) Firebase config below
API_KEY=
AUTH_DOMAIN=
PROJECT_ID=
STORAGE_BUCKET=
MESSAGING_SENDER_ID=
APP_ID=
```
3. Install dependencies by running `yarn` in the root directory
4. Run `yarn dev` and visit localhost:9000 in your browser

## Running Tests
Run `yarn test` or `yarn test --coverage`. If you'd like to run tests without output from the logger, add the `--silent` flag.

# Live examples
<p align="center">Wanna preview an <b>animated</b> GLTF model without downloading it? Sure! <a href="https://gitbrowser.io/mrdoob/three.js?branch=dev&file=examples%2Fmodels%2Fgltf%2FSoldier.glb">View model</a></p>
<img width="1648" alt="Screen Shot 2021-01-26 at 12 25 12 AM" src="https://user-images.githubusercontent.com/7400747/118326420-f6b32700-b4d2-11eb-8c13-09a27c19f176.png">

<p align="center">Wanna see what a font looks like without leaving your browser? Gotcha covered! <a href="https://gitbrowser.io/adobe-fonts/source-code-pro?branch=release&file=TTF%2FSourceCodePro-Medium.ttf">View font</a></p>
<img width="1648" alt="Screen Shot 2021-01-26 at 12 33 28 AM" src="https://user-images.githubusercontent.com/7400747/105804581-26631100-5f6e-11eb-94fc-37e1fb38a958.png">

<p align="center">Wanna see what a video looks like? Well you're in luck! <a href="https://gitbrowser.io/ctcuff/layout-playground?branch=develop&file=src%2Fassets%2Fvideos%2Fbeach-1920x1080.mp4">View video</a></p>
<img width="1648" alt="Screen Shot 2021-01-26 at 12 27 31 AM" src="https://user-images.githubusercontent.com/7400747/105804867-d20c6100-5f6e-11eb-876b-0291e5979f80.png">

<p align="center">Wanna see what the code for this website looks like on this website? Inception! <a href="https://gitbrowser.io/ctcuff/git-browser?branch=dev&file=src%2Fcomponents%2Frenderers%2FPDFRenderer.tsx
">View code</a></p>
<img width="1648" alt="Screen Shot 2021-01-26 at 12 45 45 AM" src="https://user-images.githubusercontent.com/7400747/105805380-de44ee00-5f6f-11eb-8b7c-5eec8e6b43ac.png">
