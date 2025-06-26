import React from 'react';
import { Shield, Lock, Key, FileCheck, UserCheck, Server } from 'lucide-react';

const Security: React.FC = () => {
  return (
    <div className="pt-32 pb-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="inline-block p-4 bg-blue-50 rounded-full mb-6">
            <Shield className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Enterprise-Grade Security for Your Legacy
          </h1>
          <p className="text-xl text-gray-600">
            Your memories and wisdom deserve the highest level of protection. Our multi-layered security approach ensures your legacy remains private and secure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <SecurityFeature
            icon={<Lock className="h-8 w-8 text-blue-600" />}
            title="End-to-End Encryption"
            description="All capsule contents are encrypted using AES-256 encryption before being stored. Only authorized recipients can decrypt and access the contents."
          />
          <SecurityFeature
            icon={<Key className="h-8 w-8 text-blue-600" />}
            title="Multi-Factor Authentication"
            description="Access to capsules can be protected by multiple authentication factors, including biometrics, time-based OTP, and hardware security keys."
          />
          <SecurityFeature
            icon={<Server className="h-8 w-8 text-blue-600" />}
            title="Redundant Storage"
            description="Your capsules are automatically replicated across multiple secure data centers, ensuring 99.999% durability and availability."
          />
          <SecurityFeature
            icon={<FileCheck className="h-8 w-8 text-blue-600" />}
            title="Content Integrity"
            description="Digital signatures and blockchain technology ensure your capsule contents remain unaltered from the moment of creation."
          />
        </div>

        <div className="bg-gray-900 text-white rounded-2xl p-8 md:p-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 text-center">Our Security Certifications</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <Certification label="SOC 2 Type II" />
              <Certification label="ISO 27001" />
              <Certification label="GDPR Compliant" />
              <Certification label="HIPAA Compliant" />
            </div>
          </div>
        </div>

        <div className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Security Best Practices</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <BestPractice
              title="Regular Security Audits"
              description="Our systems undergo regular penetration testing and security audits by independent third-party firms."
            />
            <BestPractice
              title="Zero Knowledge Architecture"
              description="We cannot access your capsule contents - only you and your designated recipients have the decryption keys."
            />
            <BestPractice
              title="Secure Development Lifecycle"
              description="All code changes go through rigorous security review and automated vulnerability scanning before deployment."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const SecurityFeature: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ icon, title, description }) => {
  return (
    <div className="bg-white rounded-xl p-8 border border-gray-100 hover:shadow-lg transition-all duration-300">
      <div className="bg-blue-50 rounded-lg p-3 inline-block mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
};

const Certification: React.FC<{
  label: string;
}> = ({ label }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-4 text-center">
      <Shield className="h-6 w-6 mx-auto mb-2 text-blue-400" />
      <div className="text-sm font-medium text-gray-300">{label}</div>
    </div>
  );
};

const BestPractice: React.FC<{
  title: string;
  description: string;
}> = ({ title, description }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <div className="flex items-start">
        <div className="bg-blue-100 rounded-full p-2 mr-4">
          <Shield className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">{title}</h4>
          <p className="text-gray-600">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default Security;