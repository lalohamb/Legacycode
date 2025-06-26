import React from 'react';
import { Key, FileQuestion, DollarSign, QrCode, MapPin, Wallet, BrainCircuit, Calendar, ArrowRight, Heart, Users, Clock } from 'lucide-react';
import Button from './Button';
import { useNavigate } from 'react-router-dom';

const CapsuleTypes: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="pt-32 pb-20 bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Types of Legacy Capsules
          </h1>
          <p className="text-xl text-gray-600">
            Each unlock method tells a different story. Choose the one that best preserves your legacy and ensures it reaches the right person at the right time.
          </p>
        </div>

        <div className="space-y-16">
          <CapsuleTypeCard
            icon={<Key className="h-8 w-8 text-blue-600" />}
            title="Secret Passphrase Capsule"
            subtitle="For intimate family secrets and personal wisdom"
            story={{
              title: "The Family Recipe",
              content: "Maria's grandmother always made the most incredible tamales every Christmas. Before she passed, she created a passphrase-protected capsule containing not just the secret recipe, but a video of herself making them, sharing stories about each ingredient's significance to their family history. The passphrase? 'AbuelasSazon1952' - combining 'Grandma's seasoning' with the year she first came to America."
            }}
            features={[
              "Perfect for deeply personal content",
              "Simple yet secure protection",
              "Ideal for family traditions and recipes",
              "Can be shared verbally or written down"
            ]}
            useCase="Best for: Family recipes, personal advice, intimate memories that should only be accessed by specific loved ones."
          />

          <CapsuleTypeCard
            icon={<FileQuestion className="h-8 w-8 text-purple-600" />}
            title="Question & Answer Capsule"
            subtitle="Ensuring only family members can access"
            story={{
              title: "The Inheritance Letter",
              content: "Robert created a capsule for his children containing important financial documents and a heartfelt letter about his life lessons. To unlock it, they need to answer: his full name, his date of birth, and his mother's maiden name. This ensures only his children, who would naturally know these details, can access his final words and important documents - even if they're estranged or haven't spoken in years."
            }}
            features={[
              "Multi-factor family verification",
              "Natural knowledge only family would have",
              "Prevents unauthorized access",
              "Works even with distant relatives"
            ]}
            useCase="Best for: Inheritance instructions, family history, important documents that should only be accessed by blood relatives."
          />

          <CapsuleTypeCard
            icon={<DollarSign className="h-8 w-8 text-green-600" />}
            title="Payment-Gated Capsule"
            subtitle="For valuable knowledge and premium content"
            story={{
              title: "The Master Craftsman's Techniques",
              content: "Master woodworker James spent 40 years perfecting his craft. He created a payment-gated capsule containing detailed video tutorials of his most advanced techniques, worth thousands in training value. By requiring a 0.1 ETH payment to unlock, he ensures only serious craftspeople who truly value the knowledge will access it, while also providing ongoing income for his family."
            }}
            features={[
              "Monetize valuable knowledge",
              "Ensure serious intent from recipients",
              "Create ongoing income streams",
              "Filter out casual browsers"
            ]}
            useCase="Best for: Professional knowledge, valuable tutorials, business secrets, or content that should only be accessed by those willing to invest."
          />

          <CapsuleTypeCard
            icon={<QrCode className="h-8 w-8 text-indigo-600" />}
            title="QR Code Capsule"
            subtitle="Physical tokens for digital memories"
            story={{
              title: "The Wedding Time Capsule",
              content: "Sarah and David created QR code capsules for their wedding guests. Each table received a beautifully designed card with a QR code. When scanned, it revealed a personalized video message from the couple to that specific group of friends, sharing memories and inside jokes. The physical cards became keepsakes, while the digital content preserved their relationships forever."
            }}
            features={[
              "Bridge physical and digital worlds",
              "Beautiful keepsake potential",
              "Easy sharing at events",
              "Memorable presentation method"
            ]}
            useCase="Best for: Wedding messages, event memories, gifts that combine physical and digital elements, or content tied to specific locations."
          />

          <CapsuleTypeCard
            icon={<MapPin className="h-8 w-8 text-red-600" />}
            title="Location-Based Capsule"
            subtitle="Memories tied to special places"
            story={{
              title: "The Childhood Home",
              content: "Before selling the family home where three generations lived, Elena created a location-based capsule that can only be unlocked when someone is physically at that address. It contains a virtual tour of the house as it was, stories about each room, and messages from family members sharing their favorite memories. Future owners or visiting family members can access this rich history simply by being there."
            }}
            features={[
              "Connect memories to physical places",
              "Create location-based experiences",
              "Preserve historical context",
              "Encourage meaningful visits"
            ]}
            useCase="Best for: Childhood homes, special locations, travel memories, or content that should only be accessed at meaningful places."
          />

          <CapsuleTypeCard
            icon={<Wallet className="h-8 w-8 text-orange-600" />}
            title="Token-Gated Capsule"
            subtitle="Exclusive access for community members"
            story={{
              title: "The Artist's Collector Circle",
              content: "Digital artist Maya created an exclusive capsule for holders of her NFT collection. Only those who own one of her 'Dreamscape' NFTs can unlock a capsule containing her creative process videos, unreleased artwork, and personal stories about her artistic journey. This creates ongoing value for her collectors and builds a deeper connection with her most dedicated fans."
            }}
            features={[
              "Reward loyal community members",
              "Create exclusive experiences",
              "Add utility to NFT collections",
              "Build stronger fan relationships"
            ]}
            useCase="Best for: Artist communities, exclusive content for supporters, NFT utility, or content for specific group members."
          />

          <CapsuleTypeCard
            icon={<BrainCircuit className="h-8 w-8 text-cyan-600" />}
            title="Quiz-Protected Capsule"
            subtitle="Test knowledge before revealing wisdom"
            story={{
              title: "The Professor's Final Lesson",
              content: "Professor Williams, after 30 years of teaching philosophy, created a quiz-protected capsule containing his most profound insights about life and learning. Students can only unlock it by correctly answering a question about one of his core teachings: 'What is the relationship between wisdom and uncertainty?' Only those who truly understood his lessons can access his final, most personal philosophical reflections."
            }}
            features={[
              "Ensure understanding before access",
              "Educational and meaningful",
              "Test true comprehension",
              "Create learning moments"
            ]}
            useCase="Best for: Educational content, testing understanding of important concepts, or ensuring recipients have learned key lessons."
          />

          <CapsuleTypeCard
            icon={<Calendar className="h-8 w-8 text-pink-600" />}
            title="Time-Released Capsule"
            subtitle="Messages for future milestones"
            story={{
              title: "Letters to My Future Daughter",
              content: "New mother Lisa created a series of time-released capsules for her baby daughter: one for her 16th birthday with advice about growing up, one for her 18th birthday with college guidance, one for her wedding day with marriage wisdom, and one for when she becomes a mother herself. Each capsule will automatically unlock on the specified date, ensuring her love and guidance reaches her daughter at exactly the right moments in life."
            }}
            features={[
              "Perfect timing for life events",
              "Automatic delivery system",
              "Plan for future milestones",
              "Surprise and delight recipients"
            ]}
            useCase="Best for: Birthday messages, graduation advice, anniversary surprises, or any content meant for specific future dates."
          />
        </div>

        {/* Call to Action */}
        <div className="mt-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-6">Ready to Create Your Legacy?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Choose the unlock method that best fits your story and start preserving your wisdom for future generations.
          </p>
          <Button
            variant="secondary"
            size="lg"
            icon={true}
            onClick={() => navigate('/create')}
            className="bg-white text-blue-600 hover:bg-gray-100"
          >
            Start Creating Your Capsule
          </Button>
        </div>

        {/* Statistics */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <StatCard icon={<Heart />} number="10,000+" label="Capsules Created" />
          <StatCard icon={<Users />} number="25,000+" label="Lives Touched" />
          <StatCard icon={<Clock />} number="50+" label="Years Preserved" />
          <StatCard icon={<Key />} number="8" label="Unlock Methods" />
        </div>
      </div>
    </div>
  );
};

const CapsuleTypeCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  story: {
    title: string;
    content: string;
  };
  features: string[];
  useCase: string;
}> = ({ icon, title, subtitle, story, features, useCase }) => {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Left Column - Info */}
        <div>
          <div className="flex items-center mb-4">
            <div className="bg-gray-50 rounded-lg p-3 mr-4">
              {icon}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
              <p className="text-gray-600">{subtitle}</p>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Key Features:</h4>
            <ul className="space-y-2">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <ArrowRight className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600 text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-blue-800 text-sm font-medium">{useCase}</p>
          </div>
        </div>

        {/* Right Column - Story */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-3">
            Real-World Example: {story.title}
          </h4>
          <p className="text-gray-700 leading-relaxed text-sm">
            {story.content}
          </p>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{
  icon: React.ReactNode;
  number: string;
  label: string;
}> = ({ icon, number, label }) => {
  return (
    <div className="bg-white rounded-lg p-6 border border-gray-100">
      <div className="text-blue-600 mb-2 flex justify-center">
        {React.cloneElement(icon as React.ReactElement, { className: 'h-6 w-6' })}
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{number}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
};

export default CapsuleTypes;