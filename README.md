# Repo Browser
Repo Browser is a different way of viewing GitHub repositories in your browser. Have you ever wanted to look at a specific file on Github? Have you ever wanted to browse a few different files across multiple folders? Probably not but I have! The goal is to give an experience that emulates that of vscode, but in your browser. No more cloning a repo then opening it up in your editor of choice just to browse a couple of files.

# How do I build this?
Before you get started, you'll need to generate a [personal access token](https://docs.github.com/en/free-pro-team@latest/github/authenticating-to-github/creating-a-personal-access-token#creating-a-token). This is because the GitHub API limits non-authenticated users to only 60 requests per hour and authenticated users to 5000 requests per hour. When you generate the token, you don't have to select any of the options for this project to work.
1. Clone this repo with `git clone https://github.com/ctcuff/repo-browser.git`
2. In the `src` directory, create a file called `config.js` that looks like this:
```js
// If you don't have a GitHub account or don't want to
// generate an oauth token, just export an empty string.
const OAUTH_TOKEN = 'you-token-here'
export { OAUTH_TOKEN }
```
3. Install dependencies by running `yarn` in the root directory
4. Run `yarn dev` and visit localhost:9000 in your browser
