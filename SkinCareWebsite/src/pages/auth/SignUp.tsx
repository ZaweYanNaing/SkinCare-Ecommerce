import React, { useState } from 'react';
import { Link } from 'react-router';
import glowLogo from '../../assets/skincareLogo.png';

function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match!');
      setLoading(false);
      return;
    }

    try {
      // Use JSON instead of FormData
      const response = await fetch('http://localhost/signUp.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Email: email,
          Password: password,
        }),
      });

      // Check if response is OK before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response error:', errorText);
        throw new Error(`Server error: ${response.status}`);
      }

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        // Type guard for Error objects
        const errorMessage = jsonError instanceof Error ? jsonError.message : String(jsonError);
        console.error('JSON parsing error:', errorMessage);
        const responseText = await response.text();
        console.error('Raw response:', responseText);
        throw new Error('Invalid server response format');
      }

      if (data.success) {
        setSuccess(data.message);
        // Reset form fields on success
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again later.');
      // Type guard for Error objects
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('Signup error:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl md:flex-row">
        {/* Left side */}
        <div className="flex flex-col justify-center bg-gray-50 p-8 md:w-1/2">
          <div className="mb-8">
            <img src={glowLogo} alt="GLOW Logo" className="size-20" />
          </div>
          <h1 className="mb-4 text-4xl font-bold text-gray-800">Welcome!</h1>
          <div className="mb-6 w-24 border-b border-gray-300"></div>
          <p className="mb-6 text-gray-600">Do you already have an account?</p>
          <Link to="/auth/signin">
            <button className="w-fit rounded-full border border-green-500 px-6 py-2 text-green-500 transition hover:bg-green-50">Sign In</button>
          </Link>
        </div>
        {/* Right side */}
        <div className="rounded-r-2xl bg-white p-8 md:w-1/2">
          <h2 className="mb-6 text-2xl font-semibold text-green-600">Create Account</h2>
          {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-600">{error}</div>}
          {success && <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-600">{success}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 p-3 focus:ring-1 focus:ring-green-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 p-3 focus:ring-1 focus:ring-green-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 p-3 focus:ring-1 focus:ring-green-500 focus:outline-none"
                required
              />
            </div>
            <button
              type="submit"
              className="mt-4 flex w-full items-center justify-center rounded-lg bg-green-500 py-3 text-white transition hover:bg-green-600"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="mr-3 -ml-1 h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : (
                'Sign Up'
              )}
            </button>
            <div className="mt-4 flex items-center justify-center">
              <div className="mr-3 flex-grow border-t border-gray-300"></div>
              <span className="text-sm text-gray-500">Or sign in with</span>
              <div className="ml-3 flex-grow border-t border-gray-300"></div>
            </div>
            <div className="mt-4 flex justify-center space-x-4">
              <button type="button" className="rounded-full border border-gray-300 p-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24">
                  <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2.917 16.083c-2.258 0-4.083-1.825-4.083-4.083s1.825-4.083 4.083-4.083c1.103 0 2.024.402 2.735 1.067l-1.107 1.068c-.304-.292-.834-.63-1.628-.63-1.394 0-2.531 1.155-2.531 2.579 0 1.424 1.138 2.579 2.531 2.579 1.616 0 2.224-1.162 2.316-1.762h-2.316v-1.4h3.855c.036.204.064.408.064.677.001 2.332-1.563 3.988-3.919 3.988zm9.917-3.5h-1.75v1.75h-1.167v-1.75h-1.75v-1.166h1.75v-1.75h1.167v1.75h1.75v1.166z" />
                </svg>
              </button>
              <button type="button" className="rounded-full border border-gray-300 p-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24">
                  <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2.635 17.443c-3.198 0-5.808-2.61-5.808-5.808 0-3.198 2.61-5.808 5.808-5.808 1.42 0 2.615.474 3.515 1.247l-1.424 1.368c-.389-.336-1.064-.724-2.091-.724-1.789 0-3.255 1.484-3.255 3.917s1.466 3.917 3.255 3.917c2.082 0 2.864-1.493 2.984-2.267h-2.984v-1.805h4.957c.046.261.078.522.078.87.001 3.001-2.007 5.093-5.035 5.093z" />
                </svg>
              </button>
              <button type="button" className="rounded-full border border-gray-300 p-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24">
                  <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2 16h-2v-6h2v6zm-1-6.891c-.607 0-1.1-.496-1.1-1.109 0-.612.492-1.109 1.1-1.109s1.1.497 1.1 1.109c0 .613-.493 1.109-1.1 1.109zm8 6.891h-1.998v-2.861c0-1.881-2.002-1.722-2.002 0v2.861h-2v-6h2v1.093c.872-1.616 4-1.736 4 1.548v3.359z" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
