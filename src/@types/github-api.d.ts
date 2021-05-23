/* eslint-disable camelcase */

import { GetResponseTypeFromEndpointMethod } from '@octokit/types'
import { Octokit } from '@octokit/rest'

const octokit = new Octokit()

// For some reason octokit types need to be reified in this manner, don't ask me why...
type BranchResponse = GetResponseTypeFromEndpointMethod<
  typeof octokit.repos.getBranch
>

type BranchData = BranchResponse['data']

type TreeResponse = GetResponseTypeFromEndpointMethod<
  typeof octokit.git.getTree
>

type BranchListResponse = GetResponseTypeFromEndpointMethod<
  typeof octokit.repos.listBranches.data
>

type TreeData = TreeResponse['data']['tree']
type TreeNode = TreeData[number]

export type Blob = {
  sha: string
  node_id: string
  size: number
  url: string
  content: string
  encoding: 'base64'
}
