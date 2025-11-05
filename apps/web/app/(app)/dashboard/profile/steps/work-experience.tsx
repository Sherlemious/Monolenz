// apps/web/app/(app)/dashboard/profile/steps/work-experience.tsx
"use client"

import { Controller, UseFormReturn, useFieldArray } from "react-hook-form"
import * as z from "zod"


import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

interface WorkExperienceStepProps {
  form: UseFormReturn<any>
}

const employmentTypes = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
  { value: "freelance", label: "Freelance" },
] as const

const locationTypes = [
  { value: "on-site", label: "On-site" },
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
] as const

export function WorkExperienceStep({ form }: WorkExperienceStepProps) {
  
  const achievementsArray = useFieldArray({
    control: form.control,
    name: "achievements",
  })

  const responsibilitiesArray = useFieldArray({
    control: form.control,
    name: "responsibilities",
  })

  const technologiesArray = useFieldArray({
    control: form.control,
    name: "technologies",
  })

  return (
    <form id="form-rhf-input">
      <FieldGroup>
        {/* Basic Information */}
        <Controller
          name="company_name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-rhf-input-company-name">
                Company Name *
              </FieldLabel>
              <Input
                {...field}
                id="form-rhf-input-company-name"
                aria-invalid={fieldState.invalid}
                placeholder="e.g., Google, Microsoft"
                autoComplete="organization"
              />
              <FieldDescription>
                Name of the company or organization (required)
              </FieldDescription>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          name="position_title"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-rhf-input-position-title">
                Position Title *
              </FieldLabel>
              <Input
                {...field}
                id="form-rhf-input-position-title"
                aria-invalid={fieldState.invalid}
                placeholder="e.g., Senior Software Engineer"
                autoComplete="organization-title"
              />
              <FieldDescription>
                Job title or position held (required)
              </FieldDescription>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <div className="flex flex-col gap-4 sm:flex-row sm:gap-4">
          <Controller
            name="employment_type"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="flex-1">
                <FieldLabel htmlFor="form-rhf-input-employment-type">
                  Employment Type
                </FieldLabel>
                <select
                  {...field}
                  id="form-rhf-input-employment-type"
                  aria-invalid={fieldState.invalid}
                  value={field.value || ""}
                  onChange={(e) => field.onChange(e.target.value || undefined)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-all focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20"
                >
                  <option value="">Select employment type</option>
                  {employmentTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <FieldDescription>
                  Type of employment (optional)
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
              <Field data-invalid={fieldState.invalid} className="flex-1">
                <FieldLabel htmlFor="form-rhf-input-location">
                  Location
                </FieldLabel>
                <Input
                  {...field}
                  id="form-rhf-input-location"
                  aria-invalid={fieldState.invalid}
                  placeholder="e.g., San Francisco, CA"
                  autoComplete="address-line1"
                />
                <FieldDescription>
                  Work location (optional)
                </FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="location_type"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="flex-1">
                <FieldLabel htmlFor="form-rhf-input-location-type">
                  Location Type
                </FieldLabel>
                <select
                  {...field}
                  id="form-rhf-input-location-type"
                  aria-invalid={fieldState.invalid}
                  value={field.value || ""}
                  onChange={(e) => field.onChange(e.target.value || undefined)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-all focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20"
                >
                  <option value="">Select location type</option>
                  {locationTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <FieldDescription>
                  Type of work arrangement (optional)
                </FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>

        {/* Dates */}
        <div className="flex flex-col gap-4 sm:flex-row sm:gap-4">
          <Controller
            name="start_date"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="flex-1">
                <FieldLabel htmlFor="form-rhf-input-start-date">
                  Start Date *
                </FieldLabel>
                <Input
                  {...field}
                  id="form-rhf-input-start-date"
                  aria-invalid={fieldState.invalid}
                  type="date"
                />
                <FieldDescription>
                  Employment start date (required)
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
              <Field data-invalid={fieldState.invalid} className="flex-1">
                <FieldLabel htmlFor="form-rhf-input-end-date">
                  End Date
                </FieldLabel>
                <Input
                  {...field}
                  id="form-rhf-input-end-date"
                  aria-invalid={fieldState.invalid}
                  type="date"
                />
                <FieldDescription>
                  Employment end date (optional)
                </FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>

        {/* Description */}
        <Controller
          name="description"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-rhf-input-description">
                Description
              </FieldLabel>
              <Textarea
                {...field}
                id="form-rhf-input-description"
                aria-invalid={fieldState.invalid}
                placeholder="Describe your role and responsibilities..."
                className="min-h-[80px]"
              />
              <FieldDescription>
                Job description and overview (optional)
              </FieldDescription>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        {/* Achievements */}
        <Field>
          <FieldLabel>Achievements</FieldLabel>
          <FieldDescription>
            Key achievements in this role (optional)
          </FieldDescription>
          {achievementsArray.fields.map((field, index) => (
            <div key={field.id} className="flex gap-2 mb-1.5">
              <Controller
                name={`achievements.${index}`}
                control={form.control}
                render={({ field, fieldState }) => (
                  <div className="flex-1">
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      placeholder={`Achievement ${index + 1}`}
                      className="h-9"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </div>
                )}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => achievementsArray.remove(index)}
                className="shrink-0 h-9"
              >
                Remove
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => achievementsArray.append("")}
            className="mt-1.5"
          >
            Add Achievement
          </Button>
        </Field>

        {/* Responsibilities */}
        <Field>
          <FieldLabel>Responsibilities</FieldLabel>
          <FieldDescription>
            Main responsibilities (optional)
          </FieldDescription>
          {responsibilitiesArray.fields.map((field, index) => (
            <div key={field.id} className="flex gap-2 mb-1.5">
              <Controller
                name={`responsibilities.${index}`}
                control={form.control}
                render={({ field, fieldState }) => (
                  <div className="flex-1">
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      placeholder={`Responsibility ${index + 1}`}
                      className="h-9"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </div>
                )}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => responsibilitiesArray.remove(index)}
                className="shrink-0 h-9"
              >
                Remove
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => responsibilitiesArray.append("")}
            className="mt-1.5"
          >
            Add Responsibility
          </Button>
        </Field>

        {/* Technologies */}
        <Field>
          <FieldLabel>Technologies</FieldLabel>
          <FieldDescription>
            Technologies and tools used (optional)
          </FieldDescription>
          {technologiesArray.fields.map((field, index) => (
            <div key={field.id} className="flex gap-2 mb-1.5">
              <Controller
                name={`technologies.${index}`}
                control={form.control}
                render={({ field, fieldState }) => (
                  <div className="flex-1">
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      placeholder={`Technology ${index + 1}`}
                      className="h-9"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </div>
                )}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => technologiesArray.remove(index)}
                className="shrink-0 h-9"
              >
                Remove
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => technologiesArray.append("")}
            className="mt-1.5"
          >
            Add Technology
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}

