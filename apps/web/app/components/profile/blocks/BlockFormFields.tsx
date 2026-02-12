'use client';

/**
 * BlockFormFields - Type-specific form components for each block type
 * Beautiful, accessible form fields with inline validation
 */

import { useState, useCallback } from 'react';
import { BlockType, type DraftBlock } from '@monolenz/types/entities';
import { useProfileEditorStore } from '@/lib/stores/profile-editor-store';
import { Input, Label } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

interface BlockFormFieldsProps {
  block: DraftBlock;
}

// ============================================================================
// Main Dispatcher
// ============================================================================

export function BlockFormFields({ block }: BlockFormFieldsProps) {
  switch (block.blockType) {
    case BlockType.WORK_EXPERIENCE:
      return <WorkExperienceForm block={block} />;
    case BlockType.EDUCATION:
      return <EducationForm block={block} />;
    case BlockType.SKILL:
      return <SkillForm block={block} />;
    case BlockType.PROJECT:
      return <ProjectForm block={block} />;
    case BlockType.CERTIFICATION:
      return <CertificationForm block={block} />;
    case BlockType.LANGUAGE:
      return <LanguageForm block={block} />;
    case BlockType.VOLUNTEER:
      return <VolunteerForm block={block} />;
    case BlockType.AWARD:
      return <AwardForm block={block} />;
    default:
      return <p className='text-muted-foreground text-sm'>Unknown block type</p>;
  }
}

// ============================================================================
// Reusable Field Components
// ============================================================================

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  error?: string;
  type?: 'text' | 'url' | 'number';
  hint?: string;
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  required,
  maxLength,
  error,
  type = 'text',
  hint,
}: TextFieldProps) {
  return (
    <div className='space-y-1.5'>
      <Label className='text-foreground'>
        {label}
        {required && <span className='text-destructive ml-0.5'>*</span>}
      </Label>
      <Input
        type={type}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        aria-invalid={!!error}
        className={cn(error && 'border-destructive focus-visible:ring-destructive/50')}
      />
      {hint && !error && <p className='text-[11px] text-muted-foreground'>{hint}</p>}
      {error && (
        <p className='text-xs text-destructive flex items-center gap-1'>
          <span className='text-[10px]'>●</span> {error}
        </p>
      )}
    </div>
  );
}

interface TextAreaFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  hint?: string;
}

function TextAreaField({ label, value, onChange, placeholder, rows = 3, hint }: TextAreaFieldProps) {
  return (
    <div className='space-y-1.5'>
      <Label className='text-foreground'>{label}</Label>
      <textarea
        className='flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs transition-all placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y font-[inherit]'
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
      />
      {hint && <p className='text-[11px] text-muted-foreground'>{hint}</p>}
    </div>
  );
}

interface DateFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
}

function DateField({ label, value, onChange, required, error }: DateFieldProps) {
  return (
    <div className='space-y-1.5'>
      <Label className='text-foreground'>
        {label}
        {required && <span className='text-destructive ml-0.5'>*</span>}
      </Label>
      <Input
        type='date'
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        className={cn(error && 'border-destructive focus-visible:ring-destructive/50')}
      />
      {error && (
        <p className='text-xs text-destructive flex items-center gap-1'>
          <span className='text-[10px]'>●</span> {error}
        </p>
      )}
    </div>
  );
}

interface ToggleFieldProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
}

function ToggleField({ label, checked, onChange, description }: ToggleFieldProps) {
  return (
    <label className='flex items-center gap-3 cursor-pointer select-none p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors'>
      <input
        type='checkbox'
        className='peer sr-only'
        checked={checked ?? false}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span
        className={cn(
          'relative w-10 h-[22px] rounded-full transition-colors shrink-0',
          'bg-input',
          "after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:size-4 after:bg-white after:rounded-full after:shadow-sm after:transition-transform",
          'peer-checked:bg-primary peer-checked:after:translate-x-[18px]'
        )}
      />
      <span className='text-sm'>
        <span className='font-medium'>{label}</span>
        {description && <span className='block text-xs text-muted-foreground mt-0.5'>{description}</span>}
      </span>
    </label>
  );
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  error?: string;
}

