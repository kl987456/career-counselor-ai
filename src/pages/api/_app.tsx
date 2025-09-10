import { AppType } from "next/app";
import { trpc } from "@/utils/trpc";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import "../styles/globals.css"; // your global CSS

const MyApp: AppType = ({ Component, pageProps }) => {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        trpc.httpBatchLink({
          url: "/api/trpc",
        }),
      ],
    })
  );

  // Dark mode state
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // mark that we're on the client
  }, []);

  useEffect(() => {
    if (!mounted) return; // only run on client
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode, mounted]);

  if (!mounted) return null; // prevent SSR mismatch

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} darkMode={darkMode} setDarkMode={setDarkMode} />
      </QueryClientProvider>
    </trpc.Provider>
  );
};

export default MyApp;
