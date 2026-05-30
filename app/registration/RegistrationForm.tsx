"use client";

import * as React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SPEAKERS } from "@/lib/speakers";
import Image from "next/image";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/pdf",
];

const affiliationOptions = [
  {
    value: "parish",
    label: "joining as a representative of a parish",
  },
  {
    value: "school",
    label: "joining as a representative of a school",
  },
  {
    value: "neither",
    label: "neither affiliated to a parish or a school",
  },
] as const;

const ministryOptions = [
  "Spiritual Director",
  "Writer",
  "Photographer",
  "Videographer",
  "Technical Staff",
  "Graphic Artist",
  "Others",
] as const;

const designationOptions = [
  "Teacher/Adviser",
  "Writer",
  "Photographer",
  "Videographer",
  "Technical Staff",
  "Graphic Artist",
  "Others",
] as const;

const titleOptions = ["Rev. Fr.", "Sr.", "Bro.", "Mr.", "Ms.", "Mrs."] as const;

const shirtSizes = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "2XL",
  "3XL",
  "4XL",
  "5XL",
] as const;

const day1Options = [
  {
    value: "day1-audio",
    label: "The Power of Voice: Crafting Meaningful Audio Content",
    speaker: "Rev. Fr. Albert Garong, SSP",
  },
  {
    value: "day1-writing",
    label: "The Storyteller's Toolkit: Writing & Interviewing",
    speaker: "Ms. Annie Perez",
  },
  {
    value: "day1-video",
    label: "Stories That Move: The Art of Video Storytelling",
    speaker: "Mr. Aubry Lerio",
  },
] as const;

const day2Options = [
  {
    value: "day2-production",
    label: "BTS: The Production Process",
    speaker: "Mr. Miko Mel C. Peñaloza",
  },
  {
    value: "day2-graphics",
    label: "Visualizing Ideas: The Art of Graphics and Layouting",
    speaker: "Ms. April Frances Ortigas",
  },
  {
    value: "day2-cognitive",
    label: "Think Before You Create: Cognitive Strategies for Engaging Content",
    speaker: "Ms. Kia Abrera",
  },
] as const;

const day1WithImages = day1Options.map((option) => ({
  ...option,
  imgUrl: SPEAKERS.find((s) => s.name === option.speaker)?.imgUrl ?? "",
}));

const day2WithImages = day2Options.map((option) => ({
  ...option,
  imgUrl: SPEAKERS.find((s) => s.name === option.speaker)?.imgUrl ?? "",
}));

const day1Values = day1Options.map((option) => option.value) as [
  string,
  ...string[],
];
const day2Values = day2Options.map((option) => option.value) as [
  string,
  ...string[],
];

const fileSchema = z
  .custom<FileList>((val) => val instanceof FileList, "Upload is required.")
  .refine((files) => files.length === 1, "Upload is required.")
  .refine(
    (files) => files[0]?.size <= MAX_FILE_SIZE,
    "File must be 5MB or smaller.",
  )
  .refine(
    (files) => (files[0] ? ACCEPTED_FILE_TYPES.includes(files[0].type) : false),
    "Only image or PDF files are allowed.",
  );

const phoneRegex = /^(09|\+639)\d{9}$/;

