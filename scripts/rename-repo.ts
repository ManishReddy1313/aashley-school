import { Octokit } from '@octokit/rest';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }

  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
    ? 'depl ' + process.env.WEB_REPL_RENEWAL
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('GitHub not connected');
  }
  return accessToken;
}

async function main() {
  const accessToken = await getAccessToken();
  const octokit = new Octokit({ auth: accessToken });

  const { data: user } = await octokit.users.getAuthenticated();
  console.log(`Authenticated as: ${user.login}`);

  try {
    console.log('Deleting existing "aashley" repo...');
    await octokit.repos.delete({ owner: user.login, repo: 'aashley' });
    console.log('Deleted old "aashley" repo.');
    await new Promise(resolve => setTimeout(resolve, 2000));
  } catch (e: any) {
    if (e.status === 404) {
      console.log('No existing "aashley" repo found.');
    } else {
      throw e;
    }
  }

  console.log('Renaming "aashley-international-school-website" to "aashley"...');
  await octokit.repos.update({
    owner: user.login,
    repo: 'aashley-international-school-website',
    name: 'aashley',
  });

  console.log('\nDone! Repository renamed successfully.');
  console.log(`New URL: https://github.com/${user.login}/aashley`);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
