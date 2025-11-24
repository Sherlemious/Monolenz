'use client';

/**
 * PropertyField - Dynamic input renderer
 * Maps property_type to the appropriate input component
 */

import type { BlockProperty } from '@monolenz/types/entities';

// ============================================================================
// Types
// ============================================================================

interface PropertyFieldProps {
  property: BlockProperty;
  value: unknown;
  onChange: (value: unknown) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
  isPublic?: boolean;
  onVisibilityChange?: (isPublic: boolean) => void;
}

// ============================================================================
// Main Component
// ============================================================================

export function PropertyField({
  property,
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
  isPublic = true,
  onVisibilityChange,
}: PropertyFieldProps) {
  const inputId = `field-${property.property_name}`;

  return (
    <div className="property-field">
      <div className="property-field__header">
        <label htmlFor={inputId} className="property-field__label">
          {property.display_name}
          {property.is_required && <span className="property-field__required">*</span>}
        </label>

        {onVisibilityChange && (
          <button
            type="button"
            onClick={() => onVisibilityChange(!isPublic)}
            className={`property-field__visibility ${isPublic ? 'is-public' : 'is-private'}`}
            title={isPublic ? 'Visible on public profile' : 'Hidden from public profile'}
          >
            {isPublic ? <EyeIcon className="w-4 h-4" /> : <EyeOffIcon className="w-4 h-4" />}
          </button>
        )}
      </div>

      {property.help_text && <p className="property-field__help">{property.help_text}</p>}

      <div className="property-field__input">
        <PropertyInput
          id={inputId}
          property={property}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          hasError={!!error}
        />
      </div>

      {error && <p className="property-field__error">{error}</p>}

      <style jsx>{`
        .property-field {
          margin-bottom: 1.25rem;
        }

        .property-field__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.375rem;
        }

        .property-field__label {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--color-text-primary, #1a1a1a);
        }

        .property-field__required {
          color: var(--color-error, #dc2626);
          margin-left: 0.25rem;
        }

        .property-field__visibility {
          padding: 0.25rem;
          border-radius: 0.25rem;
          border: none;
          background: transparent;
          cursor: pointer;
          opacity: 0.6;
          transition: opacity 0.15s ease;
        }

        .property-field__visibility:hover {
          opacity: 1;
        }

        .property-field__visibility.is-public {
          color: var(--color-success, #16a34a);
        }

        .property-field__visibility.is-private {
          color: var(--color-text-muted, #6b7280);
        }

        .property-field__help {
          font-size: 0.75rem;
          color: var(--color-text-muted, #6b7280);
          margin-bottom: 0.375rem;
        }

        .property-field__error {
          font-size: 0.75rem;
          color: var(--color-error, #dc2626);
          margin-top: 0.375rem;
        }
      `}</style>
    </div>
  );
}

// ============================================================================
// Property Input Router
// ============================================================================

interface PropertyInputProps {
  id: string;
  property: BlockProperty;
  value: unknown;
  onChange: (value: unknown) => void;
  onBlur?: () => void;
  disabled: boolean;
  hasError: boolean;
}

