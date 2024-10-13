'use client';

import { signIn } from "next-auth/react";

export default function LoginScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Welcome to Rock Todo</h1>
        <p className="mb-6 text-center text-gray-600">Please sign in to continue</p>
        <button
          onClick={() => signIn("auth0")}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Sign in with Auth0
        </button>
      </div>
    </div>
  );
}
