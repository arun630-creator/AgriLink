import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, CheckCircle, Clock, Award } from 'lucide-react';

interface ReputationData {
  farmerId: string;
  farmerName: string;
  totalOrders: number;
  fulfillmentRate: number;
  averageRating: number;
  returnRate: number;
  responseTime: string;
  qualityBadges: string[];
  joinedDate: string;
}

interface FarmerReputationBadgeProps {
  reputation: ReputationData;
  showDetails?: boolean;
}

const FarmerReputationBadge = ({ reputation, showDetails = false }: FarmerReputationBadgeProps) => {
  // Bulletproof: always have a safe reputation object
  const safeReputation = reputation || {};
  const qualityBadges = safeReputation.qualityBadges || [];

  const getReputationLevel = () => {
    const fulfillmentRate = safeReputation.fulfillmentRate ?? 0;
    const averageRating = safeReputation.averageRating ?? 0;
    const returnRate = safeReputation.returnRate ?? 100;
    if (fulfillmentRate >= 95 && averageRating >= 4.5 && returnRate <= 5) {
      return { level: 'Excellent', color: 'bg-green-100 text-green-800', icon: '🏆' };
    } else if (fulfillmentRate >= 90 && averageRating >= 4.0 && returnRate <= 10) {
      return { level: 'Good', color: 'bg-blue-100 text-blue-800', icon: '⭐' };
    } else {
      return { level: 'Average', color: 'bg-yellow-100 text-yellow-800', icon: '📊' };
    }
  };

  const reputationLevel = getReputationLevel();

  if (!showDetails) {
    return (
      <Badge className={reputationLevel.color}>
        {reputationLevel.icon} {reputationLevel.level} Reputation
      </Badge>
    );
  }

  return (
    <Card className="border-green-100">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Award className="h-5 w-5 text-green-600" />
          Farmer Reputation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <Badge className={`${reputationLevel.color} text-lg py-2 px-4`}>
            {reputationLevel.icon} {reputationLevel.level}
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Orders Completed</span>
            <span className="font-medium">{safeReputation.totalOrders ?? 0}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Fulfillment Rate</span>
            <div className="flex items-center gap-1">
              <span className={`font-medium ${(safeReputation.fulfillmentRate ?? 0) >= 95 ? 'text-green-600' : 'text-orange-600'}`}>
                {(safeReputation.fulfillmentRate ?? 0)}%
              </span>
              {(safeReputation.fulfillmentRate ?? 0) >= 95 && <CheckCircle className="w-4 h-4 text-green-600" />}
            </div>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Average Rating</span>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{safeReputation.averageRating ?? 'N/A'}</span>
            </div>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Response Time</span>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="font-medium">{safeReputation.responseTime ?? 'N/A'}</span>
            </div>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Return Rate</span>
            <span className={`font-medium ${(safeReputation.returnRate ?? 100) <= 5 ? 'text-green-600' : 'text-red-600'}`}>
              {(safeReputation.returnRate ?? 100)}%
            </span>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-2">Quality Badges</h4>
          <div className="flex flex-wrap gap-1">
            {qualityBadges.map((badge, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {badge}
              </Badge>
            ))}
            {qualityBadges.length === 0 && (
              <span className="text-xs text-gray-500">None</span>
            )}
          </div>
        </div>

        <div className="text-center pt-2 border-t">
          <p className="text-sm text-gray-500">Member since {safeReputation.joinedDate ?? 'N/A'}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FarmerReputationBadge;
