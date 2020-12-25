class Tree {
  /**
   * Takes the response from the GitHub tree API and turns it into a flat
   * object with the path of each folder/file. For example
   *
   * ```
   {
      "src": {
        "path": "src",
        "type": "folder",
        "children": [
          "src/App.vue",
          "src/assets",
          "src/components",
          "src/main.js",
          "src/project-info.js",
          "src/router.js",
          "src/scss",
          "src/util"
        ],
        "url": "https://api.github.com/repos/ctcuff/ctcuff.github.io/git/trees/358553e5a2ee066d0bb0f52e4033456921a83c3f",
        "isRoot": true
      },
      "src/App.vue": {
        "type": "file",
        "name": "App.vue",
        "size": 2487,
        "path": "src/App.vue",
        "url": "https://api.github.com/repos/ctcuff/ctcuff.github.io/git/blobs/2e6719d25b30a897967c849672ccee435f5c6ae9"
      },
      .
      .
      .
    }
   * ```
   *
   * @see https://docs.github.com/en/free-pro-team@latest/rest/reference/git#trees
   */
  static treeify(data) {
    const tree = {}

    for (const item of data) {
      const { path, url, type, size } = item

      if (type !== 'blob' && type !== 'tree') {
        // The GitHub API has 3 types: blobs, trees, and commits.
        // Blobs and trees are equivalent to files and folders so
        // we only care about adding those types since we
        // can't display commits (yet?).
        continue
      }

      // If this file/folder is contained in a folder, split the path
      // to try and find the name of the parent folder. For example:
      // `src/components/App.js` => `components`
      const parts = path.split('/')
      const parent = parts.splice(0, parts.length - 1).join('/')

      switch (type) {
        case 'blob':
          tree[path] = {
            type: 'file',
            name: parts[parts.length - 1],
            size,
            path,
            url
          }
          break
        case 'tree':
          if (!tree[path]) {
            tree[path] = {
              path,
              type: 'folder',
              children: [],
              url
            }
          }
          break
      }

      // If the file/folder had a parent, make sure that file/folder
      // gets added to the parent's children
      if (parent) {
        tree[parent].children.push(path)
      } else {
        tree[path].isRoot = true
      }
    }

    return tree
  }
}

export default Tree
