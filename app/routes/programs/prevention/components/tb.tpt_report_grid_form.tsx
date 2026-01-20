import React, {
  useState,
  useEffect,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from "react";
import { Box, Stepper, Step, StepLabel, TextField, FormControl } from "@mui/material";
import dayjs, { type Dayjs } from "dayjs";

import type {
  ITPTGridRow,
  ITPTReportData,
  TPTReportGridRef,
} from "~/types/interfaces/ITPTReportInterfaces";
import { DatePicker } from "@mui/x-date-pickers";
import FacilitySelect from "../../../../components/forms/elements/FacilitySelect";
import type { IFacility } from "~/types/interfaces/IFacilityInterfaces";

interface Props {
  data?: ITPTReportData | null;
  setSlotData: (data: ITPTGridRow[] | null) => void;
  currentStep?: number;
  onStepChange?: (step: number) => void;
}

const ageGroups = [
  "<1",
  "1-4",
  "5-9",
  "10-14",
  "15-19",
  "20-24",
  "25-29",
  "30-34",
  "35-39",
  "40-44",
  "45-49",
  "50+",
] as const;

const indicators = [
  "Total number of clients new on ART (TX New)",
  "Number of clients new on ART started on IPT",
  "Number of clients new on ART started on 3HP",
  "Number of clients who reached the six months milestone during the reporting month (IPT)",
  "Number of clients reached the three months milestone during the reporting month (3HP)",
  "Number of clients who stopped TPT during the reporting month",
  "Number of clients who developed active TB during the reporting month",
] as const;

const defaultReasons = [
  "Developed symptoms of hepatitis",
  "Developed neurological symptoms",
  "Patient not adherent",
  "Severe rash",
  "Other reasons",
  "Developed active TB",
] as const;

const makeDefaultGrid = (): ITPTGridRow[] => {
  const rows: ITPTGridRow[] = [];

  indicators.forEach((ind) => {
    ["M", "FP", "FNP"].forEach((t) => {
      const values: Record<string, number> = {};
      ageGroups.forEach((a) => (values[a] = 0));

      rows.push({
        indicator: ind,
        type: t as "M" | "FP" | "FNP",
        values,
      });
    });
  });

  return rows;
};

const TPTReportGridForm = forwardRef<TPTReportGridRef, Props>(
  ({ data = null, setSlotData, currentStep = 0, onStepChange }, ref) => {
    const [reportPeriod, setReportPeriod] = useState<Dayjs | null>(null);
    const [openReportPeriod, setOpenReportPeriod] = useState(false);
    const [currentReportPeriodView, setCurrentReportPeriodView] = useState("year");

    const [facility, setFacility] = useState<IFacility[] | any>(null);

    const [activeStep, setActiveStep] = useState<number>(currentStep);
    const [gridRows, setGridRows] = useState<ITPTGridRow[]>(makeDefaultGrid());
    const [iptStop, setIptStop] = useState<Record<string, number>>({});
    const [threeHpStop, setThreeHpStop] = useState<Record<string, number>>({});
    const [comment, setComment] = useState("");

    const [iptBuffers, setIptBuffers] = useState<Record<string, string>>(
      () => Object.fromEntries(defaultReasons.map(r => [r, String(iptStop[r] ?? 0)]))
    );

    const [threeHpBuffers, setThreeHpBuffers] = useState<Record<string, string>>(
      () => Object.fromEntries(defaultReasons.map(r => [r, String(threeHpStop[r] ?? 0)]))
    );

    useEffect(() => {
      if (data) {
        if (data.data) setGridRows(data.data);
        if (data.ipt_stop_reasons) setIptStop(data.ipt_stop_reasons);
        if (data.three_hp_stop_reasons) setThreeHpStop(data.three_hp_stop_reasons);
        if (data.meta.comment) setComment(data.meta.comment);
      } else {
        setIptStop(Object.fromEntries(defaultReasons.map((r) => [r, 0])));
        setThreeHpStop(Object.fromEntries(defaultReasons.map((r) => [r, 0])));
      }
    }, []);

    
    useEffect(() => {
      setActiveStep(currentStep);
    }, [currentStep]);


    const handleFacilitiesChange = useCallback(({ data }: { data: any[] }) => {
      if(Array.isArray(data)) {
        setFacility(data[0]);
        return;
      }

      setFacility((prev: any) => ({ ...prev, data }));
    }, []);


    useImperativeHandle(ref, () => ({
      getRows: () => ({
        meta: {
          report_period: reportPeriod?.toISOString(),
          facility: facility,
          submitted_by: {},
          comment
        }, // Step 1 is empty — no metadata
        data: gridRows,
        ipt_stop_reasons: iptStop,
        three_hp_stop_reasons: threeHpStop,
      }),
      validateCurrentStep: () => true,
      goToNextStep: () => {
        const next = Math.min(activeStep + 1, 3);
        setActiveStep(next);
        onStepChange?.(next);
      },
      goToPrevStep: () => {
        const prev = Math.max(activeStep - 1, 0);
        setActiveStep(prev);
        onStepChange?.(prev);
      },
    }));

    // Sync grid data upwards
    useEffect(() => {
      setSlotData(gridRows);
    }, [gridRows, setSlotData]);

    // Fix: Only update the changed cell → prevents cursor jumping
    const handleGridChange = useCallback(
      (rowIndex: number, age: string, value: string) => {
        const num = value === "" ? 0 : parseInt(value, 10) || 0;

        setGridRows((prev) =>
          prev.map((row, idx) =>
            idx === rowIndex
              ? {
                  ...row,
                  values: { ...row.values, [age]: num },
                }
              : row
          )
        );
      },
      []
    );

    // ----- RENDER STEP CONTENT -----
    const Step1 = () => (
      <div className="bg-white rounded-lg shadow">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold">TPT Report</h2>
          <p className="text-gray-600 mt-2">Proceed to continue filling the report.</p>
        </div>

        <div className="bg-white rounded-md p-6 space-y-6">
          {/* First row: Report Period + Facility */}
          <div className="flex gap-4">
            <div className="flex-1">
              <DatePicker
                label="Report Period"
                enableAccessibleFieldDOMStructure={false}
                open={openReportPeriod}
                onOpen={() => setOpenReportPeriod(true)}
                onClose={() => setOpenReportPeriod(false)}
                openTo="year"
                views={['year', 'month']}
                yearsOrder="desc"
                format="MMM-YY"
                maxDate={dayjs()}
                value={reportPeriod}
                onChange={(selected) => {
                  if (selected) setReportPeriod(dayjs(selected));
                }}
                onViewChange={(view) => setCurrentReportPeriodView(view)}
                onYearChange={(newYear) => {
                  if (currentReportPeriodView === 'month') setOpenReportPeriod(false);
                }}
                slots={{ textField: TextField }}
                slotProps={{
                  textField: { size: 'small', fullWidth: true }
                }}
              />
            </div>

            <div className="flex-1">
              <FacilitySelect 
                label="Facility"
                value={facility}
                multiple={true}
                maxSelection={1}
                validate
                onChange={handleFacilitiesChange}
              />
            </div>
          </div>

          <div>
            <TextField
              label="Data Collectors"
              variant="outlined"
              size="small"
              placeholder="Separate names with comma"
              fullWidth
            />
          </div>
        </div>
      </div>
    );

  const Step2 = () => (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-4">
          <h2 className="text-xl font-bold text-white">TPT Reporting Grid</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr>
                <th className="border border-gray-300 bg-gray-700 p-3 font-bold text-white text-left min-w-[200px]">
                  Indicator
                </th>
                <th className="border border-gray-300 bg-gray-700 p-3 font-bold text-white text-left min-w-[150px]">
                  Gender
                </th>
                {ageGroups.map((age) => (
                  <th
                    key={age}
                    className="border border-gray-300 bg-gray-600 p-2 font-bold text-white text-center min-w-[60px]"
                  >
                    {age}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {indicators.map((indicator, indIdx) => {
                const types = ["M", "FP", "FNP"];
                return (
                  <React.Fragment key={indicator}>
                    {types.map((type, typeIdx) => {
                      const isFirst = typeIdx === 0;
                      const rowIndex = indIdx * 3 + typeIdx;
                      const row = gridRows[rowIndex];

                      return (
                        <tr key={`${indicator}-${type}`} className="hover:bg-gray-50">
                          {isFirst && (
                            <td
                              rowSpan={types.length}
                              className="border border-gray-300 p-3 font-medium text-gray-800 bg-gray-50 align-top"
                            >
                              {indicator}
                            </td>
                          )}
                          <td className="border border-gray-300 p-3 text-gray-700">
                            {type === "M" ? "Male" : type === "FP" ? "Female (Pregnant)" : "Female (Not Pregnant)"}
                          </td>

                          {ageGroups.map((age) => {
                            const [buffer, setBuffer] = useState<string>(
                              String(row.values[age])
                            );

                            return (
                              <td key={age} className="border border-gray-300 p-0">
                                <input
                                  type="text"
                                  className="w-full p-2 text-center outline-none focus:ring-1 focus:ring-blue-400"
                                  value={buffer}
                                  onFocus={() => {
                                    if (buffer === "0") {
                                      setBuffer("");
                                    }
                                  }}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === "" || /^\d+$/.test(val)) {
                                      setBuffer(val);
                                    }
                                  }}
                                  onBlur={() => {
                                    const finalVal = buffer === "" ? 0 : parseInt(buffer, 10);
                                    setBuffer(String(finalVal));

                                    setGridRows((prev) =>
                                      prev.map((r, idx) =>
                                        idx === rowIndex
                                          ? { ...r, values: { ...r.values, [age]: finalVal } }
                                          : r
                                      )
                                    );
                                  }}
                                />
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );

    const Step3 = () => {
      // Initialize buffers ONCE from iptStop/threeHpStop
      const [iptBuffers, setIptBuffers] = useState<Record<string, string>>(() =>
        Object.fromEntries(
          defaultReasons.map(r => [r, String(iptStop[r] ?? 0)])
        )
      );

      const [threeHpBuffers, setThreeHpBuffers] = useState<Record<string, string>>(() =>
        Object.fromEntries(
          defaultReasons.map(r => [r, String(threeHpStop[r] ?? 0)])
        )
      );

      // Sync buffers when iptStop/threeHpStop change (e.g., from data prop)
      useEffect(() => {
        setIptBuffers(prev => {
          const updated = { ...prev };
          let changed = false;
          defaultReasons.forEach(r => {
            const newVal = String(iptStop[r] ?? 0);
            if (updated[r] !== newVal) {
              updated[r] = newVal;
              changed = true;
            }
          });
          return changed ? updated : prev;
        });
      }, [iptStop]);

      useEffect(() => {
        setThreeHpBuffers(prev => {
          const updated = { ...prev };
          let changed = false;
          defaultReasons.forEach(r => {
            const newVal = String(threeHpStop[r] ?? 0);
            if (updated[r] !== newVal) {
              updated[r] = newVal;
              changed = true;
            }
          });
          return changed ? updated : prev;
        });
      }, [threeHpStop]);

      // Stable update functions
      const updateIptBuffer = useCallback((reason: string, value: string) => {
        setIptBuffers(prev => ({ ...prev, [reason]: value }));
      }, []);

      const updateHpBuffer = useCallback((reason: string, value: string) => {
        setThreeHpBuffers(prev => ({ ...prev, [reason]: value }));
      }, []);

      const handleIptBlur = useCallback((reason: string, value: string) => {
        const num = value === "" ? 0 : parseInt(value, 10) || 0;
        setIptStop(prev => ({ ...prev, [reason]: num }));
      }, []);

      const handleHpBlur = useCallback((reason: string, value: string) => {
        const num = value === "" ? 0 : parseInt(value, 10) || 0;
        setThreeHpStop(prev => ({ ...prev, [reason]: num }));
      }, []);

      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">Stop Reasons</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* IPT Card */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4">
                <h3 className="text-lg font-bold text-white">IPT Stop Reasons</h3>
              </div>
              <div className="p-5">
                <div className="space-y-4">
                  {defaultReasons.map((reason) => {
                    const buffer = iptBuffers[reason] ?? "0";
                    return (
                      <div key={`ipt-${reason}`} className="flex items-center justify-between">
                        <span className="text-gray-700 font-medium">{reason}</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={buffer === "0" ? "" : buffer}
                          placeholder="0"
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "" || /^\d+$/.test(val)) {
                              updateIptBuffer(reason, val);
                            }
                          }}
                          onBlur={() => {
                            const final = buffer === "" ? "0" : buffer;
                            updateIptBuffer(reason, final);
                            handleIptBlur(reason, final);
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 3HP Card */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-4">
                <h3 className="text-lg font-bold text-white">3HP Stop Reasons</h3>
              </div>
              <div className="p-5">
                <div className="space-y-4">
                  {defaultReasons.map((reason) => {
                    const buffer = threeHpBuffers[reason] ?? "0";
                    return (
                      <div key={`hp-${reason}`} className="flex items-center justify-between">
                        <span className="text-gray-700 font-medium">{reason}</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={buffer === "0" ? "" : buffer}
                          placeholder="0"
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "" || /^\d+$/.test(val)) {
                              updateHpBuffer(reason, val);
                            }
                          }}
                          onBlur={() => {
                            const final = buffer === "" ? "0" : buffer;
                            updateHpBuffer(reason, final);
                            handleHpBlur(reason, final);
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    };

    const Step4 = () => (
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Comments</h2>
        <textarea
          className="w-full border border-gray-300 rounded-lg p-3 min-h-[160px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add any relevant comments about this report..."
        />
      </div>
    );

    return (
      <div className="w-full min-h-screen p-3 bg-gray-50">
        <Box className="mb-8 sticky z-10 -top-4 py-4 bg-blue-100 border-b-3 border-b-white" 
          sx={{
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0 , 0.08)',
            borderRadius: '8px'
          }}
        >
          <Stepper activeStep={activeStep} alternativeLabel>
            {["Intro", "Data Grid", "Stop Reasons", "Comments"].map((lbl) => (
              <Step key={lbl}>
                <StepLabel>{lbl}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {activeStep === 0 && <Step1 />}
        {activeStep === 1 && <Step2 />}
        {activeStep === 2 && <Step3 />}
        {activeStep === 3 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Comments</h2>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 min-h-[160px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add any relevant comments about this report..."
            />
          </div>
        )}
      </div>
    );
  }
);

TPTReportGridForm.displayName = "TPTReportGridForm";
export default TPTReportGridForm;
