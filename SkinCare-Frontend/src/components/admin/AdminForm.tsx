import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Save, X, Loader2 } from 'lucide-react';

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'file';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  description?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

interface AdminFormProps {
  title: string;
  fields: FormField[];
  data: Record<string, any>;
  onChange: (name: string, value: any) => void;
  onSubmit: (data: Record<string, any>) => void;
  onCancel?: () => void;
  loading?: boolean;
  submitText?: string;
  cancelText?: string;
  description?: string;
}

export const AdminForm: React.FC<AdminFormProps> = ({
  title,
  fields,
  data,
  onChange,
  onSubmit,
  onCancel,
  loading = false,
  submitText = 'Save',
  cancelText = 'Cancel',
  description,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(data);
  };

  const renderField = (field: FormField) => {
    const value = data[field.name] || '';

    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            id={field.name}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => onChange(field.name, e.target.value)}
            required={field.required}
            className="min-h-[100px]"
          />
        );

      case 'select':
        return (
          <Select value={value} onValueChange={(val) => onChange(field.name, val)}>
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.name}
              checked={value}
              onCheckedChange={(checked) => onChange(field.name, checked)}
            />
            <Label htmlFor={field.name} className="text-sm font-normal">
              {field.description || field.label}
            </Label>
          </div>
        );

      case 'file':
        return (
          <Input
            id={field.name}
            type="file"
            onChange={(e) => onChange(field.name, e.target.files?.[0] || null)}
            required={field.required}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        );

      default:
        return (
          <Input
            id={field.name}
            type={field.type}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => onChange(field.name, e.target.value)}
            required={field.required}
            min={field.validation?.min}
            max={field.validation?.max}
            pattern={field.validation?.pattern}
          />
        );
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
        {description && (
          <p className="text-sm text-gray-600 mt-2">{description}</p>
        )}
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fields.map((field) => (
              <div
                key={field.name}
                className={`space-y-2 ${
                  field.type === 'textarea' || field.type === 'checkbox' 
                    ? 'md:col-span-2' 
                    : ''
                }`}
              >
                {field.type !== 'checkbox' && (
                  <Label htmlFor={field.name} className="text-sm font-medium">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                )}
                
                {renderField(field)}
                
                {field.description && field.type !== 'checkbox' && (
                  <p className="text-xs text-gray-500">{field.description}</p>
                )}
              </div>
            ))}
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 sm:flex-none sm:min-w-[120px]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {submitText}
                </>
              )}
            </Button>
            
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
                className="flex-1 sm:flex-none sm:min-w-[120px]"
              >
                <X className="h-4 w-4 mr-2" />
                {cancelText}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminForm;