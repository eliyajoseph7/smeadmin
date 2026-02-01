import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../../contexts/AuthContext';
import { 
  SparklesIcon, 
  EyeIcon, 
  EyeSlashIcon,
  EnvelopeIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';

const LoginPage: React.FC = () => {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [emailOrPhoneError, setEmailOrPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const validateEmailOrPhone = () => {
    if (!emailOrPhone.trim()) {
      setEmailOrPhoneError('Email or phone number is required');
      return false;
    }

    // Check if it's an email or phone
    const isEmail = emailOrPhone.includes('@');
    const isPhone = /^[+]?[0-9\s\-()]+$/.test(emailOrPhone);

    if (!isEmail && !isPhone) {
      setEmailOrPhoneError('Please enter a valid email or phone number');
      return false;
    }

    if (isEmail) {
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailOrPhone)) {
        setEmailOrPhoneError('Please enter a valid email address');
        return false;
      }
    }

    if (isPhone) {
      // Basic phone validation (allow various formats)
      const cleanPhone = emailOrPhone.replace(/[\s\-()]/g, '');
      if (cleanPhone.length < 9 || cleanPhone.length > 15) {
        setEmailOrPhoneError('Please enter a valid phone number');
        return false;
      }
    }

    setEmailOrPhoneError('');
    return true;
  };

  const validatePassword = () => {
    if (!password.trim()) {
      setPasswordError('Password is required');
      return false;
    }

    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }

    setPasswordError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isEmailOrPhoneValid = validateEmailOrPhone();
    const isPasswordValid = validatePassword();

    if (!isEmailOrPhoneValid || !isPasswordValid) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate login API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo purposes, accept any valid credentials
      toast.success('Login successful! Welcome to RINO Admin 🎉');
      
      // Store login state if remember me is checked
      if (rememberMe) {
        localStorage.setItem('smeadmin_remember', 'true');
        localStorage.setItem('smeadmin_user', emailOrPhone);
      }
      
      // Update authentication state
      login({ emailOrPhone });
      
      // Navigate to admin dashboard
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    toast.success('Password reset link will be sent to your email/phone');
    // In a real app, this would open a forgot password modal or navigate to forgot password page
  };

  return (
    <div className="min-h-screen page-container flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Orbs */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-primary-400/30 to-blue-400/30 rounded-full blur-xl animate-bounce" style={{ animationDelay: "0s", animationDuration: "3s" }}></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-gradient-to-r from-emerald-400/40 to-primary-400/40 rounded-full blur-lg animate-pulse" style={{ animationDelay: "1s" }}></div>
        <div className="absolute bottom-32 left-40 w-40 h-40 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-2xl animate-ping" style={{ animationDelay: "2s", animationDuration: "4s" }}></div>
        
        {/* Geometric Shapes */}
        <div className="absolute top-1/4 right-1/4 w-16 h-16 border-2 border-primary-400/30 rotate-45 animate-spin" style={{ animationDuration: "8s" }}></div>
        <div className="absolute bottom-1/4 left-1/4 w-12 h-12 bg-gradient-to-br from-primary-500/20 to-transparent rounded-full animate-pulse"></div>
        
        {/* Particle Effects */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-primary-400/60 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            ></div>
          ))}
        </div>
        
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/10 via-transparent to-purple-900/10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/5 to-transparent"></div>
      </div>

      <div className="w-full max-w-6xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side - Spectacular Header */}
          <div className="text-center lg:text-left">
            {/* Floating Icon with Multiple Layers */}
            <div className="relative mx-auto lg:mx-0 w-32 h-32 mb-8">
              {/* Outer Glow Ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-400/30 to-purple-400/30 animate-pulse"></div>
              {/* Middle Ring */}
              <div className="absolute inset-2 rounded-full bg-gradient-to-r from-primary-500/50 to-purple-500/50 animate-spin" style={{ animationDuration: "8s" }}></div>
              {/* Inner Icon Container */}
              <div className="absolute inset-4 rounded-full bg-gradient-to-br from-primary-500 via-primary-600 to-purple-600 flex items-center justify-center shadow-2xl">
                <SparklesIcon className="w-12 h-12 text-white drop-shadow-lg" />
              </div>
              {/* Floating Particles */}
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-emerald-400 rounded-full animate-bounce shadow-lg"></div>
              <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
              <div className="absolute top-1/2 -right-3 w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
            </div>

            {/* Animated Title */}
            <div className="relative">
              <h1 className="text-5xl font-black bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent mb-4 tracking-tight">
                Admin
                <span className="block bg-gradient-to-r from-primary-600 via-primary-500 to-primary-600 bg-clip-text text-transparent animate-pulse">
                  Portal 🔐
                </span>
              </h1>
              {/* Underline Animation */}
              <div className="mx-auto lg:mx-0 w-24 h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent rounded-full animate-pulse"></div>
            </div>
            
            <p className="text-gray-600 text-lg font-medium mt-6 max-w-md mx-auto lg:mx-0 leading-relaxed">
              Sign in to your 
              <span className="text-primary-600 font-semibold"> RINO Admin</span> dashboard and manage your business operations
            </p>
          </div>

          {/* Right Side - Spectacular Form */}
          <div className="w-full max-w-lg mx-auto lg:mx-0">

            {/* Spectacular Login Form */}
            <div className="relative">
              {/* Form Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary-500/20 via-purple-500/20 to-primary-500/20 rounded-3xl blur-lg animate-pulse"></div>
              
              {/* Main Form Card */}
              <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 animate-scaleIn">
                {/* Form Header Decoration */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-16 h-8 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full shadow-lg"></div>
                </div>

                {/* Admin Login Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email/Phone Input */}
                  <div className="space-y-2">
                    <label htmlFor="emailOrPhone" className="block text-sm font-semibold text-gray-700">
                      Email or Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="emailOrPhone"
                        type="text"
                        value={emailOrPhone}
                        onChange={(e) => {
                          setEmailOrPhone(e.target.value);
                          if (emailOrPhoneError) setEmailOrPhoneError('');
                        }}
                        onBlur={validateEmailOrPhone}
                        placeholder="admin@example.com or +255123456789"
                        className={`input-modern pl-10 text-lg ${
                          emailOrPhoneError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''
                        }`}
                        disabled={isLoading}
                      />
                    </div>
                    {emailOrPhoneError ? (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {emailOrPhoneError}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500">
                        Enter your email address or phone number
                      </p>
                    )}
                  </div>

                  {/* Password Input */}
                  <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <LockClosedIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (passwordError) setPasswordError('');
                        }}
                        onBlur={validatePassword}
                        placeholder="Enter your password"
                        className={`input-modern pl-10 pr-10 text-lg ${
                          passwordError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''
                        }`}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                    {passwordError ? (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {passwordError}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500">
                        Password must be at least 6 characters
                      </p>
                    )}
                  </div>

                  {/* Remember Me and Forgot Password */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                        Remember me
                      </label>
                    </div>

                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full btn-primary py-4 text-lg font-semibold relative overflow-hidden group"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      {isLoading ? (
                        <>
                          <div className="loading-spinner w-5 h-5"></div>
                          <span>Signing in...</span>
                        </>
                      ) : (
                        <>
                          <span>Sign In</span>
                          <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        </>
                      )}
                    </div>
                    {!isLoading && (
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    )}
                  </button>
                </form>

                {/* Additional Info */}
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-500">
                    By signing in, you agree to our{' '}
                    <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
                      Privacy Policy
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
          <p className="text-gray-500 text-sm">
            Need help?{' '}
            <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
