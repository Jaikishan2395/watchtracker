import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  MapPin, 
  Users, 
  DollarSign, 
  Clock, 
  Eye, 
  UserPlus,
  Calendar,
  Lightbulb,
  Star,
  ExternalLink,
  FileText
} from 'lucide-react';
import { CoFounderOpportunity } from './PostCoFounderModal';

interface CoFounderOpportunityCardProps {
  opportunity: CoFounderOpportunity;
  onViewDetails: (opportunity: CoFounderOpportunity) => void;
  onRequestToJoin: (opportunity: CoFounderOpportunity) => void;
}

const CoFounderOpportunityCard: React.FC<CoFounderOpportunityCardProps> = ({
  opportunity,
  onViewDetails,
  onRequestToJoin
}) => {
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
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDefaultThumbnail = () => {
    // Return a default icon based on the startup stage or type
    return (
      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
        <Lightbulb className="w-8 h-8 text-white" />
      </div>
    );
  };

  return (
    <Card className="hover:shadow-xl transition-all duration-300 border-0 bg-white">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* Thumbnail/Logo */}
            <div className="flex-shrink-0">
              {getDefaultThumbnail()}
            </div>
            
            <div className="flex-1 min-w-0">
              {/* Title */}
              <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                Looking for {opportunity.lookingFor.join(', ')} for {opportunity.startupTitle}
              </h3>
              
              {/* One-liner pitch */}
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {opportunity.oneLinerPitch}
              </p>
              
              {/* Tags row */}
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
          
          {/* Posted date */}
          <div className="flex-shrink-0 text-right">
            <p className="text-xs text-gray-500">
              Posted {opportunity.createdAt ? formatDate(opportunity.createdAt.toISOString()) : 'recently'}
            </p>
            {!opportunity.isPublic && (
              <Badge className="mt-1 bg-gray-100 text-gray-600 text-xs">
                Private
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Key details grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="truncate">
              {opportunity.remoteOrLocation || 'Remote'}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="truncate">
              {opportunity.lookingFor.slice(0, 2).join(', ')}
              {opportunity.lookingFor.length > 2 && '...'}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <span className="truncate">
              {opportunity.salaryOffering || 'Equity only'}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="truncate">
              {opportunity.preferredStartTime ? formatDate(opportunity.preferredStartTime) : 'Flexible'}
            </span>
          </div>
        </div>

        {/* Skills preview */}
        {opportunity.skillRequirements.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-900 mb-2">Required Skills:</p>
            <div className="flex flex-wrap gap-1">
              {opportunity.skillRequirements.slice(0, 4).map((skill) => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {opportunity.skillRequirements.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{opportunity.skillRequirements.length - 4} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Links preview */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          {opportunity.startupWebsite && (
            <div className="flex items-center gap-1">
              <ExternalLink className="w-3 h-3" />
              <span>Website</span>
            </div>
          )}
          {opportunity.linkedinProfile && (
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3" />
              <span>LinkedIn</span>
            </div>
          )}
          {opportunity.pitchDeck && (
            <div className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              <span>Pitch Deck</span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => onViewDetails(opportunity)}
          >
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Button>
          <Button 
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            onClick={() => onRequestToJoin(opportunity)}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Request to Join
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CoFounderOpportunityCard; 