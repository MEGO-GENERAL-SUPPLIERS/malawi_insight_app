import React, { forwardRef, useState, useImperativeHandle, useCallback, useEffect } from "react";
import { Box, Stepper, Step, StepLabel, TextField, FormControl, FormLabel, Radio, RadioGroup, FormControlLabel, Tooltip } from "@mui/material";
import type { IFacility } from "~/types/interfaces/IFacilityInterfaces";
import type { IFacilityVisitDataRef, IFacilityVisitFormData } from "~/types/interfaces/IFacilityVisit";
import type { ITeamMemberEntry, IVisitObjective, IVisitedTeam, IVisitFinding, IVisitRecommendationAction, IQualityImprovement } from "~/types/interfaces/IFacilityVisit";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { validationUtils } from "~/utils/validationUtils";
import { LocateFixedIcon, MapPinnedIcon, MessageCircleMore, SearchIcon, Sheet, ShieldCheckIcon, TriangleAlertIcon, Users2Icon, View } from "lucide-react";
import { DatePicker } from "@mui/x-date-pickers";
import FacilitySelect from "~/components/forms/elements/FacilitySelect";
import CustomMultiFieldGroup, { type DynamicFieldConfig } from "../generic_components/CustomMultiFieldGroup";
import CustomInput from "../generic_components/CustomInput";
import { ToastAlertComponentController } from "../controllers/ToastAlertComponentController";
const PageHeaderTitle = React.lazy(() => import("~/components/system/PageHeaderTitle"));
import { isEqual } from 'lodash';
import { formattingUtils } from "~/utils/formattingUtils";
import { useNavigator } from "~/hooks/useNavigator";

interface FacilityVisitData {
  data?: IFacilityVisitFormData;
  setSlotData: (data: any) => void;
  onStepChange?: (step: number) => void;
  currentStep?: number;
}

const INITIAL_FACILITY: IFacility[] = [];
const INITIAL_DATE: Dayjs | null = null;
const INITIAL_STRING = "";
const INITIAL_TEAM_MEMBERS: ITeamMemberEntry[] = [];
const INITIAL_OBJECTIVES: IVisitObjective[] = [];
const INITIAL_VISITED_TEAM: IVisitedTeam[] = [];
const INITIAL_FINDINGS: IVisitFinding[] = [];
const INITIAL_RECOMMENDATIONS: IVisitRecommendationAction[] = [];
const INITIAL_QUALITY_IMPROVEMENT: IQualityImprovement[] = [];
const INITIAL_QI_ENABLED: "Yes" | "No" = "No";

