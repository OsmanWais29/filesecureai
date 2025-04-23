
import React from 'react';
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { CheckIcon } from 'lucide-react';

export default function PricingPage() {
  const pricingPlans = [
    {
      name: 'Basic',
      price: '$9.99',
      description: 'For individuals and small teams',
      features: [
        'Store up to 5GB of documents',
        'Basic document analytics',
        'Email support',
        '5 users included',
      ],
      cta: 'Get Started'
    },
    {
      name: 'Pro',
      price: '$19.99',
      description: 'For growing businesses',
      features: [
        'Store up to 20GB of documents',
        'Advanced document analytics',
        'Priority support',
        '10 users included',
        'Custom document templates'
      ],
      cta: 'Upgrade to Pro',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Contact Us',
      description: 'For large organizations',
      features: [
        'Unlimited storage',
        'Enterprise-grade security',
        'Dedicated account manager',
        'Unlimited users',
        'Custom integrations',
        'Advanced permissions'
      ],
      cta: 'Contact Sales'
    }
  ];

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">Choose the Right Plan for Your Needs</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our pricing plans are designed to meet your needs, whether you're an individual, a small team, or a large organization.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricingPlans.map((plan) => (
            <div 
              key={plan.name} 
              className={`border rounded-lg overflow-hidden ${plan.popular ? 'border-primary shadow-md' : 'border-border'}`}
            >
              {plan.popular && (
                <div className="bg-primary text-primary-foreground text-center py-2 text-sm font-medium">
                  Most Popular
                </div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="text-3xl font-bold mb-2">{plan.price}</div>
                <p className="text-muted-foreground mb-6">{plan.description}</p>
                
                <ul className="mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start mb-2">
                      <CheckIcon className="h-5 w-5 text-primary flex-shrink-0 mr-2" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button className="w-full">{plan.cta}</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
