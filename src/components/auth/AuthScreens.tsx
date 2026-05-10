import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { Lock, Phone, User as UserIcon, LogIn } from 'lucide-react';

export default function AuthScreens() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const { login, signup } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mobile.length < 10) {
      setError('Enter valid mobile number');
      return;
    }

    if (passcode.length !== 4) {
      setError('Passcode must be 4 digits');
      return;
    }

    if (isLogin) {
      if (!login(mobile, passcode)) {
        setError('Invalid mobile or passcode');
      }
    } else {
      if (!name) {
        setError('Name is required');
        return;
      }
      if (!signup(name, mobile, passcode)) {
        setError('Mobile number already registered');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 rounded-[3rem] glass space-y-8"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-indigo-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-indigo-500/30">
            <LogIn size={32} />
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-2">Roy Study</h1>
          <p className="opacity-50 font-medium">Your focused peak performance awaits.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={20} />
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-14 pl-12 pr-4 rounded-2xl glass focus:ring-2 ring-indigo-500 outline-none transition-all"
              />
            </div>
          )}
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={20} />
            <input
              type="tel"
              placeholder="Mobile Number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full h-14 pl-12 pr-4 rounded-2xl glass focus:ring-2 ring-indigo-500 outline-none transition-all"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={20} />
            <input
              type="password"
              maxLength={4}
              placeholder="4-Digit Passcode"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full h-14 pl-12 pr-4 rounded-2xl glass focus:ring-2 ring-indigo-500 outline-none transition-all"
            />
          </div>

          {error && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-sm text-center font-medium"
            >
              {error}
            </motion.p>
          )}

          <button className="w-full h-14 bg-indigo-500 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all">
            {isLogin ? 'Login' : 'Create Account'}
          </button>
        </form>

        <div className="text-center space-x-2 text-sm">
          <span className="opacity-50">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
          </span>
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-indigo-500 font-bold hover:underline"
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