const FacilityVisitAdd = forwardRef<IFacilityVisitDataRef, FacilityVisitData>(({
  data = {},
  setSlotData,
  onStepChange,
  currentStep = 0
}, ref) => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [selectedFacility, setSelectedFacility] = useState<IFacility[]>([]);
  const [dateOfVisit, setDateOfVisit] = useState<Dayjs | null>(null);
  const [teamLead, setTeamLead] = useState<string>("");
  const [teamMembers, setTeamMembers] = useState<ITeamMemberEntry[]>([]);
  const [facilityStaffMember, setFacilityStaffMember] = useState<string>("");
  const [objectives, setObjectives] = useState<IVisitObjective[]>([]);
  const [visitedTeam, setVisitedTeam] = useState<IVisitedTeam[]>([]);
  const [findings, setFindings] = useState<IVisitFinding[]>([]);
  const [recommendationActions, setRecommendationActions] = useState<IVisitRecommendationAction[]>([]);
  const [qualityImprovement, setQualityImprovement] = useState<IQualityImprovement[]>([]);
  const [qualityImprovementEnabled, setQualityImprovementEnabled] = useState<"Yes" | "No">("No");
  const [comment, setComment] = useState<string>("");

  const { navigateTo } = useNavigator();

  useEffect(() => {
    if (!data) return;

    const updateIfChanged = <T,>(current: T, next: T, setter: (val: T) => void) => {
      if (!isEqual(current, next)) {
        setter(next);
      }
    };

    const nextFacility = Array.isArray(data.facility) ? data.facility : [];
    updateIfChanged(selectedFacility, nextFacility, setSelectedFacility);

    const nextDate = data.date_of_visit ? dayjs(data.date_of_visit) : null;
    const currentDateString = dateOfVisit?.format('YYYY-MM-DD');
    const nextDateString = nextDate?.format('YYYY-MM-DD');
    if (currentDateString !== nextDateString) {
      setDateOfVisit(nextDate);
    }

    updateIfChanged(teamLead, formattingUtils.sanitizeStringValue(data.team_lead || ""), setTeamLead);
    updateIfChanged(facilityStaffMember, data.facility_staff_member || "", setFacilityStaffMember);
    updateIfChanged(teamMembers, data.team_members || [], setTeamMembers);
    updateIfChanged(objectives, data.objectives || [], setObjectives);
    updateIfChanged(visitedTeam, data.visited_team || [], setVisitedTeam);
    updateIfChanged(findings, data.findings || [], setFindings);
    updateIfChanged(recommendationActions, data.recommendation_actions || [], setRecommendationActions);

    const nextQI = data.quality_improvement || [];
    const nextQIEnabled = (data.quality_improvement_enabled === 1 ? "Yes" : "No");
    updateIfChanged(qualityImprovement, nextQI, setQualityImprovement);
    if (qualityImprovementEnabled !== nextQIEnabled) {
      setQualityImprovementEnabled(nextQIEnabled);
    }

    updateIfChanged(comment, data.comment || "", setComment);
  }, [data]);

  const teamMembersFields: DynamicFieldConfig[] = [
    { name: "team_member", label: "Team Member *", placeholder: "Enter team member name", required: true },
    { name: "position", label: "Position *", placeholder: "Team member position", required: true },
    { name: "organisation", label: "Organisation *", placeholder: "Member organisation", required: true }
  ];

  const objectivesFields: DynamicFieldConfig[] = [
    { name: "objective", label: "Visit Objective *", placeholder: "Enter a visit objective", required: true }
  ];

  const visitedTeamFields: DynamicFieldConfig[] = [
    { name: "team_member", label: "Personnel *", placeholder: "Enter visited member name", required: true },
    { name: "position", label: "Position/Role *", placeholder: "Enter personnel position/role", required: true },
    { name: "organisation", label: "Organisation *", placeholder: "Enter organisation name", required: true }
  ];

  const visitFindingFields: DynamicFieldConfig[] = [
    { name: "finding", label: "Finding/Observation *", placeholder: "Enter a finding or an observation", required: true }
  ];

  const visitRecommendationActionFields: DynamicFieldConfig[] = [
    { name: "recommendation_action", label: "Recommendation/Action *", placeholder: "Recommendation, action or way forward", required: true },
    { name: "responsible_personnel", label: "Responsible Personnel *", placeholder: "Enter responsible person", required: true },
    { name: "completion_date", label: "Completion Date", placeholder: "YYYY-MM-DD", required: false }
  ];

  const qualityImprovementFields: DynamicFieldConfig[] = [
    { name: "suggested_qi", label: `Suggested or running QI ${qualityImprovementEnabled === "Yes" ? "*" : ""}`, placeholder: "Suggested or running QI", required: true },
    { name: "goal_outcome", label: `Goal or Outcome Indicator ${qualityImprovementEnabled === "Yes" ? "*" : ""}`, required: true }
  ];

  const handleTeamMemberChange = useCallback((payload: { values: ITeamMemberEntry[]; valid: boolean }) => {
    setTeamMembers(payload.values);
  }, []);

  const handleObjectivesChange = useCallback((payload: { values: IVisitObjective[]; valid: boolean }) => {
    setObjectives(payload.values);
  }, []);

  const handleVisitedTeamChange = useCallback((payload: { values: IVisitedTeam[]; valid: boolean }) => {
    setVisitedTeam(payload.values);
  }, []);

  const handleFindingsChange = useCallback((payload: { values: IVisitFinding[]; valid: boolean }) => {
    setFindings(payload.values);
  }, []);

  const handleObservationActionChange = useCallback((payload: { values: IVisitRecommendationAction[]; valid: boolean }) => {
    setRecommendationActions(payload.values);
  }, []);

  const handleQIChange = useCallback((payload: { values: IQualityImprovement[]; valid: boolean }) => {
    setQualityImprovement(payload.values);
  }, []);

  const handleCommentChange = (v: any) => {
    setComment(v.value);
  };

  const steps: string[] = ["Visit Details", "Visit Objectives", "People Met / Mentored / Supervised", "Findings, Recommendations", "Continuous QI", "Comments"];

  const Step1 = () => (
    <div className="">
      <h4 className="flex gap-2 p-1 mb-4 text-xl font-bold border-b border-b-gray-300">
        <MapPinnedIcon /> Visit Details
      </h4>
      <div className="flex gap-16">
        <div className="flex-2">
          <FacilitySelect
            label="Facility Visited *"
            multiple
            value={selectedFacility}
            maxSelection={1}
            onChange={(selected) => setSelectedFacility(selected.data)}
          />
        </div>
        <div className="flex-2">
          <DatePicker
            label="Date of Visit *"
            enableAccessibleFieldDOMStructure={false}
            yearsOrder="desc"
            format="YYYY-MM-DD"
            maxDate={dayjs()}
            value={dateOfVisit}
            onChange={(selected) => selected && setDateOfVisit(dayjs(selected))}
            slots={{ textField: TextField }}
            slotProps={{ textField: { size: 'small', fullWidth: true } }}
          />
        </div>
      </div>
      <div className="flex gap-16">
        <div className="flex-2">
          <CustomInput
            label="Team Leader (of the visitors) *"
            value={teamLead}
            onChange={(e) => setTeamLead(e.value)}
            validate
            liveValidation
            validationMessage="Team lead's name is required"
          />
        </div>
        <div className="flex-2">
          <CustomInput
            label="Health Facility Staff *"
            value={facilityStaffMember}
            validate
            liveValidation
            validationMessage="Health facility staff/representative is required"
            onChange={(e) => setFacilityStaffMember(e.value)}
          />
        </div>
      </div>
      <div className="flex gap-16 mt-4 pt-6 border-t border-t-gray-300">
        <div className="flex-2">
          <CustomMultiFieldGroup
            label="Visiting Team Members *"
            fields={teamMembersFields}
            minRows={1}
            defaultValue={teamMembers}
            onChange={handleTeamMemberChange}
            showRowNumbers
            addButtonLabel="Add Team Member"
          />
        </div>
      </div>
    </div>
  );

  const Step2 = () => (
    <div>
      <h4 className="flex gap-2 p-1 mb-4 text-xl font-bold border-b border-b-gray-300">
        <LocateFixedIcon /> Visit Objectives
      </h4>
      <div className="mt-12">
        <CustomMultiFieldGroup
          label="Objectives *"
          fields={objectivesFields}
          minRows={1}
          defaultValue={objectives}
          onChange={handleObjectivesChange}
          showRowNumbers
          showErrorIcon
          addButtonLabel="Add Objective"
        />
      </div>
    </div>
  );

  const Step3 = () => (
    <div>
      <h4 className="flex gap-2 p-1 mb-4 text-xl font-bold border-b border-b-gray-300">
        <Users2Icon /> People Met / Mentored / Supervised
      </h4>
      <div className="mt-12">
        <CustomMultiFieldGroup
          label="Visited Personnel *"
          fields={visitedTeamFields}
          minRows={1}
          defaultValue={visitedTeam}
          onChange={handleVisitedTeamChange}
          showRowNumbers
          addButtonLabel="Add Visited Member"
        />
      </div>
    </div>
  );

  const Step4 = () => (
    <div className="">
      <div className="flex-1 rounded-10 border border-gray-200 p-0 mt-2">
        <h4 className="flex gap-2 p-2 mb-4 text-lg font-bold border-b border-b-gray-300 rounded-t-10 bg-white">
          <SearchIcon /> Findings/Observations
        </h4>
        <div className="mt-2 pr-2">
          <CustomMultiFieldGroup
            label="Findings *"
            defaultValue={findings}
            fields={visitFindingFields}
            minRows={1}
            onChange={handleFindingsChange}
            showRowNumbers
            addButtonLabel="Add Finding"
          />
        </div>
      </div>
      <div className="flex-1 rounded-10 border border-gray-300 p-0 mt-8">
        <h4 className="flex gap-2 p-2 mb-4 text-lg font-bold border-b border-b-gray-300 rounded-t-10 bg-white">
          <TriangleAlertIcon className="text-amber-400" /> Recommendations / Actions
        </h4>
        <div className="mt-2 pr-2">
          <CustomMultiFieldGroup
            defaultValue={recommendationActions}
            fields={visitRecommendationActionFields}
            minRows={1}
            onChange={handleObservationActionChange}
            showRowNumbers
            addButtonLabel="Add Recommendation"
          />
        </div>
      </div>
    </div>
  );

  const Step5 = () => (
    <div>
      <h4 className="flex gap-2 p-2 mb-4 text-lg font-bold border-b border-b-gray-300 rounded-t-10 bg-white">
        <ShieldCheckIcon className="text-amber-400" /> Continuous Quality Improvement
      </h4>

      <div>
        <CustomMultiFieldGroup
          label={`Continuous Quality Improvement ${qualityImprovementEnabled === "Yes" ? "*" : ""}`}
          fields={qualityImprovementFields}
          defaultValue={qualityImprovement}
          minRows={qualityImprovementEnabled === "Yes" ? 1 : 1}
          showRowNumbers
          onChange={handleQIChange}
          addButtonLabel="Add QI Row"
        />
      </div>

      <div>
        <FormControl component="fieldset" margin="dense">
          <FormLabel component="legend">
            Is QI Project Documented? *
          </FormLabel>
          <RadioGroup
            row
            aria-label="quality-improvement-enabled"
            name="qualityImprovementEnabled"
            value={qualityImprovementEnabled}
            onChange={(e) => setQualityImprovementEnabled(e.target.value as "Yes" | "No")}
          >
            <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
            <FormControlLabel value="No" control={<Radio />} label="No" />
          </RadioGroup>
        </FormControl>
      </div>
    </div>
  );

  const Step6 = () => (
    <div>
      <h4 className="flex gap-2 p-2 mb-4 text-lg font-bold border-b border-b-gray-300 rounded-t-10 bg-white">
        <MessageCircleMore className="text-amber-400" /> Comment(s)
      </h4>
      <div>
        <CustomInput
          label="Comment(s)"
          value={comment}
          multiline
          minRows={8}
          onChange={handleCommentChange}
        />
      </div>
    </div>
  );


  const getValidationErrors = useCallback((): string[] => {
    const errors: string[] = [];

    switch (activeStep) {
      case 0:
        if (selectedFacility.length !== 1) {
          errors.push("Please select exactly one facility.");
        }
        if (!dateOfVisit) {
          errors.push("Date of visit is required.");
        }
        if (!teamLead.trim()) {
          errors.push("Team Leader name is required.");
        }
        if (teamMembers.length === 0) {
          errors.push("At least one visiting team member must be added.");
        } else {
          teamMembers.forEach((m, i) => {
            if (!m.team_member?.trim()) errors.push(`Team member ${i + 1}: Name is required.`);
            if (!m.position?.trim()) errors.push(`Team member ${i + 1}: Position is required.`);
            if (!m.organisation?.trim()) errors.push(`Team member ${i + 1}: Organisation is required.`);
          });
        }
        break;

      case 1:
        if (objectives.length === 0) {
          errors.push("At least one visit objective is required.");
        } else {
          objectives.forEach((o, i) => {
            if (!o.objective?.trim()) {
              errors.push(`Objective ${i + 1} cannot be empty.`);
            }
          });
        }
        break;

      case 2:
        if (visitedTeam.length === 0) {
          errors.push("Please add at least one visited personnel.");
        } else {
          visitedTeam.forEach((p, i) => {
            if (!p.team_member?.trim()) errors.push(`Visited personnel ${i + 1}: Name is required.`);
            if (!p.position?.trim()) errors.push(`Visited personnel ${i + 1}: Position is required.`);
            if (!p.organisation?.trim()) errors.push(`Visited personnel ${i + 1}: Organisation is required.`);
          });
        }
        break;

      case 3:
        const hasFindings = findings.some(f => f.finding?.trim() !== "");
        const hasRecs = recommendationActions.some(r =>
          r.recommendation_action?.trim() !== "" && r.responsible_personnel?.trim() !== ""
        );

        if (!hasFindings && !hasRecs) {
          errors.push("Please provide at least one finding or one recommendation with responsible personnel.");
        }

        findings.forEach((f, i) => {
          if (f.finding && !f.finding.trim()) {
            errors.push(`Finding ${i + 1} cannot be empty.`);
          }
        });

        recommendationActions.forEach((r, i) => {
          if (r.recommendation_action && !r.recommendation_action.trim()) {
            errors.push(`Recommendation ${i + 1}: Action is required.`);
          }
          if (r.responsible_personnel && !r.responsible_personnel.trim()) {
            errors.push(`Recommendation ${i + 1}: Responsible personnel is required.`);
          }
        });
        break;

      case 4:
        if (qualityImprovementEnabled === "Yes") {
          if (qualityImprovement.length === 0) {
            errors.push("At least one quality improvement entry is required when QI is documented.");
          } else {
            qualityImprovement.forEach((q, i) => {
              if (!q.suggested_qi?.trim()) errors.push(`QI ${i + 1}: Suggested QI is required.`);
              if (!q.goal_outcome?.trim()) errors.push(`QI ${i + 1}: Goal or outcome is required.`);
            });
          }
        }
        // If "No", no validation — user may leave empty or add optional rows
        break;

      case 5:
        break;

      default:
        errors.push("Unknown step during validation.");
    }

    return errors;
  }, [
    activeStep,
    selectedFacility,
    dateOfVisit,
    teamLead,
    teamMembers,
    objectives,
    visitedTeam,
    findings,
    recommendationActions,
    qualityImprovementEnabled,
    qualityImprovement
  ]);

  const validateCurrentStep = useCallback(() => {
    return getValidationErrors().length === 0;
  }, [getValidationErrors]);

  useImperativeHandle(ref, () => ({
    getRows: (): IFacilityVisitFormData => {
      const normalisedRecommendations = recommendationActions.map(action => {
        let completion_date = action.completion_date;

        if(completion_date === "") completion_date = null;

        if (completion_date instanceof dayjs) {
          completion_date = completion_date.isValid() ? completion_date.toISOString() : null;
        }

        return {
          ...action,
          completion_date: completion_date
        };
      });

      return {
        facility: selectedFacility,
        date_of_visit: dateOfVisit ?? null,
        team_lead: teamLead,
        facility_staff_member: facilityStaffMember,
        team_members: teamMembers,
        objectives,
        visited_team: visitedTeam,
        findings,
        recommendation_actions: normalisedRecommendations,
        quality_improvement: qualityImprovement,
        quality_improvement_enabled: qualityImprovementEnabled === "Yes" ? 1 : 0,
        comment,
        submitted_by: data?.submitted_by
      }
    },

    validateCurrentStep,

    goToNextStep: () => {
      if (activeStep >= steps.length - 1) return;

      const errors = getValidationErrors();
      if (errors.length > 0) {
        const message = errors.length === 1
          ? errors[0]
          : `${errors[0]} (${errors.length} issues total)`;

        ToastAlertComponentController.show({
          type: "error",
          message,
          autoHideDuration: 5000,
        });
        return;
      }

      const next = activeStep + 1;
      setActiveStep(next);
      onStepChange?.(next);
    },

    goToPrevStep: () => {
      if (activeStep > 0) {
        const prev = activeStep - 1;
        setActiveStep(prev);
        onStepChange?.(prev);
      }
    },

    resetForm: () => {
      setSelectedFacility(INITIAL_FACILITY);
      setDateOfVisit(INITIAL_DATE);
      setTeamLead(INITIAL_STRING);
      setFacilityStaffMember(INITIAL_STRING);
      setTeamMembers(INITIAL_TEAM_MEMBERS);
      setObjectives(INITIAL_OBJECTIVES);
      setVisitedTeam(INITIAL_VISITED_TEAM);
      setFindings(INITIAL_FINDINGS);
      setRecommendationActions(INITIAL_RECOMMENDATIONS);
      setQualityImprovement(INITIAL_QUALITY_IMPROVEMENT);
      setQualityImprovementEnabled(INITIAL_QI_ENABLED);
      setComment(INITIAL_STRING);
      setActiveStep(0);
      onStepChange?.(0);
    }
  }));

  return (
    <div className="min-h-4/12 bg-gray-50 p-1">
      <div className="max-w-8xl ml-0">
        <PageHeaderTitle
          icon="MapPinned"
          title="New Facility Visit"
          description="Strategic Information Unit area"
          alignment="left"
          actions={[
            <Tooltip title="View facility visit data" key="view">
              <button className="btn btn-info btn-sm" onClick={() => navigateTo("generic_facility_visitor_data")}>
                <Sheet size="20" />
              </button>
            </Tooltip>
          ]}
        />
        <div>Last recorded visit</div>
        <div className="w-full min-h-screen p-6 bg-gray-50">
          <Box className="mb-8">
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
          <div className="step-content border border-gray-300 rounded-10 shadow p-4">
            {activeStep === 0 && Step1()}
            {activeStep === 1 && Step2()}
            {activeStep === 2 && Step3()}
            {activeStep === 3 && Step4()}
            {activeStep === 4 && Step5()}
            {activeStep === 5 && Step6()}
          </div>
        </div>
        <ToastAlertComponentController.render />
      </div>
    </div>
  );
});

export default FacilityVisitAdd;