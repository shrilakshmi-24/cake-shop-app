'use client';

import { useActionState, Suspense } from 'react';
import { authenticate } from '@/lib/actions/auth';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function LoginForm() {
    const [errorMessage, dispatch, isPending] = useActionState(authenticate, undefined);
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/';

    return (
        <div className="flex h-screen bg-white overflow-hidden">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex w-1/2 bg-red-600 relative overflow-hidden items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-900 opacity-90" />
                {/* Abstract Pattern / Deco */}
                <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white opacity-10 blur-3xl" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-white/10" />
                <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-yellow-400 opacity-20 blur-3xl" />

                <div className="relative z-10 text-center p-12 text-white max-w-lg">
                    <h1 className="text-5xl font-extrabold tracking-tight mb-6">Welcome Back.</h1>
                    <p className="text-xl text-red-100 font-light">
                        Sign in to access your order history, saved designs, and express checkout.
                    </p>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 lg:px-24 py-12">
                <div className="max-w-md w-full mx-auto">
                    <div className="mb-12">
                        <Link href="/" className="inline-block p-2 rounded-full bg-red-50 text-red-600 mb-6 hover:bg-red-100 transition">
                            <span className="sr-only">Home</span>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </Link>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Sign in to Cake Shop</h2>
                        <p className="mt-2 text-gray-500">
                            Don't have an account?{' '}
                            <Link href="/register" className="font-semibold text-red-600 hover:text-red-500 hover:underline">
                                Create one for free
                            </Link>
                        </p>
                    </div>

                    <form action={dispatch} className="space-y-6">
                        <input type="hidden" name="redirectTo" value={callbackUrl} />
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email address</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="block w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3.5 text-gray-900 focus:border-red-500 focus:bg-white focus:ring-red-500 transition-all duration-200"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-semibold text-gray-700">Password</label>
                                <a href="#" className="text-sm font-medium text-red-600 hover:text-red-500">Forgot password?</a>
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="block w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3.5 text-gray-900 focus:border-red-500 focus:bg-white focus:ring-red-500 transition-all duration-200"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            aria-disabled={isPending}
                            type="submit"
                            className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-red-100 text-sm font-bold text-white bg-red-600 hover:bg-red-700 hover:shadow-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 transform active:scale-[0.98]"
                        >
                            {isPending ? 'Signing in...' : 'Sign in'}
                        </button>

                        <div className="min-h-[20px]">
                            {errorMessage && (
                                <p className="text-sm font-medium text-red-600 flex items-center gap-2 animate-pulse">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {errorMessage}
                                </p>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center bg-white"><div className="w-8 h-8 rounded-full border-4 border-red-600 border-t-transparent animate-spin" /></div>}>
            <LoginForm />
        </Suspense>
    );
}
