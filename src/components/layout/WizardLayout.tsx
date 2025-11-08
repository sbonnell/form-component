/**
 * WizardLayout component
 * 
 * Step-by-step wizard navigation for multi-page forms.
 * Validates each step before allowing navigation to the next.
 */

'use client';

import React, { useState } from 'react';
import type { FieldErrors, FieldValues } from 'react-hook-form';

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
              const complete = isStepComplete(step);

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
                    {/* Step circle */}
                    <span
                      className={`
                        relative flex h-5 @xs:h-6 @md:h-8 w-5 @xs:w-6 @md:w-8 items-center justify-center rounded-full border-2 flex-shrink-0
                        ${
                          isActive
                            ? hasErrors
                              ? 'border-red-500 bg-white'
                              : 'border-blue-600 bg-white'
                            : isCompleted && !hasErrors
                            ? 'border-blue-600 bg-blue-600'
                            : hasErrors && isVisited
                            ? 'border-red-500 bg-red-50'
                            : hasErrors
                            ? 'border-orange-400 bg-orange-50'
                            : 'border-gray-300 bg-white'
                        }
                      `}
                    >
                      {isCompleted && !hasErrors ? (
                        <svg
                          className="h-3 @xs:h-3.5 @md:h-5 w-3 @xs:w-3.5 @md:w-5 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : hasErrors ? (
                        <svg
                          className={`h-3 @xs:h-3.5 @md:h-5 w-3 @xs:w-3.5 @md:w-5 ${isVisited ? 'text-red-500' : 'text-orange-500'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <span
                          className={`text-xs @xs:text-xs @md:text-sm font-medium flex-shrink-0 ${
                            isActive ? 'text-blue-600' : 'text-gray-500'
                          }`}
                        >
                          {index + 1}
                        </span>
                      )}
                    </span>

                    {/* Step label - hidden on small screens */}
                    <span className="ml-0 @md:ml-1.5 @lg:ml-2.5 hidden @md:flex flex-col flex-shrink-0 max-w-12 @lg:max-w-none">
                      <span
                        className={`block text-xs @md:text-xs @lg:text-sm font-medium truncate leading-tight ${
                          isActive
                            ? hasErrors
                              ? 'text-red-600'
                              : 'text-blue-600'
                            : isCompleted && !hasErrors
                            ? 'text-gray-900'
                            : hasErrors && isVisited
                            ? 'text-red-600'
                            : hasErrors
                            ? 'text-orange-600'
                            : 'text-gray-500'
                        }`}
                      >
                        {step.title}
                      </span>
                      {step.description && (
                        <span className={`hidden @md:block text-xs ${
                          hasErrors && isVisited
                            ? 'text-red-500'
                            : hasErrors
                            ? 'text-orange-500'
                            : 'text-gray-500'
                        } truncate leading-tight`}>
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
      <div className="bg-white rounded-lg border border-gray-200 p-2 @sm:p-4 @md:p-6 mb-4 @md:mb-6">
        <div className="mb-3 @md:mb-4 @lg:mb-6">
          <h2 className="text-base @sm:text-lg @md:text-xl font-semibold text-gray-900">
            {currentStepData.title}
          </h2>
          {currentStepData.description && (
            <p className="text-xs @sm:text-sm text-gray-600 mt-1">
              {currentStepData.description}
            </p>
          )}
        </div>

        <div>{currentStepData.content}</div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between gap-2 @sm:gap-4">
        <button
          type="button"
          onClick={handlePrevious}
          disabled={isFirstStep}
          className={`
            px-2 @sm:px-4 py-2 text-xs @sm:text-sm font-medium rounded-md transition-colors flex-1 @sm:flex-none
            ${
              isFirstStep
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }
          `}
        >
          Previous
        </button>

        {isLastStep ? (
          <button
            type="button"
            onClick={handleComplete}
            disabled={!allStepsValid}
            className={`
              px-2 @sm:px-4 py-2 text-xs @sm:text-sm font-medium rounded-md transition-colors flex-1 @sm:flex-none
              ${
                allStepsValid
                  ? 'text-white bg-blue-600 hover:bg-blue-700'
                  : 'text-gray-400 bg-gray-100 cursor-not-allowed'
              }
            `}
            title={!allStepsValid ? 'Please complete all steps before submitting' : ''}
          >
            Complete
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            className="px-2 @sm:px-4 py-2 text-xs @sm:text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors flex-1 @sm:flex-none"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}
