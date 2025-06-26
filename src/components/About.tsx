import React from 'react';
import { Users, Heart, Globe, Award, BookOpen, Coffee } from 'lucide-react';
import Button from './Button';

const About: React.FC = () => {
  return (
    <div className="pt-32 pb-20">
      <div className="container mx-auto px-4">
        {/* Mission Section */}
        <div className="max-w-4xl mx-auto text-center mb-20">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Preserving Wisdom Across Generations
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            At LegacyCode, we believe that every life story, every piece of wisdom, and every cherished memory deserves to be preserved and shared with future generations.
          </p>
          <div className="flex justify-center gap-4">
            <ValueBadge icon={<Users className="h-5 w-5" />} label="10k+ Users" />
            <ValueBadge icon={<Heart className="h-5 w-5" />} label="50k+ Capsules" />
            <ValueBadge icon={<Globe className="h-5 w-5" />} label="Global Reach" />
          </div>
        </div>

        {/* Values Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <ValueCard
            icon={<BookOpen className="h-8 w-8 text-blue-500" />}
            title="Knowledge Preservation"
            description="We're committed to ensuring that valuable life lessons and experiences are never lost to time."
          />
          <ValueCard
            icon={<Award className="h-8 w-8 text-blue-500" />}
            title="Trust & Security"
            description="Your memories deserve the highest level of protection. We employ cutting-edge security to keep your legacy safe."
          />
          <ValueCard
            icon={<Heart className="h-8 w-8 text-blue-500" />}
            title="Emotional Connection"
            description="We create meaningful ways for future generations to connect with their heritage and family wisdom."
          />
        </div>

        {/* Team Section */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-12 mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Meet the Creator</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-8">
            <TeamMember
              name="Edward Hambrick"
              role="Founder & CEO"
              bio="Tech Engineer passionate about preserving family histories"
              imageUrl="../src/img/lalo.png"
            />
          </div>
        </div>

        {/* Story Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">My Story</h2>
          <div className="prose prose-lg mx-auto text-gray-600">
            <p className="mb-6">
              LegacyCode was born from a simple yet powerful idea: that the wisdom and experiences of our loved ones are too precious to be lost to time. As founder, I was inspired to create LegacyCode after attending multi funerals of family elders who only keep family records through polaroid pictures, paper obituraries, food recipies, old leher grandmother and realizing how many untold stories and pieces of wisdom were sucpetable to lost with the generation inheirting these important pieces of fmaily legacies.
            </p>
            <p className="mb-6">
              What started as a personal project to preserve family histories has grown into a global platform trusted by thousands of users to safeguard their most precious memories and life lessons for future generations.
            </p>
            <p>
              Today, we're proud to be at the forefront of Web3 digital legacy preservation, combining cutting-edge technology with a deep understanding of what makes human connections meaningful across generations.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Join Us in Preserving Legacy</h2>
          <p className="text-gray-600 mb-8">
            Be part of our mission to connect generations through shared wisdom
          </p>
          <Button
            variant="primary"
            size="lg"
            icon={true}
            className="inline-flex"
          >
            Start Your Legacy
          </Button>
        </div>
      </div>
    </div>
  );
};

const ValueBadge: React.FC<{
  icon: React.ReactNode;
  label: string;
}> = ({ icon, label }) => {
  return (
    <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full flex items-center">
      {icon}
      <span className="ml-2 font-medium">{label}</span>
    </div>
  );
};

const ValueCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ icon, title, description }) => {
  return (
    <div className="bg-white rounded-xl p-8 border border-gray-100 hover:border-blue-200 transition-all duration-300 hover:shadow-lg">
      <div className="bg-blue-50 rounded-lg p-3 inline-block mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

const TeamMember: React.FC<{
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
}> = ({ name, role, bio, imageUrl }) => {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100 hover:border-blue-200 transition-all duration-300 hover:shadow-lg">
      <img
        src={imageUrl}
        alt={name}
        className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
      />
      <h3 className="text-xl font-semibold text-gray-900 text-center mb-1">{name}</h3>
      <p className="text-blue-600 text-center text-sm mb-3">{role}</p>
      <p className="text-gray-600 text-center text-sm">{bio}</p>
    </div>
  );
};

export default About;