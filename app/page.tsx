'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Github, FileText, Download, Shield } from 'lucide-react';
import { WalletInput } from '@/components/ui/wallet-input';

export default function HomePage() {
  const router = useRouter();
  const [address, setAddress] = useState('');

  const handleSubmit = (validAddress: string) => {
    router.push(`/wallet/${validAddress}`);
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] relative overflow-hidden flex flex-col font-sans text-[#111111]">
      {/* Decorative side borders */}
      <div className="absolute left-0 top-0 bottom-0 w-32 border-r border-gray-200/50 bg-white/40 rounded-r-[100px] pointer-events-none hidden lg:block" />
      <div className="absolute right-0 top-0 bottom-0 w-32 border-l border-gray-200/50 bg-white/40 rounded-l-[100px] pointer-events-none hidden lg:block" />

      {/* Moving Background Elements (Framer Motion) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-orange-100/30 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-[10%] right-[20%] w-[600px] h-[600px] bg-gray-200/50 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
        />
      </div>

      {/* Floating Decorative Cards */}
      <motion.div
        className="absolute top-1/4 right-[10%] w-24 h-24 bg-white rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center hidden xl:flex z-0"
        animate={{
          y: [0, -20, 0],
          rotate: [-5, 5, -5],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <Shield className="w-8 h-8 text-gray-300" />
      </motion.div>

      <motion.div
        className="absolute bottom-1/4 right-[15%] w-20 h-20 bg-white rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center hidden xl:flex z-0"
        animate={{
          y: [0, 20, 0],
          rotate: [10, -10, 10],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
      >
        <FileText className="w-6 h-6 text-gray-300" />
      </motion.div>

      {/* Header */}
      <header className="relative z-10 px-6 py-8 flex justify-center">
        <div className="flex items-center gap-6 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 pr-6 border-r border-gray-100">
            <svg className="w-6 h-6" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="100" cy="100" r="90" fill="#111111" />
              <path d="M100 40C66.8629 40 40 66.8629 40 100C40 133.137 66.8629 160 100 160C133.137 160 160 133.137 160 100C160 66.8629 133.137 40 100 40ZM100 140C78.0132 140 60 121.987 60 100C60 78.0132 78.0132 60 100 60C121.987 60 140 78.0132 140 100C140 121.987 121.987 140 100 140Z" fill="white"/>
              <circle cx="100" cy="100" r="25" fill="white"/>
            </svg>
            <span className="font-bold text-lg tracking-tight">Osmoscan</span>
          </div>
          <a href="https://x.com/kingzedox0" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold bg-[#111111] text-white px-5 py-2 rounded-full hover:bg-gray-800 transition-colors">
            Contact me
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pt-10 pb-20">
        <div className="max-w-3xl mx-auto w-full text-center space-y-10">
          
          {/* Hero Typography */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-2"
          >
            <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tight leading-[1.1]">
              <span className="block text-[#111111]">Explore Osmosis.</span>
              <span className="block text-[#FF6B00]">Track your taxes.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-500 mt-6 max-w-xl mx-auto leading-relaxed">
              Quickly view your Osmosis blockchain transactions and export them directly to an Awaken Tax compatible format.
            </p>
          </motion.div>

          {/* Wallet Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-xl mx-auto w-full pt-4"
          >
            <WalletInput
              value={address}
              onChange={setAddress}
              onSubmit={handleSubmit}
              placeholder="Enter your osmo... address"
            />
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 w-full max-w-xs mx-auto sm:max-w-none"
          >
            <button 
              onClick={() => handleSubmit(address)}
              className="w-full sm:w-auto bg-[#FF6B00] text-white px-8 py-3.5 rounded-lg font-semibold hover:bg-[#e66000] transition-colors shadow-sm whitespace-nowrap"
            >
              Search Wallet
            </button>
            <a 
              href="https://github.com/kingzedox/osmoscan" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full sm:w-auto justify-center bg-[#111111] text-white px-8 py-3.5 rounded-lg font-semibold hover:bg-gray-900 transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap"
            >
              <Github className="w-5 h-5" />
              <span>View Source</span>
            </a>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-8 text-center text-sm text-gray-400">
        <p>Compatible with <a href="https://awaken.tax" className="text-gray-900 font-medium hover:underline">Awaken Tax</a> exports.</p>
      </footer>
    </div>
  );
}
