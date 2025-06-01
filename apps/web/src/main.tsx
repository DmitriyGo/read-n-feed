import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { ToastContainer, Bounce } from 'react-toastify';

import './i18n';

import App from './app';

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

root.render(
  <StrictMode>
    <HashRouter>
      <QueryClientProvider client={queryClient}>
        <ToastContainer
          position="bottom-left"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick={false}
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
          transition={Bounce}
        />

        <App />
      </QueryClientProvider>
    </HashRouter>
  </StrictMode>,
);
