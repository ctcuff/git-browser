import Tree from 'src/scripts/tree'
import sampleTreeData from 'src/assets/sample-tree-data.json'
import sampleTreeApiResponse from 'src/assets/sample-tree-response.json'

describe('Tree', () => {
  test('creates tree object', () => {
    // Need to make sure it ignores commits
    sampleTreeApiResponse.tree.push({
      path: 'mock-file.txt',
      type: 'commit'
    })

    // Need to make sure it handles duplicates
    sampleTreeApiResponse.tree.push(sampleTreeApiResponse.tree[0])

    const treeData = Tree.treeify(sampleTreeApiResponse.tree)
    expect(treeData).toEqual(sampleTreeData)
  })
})
