import {StrictMode, Suspense, lazy} from 'react';
import {createRoot} from 'react-dom/client';
import './index.css';

const App = lazy(() => import('./App.tsx'));
const OfflinePrototype = lazy(() => import('./components/OfflinePrototype.tsx'));
const isOfflinePrototype = new URLSearchParams(window.location.search).get('mode') === 'offline';
const RootApp = isOfflinePrototype ? OfflinePrototype : App;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={<div style={{minHeight:'100dvh',display:'grid',placeItems:'center',background:'#10251d',color:'#f3e8c8',fontFamily:'system-ui'}}>Memuat Sawit Legend…</div>}>
      <RootApp />
    </Suspense>
  </StrictMode>,
);
