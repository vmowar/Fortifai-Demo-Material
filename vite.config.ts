import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import type {IncomingMessage, ServerResponse} from 'http';
import path from 'path';
import {defineConfig, type ViteDevServer} from 'vite';

function readRequestBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk: Buffer | string) => {
      raw += chunk.toString();
      if (raw.length > 4_000_000) {
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => resolve(raw));
    req.on('error', reject);
  });
}

function invalidateCmsModule(server: ViteDevServer, filePath: string): void {
  try {
    const mods = server.moduleGraph.getModulesByFile(filePath);
    if (mods) {
      for (const mod of mods) {
        server.moduleGraph.invalidateModule(mod);
      }
    }
  } catch {
    // Ignore module graph invalidation issues
  }
}

interface DiskPersistedState {
  revision: number;
  config: Record<string, unknown> | null;
}

function normalizeRevision(rawNum: number): number {
  if (!Number.isFinite(rawNum) || rawNum <= 0) {
    return 0;
  }
  // Normalize legacy container wall-clock timestamps (e.g. 1795002000000) to revision 1
  // so monotonic revision numbers never suffer from client/container clock skew.
  if (rawNum >= 1_000_000_000_000) {
    return 1;
  }
  return Math.floor(rawNum);
}

function readPersistedCmsFromDisk(filePath: string): DiskPersistedState {
  try {
    if (!fs.existsSync(filePath)) {
      return {revision: 0, config: null};
    }
    const content = fs.readFileSync(filePath, 'utf8');
    const revMatch = content.match(
      /export\s+const\s+PERSISTED_CMS_UPDATED_AT\s*=\s*(\d+)\s*;/
    );
    const rawRev = revMatch ? Number(revMatch[1]) : 0;
    const revision = normalizeRevision(rawRev);

    const dataMarker =
      'export const PERSISTED_CMS_DATA: Record<string, unknown> | null =';
    const markerIdx = content.indexOf(dataMarker);
    if (markerIdx === -1) {
      return {revision, config: null};
    }

    let jsonSlice = content.slice(markerIdx + dataMarker.length).trim();
    if (jsonSlice.endsWith(';')) {
      jsonSlice = jsonSlice.slice(0, -1).trim();
    }
    if (!jsonSlice || jsonSlice === 'null') {
      return {revision: 0, config: null};
    }

    const parsed = JSON.parse(jsonSlice) as Record<string, unknown> | null;
    if (!parsed || typeof parsed !== 'object') {
      return {revision: 0, config: null};
    }
    return {revision: Math.max(1, revision), config: parsed};
  } catch {
    return {revision: 0, config: null};
  }
}

function writePersistedCmsAtomically(
  filePath: string,
  revision: number,
  config: Record<string, unknown> | null
): void {
  const serialized = config ? JSON.stringify(config, null, 2) : 'null';
  const fileContents = `// Auto-synced by Fortifai Live CMS Studio inside Google AI Studio.\n// When downloading the ZIP for Git deployment, any edits saved in Live CMS are persisted here automatically.\nexport const PERSISTED_CMS_UPDATED_AT = ${revision};\n\nexport const PERSISTED_CMS_DATA: Record<string, unknown> | null = ${serialized};\n`;

  const tmpPath = `${filePath}.tmp`;
  fs.writeFileSync(tmpPath, fileContents, 'utf8');
  fs.renameSync(tmpPath, filePath);
}

function syncStandaloneAgentSuiteHtml(
  htmlFilePath: string,
  config: Record<string, unknown>
): void {
  try {
    if (!Array.isArray(config.agents) || !fs.existsSync(htmlFilePath)) {
      return;
    }
    const cleanAgents = config.agents
      .filter(
        (item): item is Record<string, unknown> =>
          Boolean(item) &&
          typeof item === 'object' &&
          typeof (item as Record<string, unknown>).title === 'string' &&
          typeof (item as Record<string, unknown>).description === 'string'
      )
      .map((item, idx) => {
        const suites = Array.isArray(item.suites)
          ? item.suites.filter(
              (s): s is string => typeof s === 'string' && s.trim().length > 0
            )
          : undefined;
        return {
          indexBadge:
            typeof item.indexBadge === 'string' && item.indexBadge.trim()
              ? item.indexBadge
              : String(idx + 1).padStart(2, '0'),
          suite:
            typeof item.suite === 'string' && item.suite.trim()
              ? item.suite
              : 'PROCUREMENT',
          ...(suites && suites.length > 1 ? {suites} : {}),
          suiteLabel:
            typeof item.suiteLabel === 'string' && item.suiteLabel.trim()
              ? item.suiteLabel
              : 'Procurement & Supply Chain',
          title: String(item.title),
          description: String(item.description),
          signals: typeof item.signals === 'string' ? item.signals : '',
          output: typeof item.output === 'string' ? item.output : '',
        };
      });

    if (cleanAgents.length === 0) {
      return;
    }

    const currentHtml = fs.readFileSync(htmlFilePath, 'utf8');
    const serializedAgents = JSON.stringify(cleanAgents, null, 8)
      .replace(/</g, '\\u003c')
      .replace(/\n\]$/, '\n      ]');
    const replacementBlock = `const AGENTS = ${serializedAgents};`;
    const updatedHtml = currentHtml.replace(
      /const AGENTS = \[[\s\S]*?\];(?=\s*(?:const SUITE_LABELS =|let activeSuite =))/,
      replacementBlock
    );

    if (updatedHtml !== currentHtml) {
      const tmpHtmlPath = `${htmlFilePath}.tmp`;
      fs.writeFileSync(tmpHtmlPath, updatedHtml, 'utf8');
      fs.renameSync(tmpHtmlPath, htmlFilePath);
    }
  } catch {
    // Never block CMS save if standalone HTML sync encounters an issue
  }
}