function SelectField({ label, value, onChange, options, placeholder, required, error }: SelectFieldProps) {
  return (
    <div className='space-y-1.5'>
      <Label className='text-foreground'>
        {label}
        {required && <span className='text-destructive ml-0.5'>*</span>}
      </Label>
      <select
        className={cn(
          'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-all focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 appearance-none bg-[length:1.25em_1.25em] bg-[position:right_0.5rem_center] bg-no-repeat pr-8',
          error && 'border-destructive focus-visible:ring-destructive/50'
        )}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
        }}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
      >
        {placeholder && <option value=''>{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p className='text-xs text-destructive flex items-center gap-1'>
          <span className='text-[10px]'>●</span> {error}
        </p>
      )}
    </div>
  );
}

interface NumberFieldProps {
  label: string;
  value: number | null | undefined;
  onChange: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
}

function NumberField({ label, value, onChange, min, max, step, placeholder }: NumberFieldProps) {
  return (
    <div className='space-y-1.5'>
      <Label className='text-foreground'>{label}</Label>
      <Input
        type='number'
        value={value ?? ''}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v === '' ? null : Number(v));
        }}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
      />
    </div>
  );
}

interface TagsFieldProps {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

function TagsField({ label, values, onChange, placeholder }: TagsFieldProps) {
  const [inputValue, setInputValue] = useState('');
  const items = Array.isArray(values) ? values : [];

  const addTag = useCallback(() => {
    const trimmed = inputValue.trim();
    if (trimmed && !items.includes(trimmed)) {
      onChange([...items, trimmed]);
      setInputValue('');
    }
  }, [inputValue, items, onChange]);

  const removeTag = useCallback(
    (index: number) => {
      onChange(items.filter((_, i) => i !== index));
    },
    [items, onChange]
  );

  return (
    <div className='space-y-2'>
      <Label className='text-foreground'>{label}</Label>
      {items.length > 0 && (
        <div className='flex flex-wrap gap-1.5'>
          {items.map((tag, i) => (
            <Badge key={i} variant='secondary' className='gap-1 pl-2.5 pr-1 py-1'>
              {tag}
              <button
                type='button'
                className='size-4 inline-flex items-center justify-center rounded-full hover:bg-foreground/10 transition-colors ml-0.5'
                onClick={() => removeTag(i)}
              >
                <span className='text-xs leading-none'>&times;</span>
              </button>
            </Badge>
          ))}
        </div>
      )}
      <div className='flex gap-2'>
        <Input
          className='flex-1'
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addTag();
            }
          }}
          placeholder={placeholder ?? 'Type and press Enter'}
        />
        <Button type='button' variant='outline' size='sm' onClick={addTag} disabled={!inputValue.trim()}>
          Add
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// Section Divider
// ============================================================================

function FormSection({ title }: { title: string }) {
  return (
    <div className='pt-2'>
      <p className='text-[11px] font-semibold text-muted-foreground uppercase tracking-wider pb-2 border-b'>{title}</p>
    </div>
  );
}

// ============================================================================
// Helper: useField hook for block field updates
// ============================================================================

function useBlockField(block: DraftBlock) {
  const updateBlockField = useProfileEditorStore((s) => s.updateBlockField);

  const update = useCallback(
    (field: string, value: unknown) => {
      updateBlockField(block.clientId, field, value);
    },
    [block.clientId, updateBlockField]
  );

  const get = useCallback(
    <T,>(field: string, fallback?: T): T => {
      const val = block.data[field];
      return (val !== undefined && val !== null ? val : fallback) as T;
    },
    [block.data]
  );

  return { update, get, errors: block.errors ?? {} };
}

// ============================================================================
// Work Experience Form
// ============================================================================

