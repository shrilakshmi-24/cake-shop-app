'use client';

import { useActionState } from 'react';
import { register } from '@/lib/actions/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useToast } from '@/contexts/ToastContext';

export default function RegisterPage() {
    const [state, dispatch, isPending] = useActionState(register, undefined);
    const router = useRouter();
    const { showToast } = useToast();

    useEffect(() => {
        if (state === 'success') {
            showToast('Registration successful! Please sign in.', 'success');
            router.push('/login');
        } else if (state) {
            showToast(state, 'error');
        }
    }, [state, router, showToast]);

    return (
        <div className="flex h-screen bg-white overflow-hidden">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex w-1/2 bg-gray-900 relative overflow-hidden items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black opacity-90" />
                {/* Abstract Pattern */}
                <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-red-600 opacity-20 blur-[100px]" />
                <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-blue-600 opacity-10 blur-[100px]" />

                <div className="relative z-10 text-center p-12 text-white max-w-lg">
                    <h1 className="text-5xl font-extrabold tracking-tight mb-6">Join the Club.</h1>
                    <p className="text-xl text-gray-300 font-light">
                        Create an account to start designing your dream cakes and get exclusive offers.
                    </p>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 lg:px-24 py-12 overflow-y-auto">
                <div className="max-w-md w-full mx-auto">
                    <div className="mb-12">
                        <Link href="/" className="inline-block p-2 rounded-full bg-gray-100 text-gray-600 mb-6 hover:bg-gray-200 transition">
                            <span className="sr-only">Home</span>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </Link>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Create an Account</h2>
                        <p className="mt-2 text-gray-500">
                            Already have an account?{' '}
                            <Link href="/login" className="font-semibold text-red-600 hover:text-red-500 hover:underline">
                                Sign in here
                            </Link>
                        </p>
                    </div>

                    <form action={dispatch} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                className="block w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3.5 text-gray-900 focus:border-red-500 focus:bg-white focus:ring-red-500 transition-all duration-200"
                                placeholder="John Doe"
                            />
                        </div>

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
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                minLength={6}
                                className="block w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3.5 text-gray-900 focus:border-red-500 focus:bg-white focus:ring-red-500 transition-all duration-200"
                                placeholder="Min. 6 characters"
                            />
                        </div>

                        <button
                            aria-disabled={isPending}
                            type="submit"
                            className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-gray-200 text-sm font-bold text-white bg-gray-900 hover:bg-black hover:shadow-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all duration-200 transform active:scale-[0.98]"
                        >
                            {isPending ? 'Creating Account...' : 'Get Started'}
                        </button>

                        <div className="min-h-[20px]">
                            {state && state !== 'success' && (
                                <p className="text-sm font-medium text-red-600 flex items-center gap-2 animate-pulse">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {state}
                                </p>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
