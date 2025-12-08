import { Save } from "lucide-react";
import React, { useRef, useState, Suspense, useEffect } from "react";
import type { IFacilityVisitDataRef, IFacilityVisitFormData } from "~/types/interfaces/IFacilityVisit";
import { ToastAlertComponentController } from "~/components/controllers/ToastAlertComponentController";
import { localStorageUtils } from "~/utils/localStorageUtils";
const FacilityVisitAdd = React.lazy(() => import("~/components/forms/_main.facility_visit.add"));
import { addFacilityVisit } from "~/services/facilityVisitService";
import { AlertComponentController } from "~/components/controllers/AlertComponentController";
import { CircularProgress } from "@mui/material";


const FacilityVisitNew: React.FC = () => {
  const formRef = useRef<IFacilityVisitDataRef>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const initialData: IFacilityVisitFormData = {
    facility: null,
    date_of_visit: null,
    team_lead: ``,
    facility_staff_member: ``,
    team_members: [],
    objectives: [],
    visited_team: [],
    findings: [],
    recommendation_actions: [],
    quality_improvement: [],
    quality_improvement_enabled: "No", 
    comment: "",
  };
  const [editRow, setEditRow] = useState<IFacilityVisitFormData>(initialData);
  const localUser = localStorageUtils.getStoredUser();
  const [loadingAsync, setLoadingAsync] = useState(false);

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
  const handleSubmit = async () => {
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
    const allData = {
      ...formData,
      submitted_by: localUser
    };

    console.log("Final data:", allData);

    AlertComponentController.dismiss();
    AlertComponentController.show({
      type: `confirm`,
      title: `Submit Facility Visit Data`,
      message: `Are you sure you want to submit this facility visit data?`,
      buttons: [
        {
          label: `Proceed`,
          className: `btn btn-success`,
          onClick: async () => {       
            setLoadingAsync(true);
            
            const response = await addFacilityVisit(allData);

            if(response.success){
              ToastAlertComponentController.show({
                type: "success",
                message: `${response.message || "Failed to add visit"}`,
                autoHideDuration: 3500,
              });

              setEditRow(initialData);
              setCurrentStep(0);
              if (formRef.current?.resetForm) {
                formRef.current.resetForm();
              }
            } else {
              ToastAlertComponentController.show({
                type: "error",
                message: `${response.message || "Failed to add facility visit"}`,
                autoHideDuration: 4000,
              });
            }

            setLoadingAsync(false);
          }
        },{
          label: `Cancel`,
          className: `btn btn-danger`,
          autoClose: true,
          onClick: () => {}
        }
      ]
    });
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
          <button className={`btn btn-success flex gap-1 ${loadingAsync ? ' opacity-70 cursor-not-allowed' : ''}`} disabled={loadingAsync} onClick={handleSubmit}>
            {loadingAsync ? <CircularProgress className="animate-spin" /> : <Save />}
            {" "}Submit
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