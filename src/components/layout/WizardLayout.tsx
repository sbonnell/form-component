/**
 * WizardLayout component
 * 
 * Step-by-step wizard navigation for multi-page forms.
 * Validates each step before allowing navigation to the next.
 * Migrated to use shadcn/ui components.
 */

'use client';

import React, { useState } from 'react';
import type { FieldErrors, FieldValues } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface WizardStep {
  /** Step identifier */
  id: string;
  
  /** Step title */
  title: string;
  
  /** Step description */
  description?: string;
  
  /** Field keys in this step */
  fields: string[];
  
  /** Step content */
  content: React.ReactNode;
  
  /** 
   * Allow navigation away from this step even if invalid
   * If false (default), validation must pass before proceeding
   * If true, user can navigate to other steps with incomplete data
   */
  allowIncomplete?: boolean;
}

export interface WizardLayoutProps {
  /** Array of wizard steps */
  steps: WizardStep[];
  
  /** Form errors for validation */
  errors?: FieldErrors;
  
  /** Function to trigger validation for specific fields */
  validateFields?: (fields: string[]) => Promise<boolean>;
  
  /** Form data for checking if fields have values */
  formData?: FieldValues;
  
  /** Callback when step changes */
  onStepChange?: (stepIndex: number) => void;
  
  /** Callback when wizard completes */
  onComplete?: () => void;
  
  /** Additional CSS classes */
  className?: string;
}

