'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface FormData {
  email: string;
  password: string;
}

interface ValidationErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function FigmaLoginForm() {
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState<FormData>({ email: '', password: '' });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): ValidationErrors => {
    const newErrors: ValidationErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'メールアドレスを入力してください';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '正しいメールアドレスの形式で入力してください';
    }
    if (!formData.password) {
      newErrors.password = 'パスワードを入力してください';
    } else if (formData.password.length < 8) {
      newErrors.password = 'パスワードは8文字以上で入力してください';
    } else if (!/^(?=.*[a-zA-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'パスワードには英字と数字を含めてください';
    }
    return newErrors;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setIsSubmitting(true);
    setErrors({});
    try {
      await login(formData.email, formData.password);
    } catch (error) {
      setErrors({ general: 'メールアドレス・パスワードのどちらかが間違っています' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">Sherpath</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-gray-700 font-bold mb-1">
              メールアドレス
            </label>
            <input
              id="email"
              name="email"
              type="text"
              autoComplete="email"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
              value={formData.email}
              onChange={handleInputChange}
              disabled={isSubmitting || isLoading}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-700 font-bold mb-1">
              パスワード
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
              value={formData.password}
              onChange={handleInputChange}
              disabled={isSubmitting || isLoading}
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          {errors.general && (
            <div className="text-red-500 text-sm text-center">{errors.general}</div>
          )}

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isLoading}
              aria-label={isLoading ? 'ログイン中…' : 'ログイン'}
              className="border-0 bg-transparent p-0 hover:opacity-90 active:opacity-80 disabled:opacity-60"
              style={{ lineHeight: 0 }}
            >
              <img
                src="/LoginButton.svg"
                alt="ログイン"
                width={180}
                height={60}
                className="select-none pointer-events-none"
                draggable={false}
              />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
