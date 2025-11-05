"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"
import { profileSchemas } from "@monolenz/types/validation"

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
import { BioStep } from "./steps/bio-setup"
import { LinksStep } from "./steps/links-step"

const formSchema = profileSchemas.createForm
const totalSteps = 3

export default function FormRhfInput() {
  const [step, setStep] = useState(1) // 1: Username, 2: Bio, 3: Links

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      bio: "",
      linkedin_url: "",
      github_url: "",
      portfolio_url: "",
    },
  })

  function onSubmit(data: z.infer<typeof formSchema>) {
    if (step < totalSteps) {
      // Validate current step before moving to next
      let fieldsToValidate: string[] = []
      
      if (step === 1) {
        fieldsToValidate = ["username"]
      } else if (step === 2) {
        fieldsToValidate = ["bio"]
      } else if (step === 3) {
        fieldsToValidate = ["linkedin_url", "github_url", "portfolio_url"]
      }
      
      form.trigger(fieldsToValidate as any).then((isValid) => {
        if (isValid) {
          setStep(step + 1)
        }
      })
      return
    }

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
    <Card className="w-full sm:max-w-md -translate-y-20">
      <CardHeader>
        <CardTitle>Initial Profile Creation</CardTitle>
        <CardDescription>
          Input your profile information below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 1 && <UsernameStep form={form} />}
        {step === 2 && <BioStep form={form} />}
        {step === 3 && <LinksStep form={form} />}
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
          <Button type="button" onClick={form.handleSubmit(onSubmit)}>
            {step < totalSteps ? "Next" : "Submit"}
          </Button>
        </Field>
      </CardFooter>
    </Card>
  </main>
  )
}
