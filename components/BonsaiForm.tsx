import type { FormEvent, ReactNode } from "react";
import { useEffect, useState } from "react";
import FormWizard, { type FormWizardStep } from "@/components/FormWizard";
import { bonsaiFormStepConfigs } from "@/lib/config/forms";
import { startOfTodayUtc, toDateInput } from "@/lib/date";
import type { BonsaiFormValues } from "@/types/forms";

interface BonsaiFormProps {
  initialValues: BonsaiFormValues;
  submitLabel: string;
  onSubmit: (values: BonsaiFormValues) => Promise<void>;
  submitting?: boolean;
  error?: string | null;
  success?: string | null;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="surface-section space-y-4 rounded-[1.75rem] p-5 md:p-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <fieldset className="fieldset w-full gap-2">
      <legend className="fieldset-legend text-sm font-medium">
        {label}
        {required ? " *" : ""}
      </legend>
      {children}
    </fieldset>
  );
}

export default function BonsaiForm({
  initialValues,
  submitLabel,
  onSubmit,
  submitting = false,
  error,
  success,
}: BonsaiFormProps) {
  const [values, setValues] = useState<BonsaiFormValues>(initialValues);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    setValues(initialValues);
    setCurrentStep(0);
  }, [initialValues]);

  const isValid =
    values.name.trim().length >= 2 &&
    values.species.trim().length >= 2 &&
    values.location.trim().length >= 2 &&
    values.age !== "" &&
    values.ownedSince !== "" &&
    (values.style !== "Sonstiger" || values.customStyle.trim().length >= 1);

  function update<K extends keyof BonsaiFormValues>(key: K, value: BonsaiFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function hasText(value: string, minLength = 1) {
    return value.trim().length >= minLength;
  }

  const todayDate = toDateInput(startOfTodayUtc());

  function renderField(field: (typeof bonsaiFormStepConfigs)[number]["fields"][number]) {
    if (field.condition && !field.condition(values)) {
      return null;
    }

    const key = field.key as keyof BonsaiFormValues;
    const value = values[key];
    const sharedProps = {
      className:
        field.type === "textarea"
          ? "textarea textarea-bordered h-24 w-full"
          : field.type === "select"
            ? "select select-bordered w-full"
            : "input input-bordered w-full",
      value,
      onChange: (
        event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
      ) => update(key, event.target.value as BonsaiFormValues[keyof BonsaiFormValues]),
    };

    if (field.type === "textarea") {
      return (
        <Field key={field.key} label={field.label} required={field.required}>
          <textarea {...sharedProps} className={field.key === "notes" ? "textarea textarea-bordered h-36 w-full" : sharedProps.className} />
        </Field>
      );
    }

    if (field.type === "select") {
      return (
        <Field key={field.key} label={field.label} required={field.required}>
          <select {...sharedProps}>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
      );
    }

    if (field.type === "date") {
      const extraProps =
        field.key === "ownedSince" || field.key === "lastRepotDate"
          ? { max: todayDate }
          : field.key === "nextRepotDue"
            ? { min: values.lastRepotDate || undefined }
            : {};

      return (
        <Field key={field.key} label={field.label} required={field.required}>
          <input {...sharedProps} type="date" {...extraProps} />
        </Field>
      );
    }

    return (
      <Field key={field.key} label={field.label} required={field.required}>
        <input
          {...sharedProps}
          type={field.type}
          min={field.min}
          max={field.max}
        />
      </Field>
    );
  }

  const steps: FormWizardStep[] = bonsaiFormStepConfigs.map((step) => ({
    id: step.id,
    title: step.title,
    description: step.description,
    isValid:
      step.id === "grunddaten"
        ? hasText(values.name, 2) && hasText(values.species, 2) && hasText(values.location, 2) && hasText(values.indoorOutdoor)
        : step.id === "gestaltung"
          ? values.age !== "" && hasText(values.style) && (values.style !== "Sonstiger" || hasText(values.customStyle))
          : step.id === "herkunft"
            ? hasText(values.ownedSince) && hasText(values.healthStatus) && hasText(values.developmentStage)
            : step.id === "notizen"
              ? isValid
              : true,
    content: (
      <Section title={step.sectionTitle}>
        {step.fields.map((field) =>
          step.id === "notizen" ? <div key={field.key} className="md:col-span-2">{renderField(field)}</div> : renderField(field),
        )}
      </Section>
    ),
  }));

  function handleStepChange(stepIndex: number) {
    if (stepIndex < 0 || stepIndex >= steps.length) {
      return;
    }

    const firstIncompleteIndex = steps.findIndex((step) => step.isValid === false);
    const maxReachableStep = firstIncompleteIndex === -1 ? steps.length - 1 : firstIncompleteIndex;

    if (stepIndex <= maxReachableStep || stepIndex <= currentStep) {
      setCurrentStep(stepIndex);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValid || submitting) {
      return;
    }
    await onSubmit(values);
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {error ? <div className="alert alert-error">{error}</div> : null}
      {success ? <div className="alert alert-success">{success}</div> : null}
      <FormWizard
        steps={steps}
        currentStep={currentStep}
        onStepChange={handleStepChange}
        submitLabel={submitLabel}
        submitting={submitting}
        canSubmit={isValid}
      />
    </form>
  );
}
