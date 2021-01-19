# Git Browser
Git Browser is a different way of viewing GitHub repositories in your browser. Have you ever wanted to look at a specific file on Github? Have you ever wanted to browse a few different files across multiple folders? Probably not but I have! No more cloning a repo then opening it up in your editor of choice just to browse a couple of files.

# Features
Similar to GitHub, this project supports not only viewing code, but rendering files:
- Various forms of images (png, jpg, apng, svg, ico, etc...)
- GIFs (It's pronounced GIF by the way)
- Video (mp4 and webm)
- Audio (mp3, wav, ogg, and aac)
- CSV (as well as TSV)
    - Thanks to [papaparse](https://github.com/mholt/PapaParse) 🎉
- Markdown (as well as mdx, kinda...)
    - Thanks to [markdown-it](https://github.com/markdown-it/markdown-it) 🎉
- PDFs
    - Thanks to [pdfjs](https://github.com/mozilla/pdf.js/) 🎉
- AsciiDoc
    - Thanks to [Asciidoctor](https://github.com/asciidoctor/asciidoctor.js) 🎉
- Jupyter Notebook (Experimental)
    - Thanks to [notebookjs](https://github.com/jsvine/notebookjs) 🎉
- GLTF/GLB Models (Experimental)
    - Thanks to [model-viewer](https://github.com/google/model-viewer) 🎉

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
