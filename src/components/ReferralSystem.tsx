'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const ReferralSystem = () => {
  const [referralCode, setReferralCode] = React.useState('');
  const [copied, setCopied] = React.useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    toast.success('Referral code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitReferral = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement referral submission logic
    toast.success('Referral submitted successfully!');
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Referral System</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Your Referral Code</h3>
            <div className="flex gap-2">
              <Input
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                placeholder="Enter referral code"
                className="flex-1"
              />
              <Button onClick={handleCopyCode} variant="outline">
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmitReferral} className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Enter Friend's Code</h3>
              <Input
                placeholder="Enter your friend's referral code"
                className="w-full"
              />
            </div>
            <Button type="submit" className="w-full">
              Submit Referral
            </Button>
          </form>

          <div className="text-sm text-muted-foreground">
            <p>Share your referral code with friends and earn rewards!</p>
            <p>Both you and your friend will receive benefits when they sign up.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReferralSystem; 