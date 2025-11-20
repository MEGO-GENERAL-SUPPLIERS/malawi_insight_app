import { Button } from "@mui/material";
import { Save } from "lucide-react";
import React, { useRef, useState, useMemo, Suspense, useEffect } from "react";
import type { ModalButton } from "~/components/system/ModalComponent";
import type { IFacilityVisitDataRef, IFacilityVisitFormData } from "~/types/interfaces/IFacilityVisit";
import { AlertComponentController } from "~/components/controllers/AlertComponentController";
import { ToastAlertComponentController } from "~/components/controllers/ToastAlertComponentController";

const FacilityVisitAdd = React.lazy(() => import("~/components/forms/_main.facility_visit.add"));


const FacilityVisitNew: React.FC = () => {
  const formRef = useRef<IFacilityVisitDataRef>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const initialData: IFacilityVisitFormData = {
    facility: null,
    dateOfVisit: null,
    teamLead: "",
    facilityStaffMember: "",
    teamMembers: [],
    objectives: [],
    visitedTeam: [],
    findings: [],
    recommendationActions: [],
    qualityImprovement: [],
    qualityImprovementEnabled: "No", 
    comment: "",
  };
    const [editRow, setEditRow] = useState<IFacilityVisitFormData>(initialData);

  useEffect(() => {
    if(currentStep !== currentStep){
      setCurrentStep(currentStep);
    }
  }, [currentStep]);


  // handle Step Change
  const handleStepChange = (step: number) => {
    setCurrentStep(step);
  };

  const handleStepDown = () => {
    formRef.current?.goToPrevStep();
  };

  const handleStepUp = () => {
    if(!formRef.current) return;

    const isValid = formRef.current.validateCurrentStep();
    if(!isValid) {
      ToastAlertComponentController.show({
      type: "error",
      message: "Please complete all fields with an asterisk (*) in this step.",
      autoHideDuration: 4000,
    });
      return
    };

    formRef.current.goToNextStep();
  }; 


  // handle Submit
  const handleSubmit = () => {
    if (!formRef.current) return;

    if (!formRef.current.validateCurrentStep()) {
      ToastAlertComponentController.show({
        type: "error",
        message: "Please complete all required fields.",
        autoHideDuration: 4000,
      });
      return;
    }

    const formData = formRef.current.getRows();

    ToastAlertComponentController.show({
      type: "warning",
      message: "Data to be submitted",
      autoHideDuration: 3000,
    });

    console.log("Final data:", formData);
    // Send to API here
  };

  return(
    <div>
      <div className="border-t-1 border-t-gray-400 flex justify-end gap-4 p-5 absolute z-9 right-0 bottom-12 w-full bg-white">
        {currentStep > 0 && 
          <button className="btn btn-secondary" onClick={handleStepDown}>Previous</button>
        }
        
        { currentStep < 5 &&
          <button className="btn btn-success" onClick={handleStepUp}>Next</button>
        }

        {currentStep === 5 &&
          <button className="btn btn-success flex gap-1" onClick={handleSubmit}>
            <Save />{" "}Submit
          </button>
        }
      </div>

      <div className="pb-12">
        <FacilityVisitAdd
          ref={formRef}
          data={editRow}
          setSlotData={(data) => {
            console.log("Slot data updated:", data);
          }}
          currentStep={currentStep}
          onStepChange={handleStepChange}
        />
      </div>

      <ToastAlertComponentController.render />
    </div>
  );
};

export default FacilityVisitNew; 