// apps/web/app/(app)/dashboard/profile/steps/bio-setup.tsx
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
import { Textarea } from "@/components/ui/textarea"

type FormData = z.infer<typeof profileSchemas.createForm>

interface BioStepProps {
  form: UseFormReturn<any>
}

export function BioStep({ form }: BioStepProps) {
  return (
    <form id="form-rhf-input">
      <FieldGroup>
        <Controller
          name="bio"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-rhf-input-bio">
                Bio
              </FieldLabel>
              <Textarea
                {...field}
                id="form-rhf-input-bio"
                aria-invalid={fieldState.invalid}
                placeholder="Tell us about yourself..."
                className="min-h-[120px]"
              />
              <FieldDescription>
                Tell us more about yourself. Must be less than 500 characters (optional).
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
