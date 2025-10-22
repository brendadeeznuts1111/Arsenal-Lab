// components/PackageManagementArsenal.tsx
import clsx from 'clsx';
import { useState } from 'react';

/* ------------------------------------------------------------------ */
/*  HOOK                                                              */
/* ------------------------------------------------------------------ */
export function usePackageManagementArsenal() {
  const [tab, setTab] = useState<'info' | 'outdated' | 'audit' | 'analyze' | 'patch'>('info');
  const [pkg, setPkg] = useState('react');
  const [sev, setSev] = useState<'all' | 'low' | 'moderate' | 'high' | 'critical'>('high');
  const [ws, setWs] = useState(false);
  const [patchMode, setPatchMode] = useState<'prepare' | 'commit'>('prepare');
  const [patchesDir, setPatchesDir] = useState('patches');
  return { tab, setTab, pkg, setPkg, sev, setSev, ws, setWs, patchMode, setPatchMode, patchesDir, setPatchesDir };
}

/* ------------------------------------------------------------------ */
/*  CODE SNIPPETS                                                     */
/* ------------------------------------------------------------------ */
const infoCmd = (p: string) => `bun info ${p}`;
const outdatedCmd = (r: boolean) => `bun update -i${r ? ' --recursive' : ''}`;
const auditCmd = (s: string, j: boolean) => `bun audit${s !== 'all' ? ` --severity=${s}` : ''}${j ? ' --json > audit.json' : ''}`;
const analyzeCmd = () => `bun install --analyze`;
const patchCmd = (p: string, mode: string, dir?: string) => mode === 'commit'
  ? `bun patch --commit ${p}${dir !== 'patches' ? ` --patches-dir=${dir}` : ''}`
  : `bun patch ${p}`;

/* ------------------------------------------------------------------ */
/*  MOCK DATA                                                         */
/* ------------------------------------------------------------------ */
const mockInfo = {
  name: 'react',
  version: '19.2.0',
  license: 'MIT',
  deps: 0,
  versions: 2536,
  description: 'React is a JavaScript library for building user interfaces.',
  homepage: 'https://react.dev/',
  keywords: ['react'],
  dist: {
    tarball: 'https://registry.npmjs.org/react/-/react-19.2.0.tgz',
    shasum: 'd33dd1721698f4376ae57a54098cb47fc75d93a5',
    integrity: 'sha512-tmbWg6W31tQLeB5cdIBOicJDJRR2KzXsV7uSK9iNfLWQ5bIZfxuPEHp7M8wiHyHnn0DD1i7w3Zmin0FtkrwoCQ==',
    unpackedSize: '171.60 KB',
  },
  distTags: {
    latest: '19.2.0',
    beta: '19.0.0-beta-26f2496093-20240514',
    rc: '19.0.0-rc.1',
    next: '19.3.0-canary-4fdf7cf2-20251003',
    canary: '19.3.0-canary-4fdf7cf2-20251003',
    experimental: '0.0.0-experimental-4fdf7cf2-20251003',
  },
  maintainers: ['fb <opensource+fb.com>', 'react-bot <react-core>'],
  published: '2025-10-01T21:38:32.757Z',
};

const mockOutdated = [
  { package: '@types/node', current: '20.0.0', wanted: '20.2.0', latest: '22.0.0', type: 'dev', workspace: true },
  { package: 'typescript', current: '5.0.0', wanted: '5.6.0', latest: '5.7.0', type: 'dev', workspace: false },
  { package: 'react', current: '18.3.1', wanted: '18.3.1', latest: '19.2.0', type: 'prod', workspace: false },
];

const mockAudit = [
  { package: 'lodash', severity: 'high', vulnerability: 'Prototype Pollution', patched: '>=4.17.21', workspace: true },
  { package: 'axios', severity: 'moderate', vulnerability: 'Server-Side Request Forgery', patched: '>=1.7.0', workspace: false },
  { package: 'express', severity: 'low', vulnerability: 'Open Redirect', patched: '>=4.19.0', workspace: false },
];

const severityColors: Record<string, string> = {
  low: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  moderate: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  critical: 'bg-red-200 text-red-800 dark:bg-red-800/40 dark:text-red-200',
};

