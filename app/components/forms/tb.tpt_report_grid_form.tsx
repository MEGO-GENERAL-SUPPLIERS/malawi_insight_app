import React, { useState, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import { IconButton, Tooltip, Box, Step, Stepper, StepLabel } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import HighlightOffOutlined from '@mui/icons-material/HighlightOffOutlined';
import { CircleAlert } from 'lucide-react';

import type { ITPTGridRow, ITPTReportData, TPTReportGridRef } from '~/types/interfaces/ITPTReportInterfaces';
import type { IFacility } from '~/types/interfaces/IFacilityInterfaces';
import type { IDistrict } from '~/types/interfaces/IDistrictInterfaces';

interface TPTReportGridFormProps {
  data?: ITPTReportData | null;
  setSlotData: (data: ITPTGridRow[] | null) => void;
  onStepChange?: (step: number) => void;
  currentStep?: number;
}

const ageGroups = [
  '<1',
  '1-4',
  '5-9',
  '10-14',
  '15-19',
  '20-24',
  '25-29',
  '30-34',
  '35-39',
  '40-44',
  '45-49',
  '50+'
];

const indicators = [
  'Total number of clients new on ART (TX New)',
  'Number of clients new on ART started on IPT',
  'Number of clients new on ART started on 3HP',
  'Number of clients who reached the six months milestone during the reporting month (IPT)',
  'Number of clients reached the three months milestone during the reporting month (3HP)',
  'Number of clients who stopped TPT during the reporting month',
  'Number of clients who developed active TB during the reporting month'
];

const defaultIptReasons = [
  'Developed symptoms of hepatitis',
  'Developed neurological symptoms',
  'Patient not adherent',
  'Severe rash',
  'Other reasons',
  'Developed active TB'
];

const default3HpReasons = [...defaultIptReasons];

const makeDefaultGrid = (): ITPTGridRow[] => {
  const rows: ITPTGridRow[] = [];
  indicators.forEach(ind => {
    ['M', 'FP', 'FNP'].forEach(t => {
      const values: Record<string, number> = {};
      ageGroups.forEach(a => (values[a] = 0));
      rows.push({ indicator: ind, type: t as 'M' | 'FP' | 'FNP', values });
    });
  });
  return rows;
};

const TPTReportGridForm = forwardRef<TPTReportGridRef, TPTReportGridFormProps>(
  ({ data = null, setSlotData, onStepChange, currentStep = 0 }, ref) => {
    const [activeStep, setActiveStep] = useState<number>(currentStep);
    const [gridRows, setGridRows] = useState<ITPTGridRow[]>(makeDefaultGrid());
    const [iptStop, setIptStop] = useState<Record<string, number>>(() =>
      defaultIptReasons.reduce((acc, r) => ({ ...acc, [r]: 0 }), {} as Record<string, number>)
    );
    const [threeHpStop, setThreeHpStop] = useState<Record<string, number>>(() =>
      default3HpReasons.reduce((acc, r) => ({ ...acc, [r]: 0 }), {} as Record<string, number>)
    );
    const [facilities, setFacilities] = useState<IFacility[]>([]);
    const [districts, setDistricts] = useState<IDistrict[]>([]);
    const [selectedFacility, setSelectedFacility] = useState<number | ''>('');
    const [selectedDistrict, setSelectedDistrict] = useState<number | ''>('');
    const [reportPeriod, setReportPeriod] = useState<string>(dayjs().format('MMM-YY'));
    const [comments, setComments] = useState<string>('');

    useEffect(() => {
      // initialize from provided data if any
      if (data) {
        if (Array.isArray(data.grid) && data.grid.length > 0) setGridRows(data.grid);
        if (data.iptStopReasons) setIptStop(data.iptStopReasons);
        if (data.threeHpStopReasons) setThreeHpStop(data.threeHpStopReasons);
        if (data.meta) {
          setSelectedFacility(data.meta.facilityId ?? '');
          setSelectedDistrict(data.meta.districtId ?? '');
          setReportPeriod(data.meta.reportPeriod ?? dayjs().format('MMM-YY'));
        }
        setComments(data.comments ?? '');
      } else {
        setGridRows(makeDefaultGrid());
      }

      // try load facilities/districts from localStorage (same approach as TB form)
      try {
        const stored = localStorage.getItem('user');
        if (stored) {
          const parsed = JSON.parse(stored);
          const facs: IFacility[] = parsed?.location?.facilities || [];
          setFacilities(facs);
          const dists: IDistrict[] = parsed?.location?.districts || [];
          setDistricts(dists);
        }
      } catch (e) {
        setFacilities([]);
        setDistricts([]);
      }
    }, []);

    useEffect(() => setActiveStep(currentStep), [currentStep]);

    const stepLabels = [
      'Meta Data',
      'TPT Grid',
      'Stop Reasons',
      'Comments'
    ];

    // Imperative handle to parent
    useImperativeHandle(ref, () => ({
      getRows: () => ({
        meta: {
          facilityId: selectedFacility || undefined,
          districtId: selectedDistrict || undefined,
          reportPeriod
        },
        grid: gridRows,
        iptStopReasons: iptStop,
        threeHpStopReasons: threeHpStop,
        comments
      }),
      validateCurrentStep: () => {
        if (activeStep === 0) {
          // Meta: facility and reportPeriod should be present
          return !!selectedFacility && !!reportPeriod;
        }
        if (activeStep === 1) {
          // Grid: ensure all numeric values present (non-null/undefined)
          return gridRows.every(row =>
            ageGroups.every(a => row.values[a] !== null && row.values[a] !== undefined)
          );
        }
        if (activeStep === 2) {
          // Stop reasons: ensure numbers are present
          return (
            Object.values(iptStop).every(v => v !== null && v !== undefined) &&
            Object.values(threeHpStop).every(v => v !== null && v !== undefined)
          );
        }
        return true; // comments step
      },
      goToNextStep: () => {
        if (activeStep < 3) {
          const next = activeStep + 1;
          setActiveStep(next);
          onStepChange?.(next);
        }
      },
      goToPrevStep: () => {
        if (activeStep > 0) {
          const prev = activeStep - 1;
          setActiveStep(prev);
          onStepChange?.(prev);
        }
      }
    }));

    // update parent slot data for grid changes
    useEffect(() => {
      setSlotData(gridRows);
    }, [gridRows, setSlotData]);

    // Handlers
    const handleGridCellChange = useCallback((flatIndex: number, ageKey: string, value: string) => {
      const num = value === '' ? 0 : parseInt(value, 10) || 0;
      setGridRows(prev => {
        const copy = [...prev];
        const row = copy[flatIndex];
        if (!row) return prev;
        row.values = { ...row.values, [ageKey]: num };
        copy[flatIndex] = { ...row };
        return copy;
      });
    }, []);

    const handleIptReasonChange = useCallback((reason: string, val: string) => {
      const num = val === '' ? 0 : parseInt(val, 10) || 0;
      setIptStop(prev => ({ ...prev, [reason]: num }));
    }, []);

    const handle3HpReasonChange = useCallback((reason: string, val: string) => {
      const num = val === '' ? 0 : parseInt(val, 10) || 0;
      setThreeHpStop(prev => ({ ...prev, [reason]: num }));
    }, []);

    const handleClearAll = useCallback(() => {
      setGridRows(makeDefaultGrid());
      setIptStop(defaultIptReasons.reduce((a, r) => ({ ...a, [r]: 0 }), {} as Record<string, number>));
      setThreeHpStop(default3HpReasons.reduce((a, r) => ({ ...a, [r]: 0 }), {} as Record<string, number>));
      setSelectedFacility('');
      setSelectedDistrict('');
      setReportPeriod(dayjs().format('MMM-YY'));
      setComments('');
      setSlotData(null);
    }, [setSlotData]);

    // Helpers to find flat index
    const getFlatRowIndex = (indicatorIndex: number, typeIndex: number) => {
      // Each indicator has 3 rows (M, FP, FNP)
      return indicatorIndex * 3 + typeIndex;
    };

    // ---------------------- Render Steps Internally ----------------------

    const StepMeta = () => (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Meta Data</h2>
        </div>

        <div className="flex gap-6">
          <div>
            <label className="block text-sm font-medium">Facility</label>
            <select
              value={selectedFacility}
              onChange={e => setSelectedFacility(e.target.value === '' ? '' : Number(e.target.value))}
              className="border rounded p-2 min-w-[260px]"
            >
              <option value="">Select facility</option>
              {facilities.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">District (optional)</label>
            <select
              value={selectedDistrict}
              onChange={e => setSelectedDistrict(e.target.value === '' ? '' : Number(e.target.value))}
              className="border rounded p-2 min-w-[220px]"
            >
              <option value="">Select district</option>
              {districts.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Report Period</label>
            <DatePicker
              label="Report Period"
              views={["year", "month"]}
              openTo="year"
              maxDate={dayjs()}
              value={reportPeriod ? dayjs(reportPeriod) : null}
              onChange={(value: any) => {
                if (!value) return setReportPeriod('');
                setReportPeriod(value.startOf('month').format('YYYY-MM-DD'));
              }}
              slotProps={{ textField: { size: 'small', className: 'border rounded-sm p-2 w-[200px]' } }}
            />
            <Tooltip title="Clear report period">
              <IconButton onClick={() => setReportPeriod('')}>
                <HighlightOffOutlined />
              </IconButton>
            </Tooltip>

            <div className="text-sm text-gray-500 mt-1">Display: {reportPeriod ? dayjs(reportPeriod).format('MMM-YY') : ''}</div>
          </div>
        </div>
      </div>
    );

    const StepGrid = () => (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">TPT Reporting Grid</h2>
          <div className="text-sm text-gray-600">Instructions: enter numeric values; blank = 0.</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 text-sm rounded-5">
            <thead>
              <tr>
                <th className="border p-2 bg-gray-200">Indicator</th>
                <th className="border p-2 bg-gray-200">Type</th>
                {ageGroups.map(a => (
                  <th key={a} className="border p-2 bg-gray-200 text-center min-w-[60px]">{a}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {indicators.map((ind, i) => (
                <React.Fragment key={ind}>
                  <tr className="bg-gray-100">
                    <td className="border p-2 font-bold" colSpan={2 + ageGroups.length}><span className='text-slate-50'>{ind}</span></td>
                  </tr>

                  {['M', 'FP', 'FNP'].map((t, ti) => {
                    const flatIndex = getFlatRowIndex(i, ti);
                    const row = gridRows[flatIndex];
                    return (
                      <tr key={`${ind}-${t}`} className="hover:bg-gray-50">
                        <td className="border p-2 text-sm">&nbsp;</td>
                        <td className="border p-2 font-semibold text-center bg-blue-200">{t}</td>
                        {ageGroups.map(a => (
                          <td key={a} className="border p-0">
                            <input
                              type="text"
                              className="w-full p-2 text-center border-0 outline-none"
                              value={String(row.values[a] ?? '')}
                              onChange={e => {
                                const val = e.target.value;
                                if (val === '' || /^\d+$/.test(val)) {
                                  handleGridCellChange(flatIndex, a, val);
                                }
                              }}
                              placeholder="0"
                            />
                          </td>
                        ))}
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

    const StepStopReasons = () => (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">Reasons for stopping IPT, 3HP</h2>
        <div className="grid grid-cols-2 gap-12">
          <div className='border rounded-5 p-6'>
            <h3 className="font-semibold mb-2 border-b border-b-gray-600 text-blue-400">IPT - Reasons</h3>
            <table className="w-full text-sm">
              <tbody>
                {defaultIptReasons.map(r => (
                  <tr key={r} className="hover:bg-gray-50">
                    <td className="p-2 font-medium">{r}</td>
                    <td className="p-2 w-40">
                      <input
                        type="text"
                        value={String(iptStop[r] ?? '')}
                        onChange={e => {
                          const val = e.target.value;
                          if (val === '' || /^\d+$/.test(val)) handleIptReasonChange(r, val);
                        }}
                        className="w-full p-2 text-center border rounded"
                        placeholder="0"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className='border rounded-5 p-6'>
            <h3 className="font-semibold mb-2 border-b border-b-gray-600 text-blue-400">3HP - Reasons</h3>
            <table className="w-full text-sm">
              <tbody>
                {default3HpReasons.map(r => (
                  <tr key={r} className="hover:bg-gray-50">
                    <td className="p-2 font-medium">{r}</td>
                    <td className="p-2 w-40">
                      <input
                        type="text"
                        value={String(threeHpStop[r] ?? '')}
                        onChange={e => {
                          const val = e.target.value;
                          if (val === '' || /^\d+$/.test(val)) handle3HpReasonChange(r, val);
                        }}
                        className="w-full p-2 text-center border rounded"
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

    const StepComments = () => (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">Comments (Optional)</h2>
        <textarea
          className="w-full border rounded p-3 min-h-[160px]"
          value={comments}
          onChange={e => setComments(e.target.value)}
          placeholder="Optional comments..."
        />
      </div>
    );

    return (
      <div className="w-full min-h-screen p-4 bg-gray-50">
        {/* Step content controlled externally via activeStep */}
        <div className=''>
          {/* Step Indicator */}
          <Box className="mb-8">
            <Stepper activeStep={activeStep} alternativeLabel>
              {stepLabels.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
          {/* <Tooltip title="Clear all data">
            <IconButton onClick={handleClearAll} color="error">
              <DeleteOutline />
            </IconButton>
          </Tooltip> */}
        </div>
        {activeStep === 0 && <StepMeta />}
        {activeStep === 1 && <StepGrid />}
        {activeStep === 2 && <StepStopReasons />}
        {activeStep === 3 && <StepComments />}
      </div>
    );
  }
);

TPTReportGridForm.displayName = 'TPTReportGridForm';

export default TPTReportGridForm;
