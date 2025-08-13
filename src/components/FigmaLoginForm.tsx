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
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFormValid = formData.email.trim() !== '' && formData.password !== '';

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
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof ValidationErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
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
      setErrors({
        general: 'メールアドレス・パスワードのどちらかが間違っています',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="figma-login-container">
      <div className="figma-login-body">
        <h1 className="figma-login-title">Sharpath</h1>

        <form onSubmit={handleSubmit} className="figma-login-form">
          <div className="figma-form-field">
            <label htmlFor="email" className="figma-field-label">
              メールアドレス
            </label>
            <input
              id="email"
              name="email"
              type="text"
              autoComplete="email"
              className="figma-field-input"
              value={formData.email}
              onChange={handleInputChange}
              disabled={isSubmitting || isLoading}
            />
            {errors.email && (
              <p className="figma-error-message">{errors.email}</p>
            )}
          </div>

          <div className="figma-form-field">
            <label htmlFor="password" className="figma-field-label">
              パスワード
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              className="figma-field-input"
              value={formData.password}
              onChange={handleInputChange}
              disabled={isSubmitting || isLoading}
            />
            {errors.password && (
              <p className="figma-error-message">{errors.password}</p>
            )}
          </div>

          {errors.general && (
            <div className="figma-general-error">
              {errors.general}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            aria-label={isLoading ? 'ログイン中…' : 'ログイン'}
            className="mx-auto block border-0 bg-transparent p-0 hover:opacity-90 active:opacity-80 disabled:opacity-60"
            style={{ lineHeight: 0 }}
          >
            {/* ※ public 直下のファイルは先頭スラッシュで参照。/public は付けない */}
            <img
              src="/LoginButton.svg"
              alt=""
              width={180}   // ← お好みで調整（Figmaの実寸に合わせる）
              height={60}
              className="select-none pointer-events-none"
              draggable={false}
            />
          </button>
        </form>
      </div>
    </div>
  );
}
