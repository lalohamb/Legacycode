import React from 'react';
import { Check } from 'lucide-react';
import Button from './Button';

const Pricing: React.FC = () => {
  return (
    <div className="pt-32 pb-20 bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600">
            Choose the plan that best fits your legacy preservation needs
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <PricingCard
            title="Personal"
            price="9.99"
            description="Perfect for individual legacy preservation"
            features={[
              "5 Active Capsules",
              "1GB Storage",
              "Basic Encryption",
              "Email Support",
              "1 Year Retention"
            ]}
            buttonVariant="outline"
          />
          
          <PricingCard
            title="Family"
            price="24.99"
            description="Ideal for preserving family histories"
            features={[
              "25 Active Capsules",
              "10GB Storage",
              "Advanced Encryption",
              "Priority Support",
              "5 Year Retention",
              "Family Sharing",
              "Video Messages"
            ]}
            buttonVariant="primary"
            highlighted={true}
          />
          
          <PricingCard
            title="Legacy"
            price="49.99"
            description="For comprehensive legacy planning"
            features={[
              "Unlimited Capsules",
              "50GB Storage",
              "Military-Grade Encryption",
              "24/7 Support",
              "Lifetime Retention",
              "Extended Family Sharing",
              "Priority Processing",
              "Custom Access Rules"
            ]}
            buttonVariant="outline"
          />
        </div>

        <div className="mt-20 max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <FAQ
                question="What happens if I exceed my storage limit?"
                answer="You'll receive a notification when you're approaching your limit. You can either upgrade your plan or manage your existing content."
              />
              <FAQ
                question="Can I change plans later?"
                answer="Yes! You can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle."
              />
              <FAQ
                question="Is there a free trial?"
                answer="Yes, all plans come with a 30-day free trial. No credit card required to start."
              />
              <FAQ
                question="What payment methods do you accept?"
                answer="We accept all major credit cards, PayPal, and select cryptocurrency payments."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PricingCard: React.FC<{
  title: string;
  price: string;
  description: string;
  features: string[];
  buttonVariant: 'primary' | 'outline';
  highlighted?: boolean;
}> = ({ title, price, description, features, buttonVariant, highlighted = false }) => {
  return (
    <div className={`rounded-xl p-8 transition-all duration-300 ${
      highlighted 
        ? 'bg-gradient-to-b from-blue-600 to-purple-600 text-white transform hover:-translate-y-1'
        : 'bg-white border border-gray-100 hover:border-blue-200 hover:shadow-lg'
    }`}>
      <h3 className={`text-xl font-semibold mb-2 ${highlighted ? 'text-white' : 'text-gray-900'}`}>
        {title}
      </h3>
      <div className="flex items-baseline mb-4">
        <span className={`text-4xl font-bold ${highlighted ? 'text-white' : 'text-gray-900'}`}>
          ${price}
        </span>
        <span className={`ml-2 ${highlighted ? 'text-blue-100' : 'text-gray-600'}`}>
          /month
        </span>
      </div>
      <p className={`mb-6 ${highlighted ? 'text-blue-100' : 'text-gray-600'}`}>
        {description}
      </p>
      <Button
        variant={buttonVariant}
        size="lg"
        className="w-full mb-8"
      >
        Get Started
      </Button>
      <ul className="space-y-4">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <Check className={`h-5 w-5 mr-3 ${
              highlighted ? 'text-blue-200' : 'text-blue-500'
            }`} />
            <span className={highlighted ? 'text-blue-100' : 'text-gray-600'}>
              {feature}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const FAQ: React.FC<{
  question: string;
  answer: string;
}> = ({ question, answer }) => {
  return (
    <div>
      <h4 className="font-semibold text-gray-900 mb-2">{question}</h4>
      <p className="text-gray-600">{answer}</p>
    </div>
  );
};

export default Pricing;