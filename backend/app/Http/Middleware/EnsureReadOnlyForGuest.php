<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureReadOnlyForGuest
{
    /**
     * Handle an incoming request.
     * Enforce strict read-only access for users with the 'Guest' role.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->hasRole('Guest')) {
            // Allow safe HTTP methods (GET, HEAD, OPTIONS)
            if ($request->isMethodSafe()) {
                return $next($request);
            }

            // Allow logging out
            if ($request->is('*/auth/logout')) {
                return $next($request);
            }

            return response()->json([
                'success' => false,
                'message' => 'Guest account is in read-only testing mode. You can view all users, records, and the student portal, but modifications are prohibited.',
            ], 403);
        }

        return $next($request);
    }
}
