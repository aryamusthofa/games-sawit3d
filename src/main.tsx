import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import OfflinePrototype from './components/OfflinePrototype.tsx';
import './index.css';

const isOfflinePrototype = new URLSearchParams(window.location.search).get('mode') === 'offline';
const RootApp = isOfflinePrototype ? OfflinePrototype : App;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootApp />
  </StrictMode>,
);
