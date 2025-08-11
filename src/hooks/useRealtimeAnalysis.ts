'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type AnalyzeResult = {
  completeness: 1 | 2 | 3 | 4 | 5;
  suggestions: string[];
  confidence?: number;
};

type UploadedFile = {
  id: string;
  name: string;
  size: number;
};

const ALLOWED_EXTENSIONS = ['.docx', '.xlsx'];

function getAuthHeader(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function useRealtimeAnalysis() {
  const [inputText, setInputText] = useState<string>('');
  const [docText, setDocText] = useState<string>('');
  const [analysis, setAnalysis] = useState<AnalyzeResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFileUploading, setIsFileUploading] = useState<boolean>(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const cacheRef = useRef<Map<string, AnalyzeResult>>(new Map());

  const cacheKey = useMemo(() => `${inputText}\n\n${docText}`.trim(), [inputText, docText]);

  const analyzeNow = useCallback(async (text: string, doc: string) => {
    const key = `${text}\n\n${doc}`.trim();
    if (cacheRef.current.has(key)) {
      setAnalysis(cacheRef.current.get(key) || null);
      return;
    }
    // デバッグ用に追加
    console.log('NEXT_PUBLIC_API_ENDPOINT:', process.env.NEXT_PUBLIC_API_ENDPOINT);

    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ text, docText: doc || undefined }),
      });
      if (!res.ok) throw new Error('analyze failed');
      const data = (await res.json()) as AnalyzeResult;

      // 正規化: サーバ実装差異に備えて型を整える
      const normalized: AnalyzeResult = {
        completeness: Math.min(
          5,
          Math.max(1, Math.round(Number(data.completeness)))
        ) as 1 | 2 | 3 | 4 | 5,
        suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
        confidence: typeof data.confidence === 'number' ? data.confidence : undefined,
      };

      cacheRef.current.set(key, normalized);
      setAnalysis(normalized);
    } catch {
      // フォールバック: 最低限のレスポンス
      setAnalysis({ completeness: 1, suggestions: ['入力が少ない可能性があります。'], confidence: 0.0 });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const analyzeInput = useCallback((text: string) => {
    setInputText(text);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      void analyzeNow(text, docText);
    }, 800);
  }, [analyzeNow, docText]);

  const removeFile = useCallback((id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  const handleFileUpload = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(f => ALLOWED_EXTENSIONS.some(ext => f.name.toLowerCase().endsWith(ext)));
    if (validFiles.length === 0) return;

    setIsFileUploading(true);
    try {
      const form = new FormData();
      validFiles.forEach(f => form.append('files[]', f));

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/extract_text`, {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
        },
        body: form,
      });
      if (!res.ok) throw new Error('extract failed');
      const data = await res.json() as { extractedText?: string; files?: { name: string; bytes: number }[] };

      setDocText(data.extractedText || '');
      setUploadedFiles(prev => [
        ...prev,
        ...(data.files || []).map((f) => ({ id: `${f.name}-${Date.now()}`, name: f.name, size: f.bytes })),
      ]);

      // 抽出完了後に再評価（デバウンスせず即時）
      await analyzeNow(inputText, data.extractedText || '');
    } catch {
      // 失敗時はdocTextを維持（テキストのみで継続）
    } finally {
      setIsFileUploading(false);
    }
  }, [analyzeNow, inputText]);

  useEffect(() => {
    // 初回・入力/抽出変更時のキャッシュヒットを優先
    const key = cacheKey;
    if (key && cacheRef.current.has(key)) {
      setAnalysis(cacheRef.current.get(key) || null);
    }
  }, [cacheKey]);

  return {
    analysis,
    isLoading,
    analyzeInput,
    uploadedFiles,
    isFileUploading,
    handleFileUpload,
    removeFile,
  } as const;
}