function sendNoCacheJson(
  res: ServerResponse,
  statusCode: number,
  payload: Record<string, unknown>
): void {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, max-age=0'
  );
  res.setHeader('Pragma', 'no-cache');
  res.end(JSON.stringify(payload));
}

export default defineConfig(() => {
  // True ONLY inside the Google AI Studio container.
  // When the project ZIP is downloaded and pushed to Git (Vercel, Netlify, Cloudflare, or local builds),
  // neither APP_URL=https://ais-* nor K_SERVICE=ais-* exists, so Live CMS is stripped out completely.
  const isAiStudioContainer = Boolean(
    (process.env.APP_URL &&
      /https?:\/\/ais-(dev|pre)-/i.test(process.env.APP_URL)) ||
      (process.env.K_SERVICE && /^ais-(dev|pre)-/i.test(process.env.K_SERVICE))
  );

  const cmsPersistedPath = path.resolve(
    import.meta.dirname,
    'src/config/cmsPersisted.ts'
  );
  const standaloneAgentSuitePath = path.resolve(
    import.meta.dirname,
    'public/agent-suite.html'
  );

  return {
    define: {
      __AISTUDIO_CMS_ENABLED__: JSON.stringify(isAiStudioContainer),
    },
    plugins: [
      react(),
      tailwindcss(),
      // AI Studio Dev-Only Live CMS Disk Persistence:
      // Reads & writes Live CMS edits directly to src/config/cmsPersisted.ts
      // so changes persist immediately across reloads (even with DISABLE_HMR=true)
      // AND are baked into the downloaded ZIP for Git deployment.
      {
        name: 'aistudio-cms-disk-sync',
        apply: 'serve',
        configureServer(server: ViteDevServer): void {
          if (!isAiStudioContainer) {
            return;
          }

          server.middlewares.use(
            async (
              req: IncomingMessage,
              res: ServerResponse,
              next: () => void
            ) => {
              const reqUrl = req.url ?? '';

              // Direct uncached disk state read so reloads never read stale Vite/browser module cache
              if (
                req.method === 'GET' &&
                (reqUrl.startsWith('/api/cms/state') ||
                  reqUrl.startsWith('/__aistudio_cms_state'))
              ) {
                const diskState = readPersistedCmsFromDisk(cmsPersistedPath);
                sendNoCacheJson(res, 200, {
                  ok: true,
                  revision: diskState.revision,
                  config: diskState.config,
                });
                return;
              }

              // Instant atomic disk write when clicking Save Changes in Live CMS
              if (
                req.method === 'POST' &&
                (reqUrl.startsWith('/api/cms/save') ||
                  reqUrl.startsWith('/__aistudio_cms_sync'))
              ) {
                try {
                  const bodyText = await readRequestBody(req);
                  const parsed = JSON.parse(bodyText) as {
                    config?: Record<string, unknown>;
                    revision?: number;
                  };
                  if (
                    !parsed ||
                    !parsed.config ||
                    typeof parsed.config !== 'object'
                  ) {
                    sendNoCacheJson(res, 400, {
                      ok: false,
                      error: 'Invalid config payload',
                    });
                    return;
                  }

                  const currentDisk =
                    readPersistedCmsFromDisk(cmsPersistedPath);
                  const clientRev =
                    typeof parsed.revision === 'number'
                      ? normalizeRevision(parsed.revision)
                      : 0;
                  const nextRevision =
                    Math.max(currentDisk.revision, clientRev) + 1;

                  writePersistedCmsAtomically(
                    cmsPersistedPath,
                    nextRevision,
                    parsed.config
                  );
                  syncStandaloneAgentSuiteHtml(
                    standaloneAgentSuitePath,
                    parsed.config
                  );
                  invalidateCmsModule(server, cmsPersistedPath);

                  sendNoCacheJson(res, 200, {
                    ok: true,
                    revision: nextRevision,
                  });
                } catch (err) {
                  sendNoCacheJson(res, 500, {
                    ok: false,
                    error: err instanceof Error ? err.message : 'Save failed',
                  });
                }
                return;
              }

              if (
                req.method === 'POST' &&
                (reqUrl.startsWith('/api/cms/reset') ||
                  reqUrl.startsWith('/__aistudio_cms_reset'))
              ) {
                try {
                  writePersistedCmsAtomically(cmsPersistedPath, 0, null);
                  invalidateCmsModule(server, cmsPersistedPath);
                  sendNoCacheJson(res, 200, {ok: true, revision: 0});
                } catch {
                  sendNoCacheJson(res, 500, {ok: false});
                }
                return;
              }

              next();
            }
          );
        },
      },
      // Copies src/assets into dist/ so root-relative URLs like
      // "/src/assets/images/..." (e.g. generate_image output) still resolve
      // in production builds. Do not remove.
      {
        name: 'copy-unbundled-src-assets',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const distDir = path.resolve(import.meta.dirname, 'dist');
          const srcAssets = path.resolve(import.meta.dirname, 'src/assets');
          const distAssets = path.resolve(distDir, 'src/assets');
          if (fs.existsSync(distDir) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, distAssets, {recursive: true, force: true});
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