function WorkExperienceForm({ block }: { block: DraftBlock }) {
  const { update, get, errors } = useBlockField(block);

  return (
    <div className='flex flex-col gap-5'>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <TextField
          label='Company Name'
          value={get('company_name', '')}
          onChange={(v) => update('company_name', v)}
          required
          error={errors.company_name}
          placeholder='Acme Inc.'
        />
        <TextField
          label='Position Title'
          value={get('position_title', '')}
          onChange={(v) => update('position_title', v)}
          required
          error={errors.position_title}
          placeholder='Software Engineer'
        />
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <SelectField
          label='Employment Type'
          value={get('employment_type', '')}
          onChange={(v) => update('employment_type', v || null)}
          placeholder='Select type...'
          options={[
            { value: 'full-time', label: 'Full-time' },
            { value: 'part-time', label: 'Part-time' },
            { value: 'contract', label: 'Contract' },
            { value: 'internship', label: 'Internship' },
            { value: 'freelance', label: 'Freelance' },
          ]}
        />
        <SelectField
          label='Location Type'
          value={get('location_type', '')}
          onChange={(v) => update('location_type', v || null)}
          placeholder='Select type...'
          options={[
            { value: 'on-site', label: 'On-site' },
            { value: 'remote', label: 'Remote' },
            { value: 'hybrid', label: 'Hybrid' },
          ]}
        />
      </div>

      <TextField
        label='Location'
        value={get('location', '')}
        onChange={(v) => update('location', v || null)}
        placeholder='New York, NY'
      />

      <FormSection title='Duration' />

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <DateField
          label='Start Date'
          value={get('start_date', '')}
          onChange={(v) => update('start_date', v)}
          required
          error={errors.start_date}
        />
        <DateField label='End Date' value={get('end_date', '')} onChange={(v) => update('end_date', v || null)} />
      </div>

      <ToggleField
        label='I currently work here'
        checked={get('is_current', false)}
        onChange={(v) => update('is_current', v)}
        description='End date will be ignored if enabled'
      />

      <FormSection title='Details' />

      <TextAreaField
        label='Description'
        value={get('description', '')}
        onChange={(v) => update('description', v || null)}
        placeholder='Describe your role, responsibilities, and impact...'
        rows={4}
      />

      <TagsField
        label='Achievements'
        values={get('achievements', [])}
        onChange={(v) => update('achievements', v)}
        placeholder='e.g. Increased revenue by 20%'
      />

      <TagsField
        label='Technologies'
        values={get('technologies', [])}
        onChange={(v) => update('technologies', v)}
        placeholder='e.g. React, TypeScript, Node.js'
      />
    </div>
  );
}

// ============================================================================
// Education Form
// ============================================================================

function EducationForm({ block }: { block: DraftBlock }) {
  const { update, get, errors } = useBlockField(block);

  return (
    <div className='flex flex-col gap-5'>
      <TextField
        label='Institution Name'
        value={get('institution_name', '')}
        onChange={(v) => update('institution_name', v)}
        required
        error={errors.institution_name}
        placeholder='Massachusetts Institute of Technology'
      />

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <TextField
          label='Degree Type'
          value={get('degree_type', '')}
          onChange={(v) => update('degree_type', v || null)}
          placeholder="Bachelor's, Master's, PhD..."
        />
        <TextField
          label='Degree Name'
          value={get('degree_name', '')}
          onChange={(v) => update('degree_name', v || null)}
          placeholder='B.S. Computer Science'
        />
      </div>

      <TextField
        label='Field of Study'
        value={get('field_of_study', '')}
        onChange={(v) => update('field_of_study', v || null)}
        placeholder='Computer Science'
      />

      <FormSection title='Duration' />

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <DateField label='Start Date' value={get('start_date', '')} onChange={(v) => update('start_date', v || null)} />
        <DateField label='End Date' value={get('end_date', '')} onChange={(v) => update('end_date', v || null)} />
      </div>

      <ToggleField
        label='Currently studying here'
        checked={get('is_current', false)}
        onChange={(v) => update('is_current', v)}
      />

      <FormSection title='Academic Details' />

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <NumberField
          label='GPA'
          value={get<number | null>('gpa', null)}
          onChange={(v) => update('gpa', v)}
          min={0}
          max={10}
          step={0.01}
          placeholder='3.8'
        />
        <NumberField
          label='GPA Scale'
          value={get<number | null>('gpa_scale', 4.0)}
          onChange={(v) => update('gpa_scale', v ?? 4.0)}
          min={1}
          max={10}
          step={0.1}
          placeholder='4.0'
        />
      </div>

      <TextField
        label='Location'
        value={get('location', '')}
        onChange={(v) => update('location', v || null)}
        placeholder='Cambridge, MA'
      />

      <TagsField
        label='Honors'
        values={get('honors', [])}
        onChange={(v) => update('honors', v)}
        placeholder='e.g. Summa Cum Laude'
      />

      <TagsField
        label='Relevant Coursework'
        values={get('relevant_coursework', [])}
        onChange={(v) => update('relevant_coursework', v)}
        placeholder='e.g. Data Structures'
      />
    </div>
  );
}

