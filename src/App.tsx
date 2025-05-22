
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Index } from './pages/Index';
import { Auth } from './pages/Auth';
import { NotFound } from './pages/NotFound';
import { Settings } from './pages/Settings';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider defaultTheme="light" storageKey="ui-theme">
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
