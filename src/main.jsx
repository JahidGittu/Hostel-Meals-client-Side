import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router'
import Router from './Router/Router.jsx'

import Aos from 'aos'
import 'aos/dist/aos.css';
import AuthProvider from './Context/AuthContext/AuthProvider.jsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HelmetProvider } from "react-helmet-async";

Aos.init()

const queryClient = new QueryClient();



createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HelmetProvider>
      <div className="urbanist-font">
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <RouterProvider router={Router} />
          </AuthProvider>
        </QueryClientProvider>
      </div>
    </HelmetProvider>
  </StrictMode>
);
