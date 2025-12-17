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
          report_period: reportPeriod?.toString(),
          facilities: facility,
          submitted_by: null
        }, // Step 1 is empty — no metadata
        data: gridRows,
        ipt_stop_reasons: iptStop,
        three_hp_stop_reasons: threeHpStop,
        comment,
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
        <div className="bg-white rounded-lg shadow p-6 items-center">
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

          {/* Second row: Data Collectors */}
          <div>
            <FormControl fullWidth>
              <TextField
                label="Data Collectors"
                variant="outlined"
                size="small"
                placeholder="Separate names with comma"
                fullWidth
              />
            </FormControl>
          </div>
        </div>

      </div>
    );

   const Step2 = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">TPT Reporting Grid</h2>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 text-sm">
          <thead>
            <tr>
              <th className="border p-2 bg-gray-200">Indicator</th>
              <th className="border p-2 bg-gray-200">Type</th>
              {ageGroups.map((a) => (
                <th key={a} className="border p-2 bg-gray-200 text-center">
                  {a}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {indicators.map((ind, indIdx) => (
              <React.Fragment key={ind}>
                <tr className="bg-gray-100">
                  <td colSpan={2 + ageGroups.length} className="border p-2 font-bold">
                    {ind}
                  </td>
                </tr>

                {["M", "FP", "FNP"].map((t, tIdx) => {
                  const rowIndex = indIdx * 3 + tIdx;
                  const row = gridRows[rowIndex];

                  return (
                    <tr key={t} className="hover:bg-gray-50">
                      <td className="border p-2">&nbsp;</td>
                      <td className="border p-2 text-center font-semibold bg-blue-200">{t}</td>

                      {ageGroups.map((a) => {
                        const [buffer, setBuffer] = useState<string>(String(row.values[a]));

                        return (
                          <td key={a} className="border p-0">
                            <input
                              type="text"
                              className="w-full p-2 text-center outline-none"
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

                                // restore default 0 if user left blank
                                setBuffer(String(finalVal));

                                setGridRows((prev) =>
                                  prev.map((r, idx) =>
                                    idx === rowIndex
                                      ? { ...r, values: { ...r.values, [a]: finalVal } }
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

    const Step3 = () => {
      const [iptStop, setIptStop] = useState<any>({});
      const [threeHpStop, setThreeHpStop] = useState<any>({});

      // Handle typing (digits only)
      const handleNumericInput = (setter: any, key: string, value: string) => {
        // Allow only digits
        if (/^\d*$/.test(value)) {
          setter((prev: any) => ({
            ...prev,
            [key]: value,         // IMPORTANT: do NOT force "0" here
          }));
        }
      };

      // Handle focus: clear "0" so user can type freely
      const handleFocus = (setter: any, key: string, currentValue: string) => {
        if (currentValue === "0") {
          setter((prev: any) => ({
            ...prev,
            [key]: "",
          }));
        }
      };

      // Handle blur: restore 0 if field is left empty
      const handleBlur = (setter: any, key: string, currentValue: string) => {
        if (currentValue === "") {
          setter((prev: any) => ({
            ...prev,
            [key]: "0",
          }));
        }
      };

      return (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">Stop Reasons</h2>

          <div className="grid md:grid-cols-2 md:gap-50 sm:grid-cols-1 sm:gap-8">

            {/* IPT */}
            <div>
              <h3 className="font-bold mb-2 text-blue-600">IPT</h3>
              {defaultReasons.map((r) => {
                const current = iptStop[r] ?? "0";
                return (
                  <div key={r} className="flex justify-between items-center mb-2">
                    <span>{r}</span>

                    <input
                      className="border p-1 w-20 text-center"
                      type="text"
                      inputMode="numeric"
                      value={current}
                      onChange={(e) => handleNumericInput(setIptStop, r, e.target.value)}
                      onFocus={() => handleFocus(setIptStop, r, current)}
                      onBlur={() => handleBlur(setIptStop, r, iptStop[r] ?? "")}
                    />
                  </div>
                );
              })}
            </div>

            {/* 3HP */}
            <div>
              <h3 className="font-bold mb-2 text-blue-600">3HP</h3>
              {defaultReasons.map((r) => {
                const current = threeHpStop[r] ?? "0";
                return (
                  <div key={r} className="flex justify-between items-center mb-2">
                    <span>{r}</span>

                    <input
                      className="border p-1 w-20 text-center"
                      type="text"
                      inputMode="numeric"
                      value={current}
                      onChange={(e) => handleNumericInput(setThreeHpStop, r, e.target.value)}
                      onFocus={() => handleFocus(setThreeHpStop, r, current)}
                      onBlur={() => handleBlur(setThreeHpStop, r, threeHpStop[r] ?? "")}
                    />
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      );
    };


    const Step4 = () => (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Comments</h2>
        <textarea
          className="w-full border rounded p-3 min-h-[160px]"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>
    );

    return (
      <div className="w-full min-h-screen p-4 bg-gray-50">
        <Box className="mb-8">
          <Stepper activeStep={activeStep} alternativeLabel>
            {["Intro", "Grid", "Stop Reasons", "Comments"].map((lbl) => (
              <Step key={lbl}>
                <StepLabel>{lbl}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {activeStep === 0 && <Step1 />}
        {activeStep === 1 && <Step2 />}
        {activeStep === 2 && <Step3 />}
        {activeStep === 3 && <Step4 />}
      </div>
    );
  }
);

TPTReportGridForm.displayName = "TPTReportGridForm";
export default TPTReportGridForm;
