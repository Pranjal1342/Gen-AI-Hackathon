import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Globe, Languages, Loader2 } from 'lucide-react';
import { TranslateRequest, TranslateResponse } from '@/lib/api';
import { useTranslation } from 'react-i18next';

interface TranslationSectionProps {
  defaultText: string;
  onTranslate: (request: TranslateRequest) => Promise<TranslateResponse>;
}

const TranslationSection: React.FC<TranslationSectionProps> = ({ defaultText, onTranslate }) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [translatedText, setTranslatedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [sourceText, setSourceText] = useState(defaultText);
  const { t } = useTranslation();

  const SUPPORTED_LANGUAGES = [
    { code: 'es', name: t('languages.spanish') },
    { code: 'fr', name: t('languages.french') },
    { code: 'de', name: t('languages.german') },
    { code: 'it', name: t('languages.italian') },
    { code: 'pt', name: t('languages.portuguese') },
    { code: 'ru', name: t('languages.russian') },
    { code: 'ja', name: t('languages.japanese') },
    { code: 'ko', name: t('languages.korean') },
    { code: 'zh', name: t('languages.chinese') },
    { code: 'ar', name: t('languages.arabic') },
    { code: 'hi', name: t('languages.hindi') },
    { code: 'nl', name: t('languages.dutch') },
    { code: 'sv', name: t('languages.swedish') },
    { code: 'no', name: t('languages.norwegian') },
    { code: 'da', name: t('languages.danish') },
  ];

  const handleTranslate = async () => {
    if (!selectedLanguage || !sourceText.trim()) return;

    setIsLoading(true);
    try {
      const response = await onTranslate({
        text: sourceText,
        target_language: selectedLanguage,
      });
      setTranslatedText(response.translated_text);
    } catch (error) {
      console.error('Error translating text:', error);
      // Optionally show error toast here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Languages className="h-5 w-5 text-primary" />
          <span>{t('translation.title')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Source Text */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            {t('translation.sourceText')}
          </label>
          <Textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            placeholder={t('translation.placeholder')}
            className="min-h-[100px]"
          />
        </div>

        {/* Language Selection and Translate Button */}
        <div className="flex space-x-2">
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder={t('translation.selectLanguage')} />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4" />
                    <span>{lang.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            onClick={handleTranslate}
            disabled={!selectedLanguage || !sourceText.trim() || isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Languages className="h-4 w-4 mr-2" />
            )}
            {t('translation.translate')}
          </Button>
        </div>

        {/* Translated Text */}
        {translatedText && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {t('translation.translatedText')} ({SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage)?.name})
            </label>
            <Textarea
              value={translatedText}
              readOnly
              className="min-h-[100px] bg-muted/50"
            />
          </div>
        )}

        {!translatedText && !isLoading && (
          <div className="text-center py-6 text-muted-foreground">
            <Globe className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>{t('translation.emptyState')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TranslationSection;