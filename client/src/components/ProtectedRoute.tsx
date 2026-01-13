import { useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
    const [, setLocation] = useLocation();

    // Query current user session from server
    const { data: user, isLoading, error } = trpc.auth.me.useQuery(undefined, {
        retry: false,
        refetchOnWindowFocus: false
    });

    useEffect(() => {
        if (isLoading) return;

        if (error || !user) {
            // Not logged in at all
            if (requireAdmin) {
                setLocation("/admin/login");
            } else {
                setLocation("/login");
            }
            return;
        }

        // Logged in, check permissions
        if (requireAdmin && user.role !== "admin") {
            // Logged in but not admin
            setLocation("/admin/login");
        }
        // Note: For regular customers, just being logged in (which !user checks) is usually enough
        // unless you have specific customer roles, but standard flow allows any authed user

    }, [user, isLoading, error, setLocation, requireAdmin]);

    if (isLoading) {
        // You could render a loading spinner here
        return null;
    }

    // If no user or error, we are redirecting, so return null
    if (!user || error) return null;

    // If admin required but not admin, return null (redirecting)
    if (requireAdmin && user.role !== "admin") return null;

    return <>{children}</>;
}

