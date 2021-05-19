/* eslint-disable camelcase */

// Directly mapped from GitHub's API responses

export type GitHubRepoOwner = {
  login: string
  id: number
  node_id: string
  avatar_url: string
  gravatar_id: string
  url: string
  html_url: string
  followers_url: string
  following_url: string
  gists_url: string
  starred_url: string
  subscriptions_url: string
  organizations_url: string
  repos_url: string
  events_url: string
  received_events_url: string
  type: string
  site_admin: boolean
}

export type GitHubError = {
  message: string
}

export type GitHubTreeItem = {
  path: string
  mode: string
  type: 'blob' | 'tree' | 'commit'
  sha: 'string'
  size: number
  url: string
}

export type GitHubBranchInfo = {
  sha: string
  truncated: boolean
  url: string
  tree: GitHubTreeItem[]
}

export type GitHubBranch = {
  commit: {
    sha: string
    url: string
  }
  name: string
  protected: boolean
}

export type GitHubBlob = {
  sha: string
  node_id: string
  size: number
  url: string
  content: string
  encoding: 'base64'
}

export type GitHubRepo = {
  id: number
  node_id: string
  name: string
  full_name: string
  private: boolean
  owner: GitHubRepoOwner
  html_url: string
  description: string
  fork: boolean
  url: string
  forks_url: string
  keys_url: string
  collaborators_url: string
  teams_url: string
  hooks_url: string
  issue_events_url: string
  events_url: string
  assignees_url: string
  branches_url: string
  tags_url: string
  blobs_url: string
  git_tags_url: string
  git_refs_url: string
  trees_url: string
  statuses_url: string
  languages_url: string
  stargazers_url: string
  contributors_url: string
  subscribers_url: string
  subscription_url: string
  commits_url: string
  git_commits_url: string
  comments_url: string
  issue_comment_url: string
  contents_url: string
  compare_url: string
  merges_url: string
  archive_url: string
  downloads_url: string
  issues_url: string
  pulls_url: string
  milestones_url: string
  notifications_url: string
  labels_url: string
  releases_url: string
  deployments_url: string
  created_at: string
  updated_at: string
  pushed_at: string
  git_url: string
  ssh_url: string
  clone_url: string
  svn_url: string
  homepage: string | null
  size: number
  stargazers_count: number
  watchers_count: number
  language: string
  has_issues: boolean
  has_projects: boolean
  has_downloads: boolean
  has_wiki: boolean
  has_pages: boolean
  forks_count: number
  mirror_url: string | null
  archived: boolean
  disabled: boolean
  open_issues_count: number
  license: string | null
  forks: number
  open_issues: number
  watchers: number
  default_branch: string
  temp_clone_token: string | null
  network_count: number
  subscribers_count: number
}
