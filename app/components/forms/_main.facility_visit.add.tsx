import React, {
  forwardRef,
  useState,
  useImperativeHandle,
  useCallback,
  useMemo,
} from "react";
import {
  Box,
  TextField,
  FormControl,
  FormLabel,
  Radio,
  RadioGroup,
  FormControlLabel,
  Tooltip,
  useTheme,
} from "@mui/material";
import type { IFacility } from "~/types/interfaces/IFacilityInterfaces";
import type { IFacilityVisitDataRef, IFacilityVisitFormData } from "~/types/interfaces/IFacilityVisit";
import type {
  ITeamMemberEntry,
  IVisitObjective,
  IVisitedTeam,
  IVisitFinding,
  IVisitRecommendationAction,
  IQualityImprovement,
} from "~/types/interfaces/IFacilityVisit";
import dayjs, { Dayjs } from "dayjs";
import {
  LocateFixedIcon,
  MapPinnedIcon,
  MessageCircleMore,
  SearchIcon,
  Sheet,
  ShieldCheckIcon,
  TriangleAlertIcon,
  Users2Icon,
} from "lucide-react";
import { DatePicker } from "@mui/x-date-pickers";
import FacilitySelect from "~/components/forms/elements/FacilitySelect";
import CustomMultiFieldGroup, { type DynamicFieldConfig } from "../generic_components/CustomMultiFieldGroup";
import { ToastAlertComponentController } from "../controllers/ToastAlertComponentController";
const PageHeaderTitle = React.lazy(() => import("~/components/system/PageHeaderTitle"));
import { formattingUtils } from "~/utils/formattingUtils";
import { useNavigator } from "~/hooks/useNavigator";
import { Stepper as CustomStepper, type StepObject } from "../generic_components/CustomStepper";

// ✅ MEMOIZED TEXT FIELD COMPONENTS (PER-FIELD ISOLATION)
const MemoizedTextField = React.memo(
  ({
    label,
    value,
    onChange,
    onBlur,
    error,
    helperText,
    multiline = false,
    minRows,
    maxRows,
  }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    error?: boolean;
    helperText?: string;
    multiline?: boolean;
    minRows?: number;
    maxRows?: number;
  }) => (
    <TextField
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      error={error}
      helperText={helperText}
      size="small"
      fullWidth
      multiline={multiline}
      minRows={minRows}
      maxRows={maxRows}
    />
  ),
  (prev, next) =>
    prev.value === next.value &&
    prev.error === next.error &&
    prev.helperText === next.helperText &&
    prev.multiline === next.multiline
);

interface FacilityVisitData {
  data?: IFacilityVisitFormData;
  setSlotData: (data: any) => void;
  onStepChange?: (step: number) => void;
  currentStep?: number;
}

