class Tree {
  static treeify(data) {
    const tree = {}

    data.forEach(item => {
      const { path, url } = item
      const parts = path.split('/')
      const parent = parts.splice(0, parts.length - 1).join('/')

      switch (item.type) {
        case 'blob':
          tree[path] = {
            type: 'file',
            name: parts[parts.length - 1],
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
        default:
          console.warn('Invalid type', item.type)
      }

      if (parent) {
        tree[parent].children.push(path)
      } else {
        tree[path].isRoot = true
      }
    })

    return tree
  }
}

export default Tree
