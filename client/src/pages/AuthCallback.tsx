import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/const";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session from the URL
        const { data, error: sessionError } =
          await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (data.session) {
          // Session established, redirect to dashboard
          setLocation("/dashboard");
        } else {
          // No session, redirect to login
          setLocation("/login");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Authentication failed");
        // Redirect to login after 3 seconds
        setTimeout(() => setLocation("/login"), 3000);
      }
    };

    handleCallback();
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 flex items-center justify-center">
      <div className="text-center space-y-4">
        {error ? (
          <>
            <div className="text-red-600 font-medium">{error}</div>
            <p className="text-zinc-600 text-sm">
              Redirecting to login...
            </p>
          </>
        ) : (
          <>
            <Loader2 className="w-8 h-8 text-zinc-900 animate-spin mx-auto" />
            <p className="text-zinc-600">Completing sign in...</p>
          </>
        )}
      </div>
    </div>
  );
}
