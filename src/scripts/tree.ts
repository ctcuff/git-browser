/**
 * Represents the structure of the object returned in the tree array from GitHub
 */
interface GithubResponseTree {
  path: string
  mode: string
  type: 'blob' | 'tree' | 'commit'
  sha: 'string'
  size: number
  url: string
}

type TreeObject = {
  [key: string]: {
    type: 'file' | 'folder'
    parent: string | null
    url: string
    size?: number
    name?: string
    isRoot?: boolean
    children?: string[]
  }
}

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
        "url": "blob-link-here",
        "isRoot": true
      },
      "src/App.vue": {
        "type": "file",
        "name": "App.vue",
        "size": 2487,
        "path": "src/App.vue",
        "url": "blob-link-here",
        "parent": "src"
      },
      .
      .
      .
    }
   * ```
   *
   * @see https://docs.github.com/en/free-pro-team@latest/rest/reference/git#trees
   */
  public static treeify(data: GithubResponseTree[]): TreeObject {
    const tree: TreeObject = {}

    for (let i = 0; i < data.length; i++) {
      const { path, url, type, size } = data[i]

      if (type !== 'blob' && type !== 'tree') {
        // The GitHub API has 3 types: blobs, trees, and commits.
        // Blobs and trees are equivalent to files and folders so
        // we only care about adding those types since we
        // can't display commits (yet?).
        // eslint-disable-next-line no-continue
        continue
      }

      // If this file/folder is contained in a folder, split the path
      // to try and find the name of the parent folder. For example:
      // `src/components/App.js` => `components`
      const parts = path.split('/').filter(str => !!str.trim())
      const parentPath = parts.splice(0, parts.length - 1).join('/')
      const treeData = {
        parent: null,
        path,
        url
      }

      // eslint-disable-next-line default-case
      switch (type) {
        case 'blob':
          tree[path] = {
            ...treeData,
            type: 'file',
            name: parts[parts.length - 1],
            size,
            url
          }
          break
        case 'tree':
          // Make sure we don't add folders we've seen before
          if (!tree[path]) {
            tree[path] = {
              ...treeData,
              type: 'folder',
              children: []
            }
          }
          break
      }

      // If the file/folder had a parent, make sure that file/folder
      // gets added to the parent's children
      if (parentPath && tree[parentPath]) {
        tree[parentPath].children?.push(path)
        tree[path].parent = parentPath
      } else {
        // This file doesn't have a parent so it must be in the root
        tree[path].isRoot = true
      }
    }

    return tree
  }
}

export default Tree
