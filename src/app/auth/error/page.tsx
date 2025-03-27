'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

// Loading fallback component
function AuthErrorLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Loading...</CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}

// Inner component that uses useSearchParams
function AuthErrorContent() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const errorParam = searchParams.get('error');
    
    // Parse error type
    if (errorParam) {
      switch (errorParam) {
        case 'Signin':
          setError('Try signing in with a different account.');
          break;
        case 'OAuthSignin':
        case 'OAuthCallback':
        case 'OAuthCreateAccount':
        case 'EmailCreateAccount':
        case 'Callback':
          setError('There was a problem with the authentication service. Please try again.');
          break;
        case 'OAuthAccountNotLinked':
          setError('You already have an account with a different sign-in method. Please sign in with that method instead.');
          break;
        case 'EmailSignin':
          setError('The email could not be sent. Please try again.');
          break;
        case 'CredentialsSignin':
          setError('The email or password you entered is incorrect.');
          break;
        case 'SessionRequired':
          setError('You need to be signed in to access this page.');
          break;
        default:
          setError('An unknown error occurred. Please try again.');
          break;
      }
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center flex items-center justify-center">
            <AlertCircle className="mr-2 h-6 w-6 text-red-500" />
            Authentication Error
          </CardTitle>
          <CardDescription className="text-center">
            There was a problem with your authentication request
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4 text-center">
          <p className="text-gray-600">{error}</p>
        </CardContent>
        
        <CardFooter className="flex justify-center">
          <Link href="/auth/signin">
            <Button>
              Return to Sign In
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

// Main component with Suspense boundary
export default function AuthError() {
  return (
    <Suspense fallback={<AuthErrorLoading />}>
      <AuthErrorContent />
    </Suspense>
  );
}