import { Crown, Check, X, Clock, Sparkles, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';

const features = {
  free: [
    { name:"2 Playlist ", included: true },
    {  name:"advertizement ",included: true },
    {  name:"Premimum features",included: false },
    {  name:"Not allow to create playlist other than learning", included: true },
    {  name :"Not allow to do progess report ",included: false },
  ],
  monthly: [
    {  included: true },
    {  included: true },
    { included: true },
    { included: true },
    {  included: true },
    {  included: true },
    {  included: true },
    { included: true },
    { included: false },
  ],
  yearly: [
    { name: "Unlimited playlist", included: true },
    { name: "No Advertisement", included: true },
    { name: "All Premium Features", included: true },
    { name: "Create any type of playlist and track", included: true },
    { name: "Detailed Progress Reports", included: true },
    { name: "Priority Support", included: true },
    { name: "Early Access to New Features", included: true },
    { name: "Custom Learning Paths", included: true },
    { name: "Advanced Analytics", included: true },
  ],
  referral: [
    { name: "All Yearly Plan Features", included: true },
    { name: "50% Off on Yearly Plan", included: true },
    { name: "Limited Time Offer - 24 Hours Only", included: true },
    { name: "One-time use only", included: true },
    { name: "Non-transferable", included: true },
  ],
};

const plans = [
  {
    name: 'Free',
    price: '₹0',
    description: 'Perfect for getting started',
    features: features.free,
    buttonText: 'Current Plan',
    buttonVariant: 'outline' as const,
  },
  {
    name: 'Monthly',
    price: '₹9',
    description: 'Best for flexible learning',
    features: features.monthly,
    buttonText: 'Upgrade Now',
    buttonVariant: 'default' as const,
  },
  {
    name: 'Yearly',
    price: '₹81',
    originalPrice: '₹108',
    description: 'Best value for dedicated learners',
    features: features.yearly,
    buttonText: 'Upgrade Now',
    buttonVariant: 'default' as const,
    popular: true,
  },
  {
    name: 'Refer & Save',
    price: '₹54',
    originalPrice: '₹108',
    description: 'Refer 3 friends and get 50% off yearly plan',
    features: features.referral,
    buttonText: 'Refer Friends',
    buttonVariant: 'default' as const,
    referral: true,
  },
];

export default function Premium() {
  const [timeLeft, setTimeLeft] = useState(() => {
    const storedEndTime = localStorage.getItem('offerEndTime');
    if (storedEndTime) {
      const endTime = parseInt(storedEndTime);
      const now = Date.now();
      const timeRemaining = Math.max(0, endTime - now);
      
      if (timeRemaining <= 0) {
        localStorage.removeItem('offerEndTime');
        return { hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        hours: Math.floor(timeRemaining / (1000 * 60 * 60)),
        minutes: Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((timeRemaining % (1000 * 60)) / 1000)
      };
    }

    const endTime = Date.now() + 24 * 60 * 60 * 1000;
    localStorage.setItem('offerEndTime', endTime.toString());
    return { hours: 24, minutes: 0, seconds: 0 };
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const storedEndTime = localStorage.getItem('offerEndTime');
        if (!storedEndTime) return { hours: 0, minutes: 0, seconds: 0 };

        const endTime = parseInt(storedEndTime);
        const now = Date.now();
        const timeRemaining = Math.max(0, endTime - now);

        if (timeRemaining <= 0) {
          localStorage.removeItem('offerEndTime');
          return { hours: 0, minutes: 0, seconds: 0 };
        }

        return {
          hours: Math.floor(timeRemaining / (1000 * 60 * 60)),
          minutes: Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((timeRemaining % (1000 * 60)) / 1000)
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleLinkedInShare = () => {
    const shareUrl = 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(window.location.href);
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-amber-600">
            Upgrade Your Learning Experience
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Choose the perfect plan for your learning journey and unlock your full potential
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan) => (
            <Card 
              key={plan.name} 
              className={`relative transition-all duration-300 hover:scale-105 ${
                plan.popular ? 'border-yellow-500 shadow-lg shadow-yellow-100 dark:shadow-yellow-900/20' : ''
              } ${plan.referral ? 'border-amber-500 shadow-lg shadow-amber-100 dark:shadow-amber-900/20' : ''} 
              hover:shadow-xl dark:bg-gray-800 dark:border-gray-700`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1 shadow-md">
                    <Crown className="w-4 h-4" />
                    Most Popular
                  </div>
                </div>
              )}
              {plan.referral && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1 shadow-md">
                    <Sparkles className="w-4 h-4" />
                    Special Offer
                  </div>
                </div>
              )}
              <CardHeader className="space-y-4">
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">{plan.name}</CardTitle>
                <div className="mt-4">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-amber-600">
                      {plan.price}
                    </span>
                    {plan.price !== '₹0' && (
                      <span className="text-gray-500 dark:text-gray-400 ml-1">
                        {plan.name === 'Yearly' || plan.name === 'Refer & Save' ? '/year' : '/month'}
                      </span>
                    )}
                  </div>
                  {plan.originalPrice && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-gray-500 dark:text-gray-400 line-through">{plan.originalPrice}/year</span>
                      <span className="text-sm font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">
                        {plan.referral ? 'Save 50%' : 'Save 25%'}
                      </span>
                    </div>
                  )}
                </div>
                <CardDescription className="text-gray-600 dark:text-gray-300">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-amber-500 dark:text-amber-400 flex-shrink-0" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                      )}
                      <span className={`${feature.included ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="flex flex-col">
                <Button
                  variant={plan.buttonVariant}
                  className={`w-full ${
                    plan.popular ? 'bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700' :
                    plan.referral ? 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700' :
                    ''
                  }`}
                  disabled={plan.name === 'Free'}
                >
                  {plan.buttonText}
                </Button>
                {plan.referral && (
                  <>
                    <div className="w-full mt-4 text-center">
                      <div className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 shadow-md">
                        <Clock className="w-4 h-4" />
                        <span>Offer ends in: {`${String(timeLeft.hours).padStart(2, '0')}:${String(timeLeft.minutes).padStart(2, '0')}:${String(timeLeft.seconds).padStart(2, '0')}`}</span>
                      </div>
                    </div>
                    <div className="w-full mt-4">
                      <Button
                        onClick={handleLinkedInShare}
                        variant="outline"
                        className="w-full border-amber-500 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 hover:text-amber-700 dark:hover:text-amber-300 flex items-center justify-center gap-2"
                      >
                        <Linkedin className="w-4 h-4" />
                        Share on LinkedIn
                      </Button>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                        Share with your network and get 50% off on yearly plan
                      </p>
                    </div>
                  </>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 