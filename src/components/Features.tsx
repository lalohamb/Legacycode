import React from 'react';
import { Shield, Key, Clock, MessageSquare, Video, Share2, Bell, Lock, Fingerprint } from 'lucide-react';
import Button from './Button';
import { useNavigate } from 'react-router-dom';

const Features: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="pt-32 pb-20 bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Preserve Your Legacy with Advanced Features
          </h1>
          <p className="text-xl text-gray-600">
            Every feature is designed to ensure your wisdom and memories are preserved and shared exactly as you intend.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          <FeatureCard
            icon={<MessageSquare className="h-8 w-8 text-blue-500" />}
            title="Rich Content Support"
            description="Share your legacy through text, images, videos, and documents. Express yourself in the format that best tells your story."
          />
          <FeatureCard
            icon={<Clock className="h-8 w-8 text-blue-500" />}
            title="Time-Based Release"
            description="Schedule your capsules to unlock at specific dates or milestones, ensuring your message arrives at the perfect moment."
          />
          <FeatureCard
            icon={<Lock className="h-8 w-8 text-blue-500" />}
            title="Conditional Access"
            description="Set specific conditions for capsule access, from simple passwords to complex multi-factor authentication."
          />
          <FeatureCard
            icon={<Bell className="h-8 w-8 text-blue-500" />}
            title="Smart Notifications"
            description="Recipients get timely alerts when capsules become available or when important deadlines approach."
          />
          <FeatureCard
            icon={<Shield className="h-8 w-8 text-blue-500" />}
            title="Redundant Storage"
            description="Your capsules are automatically backed up across multiple secure locations, ensuring they're never lost."
          />
          <FeatureCard
            icon={<Share2 className="h-8 w-8 text-blue-500" />}
            title="Flexible Sharing"
            description="Choose between private individual access or group sharing options for family histories and shared memories."
          />
        </div>

        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-xl border border-gray-100">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Start Preserving Your Legacy Today
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Join thousands of others who have already secured their legacy for future generations.
              </p>
              <Button
                variant="primary"
                size="lg"
                icon={true}
                onClick={() => navigate('/create')}
              >
                Create Your First Capsule
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-6">
                <Stat number="50k+" label="Active Users" />
                <Stat number="100k+" label="Capsules Created" />
              </div>
              <div className="space-y-6 mt-6">
                <Stat number="99.9%" label="Uptime" />
                <Stat number="24/7" label="Support" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ icon, title, description }) => {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100 hover:border-blue-200 transition-all duration-300 hover:shadow-lg">
      <div className="bg-blue-50 rounded-lg p-3 inline-block mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

const Stat: React.FC<{
  number: string;
  label: string;
}> = ({ number, label }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-6 text-center">
      <div className="text-3xl font-bold text-blue-600 mb-1">{number}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
};

export default Features;