import React from 'react';
import { Check } from 'lucide-react';

export interface StepObject {
  label: string;
  description?: string;
}

type Step = string | StepObject;

interface CustomStyles {
  circle?: React.CSSProperties;
  line?: React.CSSProperties;
  label?: React.CSSProperties;
}

interface StepperProps {
  steps?: Step[];
  activeStep?: number;
  onStepClick?: ((index: number) => void) | null;
  clickable?: boolean;
  showCompletedIcon?: boolean;
  activeColor?: string;
  inactiveColor?: string;
  size?: 'sm' | 'md' | 'lg';
  orientation?: 'horizontal' | 'vertical';
  alternativeLabel?: boolean;
  className?: string;
  customStyles?: CustomStyles;
}

interface SizeConfig {
  circle: string;
  text: string;
  label: string;
  line: string;
  iconSize: number;
}

type StepState = 'active' | 'completed' | 'inactive';

interface ColorClasses {
  bg: string;
  text: string;
  line: string;
}

/**
 * Reusable Stepper Component
 */
export const Stepper: React.FC<StepperProps> = ({
  steps = [],
  activeStep = 0,
  onStepClick = null,
  clickable = false,
  showCompletedIcon = true,
  activeColor = 'emerald',
  inactiveColor = 'gray',
  size = 'md',
  orientation = 'horizontal',
  alternativeLabel = true,
  className = '',
  customStyles = {},
}) => {
  // Size configurations
  const sizeConfig: Record<'sm' | 'md' | 'lg', SizeConfig> = {
    sm: {
      circle: 'w-6 h-6 md:w-8 md:h-8',
      text: 'text-xs md:text-sm',
      label: 'text-xs',
      line: 'h-0.5',
      iconSize: 14,
    },
    md: {
      circle: 'w-8 h-8 md:w-10 md:h-10',
      text: 'text-sm md:text-base',
      label: 'text-xs',
      line: 'h-0.5',
      iconSize: 16,
    },
    lg: {
      circle: 'w-10 h-10 md:w-12 md:h-12',
      text: 'text-base md:text-lg',
      label: 'text-sm',
      line: 'h-1',
      iconSize: 18,
    },
  };

  const config: SizeConfig = sizeConfig[size];

  // Color configurations
  const getColorClasses = (state: StepState): ColorClasses => {
    const colors: Record<StepState, ColorClasses> = {
      active: {
        bg: `bg-${activeColor}-500`,
        text: 'text-white',
        line: `bg-${activeColor}-500`,
      },
      completed: {
        bg: `bg-${activeColor}-500`,
        text: 'text-white',
        line: `bg-${activeColor}-500`,
      },
      inactive: {
        bg: `bg-${inactiveColor}-300`,
        text: `text-${inactiveColor}-600`,
        line: `bg-${inactiveColor}-300`,
      },
    };
    return colors[state];
  };

  const handleStepClick = (index: number): void => {
    if (clickable && onStepClick) {
      onStepClick(index);
    }
  };

  const getStepState = (index: number): StepState => {
    if (index === activeStep) return 'active';
    if (index < activeStep) return 'completed';
    return 'inactive';
  };

  const getStepLabel = (step: Step): string => {
    return typeof step === 'string' ? step : step.label;
  };

  const getStepDescription = (step: Step): string | null => {
    return typeof step === 'object' ? step.description || null : null;
  };

  // Horizontal Stepper
  if (orientation === 'horizontal') {
    return (
      <div className={`w-full overflow-x-auto pb-4 pt-1 ${className}`}>
        <div className="flex items-center min-w-max md:min-w-0 px-2 md:px-0">
          {steps.map((step, index) => {
            const state = getStepState(index);
            const colors = getColorClasses(state);
            const isClickable = clickable && onStepClick !== null;
            const label = getStepLabel(step);
            const description = getStepDescription(step);

            return (
              <div key={index} className="flex items-center flex-1">
                <div className="flex flex-col items-center w-full">
                  <div className="flex items-center w-full">
                    {index > 0 && (
                      <div
                        className={`flex-1 ${config.line} ${
                          index <= activeStep
                            ? getColorClasses('completed').line
                            : getColorClasses('inactive').line
                        }`}
                        style={customStyles.line}
                      />
                    )}
                    <div
                      onClick={() => handleStepClick(index)}
                      className={`
                        ${config.circle} 
                        rounded-full 
                        flex items-center justify-center 
                        ${config.text} 
                        font-bold 
                        transition-all 
                        mx-1 
                        flex-shrink-0
                        ${colors.bg} 
                        ${colors.text}
                        ${state === 'active' ? 'scale-110 shadow-lg' : ''}
                        ${isClickable ? 'cursor-pointer hover:opacity-80' : ''}
                      `}
                      style={customStyles.circle}
                      role={isClickable ? 'button' : undefined}
                      tabIndex={isClickable ? 0 : undefined}
                      onKeyDown={isClickable ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleStepClick(index);
                        }
                      } : undefined}
                    >
                      {state === 'completed' && showCompletedIcon ? (
                        <Check size={config.iconSize} />
                      ) : (
                        index + 1
                      )}
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`flex-1 ${config.line} ${
                          index < activeStep
                            ? getColorClasses('completed').line
                            : getColorClasses('inactive').line
                        }`}
                        style={customStyles.line}
                      />
                    )}
                  </div>
                  {alternativeLabel && (
                    <div className="hidden md:block mt-3 text-center">
                      <span
                        className={`${config.label} font-medium ${
                          index <= activeStep ? 'text-gray-700' : 'text-gray-500'
                        }`}
                        style={customStyles.label}
                      >
                        {label}
                      </span>
                      {description && (
                        <p className="text-xs text-gray-400 mt-1">{description}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Vertical Stepper
  return (
    <div className={`w-full ${className}`}>
      <div className="flex flex-col space-y-4">
        {steps.map((step, index) => {
          const state = getStepState(index);
          const colors = getColorClasses(state);
          const isClickable = clickable && onStepClick !== null;
          const label = getStepLabel(step);
          const description = getStepDescription(step);

          return (
            <div key={index} className="flex items-start">
              <div className="flex flex-col items-center mr-4">
                <div
                  onClick={() => handleStepClick(index)}
                  className={`
                    ${config.circle} 
                    rounded-full 
                    flex items-center justify-center 
                    ${config.text} 
                    font-bold 
                    transition-all
                    ${colors.bg} 
                    ${colors.text}
                    ${state === 'active' ? 'scale-110 shadow-lg' : ''}
                    ${isClickable ? 'cursor-pointer hover:opacity-80' : ''}
                  `}
                  style={customStyles.circle}
                  role={isClickable ? 'button' : undefined}
                  tabIndex={isClickable ? 0 : undefined}
                  onKeyDown={isClickable ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleStepClick(index);
                    }
                  } : undefined}
                >
                  {state === 'completed' && showCompletedIcon ? (
                    <Check size={config.iconSize} />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-0.5 flex-1 mt-2 min-h-[40px] ${
                      index < activeStep
                        ? getColorClasses('completed').line
                        : getColorClasses('inactive').line
                    }`}
                    style={customStyles.line}
                  />
                )}
              </div>
              <div className="flex-1 pb-8">
                <h3
                  className={`${config.label} font-semibold ${
                    index <= activeStep ? 'text-gray-800' : 'text-gray-500'
                  }`}
                  style={customStyles.label}
                >
                  {label}
                </h3>
                {description && (
                  <p className="text-xs text-gray-500 mt-1">{description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};