import React, { type ReactNode } from "react";

export interface FormWizardStep {
  id: string;
  title: string;
  description?: string;
  content: ReactNode;
  isValid?: boolean;
}

interface FormWizardProps {
  steps: FormWizardStep[];
  currentStep: number;
  onStepChange: (stepIndex: number) => void;
  submitLabel: string;
  submitting?: boolean;
  canSubmit?: boolean;
}

export default function FormWizard({
  steps,
  currentStep,
  onStepChange,
  submitLabel,
  submitting = false,
  canSubmit = false,
}: FormWizardProps) {
  const activeStep = steps[currentStep];
  const firstIncompleteIndex = steps.findIndex((step) => step.isValid === false);
  const maxReachableStep = firstIncompleteIndex === -1 ? steps.length - 1 : firstIncompleteIndex;
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="space-y-6">
      <div className="surface-section rounded-[1.75rem] p-5 md:p-6">
        <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-primary">Wizard</p>
            <h2 className="text-xl font-semibold">{activeStep.title}</h2>
            {activeStep.description ? <p className="mt-1 text-sm text-base-content/70">{activeStep.description}</p> : null}
          </div>
          <div className="badge badge-outline px-3 py-3 text-xs uppercase tracking-[0.16em]">
            Schritt {currentStep + 1} von {steps.length}
          </div>
        </div>

        <ul className="steps steps-vertical w-full gap-2 lg:steps-horizontal">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep || (index < steps.length - 1 && step.isValid === true);
            const isActive = index === currentStep;
            const canOpen = index <= maxReachableStep || index <= currentStep;

            return (
              <li key={step.id} className={`step ${isCompleted || isActive ? "step-primary" : ""}`}>
                <button
                  type="button"
                  className={`text-left text-sm ${canOpen ? "cursor-pointer font-medium" : "cursor-not-allowed opacity-55"}`}
                  onClick={() => {
                    if (canOpen) {
                      onStepChange(index);
                    }
                  }}
                  disabled={!canOpen}
                >
                  {step.title}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="space-y-6">{activeStep.content}</div>

      <div className="surface-section flex flex-col gap-3 rounded-[1.75rem] p-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-base-content/70">
          {isLastStep ? "Prüfe die Angaben und speichere den Bonsai." : "Du kannst nur in bereits validierte Schritte vorspringen."}
        </p>
        <div className="flex flex-wrap justify-end gap-3">
          <button type="button" className="btn btn-outline" onClick={() => onStepChange(currentStep - 1)} disabled={currentStep === 0}>
            Zurück
          </button>
          {isLastStep ? (
            <button className="btn btn-primary" type="submit" disabled={!canSubmit || submitting}>
              {submitting ? <span className="loading loading-spinner loading-sm" /> : null}
              {submitLabel}
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onStepChange(currentStep + 1)}
              disabled={activeStep.isValid === false}
            >
              Weiter
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
