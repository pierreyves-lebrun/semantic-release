const fullRepoName = process.env.GITHUB_REPOSITORY; // 'owner/repository'
const repoName = fullRepoName ? fullRepoName.split('/')[1] : null;


let isHelmRepo = false;
if (repoName && (repoName.endsWith('-helm') || repoName.endsWith('-charts'))) {
  isHelmRepo = true;
}

const defaultBranches = ['refs/heads/master', 'refs/heads/main'];
const isDefaultBranch = defaultBranches.includes(process.env.GITHUB_REF);

const currentBranch = process.env.BRANCH_NAME;

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
  debug: true,
  tagFormat: '${version}',
  preset: 'conventionalcommits',
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
    '@semantic-release/release-notes-generator',
    // Conditional plugin inclusion
    (isHelmRepo ? 'semantic-release-helm3' : '@codedependant/semantic-release-docker'),
    '@semantic-release/github'
  ]
};
