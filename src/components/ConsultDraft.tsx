// 相談文の一時保存（localStorage）
const KEY = "consult:draft";

export type ConsultDraft = { text: string; createdAt: number };

export const saveConsultDraft = (text: string) =>
  localStorage.setItem(KEY, JSON.stringify({ text, createdAt: Date.now() } as ConsultDraft));

export const loadConsultDraft = (): ConsultDraft | null => {
  try {
    const v = localStorage.getItem(KEY);
    return v ? (JSON.parse(v) as ConsultDraft) : null;
  } catch { return null; }
};

export const clearConsultDraft = () => localStorage.removeItem(KEY);
