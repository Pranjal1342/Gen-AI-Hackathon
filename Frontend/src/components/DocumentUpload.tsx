import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface DocumentUploadProps {
  onUpload: (file: File) => void;
  isLoading?: boolean;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ onUpload, isLoading = false }) => {
  const [dragActive, setDragActive] = useState(false);
  const { t } = useTranslation();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onUpload(acceptedFiles[0]);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    multiple: false,
    disabled: isLoading,
  });

  return (
    <Card className="border-2 border-dashed border-muted-foreground/25 transition-all duration-300 hover:border-primary/50">
      <CardContent className="p-8">
        <div
          {...getRootProps()}
          className={cn(
            "flex flex-col items-center justify-center text-center space-y-4 cursor-pointer transition-all duration-300",
            isDragActive && "scale-105",
            isLoading && "cursor-not-allowed opacity-60"
          )}
        >
          <input {...getInputProps()} />
          
          <div className="relative">
            {isLoading ? (
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
            ) : (
              <div className="relative">
                <Upload className="h-16 w-16 text-primary/70" />
                <FileText className="h-8 w-8 text-primary absolute -bottom-1 -right-1" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-foreground">
              {isLoading ? t('upload.processing') : t('upload.title')}
            </h3>
            <p className="text-muted-foreground">
              {isLoading 
                ? t('upload.analyzing')
                : t('upload.dragDrop')
              }
            </p>
          </div>

          {!isLoading && (
            <Button variant="outline" className="mt-4">
              {t('upload.chooseFile')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentUpload;