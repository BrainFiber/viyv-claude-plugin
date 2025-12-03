import http from 'http';
import { exec } from 'child_process';
import { saveCredentials, loadCredentials } from './store.js';
import type { AuthCredentials } from './types.js';

const DEFAULT_PORT = 19876;
const TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

export async function loginWithLocalhost(marketUrl: string): Promise<AuthCredentials> {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url || '/', `http://localhost:${DEFAULT_PORT}`);

      if (url.pathname === '/callback') {
        const token = url.searchParams.get('token');

        if (token) {
          // Send success response
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>Authentication Successful</title>
                <style>
                  body { font-family: system-ui; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #fafafa; }
                  .card { text-align: center; padding: 2rem; background: white; border-radius: 1rem; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
                  h1 { color: #10b981; margin-bottom: 0.5rem; }
                  p { color: #6b7280; }
                </style>
              </head>
              <body>
                <div class="card">
                  <h1>Authentication Successful!</h1>
                  <p>You can close this window and return to your terminal.</p>
                </div>
              </body>
            </html>
          `);

          // Close server and resolve
          server.close();

          // Fetch user info
          fetchUserInfo(marketUrl, token)
            .then((userInfo) => {
              const creds: AuthCredentials = {
                token,
                userId: userInfo.id,
                username: userInfo.username,
                expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
                marketUrl,
              };
              saveCredentials(creds)
                .then(() => resolve(creds))
                .catch(reject);
            })
            .catch(reject);
        } else {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('No token received');
          server.close();
          reject(new Error('No token received from callback'));
        }
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not found');
      }
    });

    server.listen(DEFAULT_PORT, () => {
      const callbackUrl = `http://localhost:${DEFAULT_PORT}/callback`;
      const authUrl = `${marketUrl}/auth/cli?redirect=${encodeURIComponent(callbackUrl)}`;

      console.log(`Opening browser for authentication...`);
      console.log(`If the browser doesn't open, visit: ${authUrl}`);

      // Open browser
      openBrowser(authUrl);
    });

    // Timeout after 5 minutes
    const timeout = setTimeout(() => {
      server.close();
      reject(new Error('Authentication timed out'));
    }, TIMEOUT_MS);

    server.on('close', () => {
      clearTimeout(timeout);
    });

    server.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

async function fetchUserInfo(marketUrl: string, token: string): Promise<{ id: string; username: string }> {
  const response = await fetch(`${marketUrl}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user info');
  }

  const data = await response.json();
  return data.user;
}

function openBrowser(url: string): void {
  const platform = process.platform;
  let command: string;

  switch (platform) {
    case 'darwin':
      command = `open "${url}"`;
      break;
    case 'win32':
      command = `start "" "${url}"`;
      break;
    default:
      command = `xdg-open "${url}"`;
  }

  exec(command, (err) => {
    if (err) {
      console.error('Failed to open browser automatically.');
    }
  });
}

export async function getCurrentUser(): Promise<AuthCredentials | null> {
  return loadCredentials();
}
