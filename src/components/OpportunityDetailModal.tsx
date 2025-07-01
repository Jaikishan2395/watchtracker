import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  MapPin, 
  Users, 
  DollarSign, 
  Clock, 
  Calendar,
  Lightbulb,
  Star,
  ExternalLink,
  FileText,
  Building2,
  Target,
  User,
  MessageCircle,
  Download
} from 'lucide-react';
import { CoFounderOpportunity } from './PostCoFounderModal';

interface OpportunityDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: CoFounderOpportunity | null;
  onRequestToJoin: (opportunity: CoFounderOpportunity) => void;
}

const OpportunityDetailModal: React.FC<OpportunityDetailModalProps> = ({
  isOpen,
  onClose,
  opportunity,
  onRequestToJoin
}) => {
  if (!opportunity) return null;

  const getStageColor = (stage: string) => {
    switch (stage.toLowerCase()) {
      case 'idea only':
        return 'bg-gray-100 text-gray-800';
      case 'mvp built':
        return 'bg-blue-100 text-blue-800';
      case 'early traction':
        return 'bg-green-100 text-green-800';
      case 'funded':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCommitmentColor = (commitment: string) => {
    switch (commitment.toLowerCase()) {
      case 'full-time':
        return 'bg-red-100 text-red-800';
      case 'part-time':
        return 'bg-orange-100 text-orange-800';
      case 'flexible':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleDownloadPitchDeck = () => {
    if (opportunity.pitchDeck) {
      const url = URL.createObjectURL(opportunity.pitchDeck);
      const a = document.createElement('a');
      a.href = url;
      a.download = opportunity.pitchDeck.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-blue-600" />
            Co-Founder Opportunity Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8 py-6">
          {/* Header Section */}
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-10 h-10 text-white" />
              </div>
              
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {opportunity.startupTitle}
                </h2>
                <p className="text-lg text-gray-600 mb-3">
                  {opportunity.oneLinerPitch}
                </p>
                
                <div className="flex flex-wrap gap-2">
                  <Badge className={getStageColor(opportunity.startupStage)}>
                    {opportunity.startupStage}
                  </Badge>
                  {opportunity.equityOffering > 0 && (
                    <Badge className="bg-green-100 text-green-800">
                      {opportunity.equityOffering}% equity
                    </Badge>
                  )}
                  <Badge className={getCommitmentColor(opportunity.commitmentExpectation)}>
                    {opportunity.commitmentExpectation}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* About the Startup */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              About the Startup
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {opportunity.aboutStartup}
            </p>
          </div>

          {/* Key Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" />
                What They're Looking For
              </h3>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Co-founder Roles:</p>
                  <div className="flex flex-wrap gap-2">
                    {opportunity.lookingFor.map((role) => (
                      <Badge key={role} className="bg-purple-100 text-purple-800">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>

                {opportunity.skillRequirements.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Required Skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {opportunity.skillRequirements.map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Your Role:</p>
                  <div className="flex flex-wrap gap-2">
                    {opportunity.yourRole.map((role) => (
                      <Badge key={role} className="bg-blue-100 text-blue-800">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                Compensation & Commitment
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">Equity:</span>
                  <span>{opportunity.equityOffering}%</span>
                </div>

                {opportunity.salaryOffering && (
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">Salary:</span>
                    <span>{opportunity.salaryOffering}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">Commitment:</span>
                  <span>{opportunity.commitmentExpectation}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">Location:</span>
                  <span>{opportunity.remoteOrLocation || 'Remote'}</span>
                </div>

                {opportunity.preferredStartTime && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">Start Date:</span>
                    <span>{formatDate(opportunity.preferredStartTime)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Founder Information */}
          {opportunity.founderBio && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5 text-yellow-600" />
                About the Founder
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {opportunity.founderBio}
              </p>
            </div>
          )}

          {/* Links and Resources */}
          {(opportunity.startupWebsite || opportunity.linkedinProfile || opportunity.pitchDeck) && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-blue-600" />
                Links & Resources
              </h3>
              
              <div className="flex flex-wrap gap-4">
                {opportunity.startupWebsite && (
                  <Button variant="outline" className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Visit Website
                  </Button>
                )}
                
                {opportunity.linkedinProfile && (
                  <Button variant="outline" className="flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    View LinkedIn
                  </Button>
                )}
                
                {opportunity.pitchDeck && (
                  <Button variant="outline" className="flex items-center gap-2" onClick={handleDownloadPitchDeck}>
                    <Download className="w-4 h-4" />
                    Download Pitch Deck
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Posted Information */}
          <div className="text-sm text-gray-500 border-t border-gray-200 pt-4">
            <p>Posted {opportunity.createdAt ? formatDate(opportunity.createdAt.toISOString()) : 'recently'}</p>
          </div>
        </div>

        <DialogFooter className="flex gap-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            onClick={() => onRequestToJoin(opportunity)}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Request to Join
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OpportunityDetailModal;
