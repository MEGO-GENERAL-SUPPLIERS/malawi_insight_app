import React, { useState, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react';
import type { TbScreeningGridRef, ITbScreenRow, IContactTracingRow } from '~/types/interfaces/ITbScreeningDataInterfaces';
import type { IFacility } from '~/types/interfaces/IFacilityInterfaces';
import { IconButton, Tooltip, Stepper, Step, StepLabel, Box, TextField, FormControl } from '@mui/material';
import { DatePicker } from "@mui/x-date-pickers";
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import dayjs, { type Dayjs } from 'dayjs';
import { CircleAlert } from 'lucide-react';
import { Stepper as CustomStepper, type StepObject } from '~/components/generic_components/CustomStepper';

const FacilitySelect = React.lazy(() => import("~/components/forms/elements/FacilitySelect"));

interface TbScreeningGridProps {
  data?: ITbScreenRow[];
  setSlotData: (data: ITbScreenRow[]) => void;
  onStepChange?: (step: number) => void;
  currentStep?: number;
}

const TbScreeningGridForm = forwardRef<TbScreeningGridRef, TbScreeningGridProps>(({ 
  data = [], 
  setSlotData, 
  onStepChange,
  currentStep = 0 
}, ref) => {
  const [activeStep, setActiveStep] = useState<number>(currentStep);
  const [sectionARows, setSectionARows] = useState<ITbScreenRow[]>([]);
  const [sectionBRows, setSectionBRows] = useState<IContactTracingRow[]>([]);
  const [facilities, setFacilities] = useState<IFacility[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<IFacility[] | []>([]);
  const [reportPeriod, setReportPeriod] = useState<Dayjs | null>(null);
  const [comment, setComment] = useState<string>('');
  const [openReportPeriod, setOpenReportPeriod] = useState(false);
  const [currentReportPeriodView, setCurrentReportPeriodView] = useState("year");
  const [otherDataCollectors, setOtherDataCollectors] = useState("");

  // Steps for the stepper - step indices:
  const stepz: StepObject[] = [
    { label: "Metadata" },
    { label: "Tb Screening Data" },
    { label: "Contact Tracing Data" },
    { label: "Comment(s)" }
  ];
  

  // Default rows data for Section A (kept exactly as in your original)
  const defaultSectionARows: ITbScreenRow[] = [
    { age_group: '0-14 years', indicator: 'Total Screened (TB)', opd_m: 0, opd_f: 0, peads_m: 0, peads_f: 0, male_m: 0, male_f: 0, female_m: 0, female_f: 0, art_m: 0, art_f: 0, teen_m: 0, teen_f: 0, total: 0 },
    { age_group: '0-14 years', indicator: 'Total Presumptives (TB)', opd_m: 0, opd_f: 0, peads_m: 0, peads_f: 0, male_m: 0, male_f: 0, female_m: 0, female_f: 0, art_m: 0, art_f: 0, teen_m: 0, teen_f: 0, total: 0 },
    { age_group: '0-14 years', indicator: 'Total Cases Diagnosed with TB', opd_m: 0, opd_f: 0, peads_m: 0, peads_f: 0, male_m: 0, male_f: 0, female_m: 0, female_f: 0, art_m: 0, art_f: 0, teen_m: 0, teen_f: 0, total: 0 },
    { age_group: '0-14 years', indicator: 'Total Initiated on Treatment (TB)', opd_m: 0, opd_f: 0, peads_m: 0, peads_f: 0, male_m: 0, male_f: 0, female_m: 0, female_f: 0, art_m: 0, art_f: 0, teen_m: 0, teen_f: 0, total: 0 },
    { age_group: '0-14 years', indicator: 'Total Clinic Attendees (TB)', opd_m: 0, opd_f: 0, peads_m: 0, peads_f: 0, male_m: 0, male_f: 0, female_m: 0, female_f: 0, art_m: 0, art_f: 0, teen_m: 0, teen_f: 0, total: 0 },
    { age_group: '15-19 years', indicator: 'Total Screened (TB)', opd_m: 0, opd_f: 0, peads_m: 0, peads_f: 0, male_m: 0, male_f: 0, female_m: 0, female_f: 0, art_m: 0, art_f: 0, teen_m: 0, teen_f: 0, total: 0 },
    { age_group: '15-19 years', indicator: 'Total Presumptives (TB)', opd_m: 0, opd_f: 0, peads_m: 0, peads_f: 0, male_m: 0, male_f: 0, female_m: 0, female_f: 0, art_m: 0, art_f: 0, teen_m: 0, teen_f: 0, total: 0 },
    { age_group: '15-19 years', indicator: 'Total Cases Diagnosed with TB', opd_m: 0, opd_f: 0, peads_m: 0, peads_f: 0, male_m: 0, male_f: 0, female_m: 0, female_f: 0, art_m: 0, art_f: 0, teen_m: 0, teen_f: 0, total: 0 },
    { age_group: '15-19 years', indicator: 'Total Initiated on Treatment (TB)', opd_m: 0, opd_f: 0, peads_m: 0, peads_f: 0, male_m: 0, male_f: 0, female_m: 0, female_f: 0, art_m: 0, art_f: 0, teen_m: 0, teen_f: 0, total: 0 },
    { age_group: '15-19 years', indicator: 'Total Clinic Attendees (TB)', opd_m: 0, opd_f: 0, peads_m: 0, peads_f: 0, male_m: 0, male_f: 0, female_m: 0, female_f: 0, art_m: 0, art_f: 0, teen_m: 0, teen_f: 0, total: 0 },
    { age_group: '20> years', indicator: 'Total Screened (TB)', opd_m: 0, opd_f: 0, peads_m: 0, peads_f: 0, male_m: 0, male_f: 0, female_m: 0, female_f: 0, art_m: 0, art_f: 0, teen_m: 0, teen_f: 0, total: 0 },
    { age_group: '20> years', indicator: 'Total Presumptives (TB)', opd_m: 0, opd_f: 0, peads_m: 0, peads_f: 0, male_m: 0, male_f: 0, female_m: 0, female_f: 0, art_m: 0, art_f: 0, teen_m: 0, teen_f: 0, total: 0 },
    { age_group: '20> years', indicator: 'Total Cases Diagnosed with TB', opd_m: 0, opd_f: 0, peads_m: 0, peads_f: 0, male_m: 0, male_f: 0, female_m: 0, female_f: 0, art_m: 0, art_f: 0, teen_m: 0, teen_f: 0, total: 0 },
    { age_group: '20> years', indicator: 'Total Initiated on Treatment (TB)', opd_m: 0, opd_f: 0, peads_m: 0, peads_f: 0, male_m: 0, male_f: 0, female_m: 0, female_f: 0, art_m: 0, art_f: 0, teen_m: 0, teen_f: 0, total: 0 },
    { age_group: '20> years', indicator: 'Total Clinic Attendees (TB)', opd_m: 0, opd_f: 0, peads_m: 0, peads_f: 0, male_m: 0, male_f: 0, female_m: 0, female_f: 0, art_m: 0, art_f: 0, teen_m: 0, teen_f: 0, total: 0 },
  ];

  // Default rows data for Section B (kept same)
  const defaultSectionBRows: IContactTracingRow[] = [
    { indicator: 'Total number of Index cases in the reporting month (Pulmonary cases)', total: 0 },
    { indicator: 'Number of Index cases with Contacts listed', total: 0 },
    { indicator: 'Number of contacts screened for TB (at the community)', total: 0 },
    { indicator: 'Number of presumptive TB cases identified through contact tracing', total: 0 },
    { indicator: 'Number of TB cases diagnosed through contact tracing', total: 0 },
    { indicator: 'Number of 0-14 contacts eligible for TPT', total: 0 },
    { indicator: 'Number of 0-14 contacts initiated on TPT', total: 0 },
  ];

  // Initialize rows and facilities
  useEffect(() => {
    if (data && data.length > 0) {
      setSectionARows(data);
    } else {
      setSectionARows(defaultSectionARows);
    }
    setSectionBRows(defaultSectionBRows);

    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        const facs: IFacility[] = parsed?.location?.facilities || [];
        setFacilities(facs);
      }
    } catch (e) {
      // if JSON parse fails or localStorage missing, keep facilities empty
      setFacilities([]);
    }
  }, []); // run once on mount

  
  // Update active step when currentStep prop changes
  useEffect(() => {
    setActiveStep(currentStep);
  }, [currentStep]);


  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    getRows: () => ({
      tb_screen_data: sectionARows,
      tb_contact_tracing_data: sectionBRows,
      meta: {
        facility: selectedFacility || null,
        report_period: reportPeriod ? reportPeriod.toISOString() : reportPeriod,
        other_data_collectors: otherDataCollectors,
        comment
      }
    }),
    validateCurrentStep: () => {
      if (activeStep === 1) {
        return sectionARows.every(row => 
          Object.values(row).every(val => val !== null && val !== undefined)
        );
      } else if (activeStep === 2) {
        return sectionBRows.every(row => 
          row.total !== null && row.total !== undefined
        );
      }
      return true;
    },
    goToNextStep: () => {
      if (activeStep < stepz.length - 1) {
        const nextStep = activeStep + 1;
        setActiveStep(nextStep);
        onStepChange?.(nextStep);
      }
    },
    goToPrevStep: () => {
      if (activeStep > 0) {
        const prevStep = activeStep - 1;
        setActiveStep(prevStep);
        onStepChange?.(prevStep);
      }
    }
  }));


  // Calculate total safely (fix TS addition error)
  const calculateTotal = useCallback((row?: ITbScreenRow): number => {
    if (!row) return 0;

    return (
      Number(row.opd_m || 0) + Number(row.opd_f || 0) +
      Number(row.peads_m || 0) + Number(row.peads_f || 0) +
      Number(row.male_m || 0) + Number(row.male_f || 0) +
      Number(row.female_m || 0) + Number(row.female_f || 0) +
      Number(row.art_m || 0) + Number(row.art_f || 0) +
      Number(row.teen_m || 0) + Number(row.teen_f || 0)
    );
  }, []);


  const handleSectionACellChange = useCallback(
    (rowIndex: number, field: keyof ITbScreenRow, value: string) => {
      const numValue = value === '' ? 0 : parseInt(value, 10) || 0;

      setSectionARows(prevRows => {
        const updatedRows = [...prevRows];
        const currentRow = updatedRows[rowIndex];
        if (!currentRow) return prevRows;

        updatedRows[rowIndex] = {
          ...currentRow,
          [field]: numValue,
        };

        updatedRows[rowIndex].total = calculateTotal(updatedRows[rowIndex]);

        setSlotData(updatedRows);
        return updatedRows;
      });
    },
    [calculateTotal, setSlotData]
  );


  const handleSectionBCellChange = useCallback((rowIndex: number, value: string) => {
    const numValue = value === '' ? 0 : parseInt(value, 10) || 0;
    
    setSectionBRows(prevRows => {
      const updatedRows = [...prevRows];
      updatedRows[rowIndex] = {
        ...updatedRows[rowIndex],
        total: numValue,
      };
      return updatedRows;
    });
  }, []);

  // Clear all data to defaults
  const handleClearData = useCallback(() => {
    setSectionARows(defaultSectionARows);
    setSectionBRows(defaultSectionBRows);
    setSlotData(defaultSectionARows);
    setSelectedFacility([]);
    setOtherDataCollectors("");
    setReportPeriod(dayjs());
    setComment('');
  }, [setSlotData]);

  const editableFields: (keyof ITbScreenRow)[] = [
    'opd_m', 'opd_f', 'peads_m', 'peads_f', 'male_m', 'male_f',
    'female_m', 'female_f', 'art_m', 'art_f', 'teen_m', 'teen_f'
  ];

  // Group Section A rows by age group
  const groupedRows = sectionARows.reduce((acc, row) => {
    if (!acc[row.age_group]) {
      acc[row.age_group] = [];
    }
    acc[row.age_group].push(row);
    return acc;
  }, {} as Record<string, ITbScreenRow[]>);

  const ageGroups = Object.keys(groupedRows);

  // Calculate totals for each age group and field in Section A
  const calculateAgeGroupTotals = (ageGroup: string) => {
    const groupRows = groupedRows[ageGroup];
    const totals: Record<string, number> = {
      opd_m: 0,
      opd_f: 0,
      peads_m: 0,
      peads_f: 0,
      male_m: 0,
      male_f: 0,
      female_m: 0,
      female_f: 0,
      art_m: 0,
      art_f: 0,
      teen_m: 0,
      teen_f: 0,
      total: 0
    };

    groupRows.forEach(row => {
      totals.opd_m += Number(row.opd_m || 0);
      totals.opd_f += Number(row.opd_f || 0);
      totals.peads_m += Number(row.peads_m || 0);
      totals.peads_f += Number(row.peads_f || 0);
      totals.male_m += Number(row.male_m || 0);
      totals.male_f += Number(row.male_f || 0);
      totals.female_m += Number(row.female_m || 0);
      totals.female_f += Number(row.female_f || 0);
      totals.art_m += Number(row.art_m || 0);
      totals.art_f += Number(row.art_f || 0);
      totals.teen_m += Number(row.teen_m || 0);
      totals.teen_f += Number(row.teen_f || 0);
      totals.total += Number(row.total || 0);
    });

    return totals;
  };

  // handleFacilitiesChange 
  const handleFacilitiesChange = useCallback(({ data }: { data: any[] }) => {
        if(Array.isArray(data)) {
          setSelectedFacility(data[0]);
          return;
        }
  
        setSelectedFacility((prev: any) => ({ ...prev, data }));
      }, []); 

  // Other Data Collectors
  const handleOtherDataCollectors = (): string | string[] => {
    if (!otherDataCollectors) return ''; // empty
    const trimmed = otherDataCollectors.trim();

    // If contains comma, split into array, otherwise return string
    return trimmed.includes(',')
      ? trimmed.split(',').map(s => s.trim()).filter(Boolean) // remove empty entries
      : trimmed;
  };

  // Helper function to find the row index in the flat array
  const getFlatRowIndex = (ageGroup: string, indicatorIndex: number) => {
    let flatIndex = 0;
    for (const group of ageGroups) {
      if (group === ageGroup) {
        return flatIndex + indicatorIndex;
      }
      flatIndex += groupedRows[group].length;
    }
    return 0;
  };

  // Render Section A - TB Screening Data (kept the same markup you supplied)
  const renderSectionA = () => (
    <div className="w-full">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Header with Clear Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Section A: TB Screening Data Entry</h2>
          <Tooltip title="Clear TB Screening data" arrow>
            <IconButton 
              onClick={handleClearData}
              color="error"
              size="medium"
              className="hover:bg-red-50"
            >
              <DeleteOutline />
            </IconButton>
          </Tooltip>
        </div>

        {/* Meta row in Section A: Facility + Report Period */}
        <div className="mt-4 mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="flex gap-2 space-y-2 text-sm text-gray-700">
            <CircleAlert />
            <strong>Instructions:</strong> Click on any white cell to edit. Only numeric values are accepted. 
            Total is calculated automatically. Blank values are treated as 0.
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 text-sm">
            {/* Main Category Headers */}
            <thead>
              <tr>
                <th className="border border-gray-300 bg-gray-500 p-2 font-bold text-gray-700 min-w-[120px]" rowSpan={2}>
                  Age Group
                </th>
                <th className="border border-gray-300 bg-gray-500 p-2 font-bold text-gray-700 min-w-[150px]" rowSpan={2}>
                  Indicator
                </th>
                <th className="border border-gray-300 bg-blue-600 text-white p-2 font-bold text-center" colSpan={2}>
                  OPD
                </th>
                <th className="border border-gray-300 bg-green-600 text-white p-2 font-bold text-center" colSpan={2}>
                  PAEDs Ward
                </th>
                <th className="border border-gray-300 bg-purple-600 text-white p-2 font-bold text-center" colSpan={2}>
                  MALE Ward
                </th>
                <th className="border border-gray-300 bg-pink-600 text-white p-2 font-bold text-center" colSpan={2}>
                  FEMALE Ward
                </th>
                <th className="border border-gray-300 bg-orange-600 text-white p-2 font-bold text-center" colSpan={2}>
                  ART Clinic
                </th>
                <th className="border border-gray-300 bg-teal-600 text-white p-2 font-bold text-center" colSpan={2}>
                  TEEN Club
                </th>
                <th className="border border-gray-300 bg-gray-700 text-white p-2 font-bold text-center min-w-[80px]" rowSpan={2}>
                  TOTAL
                </th>
              </tr>
              {/* Sub Headers (M/F) */}
              <tr>
                <th className="border border-gray-300 bg-blue-500 text-white p-2 font-bold text-sm min-w-[60px]">M</th>
                <th className="border border-gray-300 bg-blue-500 text-white p-2 font-bold text-sm min-w-[60px]">F</th>
                <th className="border border-gray-300 bg-green-500 text-white p-2 font-bold text-sm min-w-[60px]">M</th>
                <th className="border border-gray-300 bg-green-500 text-white p-2 font-bold text-sm min-w-[60px]">F</th>
                <th className="border border-gray-300 bg-purple-500 text-white p-2 font-bold text-sm min-w-[60px]">M</th>
                <th className="border border-gray-300 bg-purple-500 text-white p-2 font-bold text-sm min-w-[60px]">F</th>
                <th className="border border-gray-300 bg-pink-500 text-white p-2 font-bold text-sm min-w-[60px]">M</th>
                <th className="border border-gray-300 bg-pink-500 text-white p-2 font-bold text-sm min-w-[60px]">F</th>
                <th className="border border-gray-300 bg-orange-500 text-white p-2 font-bold text-sm min-w-[60px]">M</th>
                <th className="border border-gray-300 bg-orange-500 text-white p-2 font-bold text-sm min-w-[60px]">F</th>
                <th className="border border-gray-300 bg-teal-500 text-white p-2 font-bold text-sm min-w-[60px]">M</th>
                <th className="border border-gray-300 bg-teal-500 text-white p-2 font-bold text-sm min-w-[60px]">F</th>
              </tr>
            </thead>
            
            {/* Data Rows */}
            <tbody>
              {ageGroups.map((ageGroup) => (
                <React.Fragment key={ageGroup}>
                  {/* Age Group Header */}
                  <tr className="bg-gray-200 hover:bg-gray-300">
                    <td rowSpan={groupedRows[ageGroup].length + 1} className="border border-gray-400 p-3 font-bold text-center">
                      {ageGroup}
                    </td>
                    <td className="border border-r-gray-300 p-1 bg-gray-300">&nbsp;</td>
                      {editableFields.map(field => <td key={field} className=" border border-r-gray-300 p-2 bg-gray-300">&nbsp;</td>)}
                    <td className="border p-2 bg-gray-300">&nbsp;</td>
                  </tr>

                  {/* Indicator Rows */}
                  {groupedRows[ageGroup].map((row, idx) => {
                    const isTotalRow = row.indicator === 'Total Clinic Attendees';
                    return (
                      <tr key={`${ageGroup}-${idx}`} className="hover:bg-gray-50">
                        <td className={`border p-2 font-semibold ${isTotalRow ? 'bg-blue-100' : 'bg-gray-500 text-white'}`}>
                          {row.indicator}
                        </td>

                        {editableFields.map(field => {
                          let highlightError = false;

                          if (isTotalRow) {
                            // check if Total Clinic Attendees is less than any column in the age group
                            highlightError = groupedRows[ageGroup]
                              .filter(r => r.indicator !== 'Total Clinic Attendees')
                              .some(r => (Number(row[field]) || 0) < (Number(r[field]) || 0));
                          }

                          return (
                            <td key={field} className={`border p-0 ${highlightError ? 'bg-red-200' : ''}`}>
                              <input
                                type="text"
                                value={row[field] !== 0 && !row[field] ? '' : String(row[field] ?? '')}
                                onChange={e => {
                                  const val = e.target.value;
                                  if (val === '' || /^\d+$/.test(val)) {
                                    const flatIndex = getFlatRowIndex(ageGroup, idx);
                                    handleSectionACellChange(flatIndex, field as keyof ITbScreenRow, val);
                                  }
                                }}
                                className="w-full h-full p-2 text-center border-0 outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                placeholder="0"
                              />
                            </td>
                          );
                        })}

                        <td className="border p-2 font-bold text-center bg-gray-200">{row.total}</td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}

            </tbody>

          </table>
        </div>
      </div>
    </div>
  );


  // Render Section B - Contact Tracing Data (kept the same)
  const renderSectionB = () => (
    <div className="w-full">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Section B: Contact Tracing Data</h2>
          <Tooltip title="Clear Contact Tracing data" arrow>
            <IconButton 
              onClick={() => setSectionBRows(defaultSectionBRows)}
              color="error"
              size="medium"
              className="hover:bg-red-50"
            >
              <DeleteOutline />
            </IconButton>
          </Tooltip>
        </div>

        <div className="mt-4 mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Instructions:</strong> Enter the total numbers for each contact tracing indicator. 
            Only numeric values are accepted. Blank values are treated as 0.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr>
                <th className="border border-gray-300 bg-gray-500 p-3 font-bold text-gray-700 text-left min-w-[400px]">
                  Indicator
                </th>
                <th className="border border-gray-300 bg-gray-700 text-white p-3 font-bold text-center min-w-[120px]">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {sectionBRows.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border border-gray-300 bg-gray-100 p-3 font-semibold text-gray-800">
                    {row.indicator}
                  </td>
                  <td className="border border-gray-300 p-0 bg-white">
                    <input
                      type="text"
                      value={row.total || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '' || /^\d+$/.test(val)) {
                          handleSectionBCellChange(index, val);
                        }
                      }}
                      className="w-full h-full p-3 text-center border-0 outline-none focus:ring-2 focus:ring-green-500 bg-white hover:bg-green-50 transition-colors"
                      placeholder="0"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Render Comments step
  const renderComments = () => (
    <div className="w-full">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Comments (Optional)</h2>
        <textarea
          className="w-full border rounded p-3 min-h-[160px]"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Optional comments..."
        />
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-screen p-6 bg-gray-50">
      {/* Stepper */}
      <Box className="mb-8 sticky z-10 -top-4 py-4 bg-blue-100 border-b-3 border-b-white" 
        sx={{
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0 , 0.08)',
          borderRadius: '8px'
        }}
      >
        <CustomStepper steps={stepz} activeStep={activeStep} className='px-3' size='sm'/>
      </Box>


      {/* Step Content */}
      <div className="step-content">
        {activeStep === 0 && (
          // Meta step minimal (Facility + Report Period repeated here for convenience)
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
                  onYearChange={(_newYear) => {
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
                  value={selectedFacility}
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
                  value={otherDataCollectors}
                  onChange={(e) => setOtherDataCollectors(e.target.value)}
                />
              </FormControl>
            </div>
          </div>
        )}

        {activeStep === 1 && renderSectionA()}
        {activeStep === 2 && renderSectionB()}
        {activeStep === 3 && renderComments()}
      </div>

      {/* Step Navigation */}
      {/* <div className="flex justify-between mt-8 pt-4 border-t border-gray-200">
        <button
          onClick={() => {
            if (activeStep > 0) {
              const prevStep = activeStep - 1;
              setActiveStep(prevStep);
              onStepChange?.(prevStep);
            }
          }}
          disabled={activeStep === 0}
          className={`px-6 py-2 rounded-md font-medium ${
            activeStep === 0 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-gray-600 text-white hover:bg-gray-700 cursor-pointer'
          }`}
        >
          Previous
        </button>

        <button
          onClick={() => {
            if (activeStep < steps.length - 1) {
              const nextStep = activeStep + 1;
              setActiveStep(nextStep);
              onStepChange?.(nextStep);
            }
          }}
          disabled={activeStep === steps.length - 1}
          className={`px-6 py-2 rounded-md font-medium ${
            activeStep === steps.length - 1
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer'
          }`}
        >
          Next
        </button>
      </div> */}
    </div>
  );
});

TbScreeningGridForm.displayName = 'TbScreeningGridForm';

export default TbScreeningGridForm;