const FacilityVisitAdd = forwardRef<IFacilityVisitDataRef, FacilityVisitData>(
  ({ data = {}, setSlotData, onStepChange, currentStep = 0 }, ref) => {
    const [teamLeadTouched, setTeamLeadTouched] = useState(false);
    const [facilityStaffTouched, setFacilityStaffTouched] = useState(false);
    const [commentTouched, setCommentTouched] = useState(false);

    // ✅ Initialize state ONCE from data
    const [activeStep, setActiveStep] = useState<number>(0);
    const [selectedFacility, setSelectedFacility] = useState<IFacility[]>(() =>
      Array.isArray(data.facility) ? [...data.facility] : []
    );
    const [dateOfVisit, setDateOfVisit] = useState<Dayjs | null>(() =>
      data.date_of_visit ? dayjs(data.date_of_visit) : null
    );
    const [teamLead, setTeamLead] = useState<string>(() =>
      formattingUtils.sanitizeStringValue(data.team_lead || "")
    );
    const [teamMembers, setTeamMembers] = useState<ITeamMemberEntry[]>(() =>
      data.team_members ? [...data.team_members] : []
    );
    const [facilityStaffMember, setFacilityStaffMember] = useState<string>(() =>
      data.facility_staff_member || ""
    );
    const [objectives, setObjectives] = useState<IVisitObjective[]>(() =>
      data.objectives ? [...data.objectives] : []
    );
    const [visitedTeam, setVisitedTeam] = useState<IVisitedTeam[]>(() =>
      data.visited_team ? [...data.visited_team] : []
    );
    const [findings, setFindings] = useState<IVisitFinding[]>(() =>
      data.findings ? [...data.findings] : []
    );
    const [recommendationActions, setRecommendationActions] = useState<IVisitRecommendationAction[]>(() =>
      data.recommendation_actions ? [...data.recommendation_actions] : []
    );
    const [qualityImprovement, setQualityImprovement] = useState<IQualityImprovement[]>(() =>
      data.quality_improvement ? [...data.quality_improvement] : []
    );
    const [qualityImprovementEnabled, setQualityImprovementEnabled] = useState<"Yes" | "No">(() =>
      data.quality_improvement_enabled === 1 ? "Yes" : "No"
    );
    const [comment, setComment] = useState<string>(() => data.comment || "");

    const { navigateTo } = useNavigator();
    const theme = useTheme();

    // --- Field Configs ---
    const teamMembersFields = useMemo<DynamicFieldConfig[]>(
      () => [
        { name: "team_member", label: "Team Member *", placeholder: "Enter team member name", required: true },
        { name: "position", label: "Position *", placeholder: "Team member position", required: true },
        { name: "organisation", label: "Organisation *", placeholder: "Member organisation", required: true },
      ],
      []
    );

    const objectivesFields = useMemo<DynamicFieldConfig[]>(
      () => [
        { name: "objective", label: "Visit Objective *", placeholder: "Enter a visit objective", required: true },
      ],
      []
    );

    const visitedTeamFields = useMemo<DynamicFieldConfig[]>(
      () => [
        { name: "team_member", label: "Personnel *", placeholder: "Enter visited member name", required: true },
        { name: "position", label: "Position/Role *", placeholder: "Enter personnel position/role", required: true },
        { name: "organisation", label: "Organisation *", placeholder: "Enter organisation name", required: true },
      ],
      []
    );

    const visitFindingFields = useMemo<DynamicFieldConfig[]>(
      () => [
        { name: "finding", label: "Finding/Observation *", placeholder: "Enter a finding or an observation", required: true },
      ],
      []
    );

    const visitRecommendationActionFields = useMemo<DynamicFieldConfig[]>(
      () => [
        {
          name: "recommendation_action",
          label: "Recommendation/Action *",
          placeholder: "Recommendation, action or way forward",
          required: true,
        },
        {
          name: "responsible_personnel",
          label: "Responsible Personnel *",
          placeholder: "Enter responsible person",
          required: true,
        },
        { name: "completion_date", label: "Completion Date", placeholder: "YYYY-MM-DD", required: false },
      ],
      []
    );

    const qualityImprovementFields = useMemo<DynamicFieldConfig[]>(
      () => [
        {
          name: "suggested_qi",
          label: `Suggested or running QI ${qualityImprovementEnabled === "Yes" ? "*" : ""}`,
          placeholder: "Suggested or running QI",
          required: true,
        },
        {
          name: "goal_outcome",
          label: `Goal or Outcome Indicator ${qualityImprovementEnabled === "Yes" ? "*" : ""}`,
          required: true,
        },
      ],
      [qualityImprovementEnabled]
    );

    // --- Handlers ---
    const handleTeamLeadChange = useCallback((value: string) => {
      setTeamLead(value);
      if (!teamLeadTouched) setTeamLeadTouched(true);
    }, [teamLeadTouched]);

    const handleTeamLeadBlur = useCallback(() => {
      setTeamLeadTouched(true);
    }, []);

    const handleFacilityStaffChange = useCallback((value: string) => {
      setFacilityStaffMember(value);
      if (!facilityStaffTouched) setFacilityStaffTouched(true);
    }, [facilityStaffTouched]);

    const handleFacilityStaffBlur = useCallback(() => {
      setFacilityStaffTouched(true);
    }, []);

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

    const handleObservationActionChange = useCallback(
      (payload: { values: IVisitRecommendationAction[]; valid: boolean }) => {
        setRecommendationActions(payload.values);
      },
      []
    );

    const handleQIChange = useCallback((payload: { values: IQualityImprovement[]; valid: boolean }) => {
      setQualityImprovement(payload.values);
    }, []);

    const handleCommentChange = useCallback((value: string) => {
      setComment(value);
      if (!commentTouched) setCommentTouched(true);
    }, [commentTouched]);

    // --- Validation Helpers ---
    const isTeamLeadValid = useCallback(() => teamLead.trim() !== "", [teamLead]);
    const isFacilityStaffValid = useCallback(() => facilityStaffMember.trim() !== "", [facilityStaffMember]);

    // --- Validation Logic ---
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
          if (!isTeamLeadValid()) {
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
          const hasFindings = findings.some((f) => f.finding?.trim() !== "");
          const hasRecs = recommendationActions.some(
            (r) => r.recommendation_action?.trim() !== "" && r.responsible_personnel?.trim() !== ""
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
          break;

        case 5:
          // No validation on comment
          break;

        default:
          errors.push("Unknown step during validation.");
      }

      return errors;
    }, [
      activeStep,
      selectedFacility,
      dateOfVisit,
      isTeamLeadValid,
      isFacilityStaffValid,
      teamMembers,
      objectives,
      visitedTeam,
      findings,
      recommendationActions,
      qualityImprovementEnabled,
      qualityImprovement,
    ]);

    const validateCurrentStep = useCallback(() => {
      return getValidationErrors().length === 0;
    }, [getValidationErrors]);

    // --- Imperative Handle ---
    useImperativeHandle(ref, () => ({
      getRows: (): IFacilityVisitFormData => {
        const normalisedRecommendations = recommendationActions.map((action) => {
          let completion_date = action.completion_date;

          if (completion_date === "") completion_date = null;

          if (completion_date instanceof dayjs) {
            completion_date = completion_date.isValid() ? completion_date.toISOString() : null;
          }

          return {
            ...action,
            completion_date: completion_date,
          };
        });

        const date_of_visit_iso = dateOfVisit?.isValid() ? dateOfVisit.toISOString() : null;

        return {
          facility: selectedFacility,
          date_of_visit: date_of_visit_iso,
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
          submitted_by: data?.submitted_by,
        };
      },

      validateCurrentStep,

      goToNextStep: () => {
        if (activeStep >= steps.length - 1) return;

        const errors = getValidationErrors();
        if (errors.length > 0) {
          const message = errors.length === 1 ? errors[0] : `${errors[0]} (${errors.length} issues total)`;

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
        setSelectedFacility([]);
        setDateOfVisit(null);
        setTeamLead("");
        setFacilityStaffMember("");
        setTeamMembers([]);
        setObjectives([]);
        setVisitedTeam([]);
        setFindings([]);
        setRecommendationActions([]);
        setQualityImprovement([]);
        setQualityImprovementEnabled("No");
        setComment("");
        setActiveStep(0);
        onStepChange?.(0);
      },
    }));

    // --- Steps Data ---
    const steps: StepObject[] = useMemo(
      () => [
        { label: "Visit Details" },
        { label: "Visit Objectives" },
        { label: "People Met / Mentored / Supervised" },
        { label: "Findings, Recommendations" },
        { label: "Continuous QI" },
        { label: "Comments" },
      ],
      []
    );

    return (
      <Box className="bg-gray-50 p-1 min-h-[50vh]">
        <Box maxWidth="8xl" mx="auto" px={{ xs: 1, sm: 2 }}>
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

          <CustomStepper steps={steps} activeStep={activeStep} />

          <Box className="border border-gray-300 rounded-lg shadow-sm p-4 bg-white">
            {activeStep === 0 ? (
              <div>
                <h4 className="flex items-center gap-2 p-1 mb-4 text-xl font-bold border-b border-gray-300">
                  <MapPinnedIcon /> Visit Details
                </h4>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: { xs: 2, sm: 4 },
                    mb: { xs: 2, sm: 3 },
                  }}
                >
                  <Box sx={{ flex: { xs: "1 1 100%", sm: "2 1 0%" } }}>
                    <FacilitySelect
                      label="Facility Visited *"
                      multiple
                      value={selectedFacility}
                      maxSelection={1}
                      onChange={(selected) => setSelectedFacility(selected.data)}
                    />
                  </Box>
                  <Box sx={{ flex: { xs: "1 1 100%", sm: "2 1 0%" } }}>
                    <DatePicker
                      label="Date of Visit *"
                      enableAccessibleFieldDOMStructure={false}
                      yearsOrder="desc"
                      format="YYYY-MM-DD"
                      maxDate={dayjs()}
                      value={dateOfVisit}
                      onChange={(selected) => selected && setDateOfVisit(dayjs(selected))}
                      slotProps={{
                        textField: {
                          size: "small",
                          fullWidth: true,
                          variant: "outlined",
                        },
                      }}
                      sx={{ width: "100%" }}
                    />
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: { xs: 2, sm: 4 },
                    mb: { xs: 2, sm: 3 },
                  }}
                >
                  <Box sx={{ flex: { xs: "1 1 100%", sm: "2 1 0%" } }}>
                    <MemoizedTextField
                      label="Team Leader (of the visitors) *"
                      value={teamLead}
                      onChange={handleTeamLeadChange}
                      onBlur={handleTeamLeadBlur}
                      error={teamLeadTouched &&!isTeamLeadValid() && activeStep === 0}
                      helperText={teamLeadTouched && !isTeamLeadValid() && activeStep === 0 ? "Team lead's name is required" : ""}
                    />
                  </Box>
                  <Box sx={{ flex: { xs: "1 1 100%", sm: "2 1 0%" } }}>
                    <MemoizedTextField
                      label="Health Facility Staff *"
                      value={facilityStaffMember}
                      onChange={handleFacilityStaffChange}
                      onBlur={handleFacilityStaffBlur}
                      error={facilityStaffTouched &&!isFacilityStaffValid() && activeStep === 0}
                      helperText={facilityStaffTouched && !isFacilityStaffValid() && activeStep === 0 ? "Health facility staff/representative is required" : ""}
                    />
                  </Box>
                </Box>

                <Box mt={3} pt={3} borderTop="1px solid" borderColor="divider">
                  <CustomMultiFieldGroup
                    label="Visiting Team Members *"
                    fields={teamMembersFields}
                    minRows={1}
                    defaultValue={teamMembers}
                    onChange={handleTeamMemberChange}
                    showRowNumbers
                    addButtonLabel="Add Team Member"
                  />
                </Box>
              </div>
            ) : activeStep === 1 ? (
              <div>
                <h4 className="flex items-center gap-2 p-1 mb-4 text-xl font-bold border-b border-gray-300">
                  <LocateFixedIcon /> Visit Objectives
                </h4>
                <Box mt={3}>
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
                </Box>
              </div>
            ) : activeStep === 2 ? (
              <div>
                <h4 className="flex items-center gap-2 p-1 mb-4 text-xl font-bold border-b border-gray-300">
                  <Users2Icon /> People Met / Mentored / Supervised
                </h4>
                <Box mt={3}>
                  <CustomMultiFieldGroup
                    label="Visited Personnel *"
                    fields={visitedTeamFields}
                    minRows={1}
                    defaultValue={visitedTeam}
                    onChange={handleVisitedTeamChange}
                    showRowNumbers
                    addButtonLabel="Add Visited Member"
                  />
                </Box>
              </div>
            ) : activeStep === 3 ? (
              <div>
                <Box className="rounded-lg border border-gray-200 mt-2">
                  <h4 className="flex items-center gap-2 p-2 mb-4 text-lg font-bold border-b border-gray-300 rounded-t-lg bg-white">
                    <SearchIcon /> Findings/Observations
                  </h4>
                  <Box p={2}>
                    <CustomMultiFieldGroup
                      label="Findings *"
                      defaultValue={findings}
                      fields={visitFindingFields}
                      minRows={1}
                      onChange={handleFindingsChange}
                      showRowNumbers
                      addButtonLabel="Add Finding"
                    />
                  </Box>
                </Box>

                <Box className="rounded-lg border border-gray-300 mt-6">
                  <h4 className="flex items-center gap-2 p-2 mb-4 text-lg font-bold border-b border-gray-300 rounded-t-lg bg-white">
                    <TriangleAlertIcon className="text-amber-400" /> Recommendations / Actions
                  </h4>
                  <Box p={2}>
                    <CustomMultiFieldGroup
                      defaultValue={recommendationActions}
                      fields={visitRecommendationActionFields}
                      minRows={1}
                      onChange={handleObservationActionChange}
                      showRowNumbers
                      addButtonLabel="Add Recommendation"
                    />
                  </Box>
                </Box>
              </div>
            ) : activeStep === 4 ? (
              <div>
                <h4 className="flex items-center gap-2 p-2 mb-4 text-lg font-bold border-b border-gray-300 rounded-t-lg bg-white">
                  <ShieldCheckIcon className="text-amber-400" /> Continuous Quality Improvement
                </h4>

                <Box mt={2}>
                  <CustomMultiFieldGroup
                    label={`Continuous Quality Improvement ${qualityImprovementEnabled === "Yes" ? "*" : ""}`}
                    fields={qualityImprovementFields}
                    defaultValue={qualityImprovement}
                    minRows={1}
                    showRowNumbers
                    onChange={handleQIChange}
                    addButtonLabel="Add QI Row"
                  />
                </Box>

                <Box mt={3}>
                  <FormControl component="fieldset" margin="dense">
                    <FormLabel component="legend">Is QI Project Documented? *</FormLabel>
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
                </Box>
              </div>
            ) : activeStep === 5 ? (
              <div>
                <h4 className="flex items-center gap-2 p-2 mb-4 text-lg font-bold border-b border-gray-300 rounded-t-lg bg-white">
                  <MessageCircleMore className="text-amber-400" /> Comment(s)
                </h4>
                <Box mt={2}>
                  <MemoizedTextField
                    label="Comment(s)"
                    value={comment}
                    onChange={setComment}
                    multiline
                    minRows={6}
                    maxRows={10}
                  />
                </Box>
              </div>
            ) : null}
          </Box>
        </Box>
        <ToastAlertComponentController.render />
      </Box>
    );
  }
);

FacilityVisitAdd.displayName = "FacilityVisitAdd";

export default FacilityVisitAdd;