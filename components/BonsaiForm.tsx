import React, { useEffect, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import FormWizard, { type FormWizardStep } from "@/components/FormWizard";
import { bonsaiFormStepConfigs, type FormFieldConfig, type FormStepConfig } from "@/lib/config/forms";
import { startOfTodayUtc, toDateInput } from "@/lib/date";
import type { BonsaiFormValues } from "@/types/forms";

interface BonsaiFormProps {
  mode?: "create" | "edit";
  initialValues: BonsaiFormValues;
  submitLabel: string;
  onSubmit: (values: BonsaiFormValues) => Promise<void>;
  submitting?: boolean;
  error?: string | null;
  success?: string | null;
}

function hasText(value: string, minLength = 1) {
  return value.trim().length >= minLength;
}

function hasCustomStyleError(values: BonsaiFormValues) {
  return values.style === "Sonstiger" && !hasText(values.customStyle);
}

function canSubmitForm(values: BonsaiFormValues, mode: "create" | "edit") {
  return hasText(values.name, 2) && (mode === "create" || hasText(values.location, 2)) && !hasCustomStyleError(values);
}

function getCreateDetailSteps(steps: FormStepConfig[]) {
  return steps
    .map((step) => ({
      ...step,
      fields: step.fields.filter((field) => field.key !== "name"),
    }))
    .filter((step) => step.fields.length > 0);
}

function getQuickstartField() {
  return bonsaiFormStepConfigs[0].fields.find((field) => field.key === "name") ?? bonsaiFormStepConfigs[0].fields[0];
}

function getFieldClassName(field: FormFieldConfig) {
  if (field.type === "textarea") {
    return field.key === "notes" ? "textarea textarea-bordered h-36 w-full" : "textarea textarea-bordered h-24 w-full";
  }

  if (field.type === "select") {
    return "select select-bordered w-full";
  }

  return "input input-bordered w-full";
}

function getDateInputProps(field: FormFieldConfig, values: BonsaiFormValues, todayDate: string) {
  if (field.key === "ownedSince" || field.key === "lastRepotDate") {
    return { max: todayDate };
  }

  if (field.key === "nextRepotDue") {
    return { min: values.lastRepotDate || undefined };
  }

  return {};
}

function isStepValid(stepId: FormStepConfig["id"], values: BonsaiFormValues, canSubmit: boolean) {
  if (stepId === "grunddaten") {
    return hasText(values.name, 2) && hasText(values.location, 2) && hasText(values.indoorOutdoor);
  }

  if (stepId === "gestaltung") {
    return hasText(values.style) && (values.style !== "Sonstiger" || hasText(values.customStyle));
  }

  if (stepId === "herkunft") {
    return hasText(values.healthStatus) && hasText(values.developmentStage);
  }

  if (stepId === "notizen") {
    return canSubmit;
  }

  return true;
}

function isWideField(stepId: FormStepConfig["id"]) {
  return stepId === "notizen";
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
  mode = "edit",
  initialValues,
  submitLabel,
  onSubmit,
  submitting = false,
  error,
  success,
}: BonsaiFormProps) {
  const [values, setValues] = useState<BonsaiFormValues>(initialValues);
  const [currentStep, setCurrentStep] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const isCreateMode = mode === "create";

  useEffect(() => {
    setValues(initialValues);
    setCurrentStep(0);
    setDetailsOpen(false);
  }, [initialValues]);

  const canSubmit = canSubmitForm(values, mode);

  function update(key: keyof BonsaiFormValues, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  const todayDate = toDateInput(startOfTodayUtc());
  const quickstartField = getQuickstartField();
  const createDetailSteps = getCreateDetailSteps(bonsaiFormStepConfigs);

  function renderField(field: FormFieldConfig) {
    if (field.condition && !field.condition(values)) {
      return null;
    }

    const key = field.key;
    const sharedProps = {
      className: getFieldClassName(field),
      value: values[key],
      placeholder: field.placeholder,
      onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => update(key, event.target.value),
    };

    if (field.type === "textarea") {
      return (
        <Field key={field.key} label={field.label} required={field.required}>
          <textarea {...sharedProps} />
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
      return (
        <Field key={field.key} label={field.label} required={field.required}>
          <input {...sharedProps} type="date" {...getDateInputProps(field, values, todayDate)} />
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
          inputMode={field.inputMode}
        />
      </Field>
    );
  }

  function renderStepFields(step: FormStepConfig) {
    return step.fields.map((field) =>
      isWideField(step.id) ? <div key={field.key} className="md:col-span-2">{renderField(field)}</div> : renderField(field),
    );
  }

  const steps: FormWizardStep[] = bonsaiFormStepConfigs.map((step) => ({
    id: step.id,
    title: step.title,
    description: step.description,
    isValid: isStepValid(step.id, values, canSubmit),
    content: (
      <Section title={step.sectionTitle}>
        {renderStepFields(step)}
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
    if (!canSubmit || submitting) {
      return;
    }
    await onSubmit(values);
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {error ? <div className="alert alert-error">{error}</div> : null}
      {success ? <div className="alert alert-success">{success}</div> : null}
      {isCreateMode ? (
        <>
          <section className="surface-section space-y-5 rounded-[1.75rem] p-5 md:p-6">
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.18em] text-primary">Schnellstart</p>
              <h2 className="text-xl font-semibold">Erst speichern, Details später ergänzen</h2>
              <p className="text-sm text-base-content/70">
                Für den ersten Schritt reicht der Name. Weitere Angaben kannst du jetzt optional ergänzen oder nach dem Speichern auf der Detailseite nachziehen.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {renderField(quickstartField)}
            </div>
            <div className="flex flex-col gap-3 rounded-[1.5rem] border border-base-300/70 bg-base-100/60 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium">Mehr Angaben sind optional</p>
                <p className="text-sm text-base-content/70">
                  Art, Standort, Bilder und Pflegeprofil können direkt mit erfasst werden, blockieren den Schnellstart aber nicht.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setDetailsOpen((current) => !current)}
                aria-expanded={detailsOpen}
              >
                {detailsOpen ? "Weitere Details ausblenden" : "Weitere Details anzeigen"}
              </button>
            </div>
          </section>

          {detailsOpen
            ? createDetailSteps.map((step) => (
                <Section key={step.id} title={step.sectionTitle}>
                  {renderStepFields(step)}
                </Section>
              ))
            : null}

          <div className="surface-section flex flex-col gap-3 rounded-[1.75rem] p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-base-content/70">
              {detailsOpen
                ? "Du kannst die zusätzlichen Felder leer lassen und trotzdem direkt speichern."
                : "Der Bonsai wird mit Standardwerten angelegt und kann danach vollständig ergänzt werden."}
            </p>
            <button className="btn btn-primary" type="submit" disabled={!canSubmit || submitting}>
              {submitting ? <span className="loading loading-spinner loading-sm" /> : null}
              {submitLabel}
            </button>
          </div>
        </>
      ) : (
        <FormWizard
          steps={steps}
          currentStep={currentStep}
          onStepChange={handleStepChange}
          submitLabel={submitLabel}
          submitting={submitting}
          canSubmit={canSubmit}
        />
      )}
    </form>
  );
}
