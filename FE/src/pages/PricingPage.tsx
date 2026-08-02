import React, { useState } from 'react';
import { Check, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import Button from '../components/ui/Button';
import Card, { CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';

interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonVariant: 'primary' | 'outline';
  highlighted: boolean;
  badge?: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

const tiers: PricingTier[] = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Perfect for small businesses just getting started with hiring.',
    features: [
      'Post up to 2 jobs per month',
      'Basic applicant tracking',
      'Email notifications',
      'Standard job listing visibility',
      'Community support',
    ],
    buttonText: 'Get Started',
    buttonVariant: 'outline',
    highlighted: false,
  },
  {
    name: 'Professional',
    price: '$99',
    period: '/month',
    description: 'Ideal for growing companies with regular hiring needs.',
    features: [
      'Post up to 25 jobs per month',
      'Advanced applicant tracking',
      'Email & SMS notifications',
      'Featured job listings',
      'Basic analytics & reporting',
      'Resume database access',
      'Priority email support',
      'Company profile page',
    ],
    buttonText: 'Get Started',
    buttonVariant: 'primary',
    highlighted: true,
    badge: 'Most Popular',
  },
  {
    name: 'Enterprise',
    price: '$299',
    period: '/month',
    description: 'For large organizations with high-volume recruitment needs.',
    features: [
      'Unlimited job postings',
      'Premium applicant tracking system',
      'Multi-channel notifications',
      'Premium job listing placement',
      'Advanced analytics & reporting',
      'Full resume database access',
      'Dedicated account manager',
      'Custom company branding',
      'API access & integrations',
      'Bulk job posting tools',
    ],
    buttonText: 'Contact Sales',
    buttonVariant: 'outline',
    highlighted: false,
  },
];

const faqs: FAQItem[] = [
  {
    question: 'Can I switch plans at any time?',
    answer:
      'Yes, you can upgrade or downgrade your plan at any time. When upgrading, the new pricing takes effect immediately with prorated billing. When downgrading, the change takes effect at the start of your next billing cycle.',
  },
  {
    question: 'Is there a free trial for paid plans?',
    answer:
      'Yes, both the Professional and Enterprise plans come with a 14-day free trial. No credit card is required to start your trial. You can explore all features before committing to a subscription.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for Enterprise plans. All payments are processed securely through our payment provider.',
  },
  {
    question: 'Can I cancel my subscription?',
    answer:
      'Absolutely. You can cancel your subscription at any time from your account settings. Your access will continue until the end of the current billing period. There are no cancellation fees.',
  },
  {
    question: 'Do you offer discounts for annual billing?',
    answer:
      'Yes, we offer a 20% discount when you choose annual billing. This means the Professional plan is $79/month and the Enterprise plan is $239/month when billed annually.',
  },
  {
    question: 'What happens to my job postings if I downgrade?',
    answer:
      'Active job postings will remain live until they expire or are filled. However, you will not be able to create new postings beyond your new plan limit until existing postings close.',
  },
];

const PricingPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="bg-surface-50 min-h-screen">
      {/* Header */}
      <div className="bg-purple-700 py-12">
        <div className="container-default text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-purple-100 max-w-2xl mx-auto">
            Choose the plan that best fits your hiring needs. All plans include access to our platform and qualified candidates.
          </p>
        </div>
      </div>

      <div className="container-default py-8 md:py-12">
        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className={`h-full flex flex-col ${
                tier.highlighted
                  ? 'ring-2 ring-purple-500 shadow-xl relative'
                  : ''
              }`}
            >
              {tier.badge && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge variant="secondary" size="lg">
                    {tier.badge}
                  </Badge>
                </div>
              )}
              <CardContent className="flex flex-col h-full pt-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-surface-900 mb-2">{tier.name}</h3>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-surface-900">{tier.price}</span>
                    <span className="text-surface-500 ml-1">{tier.period}</span>
                  </div>
                  <p className="text-sm text-surface-500 mt-2">{tier.description}</p>
                </div>

                <ul className="space-y-3 mb-8 flex-grow">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-sm text-surface-700">
                      <Check
                        size={16}
                        className={`mr-2 mt-0.5 flex-shrink-0 ${
                          tier.highlighted ? 'text-purple-500' : 'text-emerald-500'
                        }`}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  variant={tier.buttonVariant}
                  fullWidth
                  size="lg"
                  className={
                    tier.highlighted
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : ''
                  }
                >
                  {tier.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-surface-900 text-center mb-8">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left"
                >
                  <span className="font-medium text-surface-900 pr-4">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp size={20} className="text-surface-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown size={20} className="text-surface-500 flex-shrink-0" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4">
                    <p className="text-sm text-surface-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <Card className="bg-purple-50 border border-purple-200">
              <CardContent className="py-8">
                <HelpCircle className="h-10 w-10 text-purple-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-surface-900 mb-2">
                  Still have questions?
                </h3>
                <p className="text-surface-600 mb-4">
                  Our team is here to help you find the right plan for your organization.
                </p>
                <Button variant="outline">Contact Sales</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
