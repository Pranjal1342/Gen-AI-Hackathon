import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Send, Loader2 } from 'lucide-react';
import { QARequest, QAResponse } from '@/lib/api';
import { useTranslation } from 'react-i18next';

interface QASectionProps {
  sessionId: string;
  onAskQuestion: (request: QARequest) => Promise<QAResponse>;
}

interface QAHistory {
  question: string;
  answer: string;
  timestamp: Date;
}

const QASection: React.FC<QASectionProps> = ({ sessionId, onAskQuestion }) => {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [qaHistory, setQAHistory] = useState<QAHistory[]>([]);
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;

    const currentQuestion = question;
    setQuestion('');
    setIsLoading(true);

    try {
      const response = await onAskQuestion({
        session_id: sessionId,
        question: currentQuestion,
      });

      setQAHistory(prev => [
        ...prev,
        {
          question: currentQuestion,
          answer: response.answer,
          timestamp: new Date(),
        }
      ]);
    } catch (error) {
      console.error('Error asking question:', error);
      // Optionally show error toast here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          <span>{t('qa.title')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Q&A History */}
        {qaHistory.length > 0 && (
          <div className="space-y-4 max-h-64 overflow-y-auto">
            {qaHistory.map((qa, index) => (
              <div key={index} className="space-y-2">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <p className="text-sm font-medium text-foreground">Q: {qa.question}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-foreground">A: {qa.answer}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {qa.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Question Input */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex space-x-2">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={t('qa.placeholder')}
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={!question.trim() || isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>

        {qaHistory.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>{t('qa.emptyState')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QASection;