/* ------------------------------------------------------------------ */
/*  MAIN COMPONENT                                                     */
/* ------------------------------------------------------------------ */
export function PackageManagementArsenal() {
  const { tab, setTab, pkg, setPkg, sev, setSev, ws, setWs, patchMode, setPatchMode, patchesDir, setPatchesDir } = usePackageManagementArsenal();

  const tabs = [
    { id: 'info', label: 'Info', color: 'blue', icon: '📦' },
    { id: 'outdated', label: 'Outdated', color: 'orange', icon: '🔄' },
    { id: 'audit', label: 'Audit', color: 'red', icon: '🛡️' },
    { id: 'analyze', label: 'Analyze', color: 'green', icon: '🔍' },
    { id: 'patch', label: 'Patch', color: 'purple', icon: '🩹' },
  ];

  return (
    <div className="fixed bottom-4 right-4 z-30 w-[480px] max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 grid place-content-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold">📦</span>
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white">Package Management</h2>
            <p className="text-xs text-gray-500">v1.3 Arsenal</p>
          </div>
        </div>
        <div className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-[10px] font-medium">Catalog Ready</div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={clsx(
              'px-2.5 py-1 rounded-md text-[11px] border transition',
              tab === t.id ? `bg-${t.color}-600 text-white border-${t.color}-600 shadow` : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Panels */}
      {tab === 'info' && <InfoPanel pkg={pkg} setPkg={setPkg} />}
      {tab === 'outdated' && <OutdatedPanel ws={ws} setWs={setWs} />}
      {tab === 'audit' && <AuditPanel sev={sev} setSev={setSev} />}
      {tab === 'analyze' && <AnalyzePanel />}
      {tab === 'patch' && <PatchPanel pkg={pkg} setPkg={setPkg} patchMode={patchMode} setPatchMode={setPatchMode} patchesDir={patchesDir} setPatchesDir={setPatchesDir} />}

      {/* Footer */}
      <footer className="mt-5 pt-3 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 gap-2 text-[10px]">
        <div className="flex items-center gap-2"><span className="text-green-500">✅</span><span>Catalog dependencies</span></div>
        <div className="flex items-center gap-2"><span className="text-green-500">✅</span><span>Workspace support</span></div>
        <div className="flex items-center gap-2"><span className="text-green-500">✅</span><span>npm audit DB</span></div>
        <div className="flex items-center gap-2"><span className="text-green-500">✅</span><span>Auto-detect imports</span></div>
        <div className="flex items-center gap-2"><span className="text-green-500">✅</span><span>Persistent patching</span></div>
        <div className="flex items-center gap-2"><span className="text-green-500">✅</span><span>Git-friendly patches</span></div>
      </footer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PANELS                                                            */
/* ------------------------------------------------------------------ */
const InfoPanel = ({ pkg, setPkg }: any) => (
  <Section title="Package Info" desc="View metadata, versions, and dist-tags">
    <div className="flex gap-2">
      <input
        value={pkg}
        onChange={e => setPkg(e.target.value)}
        placeholder="package name"
        className="flex-1 px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
      />
      <CopyButton text={infoCmd(pkg)} />
    </div>
    <CodeBlock code={infoCmd(pkg)} />
    <InfoTable data={mockInfo} />
  </Section>
);

const OutdatedPanel = ({ ws, setWs }: any) => (
  <Section title="Update Interactive" desc="Catalog-aware outdated + update">
    <LabelCheck label="Recursive (workspaces)" checked={ws} onChange={e => setWs(e.target.checked)} />
    <CopyButton text={outdatedCmd(ws)} />
    <CodeBlock code={outdatedCmd(ws)} />
    <OutdatedTable data={mockOutdated} />
  </Section>
);

const AuditPanel = ({ sev, setSev }: any) => (
  <Section title="Security Audit" desc="Scan for known vulnerabilities">
    <div className="flex gap-2">
      <select value={sev} onChange={e => setSev(e.target.value as any)} className="px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
        <option value="all">All</option>
        <option value="low">Low</option>
        <option value="moderate">Moderate</option>
        <option value="high">High</option>
        <option value="critical">Critical</option>
      </select>
      <CopyButton text={auditCmd(sev, false)} />
      <CopyButton text={auditCmd(sev, true)} label="JSON" />
    </div>
    <CodeBlock code={auditCmd(sev, false)} />
    <AuditTable data={mockAudit} filter={sev} />
  </Section>
);

const AnalyzePanel = () => (
  <Section title="Install Analysis" desc="Auto-detect missing dependencies">
    <CopyButton text={analyzeCmd()} />
    <CodeBlock code={analyzeCmd()} />
    <AnalyzeReport />
  </Section>
);

const PatchPanel = ({ pkg, setPkg, patchMode, setPatchMode, patchesDir, setPatchesDir }: any) => (
  <Section title="Persistent Package Patching" desc="Maintainable, git-friendly patches for node_modules">
    <div className="flex gap-2 mb-2">
      <select value={patchMode} onChange={e => setPatchMode(e.target.value)} className="px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
        <option value="prepare">Prepare Package</option>
        <option value="commit">Commit Patch</option>
      </select>
      {patchMode === 'commit' && (
        <input
          value={patchesDir}
          onChange={e => setPatchesDir(e.target.value)}
          placeholder="patches dir"
          className="flex-1 px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
        />
      )}
    </div>
    <div className="flex gap-2 mb-2">
      <input
        value={pkg}
        onChange={e => setPkg(e.target.value)}
        placeholder="package name"
        className="flex-1 px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
      />
      <CopyButton text={patchCmd(pkg, patchMode, patchesDir)} />
    </div>
    <CodeBlock code={patchCmd(pkg, patchMode, patchesDir)} />
    <PatchGuide mode={patchMode} />
  </Section>
);

/* ------------------------------------------------------------------ */
/*  SMALL COMPOSABLES                                                 */
/* ------------------------------------------------------------------ */
const Section = ({ title, desc, children }: any) => (
  <div className="space-y-2 mb-4">
    <div><h3 className="font-semibold text-gray-900 dark:text-white text-sm">{title}</h3><p className="text-xs text-gray-500">{desc}</p></div>
    {children}
  </div>
);

const CodeBlock = ({ code }: { code: string }) => (
  <div className="relative"><pre className="bg-gray-900 text-gray-100 text-[11px] p-3 rounded-lg overflow-x-auto">{code}</pre><CopyButton text={code} /></div>
);

const CopyButton = ({ text, label = 'Copy' }: { text: string; label?: string }) => (
  <button onClick={() => navigator.clipboard.writeText(text)} className="absolute top-2 right-2 px-2 py-0.5 text-[10px] bg-gray-700 hover:bg-gray-600 text-white rounded">{label}</button>
);

const LabelCheck = ({ label, ...rest }: any) => (
  <label className="flex items-center gap-1.5 text-xs"><input {...rest} className="rounded border-gray-300" /><span>{label}</span></label>
);

/* ------------------------------------------------------------------ */
/*  TABLES                                                            */
/* ------------------------------------------------------------------ */
const InfoTable = ({ data }: any) => (
  <div className="space-y-1 text-xs">
    <div className="flex justify-between"><span className="text-gray-500">Version</span><span className="font-mono">{data.version}</span></div>
    <div className="flex justify-between"><span className="text-gray-500">License</span><span>{data.license}</span></div>
    <div className="flex justify-between"><span className="text-gray-500">Dependencies</span><span>{data.deps}</span></div>
    <div className="flex justify-between"><span className="text-gray-500">Unpacked</span><span>{data.dist.unpackedSize}</span></div>
    <div className="flex justify-between"><span className="text-gray-500">Published</span><span>{new Date(data.published).toLocaleDateString()}</span></div>
    <div className="mt-2"><div className="text-gray-500 mb-1">Dist-tags</div>{Object.entries(data.distTags).map(([k, v]) => (<div key={k} className="flex justify-between text-xs"><span className="text-gray-400">{k}</span><span className="font-mono">{v}</span></div>))}</div>
  </div>
);

const OutdatedTable = ({ data }: any) => (
  <div className="space-y-1">
    {data.map((r: any) => (
      <div key={r.package} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded">
        <div className="font-mono text-xs">{r.package}<span className="text-gray-400 ml-1">({r.type})</span></div>
        <div className="text-right text-xs">
          <div><span className="text-red-500">{r.current}</span> → <span className="text-green-500">{r.latest}</span></div>
          <div className="text-gray-400">wanted: {r.wanted}</div>
        </div>
      </div>
    ))}
  </div>
);

const AuditTable = ({ data, filter }: any) => (
  <div className="space-y-1">
    {(filter === 'all' ? data : data.filter((r: any) => r.severity === filter)).map((r: any) => (
      <div key={r.package} className="p-2 rounded bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center justify-between">
          <div className="font-mono text-xs">{r.package}</div>
          <span className={`px-1.5 py-0.5 text-[10px] rounded ${severityColors[r.severity]}`}>{r.severity}</span>
        </div>
        <div className="text-xs text-gray-600 mt-1">{r.vulnerability}</div>
        <div className="text-xs text-green-600">Patched: {r.patched}</div>
      </div>
    ))}
  </div>
);

const AnalyzeReport = () => (
  <div className="p-2 bg-gray-50 dark:bg-gray-800/50 rounded text-xs">
    <div className="flex items-center justify-between mb-1"><span>Missing dependencies detected:</span><span className="font-mono text-green-600">3 packages</span></div>
    <div className="space-y-1 font-mono text-[10px]"><div>lodash (imported in src/utils.ts)</div><div>axios (imported in src/api.ts)</div><div>express (imported in src/server.ts)</div></div>
    <div className="mt-2 text-green-600">✅ Auto-installed via --analyze</div>
  </div>
);

const PatchGuide = ({ mode }: { mode: string }) => (
  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-xs">
    {mode === 'prepare' ? (
      <div className="space-y-2">
        <div className="font-semibold text-purple-700 dark:text-purple-300">🎯 Step 1: Prepare Package for Patching</div>
        <div className="text-purple-600 dark:text-purple-400 space-y-1">
          <div>• Creates fresh copy in node_modules/ (no cache links)</div>
          <div>• Makes it safe to edit packages directly</div>
          <div>• Preserves Global Cache integrity</div>
        </div>
        <div className="text-gray-600 dark:text-gray-400 mt-2">
          <strong>⚠️ Important:</strong> Only edit node_modules/ after running this command!
        </div>
        <div className="text-blue-600 dark:text-blue-400 mt-2">
          <strong>🧪 Step 2: Test Your Changes Locally</strong>
          <div className="text-xs mt-1 space-y-1">
            <div>• Edit files safely in node_modules/</div>
            <div>• Run your app to test the changes</div>
            <div>• Verify functionality works as expected</div>
            <div>• Check for any side effects or breaking changes</div>
          </div>
        </div>
        <div className="text-green-600 dark:text-green-400 mt-1">
          <strong>📝 Step 3: Ready for Commit</strong> - When testing is complete, commit your patch
        </div>
      </div>
    ) : (
      <div className="space-y-2">
        <div className="font-semibold text-purple-700 dark:text-purple-300">📝 Step 3: Commit Your Patch</div>
        <div className="text-purple-600 dark:text-purple-400 space-y-1">
          <div>• Generates .patch file in patches/ directory</div>
          <div>• Updates package.json with "patchedDependencies"</div>
          <div>• Patch applies automatically on future installs</div>
          <div>• Git-friendly: commit and share patches</div>
        </div>
        <div className="text-green-600 dark:text-green-400 mt-2">
          <strong>Benefits:</strong> Persistent, maintainable, shareable patches
        </div>
        <div className="text-blue-600 dark:text-blue-400 mt-2">
          <strong>🔄 How it works:</strong>
          <div className="text-xs mt-1 space-y-1">
            <div>• Creates diff between original and modified package</div>
            <div>• Stores patch file for version control</div>
            <div>• Updates package.json to track patched dependencies</div>
            <div>• Future installs automatically apply the patch</div>
          </div>
        </div>
      </div>
    )}
  </div>
);