// ============================================================================
// Skill Form
// ============================================================================

function SkillForm({ block }: { block: DraftBlock }) {
  const { update, get, errors } = useBlockField(block);

  return (
    <div className='flex flex-col gap-5'>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <TextField
          label='Skill Name'
          value={get('name', '')}
          onChange={(v) => update('name', v)}
          required
          error={errors.name}
          placeholder='React'
        />
        <TextField
          label='Category'
          value={get('category', '')}
          onChange={(v) => update('category', v)}
          required
          error={errors.category}
          placeholder='Frontend, Backend, DevOps...'
        />
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <SelectField
          label='Proficiency Level'
          value={get('proficiency_level', '')}
          onChange={(v) => update('proficiency_level', v || null)}
          placeholder='Select level...'
          options={[
            { value: 'beginner', label: 'Beginner' },
            { value: 'intermediate', label: 'Intermediate' },
            { value: 'advanced', label: 'Advanced' },
            { value: 'expert', label: 'Expert' },
          ]}
        />
        <NumberField
          label='Years of Experience'
          value={get<number | null>('years_experience', null)}
          onChange={(v) => update('years_experience', v)}
          min={0}
          max={100}
          step={0.5}
          placeholder='3'
        />
      </div>
    </div>
  );
}

// ============================================================================
// Project Form
// ============================================================================

function ProjectForm({ block }: { block: DraftBlock }) {
  const { update, get, errors } = useBlockField(block);

  return (
    <div className='flex flex-col gap-5'>
      <TextField
        label='Project Name'
        value={get('name', '')}
        onChange={(v) => update('name', v)}
        required
        error={errors.name}
        placeholder='My Awesome Project'
      />

      <TextAreaField
        label='Description'
        value={get('description', '')}
        onChange={(v) => update('description', v || null)}
        placeholder='What does this project do? What problem does it solve?'
        rows={4}
      />

      <FormSection title='Links' />

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <TextField
          label='Project URL'
          value={get('url', '')}
          onChange={(v) => update('url', v || null)}
          type='url'
          placeholder='https://myproject.com'
          hint='Live demo or project page'
        />
        <TextField
          label='Repository URL'
          value={get('repository_url', '')}
          onChange={(v) => update('repository_url', v || null)}
          type='url'
          placeholder='https://github.com/user/repo'
          hint='Source code repository'
        />
      </div>

      <FormSection title='Timeline' />

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <DateField label='Start Date' value={get('start_date', '')} onChange={(v) => update('start_date', v || null)} />
        <DateField label='End Date' value={get('end_date', '')} onChange={(v) => update('end_date', v || null)} />
      </div>

      <ToggleField
        label='This project is ongoing'
        checked={get('is_ongoing', false)}
        onChange={(v) => update('is_ongoing', v)}
      />

      <FormSection title='Details' />

      <TagsField
        label='Technologies'
        values={get('technologies', [])}
        onChange={(v) => update('technologies', v)}
        placeholder='e.g. Next.js, PostgreSQL'
      />

      <TagsField
        label='Highlights'
        values={get('highlights', [])}
        onChange={(v) => update('highlights', v)}
        placeholder='e.g. 10k+ users, Featured on HN'
      />
    </div>
  );
}

// ============================================================================
// Certification Form
// ============================================================================

function CertificationForm({ block }: { block: DraftBlock }) {
  const { update, get, errors } = useBlockField(block);

  return (
    <div className='flex flex-col gap-5'>
      <TextField
        label='Certification Name'
        value={get('name', '')}
        onChange={(v) => update('name', v)}
        required
        error={errors.name}
        placeholder='AWS Solutions Architect'
      />

      <TextField
        label='Issuing Organization'
        value={get('issuing_organization', '')}
        onChange={(v) => update('issuing_organization', v)}
        required
        error={errors.issuing_organization}
        placeholder='Amazon Web Services'
      />

      <FormSection title='Credential Details' />

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <TextField
          label='Credential ID'
          value={get('credential_id', '')}
          onChange={(v) => update('credential_id', v || null)}
          placeholder='ABC-123-XYZ'
        />
        <TextField
          label='Credential URL'
          value={get('credential_url', '')}
          onChange={(v) => update('credential_url', v || null)}
          type='url'
          placeholder='https://verify.example.com/...'
          hint='Verification link'
        />
      </div>

      <FormSection title='Dates' />

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <DateField label='Issue Date' value={get('issue_date', '')} onChange={(v) => update('issue_date', v || null)} />
        <DateField
          label='Expiration Date'
          value={get('expiration_date', '')}
          onChange={(v) => update('expiration_date', v || null)}
        />
      </div>

      <ToggleField
        label='Does not expire'
        checked={get('does_not_expire', false)}
        onChange={(v) => update('does_not_expire', v)}
      />
    </div>
  );
}