function PropertyInput({ id, property, value, onChange, onBlur, disabled, hasError }: PropertyInputProps) {
  const rules = property.validation_rules;

  // Handle enum as special case
  if (rules?.enum && rules.enum.length > 0) {
    return (
      <EnumSelect
        id={id}
        value={value as string}
        options={rules.enum}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        hasError={hasError}
        placeholder={property.placeholder_text}
      />
    );
  }

  switch (property.property_type) {
    case 'string':
      if (rules?.format === 'uri') {
        return (
          <UrlInput
            id={id}
            value={value as string}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            hasError={hasError}
            placeholder={property.placeholder_text}
            maxLength={rules?.maxLength}
          />
        );
      }
      return (
        <StringInput
          id={id}
          value={value as string}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          hasError={hasError}
          placeholder={property.placeholder_text}
          maxLength={rules?.maxLength}
          pattern={rules?.pattern}
        />
      );

    case 'text':
      return (
        <TextInput
          id={id}
          value={value as string}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          hasError={hasError}
          placeholder={property.placeholder_text}
          maxLength={rules?.maxLength}
        />
      );

    case 'integer':
      return (
        <IntegerInput
          id={id}
          value={value as number}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          hasError={hasError}
          placeholder={property.placeholder_text}
          min={rules?.minimum}
          max={rules?.maximum}
        />
      );

    case 'decimal':
      return (
        <DecimalInput
          id={id}
          value={value as number}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          hasError={hasError}
          placeholder={property.placeholder_text}
          min={rules?.minimum}
          max={rules?.maximum}
        />
      );

    case 'date':
      return (
        <DateInput
          id={id}
          value={value as string}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          hasError={hasError}
        />
      );

    case 'boolean':
      return (
        <BooleanInput
          id={id}
          value={value as boolean}
          onChange={onChange}
          disabled={disabled}
          label={property.display_name}
        />
      );

    case 'array':
      return (
        <ArrayInput
          id={id}
          value={value as string[]}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          hasError={hasError}
          placeholder={property.placeholder_text}
        />
      );

    default:
      return (
        <StringInput
          id={id}
          value={String(value ?? '')}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          hasError={hasError}
          placeholder={property.placeholder_text}
        />
      );
  }
}

// ============================================================================
// Input Components
// ============================================================================

const inputBaseClass = `
  w-full px-3 py-2 
  border rounded-lg
  text-sm
  transition-colors duration-150
  focus:outline-none focus:ring-2 focus:ring-offset-1
  disabled:opacity-50 disabled:cursor-not-allowed
`;

const getInputClasses = (hasError: boolean) => `
  ${inputBaseClass}
  ${
    hasError
      ? 'border-red-400 focus:ring-red-400 focus:border-red-400'
      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
  }
`;

// String Input
interface StringInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled: boolean;
  hasError: boolean;
  placeholder?: string | null;
  maxLength?: number;
  pattern?: string;
}

function StringInput({ id, value, onChange, onBlur, disabled, hasError, placeholder, maxLength }: StringInputProps) {
  return (
    <input
      id={id}
      type="text"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      disabled={disabled}
      placeholder={placeholder ?? undefined}
      maxLength={maxLength}
      className={getInputClasses(hasError)}
    />
  );
}

// Text Input (textarea)
interface TextInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled: boolean;
  hasError: boolean;
  placeholder?: string | null;
  maxLength?: number;
}

function TextInput({ id, value, onChange, onBlur, disabled, hasError, placeholder, maxLength }: TextInputProps) {
  return (
    <textarea
      id={id}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      disabled={disabled}
      placeholder={placeholder ?? undefined}
      maxLength={maxLength}
      rows={4}
      className={getInputClasses(hasError)}
      style={{ resize: 'vertical', minHeight: '6rem' }}
    />
  );
}

// Integer Input
interface IntegerInputProps {
  id: string;
  value: number;
  onChange: (value: number | null) => void;
  onBlur?: () => void;
  disabled: boolean;
  hasError: boolean;
  placeholder?: string | null;
  min?: number;
  max?: number;
}

function IntegerInput({ id, value, onChange, onBlur, disabled, hasError, placeholder, min, max }: IntegerInputProps) {
  return (
    <input
      id={id}
      type="number"
      value={value ?? ''}
      onChange={(e) => {
        const val = e.target.value;
        onChange(val === '' ? null : parseInt(val, 10));
      }}
      onBlur={onBlur}
      disabled={disabled}
      placeholder={placeholder ?? undefined}
      min={min}
      max={max}
      step={1}
      className={getInputClasses(hasError)}
    />
  );
}

