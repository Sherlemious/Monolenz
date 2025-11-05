// apps/web/app/(app)/dashboard/profile/steps/education-step.tsx
"use client"

import { Controller, UseFormReturn } from "react-hook-form"
import * as z from "zod"
import { educationSchemas } from "@monolenz/types/validation"

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

type FormData = z.infer<typeof educationSchemas.createForm>

interface EducationStepProps {
  form: UseFormReturn<any>
}

const degreeTypes = [
  { value: "Bachelor", label: "Bachelor" },
  { value: "Master", label: "Master" },
  { value: "PhD", label: "PhD" },
  { value: "Associate", label: "Associate" },
  { value: "Certificate", label: "Certificate" },
  { value: "Diploma", label: "Diploma" },
] as const

export function EducationStep({ form }: EducationStepProps) {
  const isCurrent = form.watch("is_current")

  return (
    <form id="form-rhf-input">
      <FieldGroup>
        {/* Basic Information */}
        <Controller
          name="institution_name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-rhf-input-institution-name">
                Institution Name *
              </FieldLabel>
              <Input
                {...field}
                id="form-rhf-input-institution-name"
                aria-invalid={fieldState.invalid}
                placeholder="e.g., MIT, Stanford University"
                autoComplete="organization"
              />
              <FieldDescription>
                Name of the educational institution (required)
              </FieldDescription>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          name="institution_url"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-rhf-input-institution-url">
                Institution Website
              </FieldLabel>
              <Input
                {...field}
                id="form-rhf-input-institution-url"
                aria-invalid={fieldState.invalid}
                placeholder="https://www.university.edu"
                type="url"
                autoComplete="url"
              />
              <FieldDescription>
                Institution website URL (optional)
              </FieldDescription>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          name="location"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-rhf-input-location">
                Location
              </FieldLabel>
              <Input
                {...field}
                id="form-rhf-input-location"
                aria-invalid={fieldState.invalid}
                placeholder="City, State, Country"
                autoComplete="address-level2"
              />
              <FieldDescription>
                Institution location (optional)
              </FieldDescription>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        {/* Degree Information */}
        <Controller
          name="degree_type"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-rhf-input-degree-type">
                Degree Type
              </FieldLabel>
              <select
                {...field}
                id="form-rhf-input-degree-type"
                aria-invalid={fieldState.invalid}
                value={field.value || ""}
                onChange={(e) => field.onChange(e.target.value || undefined)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-all focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20"
              >
                <option value="">Select degree type</option>
                {degreeTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <FieldDescription>
                Type of degree or certification (optional)
              </FieldDescription>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          name="degree_name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-rhf-input-degree-name">
                Degree Name
              </FieldLabel>
              <Input
                {...field}
                id="form-rhf-input-degree-name"
                aria-invalid={fieldState.invalid}
                placeholder="e.g., Bachelor of Science"
                autoComplete="off"
              />
              <FieldDescription>
                Full name of the degree (optional)
              </FieldDescription>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          name="field_of_study"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-rhf-input-field-of-study">
                Field of Study
              </FieldLabel>
              <Input
                {...field}
                id="form-rhf-input-field-of-study"
                aria-invalid={fieldState.invalid}
                placeholder="e.g., Computer Science"
                autoComplete="off"
              />
              <FieldDescription>
                Major field of study (optional)
              </FieldDescription>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        {/* Dates */}
        <Controller
          name="start_date"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-rhf-input-start-date">
                Start Date
              </FieldLabel>
              <Input
                {...field}
                id="form-rhf-input-start-date"
                aria-invalid={fieldState.invalid}
                type="date"
              />
              <FieldDescription>
                Education start date (optional)
              </FieldDescription>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          name="is_current"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <div className="flex items-center gap-2">
                <input
                  {...field}
                  id="form-rhf-input-is-current"
                  type="checkbox"
                  checked={field.value || false}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="h-4 w-4 rounded border-input"
                  aria-invalid={fieldState.invalid}
                />
                <FieldLabel htmlFor="form-rhf-input-is-current" className="cursor-pointer">
                  Currently Enrolled
                </FieldLabel>
              </div>
              <FieldDescription>
                Check if you are currently enrolled in this program
              </FieldDescription>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          name="end_date"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-rhf-input-end-date">
                End Date
              </FieldLabel>
              <Input
                {...field}
                id="form-rhf-input-end-date"
                aria-invalid={fieldState.invalid}
                type="date"
                disabled={isCurrent}
              />
              <FieldDescription>
                Education end date (optional, disabled if currently enrolled)
              </FieldDescription>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        {/* Performance */}
        <Controller
          name="gpa"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-rhf-input-gpa">
                GPA
              </FieldLabel>
              <Input
                {...field}
                id="form-rhf-input-gpa"
                aria-invalid={fieldState.invalid}
                type="number"
                step="0.01"
                min="0"
                max="4"
                placeholder="3.75"
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
              />
              <FieldDescription>
                Grade point average (0.0 - 4.0, optional)
              </FieldDescription>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          name="gpa_scale"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-rhf-input-gpa-scale">
                GPA Scale
              </FieldLabel>
              <Input
                {...field}
                id="form-rhf-input-gpa-scale"
                aria-invalid={fieldState.invalid}
                type="number"
                step="0.1"
                min="1"
                max="10"
                placeholder="4.0"
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
              />
              <FieldDescription>
                GPA scale, e.g., 4.0 (1.0 - 10.0, optional)
              </FieldDescription>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
      </FieldGroup>
    </form>
  )
}

