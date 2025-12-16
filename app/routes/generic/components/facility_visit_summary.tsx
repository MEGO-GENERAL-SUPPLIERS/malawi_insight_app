import React from 'react';
import { Calendar, Users, Building2, Target, FileText, Lightbulb, AlertCircle, CheckCircle2, Clock, User, Crown, UserCheck } from 'lucide-react';
import { format, isPast } from 'date-fns';
import { enUS } from 'date-fns/locale';
import type { IFacilityVisitFormData } from '~/types/interfaces/IFacilityVisit';

interface FacilityVisitSummaryProps {
  data: IFacilityVisitFormData | null;
  errorMessage?: string | string[] | null;
}

const FacilityVisitSummary: React.FC<FacilityVisitSummaryProps> = ({ data, errorMessage }) => {
  const formatDate = (dateValue: any): string => {
    if (!dateValue) return '--';
    
    let date: Date;
    if (typeof dateValue === 'string') {
      date = new Date(dateValue);
    } else if (dateValue.toDate) {
      date = dateValue.toDate();
    } else if (dateValue instanceof Date) {
      date = dateValue;
    } else {
      return '--';
    }
    
    return format(date, 'dd-MMM-yyyy', { locale: enUS });
  };

  const isDatePast = (dateValue: any): boolean => {
    if (!dateValue) return false;
    
    let date: Date;
    if (typeof dateValue === 'string') {
      date = new Date(dateValue);
    } else if (dateValue.toDate) {
      date = dateValue.toDate();
    } else if (dateValue instanceof Date) {
      date = dateValue;
    } else {
      return false;
    }
    
    return isPast(date) && !isToday(date);
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const SectionHeader: React.FC<{
    icon: React.ElementType;
    title: string;
    iconColor?: string;
    badge?: string;
  }> = ({ icon: Icon, title, iconColor = 'text-blue-600', badge }) => (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <div className={`${iconColor} bg-gray-50 p-2 rounded-lg`}>
          <Icon size={18} className="sm:w-5 sm:h-5" />
        </div>
        <h4 className="text-sm sm:text-base font-bold text-gray-900">{title}</h4>
      </div>
      {badge && (
        <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-700">
          {badge}
        </span>
      )}
    </div>
  );

  const PersonCard: React.FC<{
    name: string;
    position: string;
    organisation: string;
    color?: string;
  }> = ({ name, position, organisation, color = 'blue' }) => (
    <div className={`bg-gradient-to-br from-${color}-50 to-white border border-${color}-100 p-3 rounded-lg hover:shadow-md transition-all duration-200`}>
      <div className="flex items-start gap-2">
        <div className={`bg-${color}-100 text-${color}-600 p-1.5 rounded-full mt-0.5 flex-shrink-0`}>
          <User size={14} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-900 text-sm truncate">{name}</div>
          <div className="text-xs text-gray-600 mt-0.5">{position} ({organisation})</div>
        </div>
      </div>
    </div>
  );

  const LeaderCard: React.FC<{
    name: string;
    role: string;
    icon: React.ElementType;
    color: string;
    bgColor: string;
    borderColor: string;
  }> = ({ name, role, icon: Icon, color, bgColor, borderColor }) => (
    <div className={`${bgColor} border-2 ${borderColor} p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200`}>
      <div className="flex items-center gap-3">
        <div className={`${color} bg-white p-2.5 rounded-full flex-shrink-0 shadow-sm`}>
          <Icon size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-0.5">{role}</div>
          <div className="font-bold text-gray-900 text-base truncate">{name}</div>
        </div>
      </div>
    </div>
  );

  if (errorMessage) {
    return (
      <div className="p-4 sm:p-6">
        <div className="flex items-start gap-3 text-red-700 bg-red-50 p-4 rounded-lg border border-red-200">
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold">Error</div>
            <div className="text-sm mt-1">
              {Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center px-4">
        <div className="bg-gray-100 p-4 rounded-full mb-4">
          <FileText size={40} className="sm:w-12 sm:h-12 text-gray-400" />
        </div>
        <p className="text-gray-500 font-medium text-sm sm:text-base">No visit data selected</p>
        <p className="text-gray-400 text-xs sm:text-sm mt-1">Select a visit to view its details</p>
      </div>
    );
  }

  // Group team members by organisation
  const teamByOrg = data.team_members?.reduce((acc, member) => {
    const org = member.organisation || 'Unknown';
    if (!acc[org]) acc[org] = [];
    acc[org].push(member);
    return acc;
  }, {} as Record<string, Array<typeof data.team_members[number]>>) || {};

  const visitedByOrg = data.visited_team?.reduce((acc, member) => {
    const org = member.organisation || 'Unknown';
    if (!acc[org]) acc[org] = [];
    acc[org].push(member);
    return acc;
  }, {} as Record<string, Array<typeof data.visited_team[number]>>) || {};

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Compact Header Card */}
      <div className="bg-gradient-to-br from-cyan-600 to-emerald-700 text-white p-4 sm:p-5 rounded-xl shadow-lg">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="flex-shrink-0 opacity-80" />
            <div>
              <div className="text-xs opacity-75 uppercase tracking-wide">Visit Date</div>
              <div className="font-semibold">{formatDate(data.date_of_visit)}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Building2 size={16} className="flex-shrink-0 opacity-80" />
            <div className="min-w-0 flex-1">
              <div className="text-xs opacity-75 uppercase tracking-wide">Facility</div>
              <div className="font-semibold truncate">{data.facility?.[0]?.name || '--'}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <User size={16} className="flex-shrink-0 opacity-80" />
            <div className="min-w-0 flex-1">
              <div className="text-xs opacity-75 uppercase tracking-wide">Submitted By</div>
              <div className="font-semibold truncate">
                {data.submitted_by?.first_name
                  ? `${data.submitted_by.first_name} ${data.submitted_by.last_name}`.trim()
                  : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Personnel - Team Lead and Facility Contact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Team Lead */}
        {data.team_lead && (
          <LeaderCard
            name={data.team_lead}
            role="Visit Team Lead"
            icon={Crown}
            color="text-emerald-600"
            bgColor="bg-gradient-to-br from-emerald-50 to-green-50"
            borderColor="border-emerald-300"
          />
        )}
        
        {/* Health Facility Staff Lead */}
        {data.facility_staff_member && (
          <LeaderCard
            name={data.facility_staff_member}
            role="Main Facility Contact"
            icon={UserCheck}
            color="text-orange-600"
            bgColor="bg-gradient-to-br from-orange-50 to-amber-50"
            borderColor="border-orange-300"
          />
        )}
      </div>

      {/* Personnel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Visit Team */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm">
          <SectionHeader 
            icon={Users} 
            title="Visit Team" 
            iconColor="text-green-600"
            badge={data.team_members?.length ? `${data.team_members.length}` : undefined}
          />
          {Object.keys(teamByOrg).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(teamByOrg).map(([org, members]) => (
                <div key={org}>
                  <div className="space-y-2 sm:space-y-3">
                    {members.map((m, _i) => (
                      <PersonCard
                        name={m.team_member}
                        position={m.position}
                        organisation={m.organisation}
                        color="green"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm italic text-center py-4">No team members listed</p>
          )}
        </div>

        {/* Facility Staff */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm">
          <SectionHeader 
            icon={Users} 
            title="Facility Staff Met" 
            iconColor="text-orange-600"
            badge={data.visited_team?.length ? `${data.visited_team.length}` : undefined}
          />
          {Object.keys(visitedByOrg).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(visitedByOrg).map(([org, members]) => (
                <div key={org}>
                  <div className="space-y-2 sm:space-y-3">
                    {members.map((v, i) => (
                      <PersonCard
                        key={`facility-${org}-${i}`}
                        name={v.team_member}
                        position={v.position}
                        organisation={v.organisation}
                        color="orange"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm italic text-center py-4">No personnel listed</p>
          )}
        </div>
      </div>

      {/* Objectives */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm">
        <SectionHeader icon={Target} title="Visit Objectives" iconColor="text-blue-600" />
        {data.objectives?.length ? (
          <div className="space-y-2">
            {data.objectives.map((o, i) => (
              <div key={i} className="flex items-start gap-2 sm:gap-3 bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                <CheckCircle2 size={16} className="sm:w-[18px] sm:h-[18px] text-blue-600 flex-shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-gray-700">{o.objective || '--'}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm italic text-center py-4">No objectives provided</p>
        )}
      </div>

      {/* Findings */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm">
        <SectionHeader icon={FileText} title="Findings & Observations" iconColor="text-indigo-600" />
        {data.findings?.length ? (
          <div className="space-y-2">
            {data.findings.map((f, i) => (
              <div key={i} className="flex items-start gap-2 sm:gap-3 bg-indigo-50 p-3 rounded-lg">
                <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0 mt-2"></div>
                <span className="text-xs sm:text-sm text-gray-700">{f.finding || '--'}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm italic text-center py-4">No findings recorded</p>
        )}
      </div>

      {/* Recommendations */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm">
        <SectionHeader 
          icon={AlertCircle} 
          title="Recommendations & Actions" 
          iconColor="text-amber-600"
          badge={data.recommendation_actions?.length ? `${data.recommendation_actions.length}` : undefined}
        />
        {data.recommendation_actions?.length ? (
          <div className="space-y-3">
            {data.recommendation_actions.map((r, i) => {
              const isPastDue = isDatePast(r.completion_date);
              const dateColor = isPastDue ? 'text-red-600' : 'text-amber-600';
              const bgColor = isPastDue ? 'from-red-50 to-orange-50' : 'from-amber-50 to-orange-50';
              const borderColor = isPastDue ? 'border-red-500' : 'border-amber-500';

              return (
                <div key={`rec-${i}-${r.recommendation_action?.substring(0, 350)}`} className={`bg-gradient-to-r ${bgColor} border-l-4 ${borderColor} p-3 sm:p-4 rounded-lg shadow-sm`}>
                  <div className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">{r.recommendation_action || '--'}</div>
                  <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <User size={14} className="text-amber-600 flex-shrink-0" />
                      <span className="font-medium">Responsible:</span>
                      <span className="break-words">{r.responsible_personnel || '--'}</span>
                    </div>
                    {r.completion_date && (
                      <div className={`flex items-center gap-2 ${dateColor} font-medium`}>
                        <Clock size={14} className="flex-shrink-0" />
                        <span>Due:</span>
                        <span>{formatDate(r.completion_date)}</span>
                        {isPastDue && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Overdue</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-400 text-sm italic text-center py-4">No recommendations provided</p>
        )}
      </div>

      {/* Quality Improvement */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm">
        <SectionHeader
          icon={Lightbulb}
          title="Quality Improvement Project"
          iconColor="text-emerald-600"
          badge={data.quality_improvement_enabled === 1 ? 'Active' : 'Not Active'}
        />
        {data.quality_improvement?.length ? (
          <div className="space-y-3">
            {data.quality_improvement.map((q, i) => (
              <div key={i} className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 p-3 sm:p-4 rounded-lg">
                <div className="mb-3">
                  <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1">
                    Suggested Initiative
                  </div>
                  <div className="text-sm font-medium text-gray-900">{q.suggested_qi || '--'}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1">
                    Goal & Outcome
                  </div>
                  <div className="text-sm text-gray-700">{q.goal_outcome || '--'}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm italic text-center py-4">
            {data.quality_improvement_enabled === 1
              ? 'No QI entries despite being enabled'
              : 'QI not documented for this visit'}
          </p>
        )}
      </div>

      {/* Additional Comments */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm">
        <SectionHeader icon={FileText} title="Additional Comments" iconColor="text-gray-600" />
        <div className="bg-gray-50 border border-gray-200 p-3 sm:p-4 rounded-lg min-h-[80px]">
          {data.comment?.trim() ? (
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{data.comment}</p>
          ) : (
            <p className="text-gray-400 text-sm italic">No comments provided</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacilityVisitSummary;