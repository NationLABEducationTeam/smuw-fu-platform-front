export type QuestionCategory = 
  | 'location' 
  | 'finance' 
  | 'market' 
  | 'personal' 
  | 'operation'
  | 'business';  // business 카테고리 추가


export type QuestionType = 
  | 'select' 
  | 'radio' 
  | 'text'
  | 'checkbox'  // checkbox 타입 추가
  | 'location';

export interface Question {
  id: number;
  question: string;
  type: QuestionType;
  options?: string[];
  category: QuestionCategory;
  description: string;
  required?: boolean;  // required 속성 추가 (선택적)
}

export interface DiagnosisAnswer {
  question: string;
  answer: string;
}

export type DiagnosisAnswers = {
  [key: number]: DiagnosisAnswer;
}