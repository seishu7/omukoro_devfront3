"use client"

import React from 'react'
import { Plus } from 'lucide-react'

interface ConsultTextAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onFilesSelect?: (files: FileList | File[]) => void;
}

export const ConsultTextArea: React.FC<ConsultTextAreaProps> = ({
  value,
  onChange,
  placeholder = '例）「ビールのモニター会をしたい。ターゲットは20代、来月に実施予定」など',
  className = '',
  onFilesSelect,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const openFilePicker = () => fileInputRef.current?.click()
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && onFilesSelect) onFilesSelect(e.target.files)
  }

  return (
    <div className={className + ' rounded-[40px_40px_0_40px] p-4 md:p-6 bg-white space-y-2'}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full min-h-[72px] bg-transparent outline-none text-sm text-black placeholder:text-black/30"
        placeholder={placeholder}
        aria-label="相談内容の入力"
      />
      <div className="flex items-center justify-between">
        {onFilesSelect ? (
          <button
            type="button"
            onClick={openFilePicker}
            className="inline-flex items-center gap-2 rounded-md bg-black/10 px-3 py-2 text-sm font-bold text-[#434343] hover:opacity-80 transition-opacity"
          >
            <Plus className="h-5 w-5 text-[#000000]" />
            資料をアップロードする
          </button>
        ) : <span />}
        <div className="text-xs text-gray-500">{value.length}文字</div>
      </div>

      {onFilesSelect && (
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".docx,.xlsx"
          onChange={onFileChange}
          className="hidden"
        />
      )}
    </div>
  )
}