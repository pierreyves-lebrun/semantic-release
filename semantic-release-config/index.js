const fullRepoName = process.env.GITHUB_REPOSITORY; // 'owner/repository'
const repoName = fullRepoName ? fullRepoName.split('/')[1] : null;


let isHelmRepo = false;
if (repoName && repoName.endsWith('-helm')) {
  isHelmRepo = true;
}

const defaultBranches = ['refs/heads/master', 'refs/heads/main'];
const isDefaultBranch = defaultBranches.includes(process.env.GITHUB_REF);

const currentBranch = process.env.BRANCH_NAME || process.env.GITHUB_REF_NAME;

if (!currentBranch) {
  throw new Error(
    'BRANCH_NAME (or GITHUB_REF_NAME) must be set: the shared semantic-release ' +
    'config derives the prerelease channel from the current branch.'
  );
}

// Replace any character not a letter, digit, or hyphen with a hyphen
const prereleaseTag = currentBranch.replace(/[^0-9A-Za-z-]+/g, '-');


module.exports = {
  branches: [
    'main',
    'master',
    { name: '+([0-9])?(.{+([0-9]),x}).x', channel: currentBranch },
    { name: currentBranch, prerelease: prereleaseTag }
  ],
  ci: true,
  tagFormat: '${version}',
  preset: 'conventionalcommits',
  presetConfig: {
    types: [
      {type: 'feat', section: 'Features'},
      {type: 'fix', section: 'Bug Fixes'},
      {type: 'perf', section: 'Performance Improvements'},
      {type: 'revert', section: 'Reverts'},
      {type: 'refactor', section: 'Code Refactoring'},
      {type: 'docs', section: 'Documentation'},
      {type: 'style', section: 'Styles'},
      {type: 'chore', section: 'Miscellaneous Chores'},
      {type: 'test', section: 'Tests'},
      {type: 'build', section: 'Build System'},
      {type: 'ci', section: 'Continuous Integration'}
    ]
  },
  releaseRules: [
    {breaking: true, release: 'major'},
    {type: 'feat', release: 'minor'},
    {release: 'patch'}
  ],
  generateNotes: [
    {
      path: '@semantic-release/release-notes-generator',
      writerOpts: {
        groupBy: 'type',
        commitGroupsSort: 'title',
        commitsSort: 'header'
      },
      linkCompare: true,
      linkReferences: true
    }
  ],
  dockerTags: isDefaultBranch ? ['latest', '{{version}}', '{{major}}', '{{major}}.{{minor}}', '{{git_sha}}'] : ['{{git_sha}}', '{{version}}'],
  dockerAutoClean: false,
  plugins: [
    '@semantic-release/commit-analyzer',
    // Conditional plugin inclusion
    (isHelmRepo ? 'semantic-release-helm3' : '@codedependant/semantic-release-docker'),
    '@semantic-release/github'
  ]
};