// ============================================================================
// Language Form
// ============================================================================

function LanguageForm({ block }: { block: DraftBlock }) {
  const { update, get, errors } = useBlockField(block);

  return (
    <div className='flex flex-col gap-5'>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <TextField
          label='Language'
          value={get('language', '')}
          onChange={(v) => update('language', v)}
          required
          error={errors.language}
          placeholder='English'
        />
        <SelectField
          label='Proficiency'
          value={get('proficiency', '')}
          onChange={(v) => update('proficiency', v)}
          required
          error={errors.proficiency}
          placeholder='Select level...'
          options={[
            { value: 'native', label: 'Native' },
            { value: 'fluent', label: 'Fluent' },
            { value: 'professional', label: 'Professional' },
            { value: 'intermediate', label: 'Intermediate' },
            { value: 'basic', label: 'Basic' },
          ]}
        />
      </div>
    </div>
  );
}

// ============================================================================
// Volunteer Form
// ============================================================================

function VolunteerForm({ block }: { block: DraftBlock }) {
  const { update, get, errors } = useBlockField(block);

  return (
    <div className='flex flex-col gap-5'>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <TextField
          label='Organization Name'
          value={get('organization_name', '')}
          onChange={(v) => update('organization_name', v)}
          required
          error={errors.organization_name}
          placeholder='Red Cross'
        />
        <TextField
          label='Role'
          value={get('role', '')}
          onChange={(v) => update('role', v)}
          required
          error={errors.role}
          placeholder='Volunteer Coordinator'
        />
      </div>

      <TextField
        label='Cause'
        value={get('cause', '')}
        onChange={(v) => update('cause', v || null)}
        placeholder='Education, Health, Environment...'
      />

      <FormSection title='Duration' />

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <DateField label='Start Date' value={get('start_date', '')} onChange={(v) => update('start_date', v || null)} />
        <DateField label='End Date' value={get('end_date', '')} onChange={(v) => update('end_date', v || null)} />
      </div>

      <ToggleField
        label='I currently volunteer here'
        checked={get('is_current', false)}
        onChange={(v) => update('is_current', v)}
      />

      <FormSection title='Details' />

      <TextAreaField
        label='Description'
        value={get('description', '')}
        onChange={(v) => update('description', v || null)}
        placeholder='Describe your volunteer work and impact...'
        rows={3}
      />

      <TagsField
        label='Highlights'
        values={get('highlights', [])}
        onChange={(v) => update('highlights', v)}
        placeholder='e.g. Organized community events'
      />
    </div>
  );
}

// ============================================================================
// Award Form
// ============================================================================

function AwardForm({ block }: { block: DraftBlock }) {
  const { update, get, errors } = useBlockField(block);

  return (
    <div className='flex flex-col gap-5'>
      <TextField
        label='Award Title'
        value={get('title', '')}
        onChange={(v) => update('title', v)}
        required
        error={errors.title}
        placeholder='Employee of the Year'
      />

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <TextField
          label='Issuer'
          value={get('issuer', '')}
          onChange={(v) => update('issuer', v || null)}
          placeholder='Company or Organization'
        />
        <DateField
          label='Date Received'
          value={get('date_received', '')}
          onChange={(v) => update('date_received', v || null)}
        />
      </div>

      <TextAreaField
        label='Description'
        value={get('description', '')}
        onChange={(v) => update('description', v || null)}
        placeholder='What was this award for?'
        rows={3}
      />

      <TextField
        label='URL'
        value={get('url', '')}
        onChange={(v) => update('url', v || null)}
        type='url'
        placeholder='https://example.com/award'
        hint='Link to award details'
      />
    </div>
  );
}
