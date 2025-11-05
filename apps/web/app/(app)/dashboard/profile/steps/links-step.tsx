// apps/web/app/(app)/dashboard/profile/steps/links-step.tsx
"use client"

import { Controller, UseFormReturn } from "react-hook-form"
import * as z from "zod"
import { profileSchemas } from "@monolenz/types/validation"

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

type FormData = z.infer<typeof profileSchemas.createForm>

interface LinksStepProps {
  form: UseFormReturn<any>
}

export function LinksStep({ form }: LinksStepProps) {
  return (
    <form id="form-rhf-input">
      <FieldGroup>
        <Controller
          name="linkedin_url"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-rhf-input-linkedin">
                LinkedIn URL
              </FieldLabel>
              <Input
                {...field}
                id="form-rhf-input-linkedin"
                aria-invalid={fieldState.invalid}
                placeholder="https://linkedin.com/in/yourname"
                type="url"
                autoComplete="url"
              />
              <FieldDescription>
                Your LinkedIn profile URL (optional)
              </FieldDescription>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          name="github_url"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-rhf-input-github">
                GitHub URL
              </FieldLabel>
              <Input
                {...field}
                id="form-rhf-input-github"
                aria-invalid={fieldState.invalid}
                placeholder="https://github.com/yourname"
                type="url"
                autoComplete="url"
              />
              <FieldDescription>
                Your GitHub profile URL (optional)
              </FieldDescription>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          name="portfolio_url"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-rhf-input-portfolio">
                Portfolio URL
              </FieldLabel>
              <Input
                {...field}
                id="form-rhf-input-portfolio"
                aria-invalid={fieldState.invalid}
                placeholder="https://yourportfolio.com"
                type="url"
                autoComplete="url"
              />
              <FieldDescription>
                Your portfolio or personal website URL (optional)
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
