"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"
import { profileSchemas } from "@monolenz/types/validation"
import { educationSchemas } from "@monolenz/types/validation"
import { createBrowserApiClient } from "@/lib/api/client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field } from "@/components/ui/field"
import { UsernameStep } from "./steps/username-step"
import { BioStep } from "./steps/bio-step"
import { LinksStep } from "./steps/links-step"
import { EducationStep } from "./steps/education-step"
import { WorkExperienceStep } from "./steps/work-experience"

// Work experience schema
const workExperienceFormSchema = z.object({
  company_name: z.string().min(1, "Company name is required").max(255).optional(),
  position_title: z.string().min(1, "Position title is required").max(255).optional(),
  employment_type: z.enum(["full-time", "part-time", "contract", "internship", "freelance"]).optional(),
  location: z.string().max(255).optional(),
  location_type: z.enum(["on-site", "remote", "hybrid"]).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  description: z.string().optional(),
  achievements: z.array(z.string()).optional(),
  responsibilities: z.array(z.string()).optional(),
  technologies: z.array(z.string()).optional(),
})

const formSchema = profileSchemas.createForm
  .merge(educationSchemas.createForm)
  .merge(workExperienceFormSchema)
  .partial()
const totalSteps = 5

export default function FormRhfInput() {
  const [step, setStep] = useState(1) // 1: Username, 2: Bio, 3: Links, 4: Education, 5: Work Experience
  const apiClient = createBrowserApiClient()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      bio: "",
      linkedin_url: "",
      github_url: "",
      portfolio_url: "",
      institution_name: "",
      institution_url: "",
      location: "",
      degree_type: undefined,
      degree_name: "",
      field_of_study: "",
      minor_fields: [],
      start_date: "",
      end_date: "",
      is_current: false,
      gpa: undefined,
      gpa_scale: undefined,
      honors: [],
      relevant_coursework: [],
      activities: [],
      company_name: "",
      position_title: "",
      employment_type: undefined,
      location_type: undefined,
      description: "",
      achievements: [],
      responsibilities: [],
      technologies: [],
    },
  })

  async function handleNext() {
    // Validate current step before moving to next
    let fieldsToValidate: string[] = []

    if (step === 1) {
      fieldsToValidate = ["username"]
    } else if (step === 2) {
      fieldsToValidate = ["bio"]
    } else if (step === 3) {
      fieldsToValidate = ["linkedin_url", "github_url", "portfolio_url"]
    } else if (step === 4) {
      fieldsToValidate = ["institution_name"]
    } else if (step === 5) {
      fieldsToValidate = ["company_name", "position_title", "start_date"]
    }

    if (fieldsToValidate.length > 0) {
      const isValid = await form.trigger(fieldsToValidate as any)
      if (isValid) {
        // If moving from step 3 to step 4, create the profile silently
        if (step === 3) {
          try {
            const formData = form.getValues()
            const profileData = {
              username: formData.username,
              bio: formData.bio || undefined,
              linkedin_url: formData.linkedin_url || undefined,
              github_url: formData.github_url || undefined,
              portfolio_url: formData.portfolio_url || undefined,
            }

            // Use the API client to send the data
            await apiClient.post("/api/v1/profiles", profileData)

            // On success, silently proceed to the next step
            setStep(step + 1)
          } catch (error) {
            // On failure, log the error for debugging but do nothing else.
            // The user will remain on the current step without an error message.
            console.error("Silent profile creation failed:", error)
          }
        } else if (step === 4) {
          try {
            const formData = form.getValues()
            const educationPayload = {
              blocks: [
                {
                  block_type_id: 2, // The ID for "Education"
                  data: {
                    institution_name: formData.institution_name,
                    degree_type: formData.degree_type,
                    field_of_study: formData.field_of_study,
                    start_date: formData.start_date,
                    end_date: formData.end_date,
                    gpa: formData.gpa,
                  },
                },
              ],
            }

            // Remove any undefined or empty string fields from the data object
            const educationBlock = educationPayload.blocks[0]
            if (educationBlock) {
              Object.keys(educationBlock.data).forEach((key) => {
                const k = key as keyof typeof educationBlock.data
                if (educationBlock.data[k] === undefined || educationBlock.data[k] === "") {
                  delete educationBlock.data[k]
                }
              })
            }

            await apiClient.post(
              "/api/v1/profiles/me/versions",
              educationPayload,
            )

            // On success, silently proceed
            setStep(step + 1)
          } catch (error) {
            console.error("Silent education block creation failed:", error)
          }
        } else {
          // For all other steps, just advance to the next one
          setStep(step + 1)
        }
      }
      // If validation is NOT valid, do nothing, keeping the user on the current step.
    } else {
      // For steps with no validation, just advance
      setStep(step + 1)
    }
  }

  function onSubmit(data: z.infer<typeof formSchema>) {
    // Final step - submit form
    toast("You submitted the following values:", {
      description: (
        <pre className="bg-code text-code-foreground mt-2 w-[320px] overflow-x-auto rounded-md p-4">
          <code>{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
      position: "bottom-right",
      classNames: {
        content: "flex flex-col gap-2",
      },
      style: {
        "--border-radius": "calc(var(--radius)  + 4px)",
      } as React.CSSProperties,
    })
  }

  return (
    <main className="flex min-h-[100svh] items-center justify-center p-4 ">
    <Card className="w-full sm:max-w-2xl -translate-y-20">
      <CardHeader>
        <CardTitle>Initial Profile Creation</CardTitle>
        <CardDescription>
          Input your profile information below.
        </CardDescription>
      </CardHeader>
      <CardContent className="max-h-[600px] overflow-y-auto">
        {step === 1 && <UsernameStep form={form} />}
        {step === 2 && <BioStep form={form} />}
        {step === 3 && <LinksStep form={form} />}
        {step === 4 && <EducationStep form={form} />}
        {step === 5 && <WorkExperienceStep form={form} />}
      </CardContent>
      <CardFooter>
        <Field orientation="horizontal" className="justify-between w-full">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (step > 1) {
                setStep(step - 1)
              } else {
                form.reset()
              }
            }}
            disabled={step === 1}
          >
            Previous
          </Button>
          <Button 
            type="button" 
            onClick={step < totalSteps ? handleNext : form.handleSubmit(onSubmit)}
          >
            {step < totalSteps ? "Next" : "Submit"}
          </Button>
        </Field>
      </CardFooter>
    </Card>
  </main>
  )
}