export default function WizardLayout({
  steps,
  errors = {},
  validateFields,
  formData = {},
  onStepChange,
  onComplete,
  className = '',
}: WizardLayoutProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [visitedSteps, setVisitedSteps] = useState<Set<number>>(new Set([0]));

  /**
   * Check if a step has any validation errors
   */
  const hasStepErrors = (step: WizardStep): boolean => {
    return step.fields.some((fieldKey) => {
      if (errors[fieldKey]) return true;
      
      const nestedKeys = Object.keys(errors).filter((key) =>
        key.startsWith(fieldKey + '.')
      );
      return nestedKeys.length > 0;
    });
  };

  /**
   * Check if a step is complete (all fields filled)
   */
  const isStepComplete = (step: WizardStep): boolean => {
    return step.fields.every((fieldKey) => {
      const value = formData[fieldKey];
      return value !== undefined && value !== null && value !== '';
    });
  };

  /**
   * Navigate to next step with optional validation
   */
  const handleNext = async () => {
    const currentStepData = steps[currentStep];
    
    // Only validate if the step requires completion (allowIncomplete is false/undefined)
    if (!currentStepData.allowIncomplete && validateFields) {
      const isValid = await validateFields(currentStepData.fields);
      if (!isValid) {
        return; // Don't proceed if validation fails and step requires completion
      }
    }

    const nextStep = currentStep + 1;
    if (nextStep < steps.length) {
      setCurrentStep(nextStep);
      setVisitedSteps(new Set([...visitedSteps, nextStep]));
      onStepChange?.(nextStep);
    }
  };

  /**
   * Navigate to previous step
   */
  const handlePrevious = () => {
    const prevStep = currentStep - 1;
    if (prevStep >= 0) {
      setCurrentStep(prevStep);
      onStepChange?.(prevStep);
    }
  };

  /**
   * Check if all steps are valid (for enabling Complete button)
   */
  const areAllStepsValid = (): boolean => {
    return steps.every((step) => !hasStepErrors(step));
  };

  /**
   * Complete wizard (on last step)
   */
  const handleComplete = async () => {
    const currentStepData = steps[currentStep];
    
    // Validate final step if it requires completion
    if (!currentStepData.allowIncomplete && validateFields) {
      const isValid = await validateFields(currentStepData.fields);
      if (!isValid) {
        return;
      }
    }

    // Check if all steps are valid before completing
    if (!areAllStepsValid()) {
      return; // Don't complete if any step has errors
    }

    onComplete?.();
  };

  if (steps.length === 0) {
    return null;
  }

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const currentStepData = steps[currentStep];
  const allStepsValid = areAllStepsValid();

  return (
    <div className={`w-full ${className}`}>
      {/* Step Indicator */}
      <div className="@container mb-4 @md:mb-6 @lg:mb-8 w-full overflow-hidden">
        <nav aria-label="Progress">
          <ol className="flex items-center justify-start gap-0 @xs:gap-0.5 @sm:gap-1 @md:gap-2 @lg:gap-4">
            {steps.map((step, index) => {
              const isActive = index === currentStep;
              const isVisited = visitedSteps.has(index);
              const isCompleted = index < currentStep;
              const hasErrors = hasStepErrors(step);

              return (
                <li
                  key={step.id}
                  className="relative flex items-center flex-shrink-0"
                >
                  {/* Connector line - only show on larger screens */}
                  {index !== steps.length - 1 && (
                    <div
                      className="hidden @lg:flex absolute @lg:left-0 @lg:-ml-px @lg:mt-0.5 @lg:h-0.5 @lg:flex-1"
                      aria-hidden="true"
                      style={{
                        width: 'calc(100% - 1rem)',
                        left: '50%'
                      }}
                    >
                      <div
                        className={`h-full w-full ${
                          isCompleted ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      />
                    </div>
                  )}

                  <div className="relative flex items-center group flex-shrink-0">
                    <span
                      className={cn(
                        "relative flex h-5 @xs:h-6 @md:h-8 w-5 @xs:w-6 @md:w-8 items-center justify-center rounded-full border-2 flex-shrink-0",
                        isActive && hasErrors && "border-destructive bg-background",
                        isActive && !hasErrors && "border-primary bg-background",
                        !isActive && isCompleted && !hasErrors && "border-primary bg-primary",
                        !isActive && !isCompleted && hasErrors && isVisited && "border-destructive bg-destructive/10",
                        !isActive && !isCompleted && hasErrors && !isVisited && "border-orange-400 bg-orange-50",
                        !isActive && !isCompleted && !hasErrors && "border-border bg-background"
                      )}
                    >
                      {isCompleted && !hasErrors ? (
                        <Check className="h-3 @xs:h-3.5 @md:h-5 w-3 @xs:w-3.5 @md:w-5 text-primary-foreground" />
                      ) : hasErrors ? (
                        <X className={cn(
                          "h-3 @xs:h-3.5 @md:h-5 w-3 @xs:w-3.5 @md:w-5",
                          isVisited ? "text-destructive" : "text-orange-500"
                        )} />
                      ) : (
                        <span
                          className={cn(
                            "text-xs @xs:text-xs @md:text-sm font-medium flex-shrink-0",
                            isActive ? "text-primary" : "text-muted-foreground"
                          )}
                        >
                          {index + 1}
                        </span>
                      )}
                    </span>

                    <span className="ml-0 @md:ml-1.5 @lg:ml-2.5 hidden @md:flex flex-col flex-shrink-0 max-w-12 @lg:max-w-none">
                      <span
                        className={cn(
                          "block text-xs @md:text-xs @lg:text-sm font-medium truncate leading-tight",
                          isActive && hasErrors && "text-destructive",
                          isActive && !hasErrors && "text-primary",
                          !isActive && isCompleted && !hasErrors && "text-foreground",
                          !isActive && hasErrors && isVisited && "text-destructive",
                          !isActive && hasErrors && !isVisited && "text-orange-600",
                          !isActive && !hasErrors && !isCompleted && "text-muted-foreground"
                        )}
                      >
                        {step.title}
                      </span>
                      {step.description && (
                        <span className={cn(
                          "hidden @md:block text-xs truncate leading-tight",
                          hasErrors && isVisited && "text-destructive",
                          hasErrors && !isVisited && "text-orange-500",
                          !hasErrors && "text-muted-foreground"
                        )}>
                          {step.description}
                        </span>
                      )}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      {/* Step Content */}
      <Card className="mb-4 @md:mb-6">
        <CardHeader className="mb-3 @md:mb-4 @lg:mb-6">
          <CardTitle className="text-base @sm:text-lg @md:text-xl">
            {currentStepData.title}
          </CardTitle>
          {currentStepData.description && (
            <CardDescription className="text-xs @sm:text-sm mt-1">
              {currentStepData.description}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent>{currentStepData.content}</CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between gap-2 @sm:gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevious}
          disabled={isFirstStep}
          className="flex-1 @sm:flex-none"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>

        {isLastStep ? (
          <Button
            type="button"
            onClick={handleComplete}
            disabled={!allStepsValid}
            className="flex-1 @sm:flex-none"
            title={!allStepsValid ? 'Please complete all steps before submitting' : ''}
          >
            Complete
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleNext}
            className="flex-1 @sm:flex-none"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}
