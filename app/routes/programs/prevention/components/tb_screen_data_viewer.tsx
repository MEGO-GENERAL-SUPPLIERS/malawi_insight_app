import React, { useMemo } from 'react';
import { Info, Users, ClipboardList, HospitalIcon } from 'lucide-react';
import type { ITbScreeningDataResponse, ITbScreenRow } from '~/types/interfaces/ITbScreeningDataInterfaces';
import { formattingUtils } from '~/utils/formattingUtils';

interface TbScreeningViewerProps {
  tbScreenDataDetails: ITbScreeningDataResponse | null;
}

// Entry point configuration with mapping to flat keys
const entryPoints = [
  { key: 'opd', label: 'OPD', color: 'blue' },
  { key: 'peads', label: 'PAEDs Ward', color: 'green' },
  { key: 'male', label: 'MALE Ward', color: 'purple' },
  { key: 'female', label: 'FEMALE Ward', color: 'pink' },
  { key: 'art', label: 'ART Clinic', color: 'orange' },
  { key: 'teen', label: 'TEEN Club', color: 'teal' }
] as const;

// Indicators exactly as expected in data
const indicators = [
  'Total Screened (TB)',
  'Total Presumptives (TB)',
  'Total Cases Diagnosed with TB',
  'Total Initiated on Treatment (TB)',
  'Total Clinic Attendees (TB)',
] as const;

// Age groups — ensure these match your data exactly
const ageGroups = ['0-14 years', '15-19 years', '20> years'] as const;

