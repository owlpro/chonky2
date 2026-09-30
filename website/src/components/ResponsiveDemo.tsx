import { lazy, Suspense, useEffect, useState } from 'react';

const PackagePreview = lazy(() => import('./PackagePreview'));

export default function ResponsiveDemo() {
  const [wideScreen, setWideScreen] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(min-width: 701px)');
    const update = () => setWideScreen(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  if (!wideScreen) return null;

  return (
    <Suspense fallback={<div className="demo-loading">Loading interactive preview…</div>}>
      <PackagePreview />
    </Suspense>
  );
}
