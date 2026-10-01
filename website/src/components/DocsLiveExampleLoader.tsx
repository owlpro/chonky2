import { lazy, Suspense } from 'react';

const DocsLiveExample = lazy(() => import('./DocsLiveExample'));

type Example = Parameters<typeof DocsLiveExample>[0]['example'];

export default function DocsLiveExampleLoader({ example, caption }: { example: Example; caption: string }) {
  return (
    <Suspense fallback={<div className="docs-example-loading">Loading live example…</div>}>
      <DocsLiveExample example={example} caption={caption} />
    </Suspense>
  );
}
