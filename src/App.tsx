
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ClerkProvider } from '@clerk/clerk-react';
import UserSyncProvider from '@/components/UserSyncProvider';
import Index from "./pages/Index";
import Brief from "./pages/Brief";
import Admin from "./pages/Admin";
import AdminDashboard from "./pages/AdminDashboard";
import MyAccount from "./pages/MyAccount";
import Auth from "./pages/Auth";
import SignUp from "./pages/SignUp";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

function App() {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <QueryClientProvider client={queryClient}>
        <UserSyncProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/brief" element={<Brief />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/my-account" element={<MyAccount />} />
              <Route path="/auth/sign-in" element={<Auth />} />
              <Route path="/auth/sign-up" element={<SignUp />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </BrowserRouter>
        </UserSyncProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default App;
