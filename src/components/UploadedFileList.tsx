'use client';

import { File, FileText, FileSpreadsheet, X } from 'lucide-react';
// useRealtimeAnalysisフックで定義されたUploadedFile型をインポート
import type { UploadedFile as UploadedFileType } from '@/hooks/useRealtimeAnalysis';

interface UploadedFileListProps {
  files: UploadedFileType[];
  onRemoveFile: (id: string) => void;
}

const getFileIcon = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (ext === 'docx') {
    return <FileText className="h-6 w-6 flex-shrink-0 text-blue-500" />;
  }
  if (ext === 'xlsx') {
    return <FileSpreadsheet className="h-6 w-6 flex-shrink-0 text-green-500" />;
  }
  return <File className="h-6 w-6 flex-shrink-0 text-gray-400" />;
};

const formatBytes = (bytes: number, decimals = 1) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

export function UploadedFileList({ files, onRemoveFile }: UploadedFileListProps) {
  if (files.length === 0) return null;

  return (
    <div className="px-6 pb-4">
      <div className="mt-4 space-y-2">
        {files.map((file) => (
          <div
            key={file.id}
            className="flex items-center justify-between rounded-lg border bg-gray-50 p-2"
          >
            <div className="flex min-w-0 items-center gap-3">
              {getFileIcon(file.name)}
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-800">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">{formatBytes(file.size)}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onRemoveFile(file.id)}
              className="ml-2 flex-shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-200"
              aria-label={`Remove ${file.name}`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