const formSchema = z.object({
  affiliationType: z.enum(["parish", "school", "neither"], {
    error: "Select an affiliation type.",
  }),
  archdiocese: z.string().optional(),
  parishName: z.string().optional(),
  parishAddress: z.string().optional(),
  organizationName: z.string().optional(),
  roleInMinistry: z.enum(ministryOptions, {
    error: "Role in the ministry is required.",
  }),
  roleInMinistryOther: z.string().optional(),
  province: z.string().optional(),
  schoolName: z.string().optional(),
  schoolAddress: z
    .string()
    .optional(),
  designation: z.enum(designationOptions, {
    error: "Designation is required.",
  }),
  designationOther: z
    .string()
    .optional(),
  companyOrganization: z
    .string()
    .optional(),
  companyAddress: z
    .string()
    .optional(),
  positionDesignation: z
    .string()
    .optional(),
  title: z.enum(titleOptions, {
    error: "Select a title.",
  }),
  firstName: z
    .string()
    .min(1, "First name is required.")
    .refine((val) => val.trim().length > 0, "First name is required."),
  middleName: z.string().optional(),
  surname: z
    .string()
    .min(1, "Surname is required.")
    .refine((val) => val.trim().length > 0, "Surname is required."),
  congregation: z.string().optional(),
  email: z
    .email({ error: "Enter a valid email address." })
    .min(1, "Email is required.")
    .refine((val) => val.trim().length > 0, "Email is required."),
  mobile: z
    .string()
    .min(1, "Mobile number is required.")
    .regex(phoneRegex, "Use 09XXXXXXXXX or +639XXXXXXXXX."),
  completeAddress: z
    .string()
    .min(1, "Complete address is required.")
    .refine((val) => val.trim().length > 0, "Complete address is required."),
  idUpload: fileSchema,
  shirtSize: z.enum(shirtSizes, {
    error: "Select a shirt size.",
  }),
  day1Session: z.enum(day1Values, {
    error: "Select a breakout session for Day 1.",
  }),
  day2Session: z.enum(day2Values, {
    error: "Select a breakout session for Day 2.",
  }),
  accommodation: z.enum(["avail", "self"], {
    error: "Select an accommodation option.",
  }),
  paymentMode: z.enum(["GCash", "BDO"], {
    error: "Select a payment mode.",
  }),
  paymentProof: fileSchema,
});

type RegistrationValues = z.infer<typeof formSchema>;
type RegistrationFieldName = keyof RegistrationValues;

type StepConfig = {
  key: string;
  label: string;
};

const steps: StepConfig[] = [
  { key: "affiliation", label: "Affiliation" },
  { key: "organization", label: "Organization" },
  { key: "personal", label: "Personal" },
  { key: "breakout", label: "Breakout" },
  { key: "accommodation", label: "Accommodation" },
  { key: "payment", label: "Payment" },
];

const defaultValues: RegistrationValues = {
  affiliationType: "parish",
  archdiocese: "",
  parishName: "",
  parishAddress: "",
  organizationName: "",
  roleInMinistry: ministryOptions[0],
  roleInMinistryOther: "",
  province: "",
  schoolName: "",
  schoolAddress: "",
  designation: designationOptions[0],
  designationOther: "",
  companyOrganization: "",
  companyAddress: "",
  positionDesignation: "",
  title: "Mr.",
  firstName: "",
  middleName: "",
  surname: "",
  congregation: "",
  email: "",
  mobile: "",
  completeAddress: "",
  idUpload: undefined as unknown as FileList,
  shirtSize: "L",
  day1Session: day1Options[0].value,
  day2Session: day2Options[0].value,
  accommodation: "avail",
  paymentMode: "GCash",
  paymentProof: undefined as unknown as FileList,
};

function getStepFields(
  stepIndex: number,
  values: RegistrationValues,
): RegistrationFieldName[] {
  if (stepIndex === 0) {
    return ["affiliationType"];
  }

  if (stepIndex === 1) {
    if (values.affiliationType === "parish") {
      return [
        "archdiocese",
        "parishName",
        "parishAddress",
        "organizationName",
        "roleInMinistry",
        values.roleInMinistry === "Others" ? "roleInMinistryOther" : undefined,
      ].filter(Boolean) as RegistrationFieldName[];
    }

    if (values.affiliationType === "school") {
      return [
        "province",
        "schoolName",
        "schoolAddress",
        "designation",
        values.designation === "Others" ? "designationOther" : undefined,
      ].filter(Boolean) as RegistrationFieldName[];
    }

    return ["companyOrganization", "companyAddress", "positionDesignation"];
  }

  if (stepIndex === 2) {
    return [
      "title",
      "firstName",
      "surname",
      "email",
      "mobile",
      "completeAddress",
      "idUpload",
      "shirtSize",
    ];
  }

  if (stepIndex === 3) {
    return ["day1Session", "day2Session"];
  }

  if (stepIndex === 4) {
    return ["accommodation"];
  }

  return ["paymentMode", "paymentProof"];
}

function createLoggableData(values: RegistrationValues) {
  return {
    ...values,
    idUpload: values.idUpload?.[0]?.name ?? "",
    paymentProof: values.paymentProof?.[0]?.name ?? "",
  };
}

function Stepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/80 p-6 shadow-sm backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {steps.map((step, index) => {
          const isActive = currentStep === index;
          const isComplete = currentStep > index;

          return (
            <div key={step.key} className="flex items-center gap-3">
              <div
                className={cn(
                  "flex size-9 items-center justify-center rounded-full border text-sm font-semibold",
                  isActive
                    ? "border-[#1a2e5a] bg-[#1a2e5a] text-white"
                    : isComplete
                      ? "border-[#2aadb5] bg-[#2aadb5]/10 text-[#1a2e5a]"
                      : "border-slate-200 bg-white text-slate-500",
                )}
              >
                {index + 1}
              </div>
              <span
                className={cn(
                  "text-xs font-semibold uppercase tracking-wide",
                  isActive || isComplete ? "text-[#1a2e5a]" : "text-slate-400",
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full bg-[#2aadb5] transition-all"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>
    </div>
  );
}

export default function RegistrationForm() {
  const [currentStep, setCurrentStep] = React.useState(0);
  const form = useForm<RegistrationValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const values = form.watch();

  const handleNext = async () => {
    const fields = getStepFields(currentStep, values);
    const isValid = await form.trigger(fields, { shouldFocus: true });

    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const onSubmit = (data: RegistrationValues) => {
    const safeData = createLoggableData(data);
    console.log("Registration submission", safeData);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f8fbff,#eef4ff_60%,#e4edf7_100%)] py-14">
      <div className="mx-auto w-full max-w-5xl px-4">
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#2aadb5]">
            Registration
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-[#1a2e5a] md:text-4xl">
            Cebu Metropolitan Catholic Mass Media Congress
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600">
            Fill out all required fields to reserve your slot. Your progress is
            saved across steps, so you can review each section before
            submitting.
          </p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Fields marked with * are required.
          </p>
        </div>

        <Stepper currentStep={currentStep} />

        <div className="mt-8 rounded-2xl border border-slate-200/70 bg-white p-6 shadow-xl shadow-slate-200/40 md:p-10">
          <Form {...form}>
            <form
              className="space-y-10"
              onSubmit={form.handleSubmit(onSubmit, (errors) => {
                console.log("Validation errors", errors);
              })}
            >
              {currentStep === 0 && (
                <section className="space-y-6">
                  <header>
                    <h2 className="text-xl font-semibold text-[#1a2e5a]">
                      Step 1: Affiliation Type
                    </h2>
                    <p className="text-sm text-slate-600">
                      Tell us where you are representing so we can tailor the
                      next step for you.
                    </p>
                  </header>
                  <FormField
                    control={form.control}
                    name="affiliationType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Affiliation Type{" "}
                          <span className="text-[#e63946]">*</span>
                        </FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="grid gap-4"
                          >
                            {affiliationOptions.map((option) => (
                              <label
                                key={option.value}
                                className="flex items-start gap-3 rounded-lg border border-slate-200 p-4 transition hover:border-[#2aadb5]/50"
                              >
                                <RadioGroupItem value={option.value} />
                                <span className="text-sm text-slate-700">
                                  {option.label}
                                </span>
                              </label>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </section>
              )}

              {currentStep === 1 && (
                <section className="space-y-6">
                  <header>
                    <h2 className="text-xl font-semibold text-[#1a2e5a]">
                      Step 2: Organization Details
                    </h2>
                    <p className="text-sm text-slate-600">
                      Provide the information required for your selected
                      affiliation type.
                    </p>
                  </header>

                  {values.affiliationType === "parish" && (
                    <div className="grid gap-5 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="archdiocese"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Arch/Diocese{" "}
                              <span className="text-[#e63946]">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Archdiocese of Cebu"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="parishName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Parish Name{" "}
                              <span className="text-[#e63946]">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Saint Joseph Parish"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="parishAddress"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>
                              Parish Address{" "}
                              <span className="text-[#e63946]">*</span>
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Parish address"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="organizationName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Organization&apos;s Name{" "}
                              <span className="text-[#e63946]">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="Media Ministry" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="roleInMinistry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Role in the Ministry{" "}
                              <span className="text-[#e63946]">*</span>
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {ministryOptions.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {values.roleInMinistry === "Others" && (
                        <FormField
                          control={form.control}
                          name="roleInMinistryOther"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>
                                Specify Role{" "}
                                <span className="text-[#e63946]">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Describe your role"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  )}

                  {values.affiliationType === "school" && (
                    <div className="grid gap-5 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="province"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Province <span className="text-[#e63946]">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="Cebu" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="schoolName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              School Name{" "}
                              <span className="text-[#e63946]">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="University of San Carlos"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="schoolAddress"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>
                              School Address{" "}
                              <span className="text-[#e63946]">*</span>
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="School address"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="designation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Designation{" "}
                              <span className="text-[#e63946]">*</span>
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select designation" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {designationOptions.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {values.designation === "Others" && (
                        <FormField
                          control={form.control}
                          name="designationOther"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>
                                Specify Designation{" "}
                                <span className="text-[#e63946]">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Describe your designation"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  )}

                  {values.affiliationType === "neither" && (
                    <div className="grid gap-5 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="companyOrganization"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Company / Organization{" "}
                              <span className="text-[#e63946]">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Organization name"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="positionDesignation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Position / Designation{" "}
                              <span className="text-[#e63946]">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="Position" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="companyAddress"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>
                              Address <span className="text-[#e63946]">*</span>
                            </FormLabel>
                            <FormControl>
                              <Textarea placeholder="Address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </section>
              )}

              {currentStep === 2 && (
                <section className="space-y-6">
                  <header>
                    <h2 className="text-xl font-semibold text-[#1a2e5a]">
                      Step 3: Personal Information
                    </h2>
                    <p className="text-sm text-slate-600">
                      Provide your personal details and upload a valid ID.
                    </p>
                  </header>
                  <div className="grid gap-5 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Title <span className="text-[#e63946]">*</span>
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select title" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {titleOptions.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="congregation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Congregation</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="For religious men and women"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            First Name <span className="text-[#e63946]">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Juan" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="middleName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Middle Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Santos" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="surname"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Surname <span className="text-[#e63946]">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Dela Cruz" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Active Email Address{" "}
                            <span className="text-[#e63946]">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="you@email.com"
                              type="email"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="mobile"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Active Mobile Number{" "}
                            <span className="text-[#e63946]">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="09XXXXXXXXX"
                              type="tel"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="shirtSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Shirt Size <span className="text-[#e63946]">*</span>
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select size" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {shirtSizes.map((size) => (
                                <SelectItem key={size} value={size}>
                                  {size}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="completeAddress"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>
                            Complete Address{" "}
                            <span className="text-[#e63946]">*</span>
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Complete address"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="idUpload"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>
                            Upload ID <span className="text-[#e63946]">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="file"
                              accept="image/*,application/pdf"
                              name={field.name}
                              onBlur={field.onBlur}
                              onChange={(event) =>
                                field.onChange(event.target.files)
                              }
                              ref={field.ref}
                            />
                          </FormControl>
                          <p className="text-xs text-slate-500">
                            Accepted formats: JPG, PNG, WEBP, PDF. Max 5MB.
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </section>
              )}

              {currentStep === 3 && (
                <section className="space-y-6">
                  <header>
                    <h2 className="text-xl font-semibold text-[#1a2e5a]">
                      Step 4: Breakout Sessions
                    </h2>
                    <p className="text-sm text-slate-600">
                      Select one session per day. Two selections are required to
                      continue.
                    </p>
                  </header>
                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="day1Session"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Day 1 — October 3{" "}
                            <span className="text-[#e63946]">*</span>
                          </FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="grid gap-3"
                            >
                              {day1WithImages.map((option) => (
                                <label
                                  key={option.value}
                                  className="flex items-start gap-3 rounded-lg border border-slate-200 p-4 transition hover:border-[#2aadb5]/40"
                                >
                                  {option.imgUrl && (
                                    <Image
                                      src={option.imgUrl}
                                      alt={`${option.speaker} photo`}
                                      width={56}
                                      height={56}
                                      className="rounded-md object-cover"
                                    />
                                  )}
                                  <RadioGroupItem value={option.value} />
                                  <span>
                                    <span className="block text-sm font-medium text-slate-700">
                                      {option.label}
                                    </span>
                                    <span className="text-xs text-slate-500">
                                      {option.speaker}
                                    </span>
                                  </span>
                                </label>
                              ))}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="day2Session"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Day 2 — October 4{" "}
                            <span className="text-[#e63946]">*</span>
                          </FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="grid gap-3"
                            >
                              {day2WithImages.map((option) => (
                                <label
                                  key={option.value}
                                  className="flex items-start gap-3 rounded-lg border border-slate-200 p-4 transition hover:border-[#2aadb5]/40"
                                >
                                  {option.imgUrl && (
                                    <Image
                                      src={option.imgUrl}
                                      alt={`${option.speaker} photo`}
                                      width={56}
                                      height={56}
                                      className="rounded-md object-cover"
                                    />
                                  )}
                                  <RadioGroupItem value={option.value} />
                                  <span>
                                    <span className="block text-sm font-medium text-slate-700">
                                      {option.label}
                                    </span>
                                    <span className="text-xs text-slate-500">
                                      {option.speaker}
                                    </span>
                                  </span>
                                </label>
                              ))}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
                    The Program Team reserves the right to reassign participants
                    to breakout sessions based on the allowable number of
                    participants for each venue.
                  </p>
                </section>
              )}

              {currentStep === 4 && (
                <section className="space-y-6">
                  <header>
                    <h2 className="text-xl font-semibold text-[#1a2e5a]">
                      Step 5: Accommodation
                    </h2>
                    <p className="text-sm text-slate-600">
                      Please review the accommodation details before selecting
                      your preference.
                    </p>
                  </header>
                  <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600">
                    <p>
                      Free accommodation for 500 participants, first-come
                      first-served.
                    </p>
                    <p>Available: 3:00 PM October 2 – 12:00 NN October 4.</p>
                    <p>Shared air-conditioned rooms, shared toilet/bathroom.</p>
                    <p>
                      Participants must bring sleeping materials and toiletries.
                    </p>
                    <p>Meals not provided.</p>
                    <p>Free shuttle service available.</p>
                    <p>Valid ID required at venue.</p>
                    <p>Cancellations not allowed.</p>
                  </div>
                  <FormField
                    control={form.control}
                    name="accommodation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Accommodation Preference{" "}
                          <span className="text-[#e63946]">*</span>
                        </FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="grid gap-3"
                          >
                            <label className="flex items-start gap-3 rounded-lg border border-slate-200 p-4 transition hover:border-[#2aadb5]/40">
                              <RadioGroupItem value="avail" />
                              <span className="text-sm text-slate-700">
                                I will avail of the free accommodation.
                              </span>
                            </label>
                            <label className="flex items-start gap-3 rounded-lg border border-slate-200 p-4 transition hover:border-[#2aadb5]/40">
                              <RadioGroupItem value="self" />
                              <span className="text-sm text-slate-700">
                                I can take care of the accommodation on my own.
                              </span>
                            </label>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </section>
              )}

              {currentStep === 5 && (
                <section className="space-y-6">
                  <header>
                    <h2 className="text-xl font-semibold text-[#1a2e5a]">
                      Step 6: Payment
                    </h2>
                    <p className="text-sm text-slate-600">
                      Choose a payment mode and upload proof of payment.
                    </p>
                  </header>
                  <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
                    <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
                      <p className="font-semibold text-[#1a2e5a]">
                        Payment Channels
                      </p>
                      <div>
                        <p className="font-medium text-slate-700">GCash</p>
                        <p>0976 090 1489 (CH*****N C.)</p>
                      </div>
                      <div>
                        <p className="font-medium text-slate-700">
                          BDO Check/Online Transfer
                        </p>
                        <p>Account Name: RCAC</p>
                        <p>Account Number: 006108017442</p>
                      </div>
                      <Image
                        src="/CMCMMC_GCash_QR.jpg"
                        alt="GCash QR code placeholder"
                        width={220}
                        height={220}
                        className="w-full max-w-55 rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                    <div className="space-y-5">
                      <FormField
                        control={form.control}
                        name="paymentMode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Mode of Payment{" "}
                              <span className="text-[#e63946]">*</span>
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select mode" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {[
                                  { value: "GCash", label: "GCash" },
                                  { value: "BDO", label: "BDO" },
                                ].map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="paymentProof"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Proof of Payment{" "}
                              <span className="text-[#e63946]">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="file"
                                accept="image/*,application/pdf"
                                name={field.name}
                                onBlur={field.onBlur}
                                onChange={(event) =>
                                  field.onChange(event.target.files)
                                }
                                ref={field.ref}
                              />
                            </FormControl>
                            <p className="text-xs text-slate-500">
                              Accepted formats: JPG, PNG, WEBP, PDF. Max 5MB.
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </section>
              )}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                >
                  Previous
                </Button>
                {currentStep < steps.length - 1 ? (
                  <Button type="button" onClick={handleNext}>
                    Next
                  </Button>
                ) : (
                  <Button type="submit">Submit</Button>
                )}
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
