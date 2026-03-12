import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Shield } from 'lucide-react';
import { FaEdit, FaSignOutAlt, FaUserLock } from 'react-icons/fa';
import { localStorageUtils } from "~/utils/localStorageUtils";
import { useNavigator } from "~/hooks/useNavigator";
import { type IUser } from "~/types/interfaces/ILocalStorageInterfaces";

interface Contact {
  type: string;
  value: string;
}

interface Facility {
  id: number;
  name: string;
  code?: string;
}

interface District {
  id: number;
  name: string;
  facilities?: Facility[];
}

interface Location {
  id: number;
  name: string;
}

interface UserLocations {
  countries?: Location[];
  provinces?: Location[];
  districts?: District[];
  facilities?: Facility[];
}

interface ExtendedUser extends Omit<IUser, 'roles' | 'privileges' | 'contacts'> {
  contacts?: Contact[];
  locations?: UserLocations;
  roles?: string[];
  privileges?: string[];
}

interface ExpandedDistrictsState {
  [key: number]: boolean;
  showAll?: boolean;
}

const Profile: React.FC = () => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [showAllPermissions, setShowAllPermissions] = useState<boolean>(false);
  const [expandedDistricts, setExpandedDistricts] = useState<ExpandedDistrictsState>({});
  const { navigateTo } = useNavigator();

  useEffect(() => {
    const userData = localStorageUtils.getStoredUser();
    if (userData) {
      setUser(userData as ExtendedUser);
    }
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 overflow-y-auto">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "--";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return "--";
    }
  };

  const getInitials = (): string => {
    return `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase();
  };

  const toggleDistrict = (districtId: number): void => {
    setExpandedDistricts(prev => ({
      ...prev,
      [districtId]: !prev[districtId]
    }));
  };

  const userPrivileges = Array.isArray(user.privileges) ? user.privileges : [];
  const displayedPermissions = showAllPermissions 
    ? userPrivileges 
    : userPrivileges.slice(0, 6);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-50 px-4 sm:px-6 lg:px-8 overflow-y-auto pb-10">
      <div className="max-w-6xl mx-auto">

        {/* Header Card */}
        <div className="bg-white rounded-md shadow-lg overflow-hidden mb-6 w-full">
          <div className="bg-linear-to-r from-emerald-500 via-emerald-600 to-teal-600 h-32 sm:h-40"></div>

          <div className="px-6 sm:px-8 pb-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16 sm:-mt-20 w-full gap-4">

              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-white shadow-xl flex items-center justify-center border-4 border-white">
                  <span className="text-4xl font-bold text-emerald-600">{getInitials()}</span>
                </div>
                <div className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-4 border-white ${
                  user.status === 'active' ? 'bg-emerald-500' : 'bg-gray-400'
                }`}></div>
              </div>

              <div className="mt-4 sm:mt-0 sm:ml-6 flex-1 text-center sm:text-left">
                <h1 className="text-3xl font-bold text-slate-700 lg:text-gray-50">{user.full_name}</h1>
                <p className="text-gray-600 sm:text-gray-900 mt-1">{`${user.username ?? "--"}`}</p>

                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
                  {user.roles?.map((role, index) => (
                    <span key={index} className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-4 sm:mt-0 justify-center sm:justify-start">
                <div className="relative group">
                  <button 
                    className="flex items-center justify-center w-10 h-10 bg-slate-500 text-white rounded-lg hover:bg-yellow-600 transition shadow-md cursor-pointer"
                    onClick = {() => navigateTo("/app/profile/password_change")}  
                  >
                    <FaUserLock size={20} />
                  </button>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
                    Change Password
                  </div>
                </div>

                <div className="relative group">
                  <button className="flex items-center justify-center w-10 h-10 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition shadow-md cursor-pointer">
                    <FaEdit size={20} />
                  </button>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
                    Edit Profile
                  </div>
                </div>
                
                <div className="relative group">
                  <button className="flex items-center justify-center w-10 h-10 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-md cursor-pointer">
                    <FaSignOutAlt size={20} />
                  </button>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
                    Logout
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full overflow-visible">

          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Personal Information */}
            <div className="bg-white rounded-xl shadow-md p-6 w-full overflow-x-hidden">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User size={24} className="text-emerald-600" />
                Personal Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoItem label="First Name" value={user.first_name || "--"} />
                <InfoItem label="Last Name" value={user.last_name || "--"} />
                <InfoItem label="Other Names" value={user.other_names || 'N/A'} />
                <InfoItem label="Gender" value={user.gender || "--"} />
                <InfoItem label="Date of Birth" value={formatDate(user?.date_of_birth)} />
                <InfoItem label="National ID" value={user.national_id || "--"} />
                <InfoItem label="Person ID" value={"--"} />
                <InfoItem label="Status" value={user.status || "--"} badge />
              </div>
            </div>

            {/* Contact Information */}
            {user.contacts && user.contacts.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6 w-full overflow-x-hidden">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Mail size={24} className="text-emerald-600" />
                  Contact Information
                </h2>

                <div className="space-y-3">
                  {user.contacts.map((contact, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      {contact?.type === 'email' ? (
                        <Mail size={20} className="text-gray-600" />
                      ) : (
                        <Phone size={20} className="text-gray-600" />
                      )}
                      <div>
                        <p className="text-xs text-gray-500 capitalize">{contact?.type || "--"}</p>
                        <p className="text-gray-900 font-medium">{contact?.value || "--"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Allocated Areas */}
            {user.locations && (
              <div className="bg-white rounded-xl shadow-md p-6 w-full overflow-x-hidden">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin size={24} className="text-emerald-600" />
                  Allocated Areas
                </h2>

                <div className="space-y-3">

                  {user.locations.countries?.map((country) => (
                    <div key={country.id} className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                      <p className="text-xs text-gray-500">Country</p>
                      <p className="text-sm font-semibold text-gray-900">{country.name}</p>
                    </div>
                  ))}

                  {user.locations.provinces?.map((province) => (
                    <div key={province.id} className="p-3 bg-teal-50 rounded-lg border border-teal-100">
                      <p className="text-xs text-gray-500">Region</p>
                      <p className="text-sm font-semibold text-gray-900">{province.name}</p>
                    </div>
                  ))}

                  {user.locations.districts?.slice(0, expandedDistricts.showAll ? undefined : 3).map((district) => (
                    <div key={district.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      
                      <div 
                        className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 cursor-pointer hover:from-emerald-100 hover:to-green-100 transition"
                        onClick={() => toggleDistrict(district.id)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-xs text-gray-500">District</p>
                            <p className="font-semibold text-gray-900">{district.name}</p>
                            <p className="text-xs text-gray-600 mt-1">
                              {district.facilities?.length || 0} facilities
                            </p>
                          </div>
                          <span className="text-emerald-600 text-xl">
                            {expandedDistricts[district.id] ? '−' : '+'}
                          </span>
                        </div>
                      </div>

                      {expandedDistricts[district.id] && district.facilities && (
                        <div className="p-4 bg-white space-y-2 overflow-y-auto max-h-[50vh] pr-1">
                          {district.facilities.map((facility) => (
                            <div key={facility.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                              <p className="font-medium text-gray-900 text-sm">{facility.name}</p>
                              {facility.code && (
                                <p className="text-xs text-gray-500 mt-1">Code: {facility.code}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {user.locations.districts && user.locations.districts.length > 3 && !expandedDistricts.showAll && (
                    <button
                      onClick={() => setExpandedDistricts(prev => ({ ...prev, showAll: true }))}
                      className="w-full py-2 px-4 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition font-medium text-sm"
                    >
                      See All Districts ({user.locations.districts.length})
                    </button>
                  )}

                </div>
              </div>
            )}
          </div>

          {/* Right Column – Permissions */}
          <div className="space-y-6">

            <div className="bg-white rounded-xl shadow-md p-6 w-full overflow-x-hidden">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Shield size={24} className="text-emerald-600" />
                Permissions
              </h2>

              <div className="space-y-2 overflow-y-auto max-h-[60vh] pr-1">
                {displayedPermissions.map((privilege, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">{privilege}</span>
                  </div>
                ))}
              </div>

              {userPrivileges.length > 6 && (
                <button
                  onClick={() => setShowAllPermissions(!showAllPermissions)}
                  className="w-full mt-4 py-2 px-4 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition font-medium text-sm"
                >
                  {showAllPermissions 
                    ? 'Show Less' 
                    : `See More (${userPrivileges.length - 6} more)`
                  }
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

interface InfoItemProps {
  label: string;
  value: string;
  badge?: boolean;
}

const InfoItem: React.FC<InfoItemProps> = ({ label, value, badge = false }) => (
  <div>
    <p className="text-xs text-gray-500 mb-1">{label}</p>
    {badge ? (
      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
        value === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
      }`}>
        {value}
      </span>
    ) : (
      <p className="text-gray-900 font-medium">{value}</p>
    )}
  </div>
);

export default Profile;
