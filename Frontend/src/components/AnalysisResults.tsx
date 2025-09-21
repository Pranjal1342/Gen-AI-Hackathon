import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, Download, Shield } from 'lucide-react';
import { DocumentAnalysis } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface AnalysisResultsProps {
  analysis: DocumentAnalysis;
  onExport: () => void;
  isExporting?: boolean;
}

const getRiskColor = (riskLevel: string) => {
  switch (riskLevel.toLowerCase()) {
    case 'high':
    case 'critical':
      return 'destructive';
    case 'medium':
    case 'moderate':
      return 'warning';
    case 'low':
    case 'minimal':
      return 'success';
    default:
      return 'secondary';
  }
};

const getHealthScoreColor = (score: number) => {
  if (score >= 80) return 'text-success';
  if (score >= 60) return 'text-warning';
  return 'text-destructive';
};

const getHealthScoreIcon = (score: number) => {
  if (score >= 80) return <CheckCircle className="h-6 w-6 text-success" />;
  if (score >= 60) return <Shield className="h-6 w-6 text-warning" />;
  return <AlertTriangle className="h-6 w-6 text-destructive" />;
};

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ 
  analysis, 
  onExport, 
  isExporting = false 
}) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      {/* Health Score Card */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getHealthScoreIcon(analysis.document_health_score)}
              <span>{t('analysis.healthScore')}</span>
            </div>
            <Button 
              onClick={onExport} 
              disabled={isExporting}
              variant="outline"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? t('analysis.exporting') : t('analysis.exportPdf')}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className={cn("text-3xl font-bold", getHealthScoreColor(analysis.document_health_score))}>
                {analysis.document_health_score}/100
              </span>
              <Badge variant={analysis.document_health_score >= 80 ? 'default' : 'secondary'}>
                {analysis.document_health_score >= 80 ? t('analysis.excellent') : 
                 analysis.document_health_score >= 60 ? t('analysis.good') : t('analysis.needsAttention')}
              </Badge>
            </div>
            <Progress 
              value={analysis.document_health_score} 
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Risks Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <span>{t('analysis.riskAssessment')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analysis.risks.length > 0 ? (
            <div className="space-y-3">
              {analysis.risks.map((risk, index) => (
                <div 
                  key={index}
                  className="flex items-start space-x-3 p-3 rounded-lg border border-border bg-muted/30"
                >
                  <Badge variant={getRiskColor(risk.risk_level) as any}>
                    {risk.risk_level}
                  </Badge>
                  <p className="text-sm text-foreground flex-1">
                    {risk.description}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 text-success" />
              <p>{t('analysis.noRisks')}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('analysis.originalText')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-64 overflow-y-auto text-sm text-foreground leading-relaxed">
              {analysis.original_text}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('analysis.simplifiedSummary')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-64 overflow-y-auto text-sm text-foreground leading-relaxed">
              {analysis.simplified_text}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalysisResults;