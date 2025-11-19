const LoginScreen = () => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const firebaseReady = useFirebaseReady();

  const googleProvider = new GoogleAuthProvider();

  const handleGoogleSignIn = async () => {
    if (!firebaseReady || !auth) {
      alert('Firebase is not configured. Please check your .env.local file.');
      return;
    }

    try {
      setError('');
      setIsLoading(true);

      const result = await signInWithPopup(auth, googleProvider);

      // Handle successful sign-in
      console.log('Signed in with Google:', result.user);

      // Redirect to the desired page after successful sign-in
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Google sign-in error:', error);

      if (error.code === 'auth/unauthorized-domain' || 
          error.message?.includes('redirect_uri_mismatch')) {
        setError(
          <>
            <div className="font-semibold mb-2">OAuth Configuration Error</div>
            <div className="text-sm space-y-2">
              <p>Your Firebase project needs to allow this domain.</p>
              <p className="font-mono text-xs bg-zinc-900 p-2 rounded">
                Current domain: {window.location.origin}
              </p>
              <p>To fix this:</p>
              <ol className="list-decimal list-inside space-y-1 text-zinc-400">
                <li>Go to <a href="https://console.firebase.google.com" target="_blank" rel="noopener" className="text-emerald-400 hover:underline">Firebase Console</a></li>
                <li>Select your project → Authentication → Settings</li>
                <li>Scroll to "Authorized domains"</li>
                <li>Add: <code className="bg-zinc-900 px-1">localhost</code></li>
                <li>For production, add your deployed domain</li>
              </ol>
            </div>
          </>
        );
      } else {
        setError(`Failed to sign in with Google: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl mb-4">Login</h1>
      <button
        className="bg-blue-500 text-white p-2 rounded"
        onClick={handleGoogleSignIn}
      >
        Sign in with Google
      </button>
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
};

export default LoginScreen;