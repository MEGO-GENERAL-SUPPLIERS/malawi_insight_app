import React from 'react';
import { User, Calendar, Pill, AlertTriangle, HospitalIcon, MessageSquareMoreIcon } from 'lucide-react';
import type { ITPTReportData } from '~/types/interfaces/ITPTReportInterfaces';
import { formattingUtils } from '~/utils/formattingUtils';

interface TptReportViewerProps {
  reportData: ITPTReportData | null;
}

const TptReportDataViewer: React.FC<TptReportViewerProps> = ({ reportData }) => {
  if (!reportData) return <div className="p-4">No report data available</div>;

  const { meta, data, ipt_stop_reasons, three_hp_stop_reasons } = reportData;

  // Helper to get disaggregated values
  const getDisaggregatedValue = (indicator: string, type: string) => {
    const row = data.find(d => d.indicator === indicator && d.type === type);
    return row ? row.values : {};
  };

  const ageGroups = ['<1', '1-4', '5-9', '10-14', '15-19', '20-24', '25-29', '30-34', '35-39', '40-44', '45-49', '50+'];

  const indicators = [
    { key: 'TX_NEW', label: 'Total New on ART (TX New)', types: ['M', 'FP', 'FNP'] },
    { key: 'IPT_STARTED', label: 'IPT Started', types: ['M', 'FP', 'FNP'] },
    { key: '3HP_STARTED', label: '3HP Started', types: ['M', 'FP', 'FNP'] },
    { key: 'IPT_COMPLETED', label: 'IPT Completed', types: ['M', 'FP', 'FNP'] },
    { key: '3HP_COMPLETED', label: '3HP Completed', types: ['M', 'FP', 'FNP'] },
    { key: 'TPT_STOPPED', label: 'TPT Stopped', types: ['M', 'FP', 'FNP'] },
    { key: 'ACTIVE_TB', label: 'Developed Active TB', types: ['M', 'FP', 'FNP'] }
  ];

  const indicatorMap: Record<string, string> = {
    TX_NEW: 'Total number of clients new on ART (TX New)',
    IPT_STARTED: 'Number of clients new on ART started on IPT',
    THREEHP_STARTED: 'Number of clients new on ART started on 3HP',
    IPT_COMPLETED: 'Number of clients who reached the six months milestone during the reporting month (IPT)',
    THREEHP_COMPLETED: 'Number of clients reached the three months milestone during the reporting month (3HP)',
    TPT_STOPPED: 'Number of clients who stopped TPT during the reporting month',
    ACTIVE_TB: 'Number of clients who developed active TB during the reporting month'
  };

  const typeLabels: Record<string, string> = {
    M: 'M',
    FP: 'FP',
    FNP: 'FNP'
  };

  return (
    <div className="w-full space-y-6 max-h-[80vh] overflow-y-auto p-4">
      {/* Meta Information Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-md p-6 border border-blue-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-cyan-600 rounded-lg">
              <HospitalIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Facility</p>
              <p className="text-lg font-bold text-gray-800">{meta.facility?.name || '–'}</p>
              <p className="text-sm text-gray-500">{meta.facility?.code || '–'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-3 bg-slate-600 rounded-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Submitted By</p>
              <p className="text-lg font-bold text-gray-800">
                {meta.submitted_by?.first_name} {meta.submitted_by?.last_name}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-3 bg-yellow-600 rounded-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Report Period</p>
              <p className="text-lg font-bold text-gray-800">{formattingUtils.formatReportPeriodMMMYY(meta?.report_period)}</p>
            </div>
          </div>
        </div>

        {meta.comment && (
          <div className="mt-6 pt-4 border-t border-blue-200">
            <p className="text-sm text-gray-600 font-medium mb-1 flex gap-1 items-center">
              <MessageSquareMoreIcon size={16} />  
              <span>Comments</span>
            </p>
            <p className="text-base text-gray-700 bg-blue-50 p-3 rounded-md">{meta.comment}</p>
          </div>
        )}
      </div>

      {/* Disaggregation Data Table */}
      <div className="bg-white rounded-md shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-cyan-600 to-navy-500 p-4 flex items-center gap-3">
          <Pill className="w-6 h-6 text-white" />
          <h2 className="text-xl font-bold text-white">TPT Program Indicators</h2>
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
                {ageGroups.map(age => (
                  <th key={age} className="border border-gray-300 bg-gray-600 p-2 font-bold text-white text-center min-w-[60px]">
                    {age}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {indicators.map((indicator) => {
                const types = indicator.types;
                return (
                  <React.Fragment key={indicator.key}>
                    {types.map((type, idx) => {
                      const isFirst = idx === 0;
                      const values = getDisaggregatedValue(indicatorMap[indicator.key], type);
                      return (
                        <tr key={`${indicator.key}-${type}`} className="hover:bg-gray-50">
                          {isFirst && (
                            <td
                              rowSpan={types.length}
                              className="border border-gray-300 p-3 font-medium text-gray-800 bg-gray-50 align-top"
                            >
                              {indicator.label}
                            </td>
                          )}
                          <td className="border border-gray-300 p-3 text-gray-700">{typeLabels[type]}</td>
                          {ageGroups.map(age => (
                            <td key={age} className="border border-gray-300 p-2 text-center">
                              {values[age] || 0}
                            </td>
                          ))}
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

      {/* Stop Reasons Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* IPT Stop Reasons */}
        <div className="bg-white rounded-md shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-4 flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">IPT Stop Reasons</h2>
          </div>
          <div className="p-4">
            {Object.entries(ipt_stop_reasons).length > 0 ? (
              <ul className="space-y-2">
                {Object.entries(ipt_stop_reasons).map(([reason, count]) => (
                  <li
                    key={reason}
                    className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                  >
                    <span className="text-gray-700">{reason}</span>
                    <span className="font-bold text-orange-600 pl-4 mr-6">{count}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">No stop reasons recorded</p>
            )}
          </div>
        </div>

        {/* 3HP Stop Reasons */}
        <div className="bg-white rounded-md shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-4 flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">3HP Stop Reasons</h2>
          </div>
          <div className="p-4">
            {Object.entries(three_hp_stop_reasons).length > 0 ? (
              <ul className="space-y-2">
                {Object.entries(three_hp_stop_reasons).map(([reason, count]) => (
                  <li
                    key={reason}
                    className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                  >
                    <span className="text-gray-700">{reason}</span>
                    <span className="font-bold text-indigo-600 pl-4 mr-6">{count}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">No stop reasons recorded</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TptReportDataViewer;