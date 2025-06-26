import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import CreateCapsule from './components/CreateCapsule';
import UnlockRules from './components/UnlockRules';
import FinalizeCapsule from './components/FinalizeCapsule';
import VaultPreview from './components/VaultPreview';
import MyCapsules from './components/MyCapsules';
import Features from './components/Features';
import Security from './components/Security';
import Pricing from './components/Pricing';
import About from './components/About';
import CapsuleTypes from './components/CapsuleTypes';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Routes>
        <Route path="/" element={
          <>
            <Hero />
            <div className="container mx-auto px-4 py-20">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How LegacyCode Works</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12">
                  <StepCard 
                    number="01"
                    title="Create Your Capsule"
                    description="Upload text, images, videos, or documents and organize them into a meaningful collection."
                  />
                  <StepCard 
                    number="02"
                    title="Set Access Conditions"
                    description="Define who can access your capsule and under what circumstances—time, event, or password protection."
                  />
                  <StepCard 
                    number="03"
                    title="Secure with Encryption"
                    description="Your capsule contents are encrypted with state-of-the-art technology, ensuring only authorized access."
                  />
                  <StepCard 
                    number="04"
                    title="Share Access Details"
                    description="Provide your loved ones or future recipients with the necessary information to access your wisdom."
                  />
                </div>
                
                <div className="text-center mt-16">
                  <p className="text-lg text-gray-600 mb-4">Ready to preserve your legacy?</p>
                  <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium py-3 px-8 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg">
                    Get Started Today
                  </button>
                </div>
              </div>
            </div>
          </>
        } />
        <Route path="/create" element={<CreateCapsule />} />
        <Route path="/unlock-rules" element={<UnlockRules />} />
        <Route path="/finalize" element={<FinalizeCapsule />} />
        <Route path="/preview" element={<VaultPreview />} />
        <Route path="/my-capsules" element={<MyCapsules />} />
        <Route path="/features" element={<Features />} />
        <Route path="/security" element={<Security />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/about" element={<About />} />
        <Route path="/capsule-types" element={<CapsuleTypes />} />
      </Routes>
    </div>
  );
}

interface StepCardProps {
  number: string;
  title: string;
  description: string;
}

const StepCard: React.FC<StepCardProps> = ({ number, title, description }) => {
  return (
    <div className="bg-gray-50 rounded-xl p-8 border border-gray-100 hover:border-blue-200 transition-all duration-300 hover:shadow-md">
      <div className="text-sm font-semibold text-purple-600 mb-2">STEP {number}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default App;