// Helper: extract M/F value for a given entry point and row
const getValue = (row: ITbScreenRow, entryKey: string, gender: 'M' | 'F'): number => {
  const field = `${entryKey}_${gender.toLowerCase()}` as keyof ITbScreenRow;
  const value = row[field];

  // Handle undefined, null, string, or number
  if (value == null) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

// Helper: compute total for a row across all entry points
const calculateRowTotal = (row: ITbScreenRow): number => {
  return entryPoints.reduce((sum, ep) => {
    return sum + getValue(row, ep.key, 'M') + getValue(row, ep.key, 'F');
  }, 0);
};

// Helper: compute column total for a given age group, entry point, and gender
const calculateColumnTotal = (
  rows: ITbScreenRow[],
  entryKey: string,
  gender: 'M' | 'F'
): number => {
  return rows.reduce((sum, row) => sum + getValue(row, entryKey, gender), 0);
};

// Color mapping
const colorClasses: Record<string, { header: string; sub: string }> = {
  blue: { header: 'bg-blue-600', sub: 'bg-blue-500' },
  green: { header: 'bg-green-600', sub: 'bg-green-500' },
  purple: { header: 'bg-purple-600', sub: 'bg-purple-500' },
  pink: { header: 'bg-pink-600', sub: 'bg-pink-500' },
  orange: { header: 'bg-orange-600', sub: 'bg-orange-500' },
  teal: { header: 'bg-teal-600', sub: 'bg-teal-500' }
};

const TbScreeningViewer: React.FC<TbScreeningViewerProps> = ({ tbScreenDataDetails }) => {
  // Group rows by age_group for easier lookup
  const rowsByAgeGroup = useMemo(() => {
    const grouped = new Map<string, ITbScreenRow[]>();
    tbScreenDataDetails?.tb_screen_data.forEach(row => {
      if (!grouped.has(row.age_group)) grouped.set(row.age_group, []);
      grouped.get(row.age_group)!.push(row);
    });
    return grouped;
  }, [tbScreenDataDetails?.tb_screen_data]);

  // Ensure all age groups are represented (even if missing in data)
  const enrichedAgeGroups = ageGroups.map(ageGroup => {
    const rows = rowsByAgeGroup.get(ageGroup) || [];
    // Ensure all indicators are present; if missing, create zero-filled rows
    const indicatorMap = new Map(rows.map(r => [r.indicator, r]));
    const fullRows = indicators.map(indicator => {
      return indicatorMap.get(indicator) || {
        age_group: ageGroup,
        indicator,
        opd_m: 0, opd_f: 0,
        peads_m: 0, peads_f: 0,
        male_m: 0, male_f: 0,
        female_m: 0, female_f: 0,
        art_m: 0, art_f: 0,
        teen_m: 0, teen_f: 0,
        total: 0
      };
    });
    return { ageGroup, rows: fullRows };
  });

  const meta = tbScreenDataDetails?.meta;

  return (
    <div className="w-full space-y-6">
      {/* Meta Information Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-md p-6 border border-blue-200">
        <div className="flex items-start gap-3">
          <div className="p-3 bg-cyan-600 rounded-lg">
            <HospitalIcon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 font-medium">Facility</p>
              <p className="text-lg font-bold text-gray-800">{meta?.facility?.name || '–'}</p>
              <p className="text-xs text-gray-500">{meta?.facility?.code || '–'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Report Period</p>
              <p className="text-lg font-bold text-gray-800">
                {meta?.report_period
                  ? formattingUtils.formatReportPeriodMMMYY(meta.report_period)
                  : '--'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Submitted By</p>
              <p className="text-lg font-bold text-gray-800">
                {meta?.submitted_by?.first_name} {meta?.submitted_by?.last_name}
              </p>
            </div>
            {meta?.other_data_collectors && (
              <div>
                <p className="text-sm text-gray-600 font-medium">Other Data Collectors</p>
                <p className="text-base text-gray-800">{meta.other_data_collectors}</p>
              </div>
            )}
          </div>
        </div>
        {meta?.comment && (
          <div className="mt-4 pt-4 border-t border-blue-200">
            <p className="text-sm text-gray-600 font-medium mb-1">Comments</p>
            <p className="text-base text-gray-700">{meta.comment}</p>
          </div>
        )}
      </div>

      {/* Section A: TB Screening Data */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex items-center gap-3">
          <Users className="w-6 h-6 text-white" />
          <h2 className="text-xl font-bold text-white">Section A: TB Screening Data</h2>
        </div>

        <div className="p-4 overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr>
                <th
                  className="border border-gray-300 bg-gray-500 p-2 font-bold text-white min-w-[120px]"
                  rowSpan={2}
                >
                  Age Group
                </th>
                <th
                  className="border border-gray-300 bg-gray-500 p-2 font-bold text-white min-w-[200px]"
                  rowSpan={2}
                >
                  Indicator
                </th>
                {entryPoints.map(ep => (
                  <th
                    key={ep.key}
                    className={`border border-gray-300 ${colorClasses[ep.color].header} text-white p-2 font-bold text-center`}
                    colSpan={2}
                  >
                    {ep.label}
                  </th>
                ))}
                <th
                  className="border border-gray-300 bg-gray-700 text-white p-2 font-bold text-center min-w-[80px]"
                  rowSpan={2}
                >
                  TOTAL
                </th>
              </tr>
              <tr>
                {entryPoints.map(ep => (
                  <React.Fragment key={ep.key}>
                    <th
                      className={`border border-gray-300 ${colorClasses[ep.color].sub} text-white p-2 font-bold text-sm min-w-[60px]`}
                    >
                      M
                    </th>
                    <th
                      className={`border border-gray-300 ${colorClasses[ep.color].sub} text-white p-2 font-bold text-sm min-w-[60px]`}
                    >
                      F
                    </th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {enrichedAgeGroups.map(({ ageGroup, rows }, ageIdx) => (
                <React.Fragment key={ageGroup}>
                  {rows.map((row, idx) => {
                    const isTotalRow = row.indicator === 'Total Clinic Attendees (TB)';
                    const isFirstIndicator = idx === 0;
                    return (
                      <tr
                        key={`${ageGroup}-${row.indicator}`}
                        className={ageIdx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                      >
                        {isFirstIndicator && (
                          <td
                            className="border border-gray-300 p-3 font-bold text-center bg-gray-200 align-middle"
                            rowSpan={rows.length + 1}
                          >
                            {ageGroup}
                          </td>
                        )}
                        <td
                          className={`border border-gray-300 p-2 font-semibold ${
                            isTotalRow ? 'bg-blue-100' : 'bg-gray-100'
                          }`}
                        >
                          {row.indicator}
                        </td>
                        {entryPoints.map(ep => (
                          <React.Fragment key={ep.key}>
                            <td className="border border-gray-300 p-2 text-center">
                              {getValue(row, ep.key, 'M')}
                            </td>
                            <td className="border border-gray-300 p-2 text-center">
                              {getValue(row, ep.key, 'F')}
                            </td>
                          </React.Fragment>
                        ))}
                        <td className="border border-gray-300 p-2 font-bold text-center bg-gray-200">
                          {row.total}
                        </td>
                      </tr>
                    );
                  })}
                  {/* Totals row per age group */}
                  <tr className="bg-gray-300 font-bold">
                    <td className="border border-gray-300 p-2">&nbsp;</td>
                    {entryPoints.map(ep => (
                      <React.Fragment key={ep.key}>
                        <td className="border border-gray-300 p-2 text-center">
                          {/*calculateColumnTotal(rows, ep.key, 'M')*/}
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          {/*calculateColumnTotal(rows, ep.key, 'F')*/}
                        </td>
                      </React.Fragment>
                    ))}
                    <td className="border border-gray-300 p-2 text-center bg-gray-400">
                      {/*rows.reduce((sum, r) => sum + calculateRowTotal(r), 0)*/}
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section B: Contact Tracing Data */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 flex items-center gap-3">
          <ClipboardList className="w-6 h-6 text-white" />
          <h2 className="text-xl font-bold text-white">Section B: Contact Tracing Data</h2>
        </div>

        <div className="p-4">
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr>
                <th className="border border-gray-300 bg-gray-500 p-3 font-bold text-white text-left">
                  Indicator
                </th>
                <th className="border border-gray-300 bg-gray-500 text-white p-3 font-bold text-center min-w-[120px]">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {tbScreenDataDetails?.tb_contact_tracing_data.map((row, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="border border-gray-300 p-3 font-medium text-gray-800">
                    {row.indicator}
                  </td>
                  <td className="border border-gray-300 p-3 text-center font-bold text-gray-900">
                    {row.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TbScreeningViewer;