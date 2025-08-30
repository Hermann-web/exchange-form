export interface FieldOption {
  value: string;
  label: string;
}

export type FieldType = 'text' | 'email' | 'select' | 'textarea';

export interface PersonalField<TForm = any> {
  key: keyof TForm;
  label: string;
  type: FieldType;
  required?: boolean;
  readonly?: boolean;
  placeholder?: string;
  options?: FieldOption[];
  rows?: number;
  validator?: (value: string) => void;
}
