import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import DocumentUpload from '@/components/DocumentUpload';
import AnalysisResults from '@/components/AnalysisResults';
import QASection from '@/components/QASection';
import TranslationSection from '@/components/TranslationSection';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { DocumentAnalysis, processDocument, askQuestion, translateText, exportToPDF } from '@/lib/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, MessageCircle, Globe, BarChart3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import heroImage from '@/assets/hero-image.jpg';

const DocumentAnalyzer: React.FC = () => {
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    try {
      const result = await processDocument(file);
      setAnalysis(result);
      toast({
        title: t('toast.processSuccess'),
        description: t('toast.processSuccessDesc', { score: result.document_health_score }),
      });
    } catch (error) {
      console.error('Error processing document:', error);
      toast({
        title: t('toast.processFailed'),
        description: t('toast.processFailedDesc'),
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExport = async () => {
    if (!analysis) return;

    setIsExporting(true);
    try {
      const blob = await exportToPDF(analysis);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `document-analysis-${analysis.session_id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: t('toast.exportSuccess'),
        description: t('toast.exportSuccessDesc'),
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: t('toast.exportFailed'),
        description: t('toast.exportFailedDesc'),
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20">
      {/* Hero Section */}
      <div className="relative py-16 px-4">
        <div
          className="absolute inset-0 opacity-10 bg-center bg-cover rounded-lg"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="relative max-w-4xl mx-auto">
          <div className="flex justify-end mb-4">
            <LanguageSwitcher />
          </div>
          <div className="flex flex-col items-center">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent text-center mb-2">
              {t('app.title')}
            </h1>
            <p className="text-xl text-muted-foreground mb-8 text-center">
              {t('app.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        {!analysis ? (
          // Upload Section
          <div className="max-w-2xl mx-auto">
            <DocumentUpload onUpload={handleFileUpload} isLoading={isProcessing} />
          </div>
        ) : (
          // Analysis Results with Tabs
          <Tabs defaultValue="analysis" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto">
              <TabsTrigger value="analysis" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">{t('tabs.analysis')}</span>
              </TabsTrigger>
              <TabsTrigger value="qa" className="flex items-center space-x-2">
                <MessageCircle className="h-4 w-4" />
                <span className="hidden sm:inline">{t('tabs.qa')}</span>
              </TabsTrigger>
              <TabsTrigger value="translate" className="flex items-center space-x-2">
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">{t('tabs.translate')}</span>
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">{t('tabs.newDoc')}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analysis">
              <AnalysisResults
                analysis={analysis}
                onExport={handleExport}
                isExporting={isExporting}
              />
            </TabsContent>

            <TabsContent value="qa">
              <QASection
                sessionId={analysis.session_id}
                onAskQuestion={askQuestion}
              />
            </TabsContent>

            <TabsContent value="translate">
              <TranslationSection
                defaultText={analysis.simplified_text}
                onTranslate={translateText}
              />
            </TabsContent>

            <TabsContent value="upload">
              <div className="max-w-2xl mx-auto">
                <DocumentUpload onUpload={handleFileUpload} isLoading={isProcessing} />
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default DocumentAnalyzer;