// Decimal Input
interface DecimalInputProps {
  id: string;
  value: number;
  onChange: (value: number | null) => void;
  onBlur?: () => void;
  disabled: boolean;
  hasError: boolean;
  placeholder?: string | null;
  min?: number;
  max?: number;
}

function DecimalInput({ id, value, onChange, onBlur, disabled, hasError, placeholder, min, max }: DecimalInputProps) {
  return (
    <input
      id={id}
      type="number"
      value={value ?? ''}
      onChange={(e) => {
        const val = e.target.value;
        onChange(val === '' ? null : parseFloat(val));
      }}
      onBlur={onBlur}
      disabled={disabled}
      placeholder={placeholder ?? undefined}
      min={min}
      max={max}
      step={0.01}
      className={getInputClasses(hasError)}
    />
  );
}

// Date Input
interface DateInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled: boolean;
  hasError: boolean;
}

function DateInput({ id, value, onChange, onBlur, disabled, hasError }: DateInputProps) {
  return (
    <input
      id={id}
      type="date"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      disabled={disabled}
      className={getInputClasses(hasError)}
    />
  );
}

// Boolean Input (checkbox toggle)
interface BooleanInputProps {
  id: string;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled: boolean;
  label: string;
}

function BooleanInput({ id, value, onChange, disabled, label }: BooleanInputProps) {
  return (
    <label htmlFor={id} className="flex items-center gap-2 cursor-pointer">
      <input
        id={id}
        type="checkbox"
        checked={value ?? false}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}

// Enum Select
interface EnumSelectProps {
  id: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled: boolean;
  hasError: boolean;
  placeholder?: string | null;
}

function EnumSelect({ id, value, options, onChange, onBlur, disabled, hasError, placeholder }: EnumSelectProps) {
  return (
    <select
      id={id}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      disabled={disabled}
      className={getInputClasses(hasError)}
    >
      <option value="">{placeholder ?? 'Select an option...'}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {formatEnumOption(opt)}
        </option>
      ))}
    </select>
  );
}

// URL Input
interface UrlInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled: boolean;
  hasError: boolean;
  placeholder?: string | null;
  maxLength?: number;
}

function UrlInput({ id, value, onChange, onBlur, disabled, hasError, placeholder, maxLength }: UrlInputProps) {
  return (
    <input
      id={id}
      type="url"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      disabled={disabled}
      placeholder={placeholder ?? 'https://...'}
      maxLength={maxLength}
      className={getInputClasses(hasError)}
    />
  );
}

// Array Input (repeatable list of strings)
interface ArrayInputProps {
  id: string;
  value: string[];
  onChange: (value: string[]) => void;
  onBlur?: () => void;
  disabled: boolean;
  hasError: boolean;
  placeholder?: string | null;
}

function ArrayInput({ id, value, onChange, onBlur, disabled, hasError, placeholder }: ArrayInputProps) {
  const items = value ?? [];

  const handleAdd = () => {
    onChange([...items, '']);
  };

  const handleRemove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, newValue: string) => {
    const updated = [...items];
    updated[index] = newValue;
    onChange(updated);
  };

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="flex gap-2">
          <input
            id={index === 0 ? id : undefined}
            type="text"
            value={item}
            onChange={(e) => handleChange(index, e.target.value)}
            onBlur={onBlur}
            disabled={disabled}
            placeholder={placeholder ?? `Item ${index + 1}`}
            className={`flex-1 ${getInputClasses(hasError)}`}
          />
          <button
            type="button"
            onClick={() => handleRemove(index)}
            disabled={disabled}
            className="px-3 py-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Remove item"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={handleAdd}
        disabled={disabled}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
      >
        <PlusIcon className="w-4 h-4" />
        Add item
      </button>
    </div>
  );
}

// ============================================================================
// Icons (inline SVG to avoid external dependencies)
// ============================================================================

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
      />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function formatEnumOption(option: string): string {
  return option
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
