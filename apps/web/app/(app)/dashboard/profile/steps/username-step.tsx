// apps/web/app/(app)/dashboard/profile/steps/username-step.tsx
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

interface UsernameStepProps {
  form: UseFormReturn<FormData>
}

export function UsernameStep({ form }: UsernameStepProps) {
  return (
    <form id="form-rhf-input">
      <FieldGroup>
        <Controller
          name="username"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-rhf-input-username">
                Username
              </FieldLabel>
              <Input
                {...field}
                id="form-rhf-input-username"
                aria-invalid={fieldState.invalid}
                placeholder="name"
                autoComplete="username"
              />
              <FieldDescription>
                This is your public display name. Must be between 3 and 50
                characters. Must only contain letters, numbers, underscores, and
                hyphens.
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