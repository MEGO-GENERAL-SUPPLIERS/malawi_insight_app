import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, CheckCircle, XCircle, ShieldCheck } from 'lucide-react';
import { validationUtils } from '~/utils/validationUtils';
import { useNavigator } from '~/hooks/useNavigator';
import { localStorageUtils } from "~/utils/localStorageUtils";
import { passwordChange } from "~/services/authService";
import { ToastAlertComponentController } from '~/components/controllers/ToastAlertComponentController';
import PageHeaderTitle from '~/components/system/PageHeaderTitle';

const PasswordChange: React.FC = () => {
  const { navigateTo } = useNavigator();

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: ""
  });

  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmNewPassword: false
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [strength, setStrength] = useState(validationUtils.validatePassword(""));
  const [isSubmitting, setIsSubmitting] = useState(false);  

  // Live validation 
  useEffect(() => {
    setStrength(validationUtils.validatePassword(formData.newPassword));

    if(errors.confirmNewPassword && formData.confirmNewPassword){
      if(validationUtils.checkPasswordMatch(formData.newPassword, formData.confirmNewPassword)){
        setErrors(prev => {
          const newErrors = {...prev};
          delete newErrors.confirmNewPassword; 
          return newErrors;
        });
      }
    }
  }, [formData.newPassword, formData.confirmNewPassword]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target; 
    setFormData(prev => ({...prev, [name]: value }));

    // ✅ Clear error for this field on input to re-enable button immediately
    if(errors[name]){
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({...prev, [field]: !prev[field]}));
  };

  // ✅ Computed: Is form valid for submission?
  // Only checks field content and matching - NOT error state
  const isFormValid = 
    formData.currentPassword.trim().length > 0 &&
    formData.newPassword.trim().length >= 8 &&
    strength.score >= 3 && // Require "Good" or "Strong"
    formData.confirmNewPassword.trim().length > 0 &&
    validationUtils.checkPasswordMatch(formData.newPassword, formData.confirmNewPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ✅ Re-validate on submit to be safe
    if(!isFormValid) return;
    
    // ✅ Start loading IMMEDIATELY on valid submit (before API call)
    setIsSubmitting(true);
    setErrors({});

    // ✅ FIXED: Simple inline validation for current password
    // This replaces validationUtils.validateCurrentPassword() which may have been causing issues
    if (!formData.currentPassword || formData.currentPassword.trim().length === 0) {
      setErrors(prev => ({...prev, currentPassword: "Current password is required" }));
      setIsSubmitting(false);
      return;
    }

    // Validate new password length
    if (formData.newPassword.trim().length < 8) {
      setErrors(prev => ({...prev, newPassword: "Password must be at least 8 characters" }));
      setIsSubmitting(false);
      return;
    }

    // Validate password match
    if(!validationUtils.checkPasswordMatch(formData.newPassword, formData.confirmNewPassword)){
      setErrors(prev => ({...prev, confirmNewPassword: "Confirm password must match new password"}));
      setIsSubmitting(false);
      return;
    }

    // Get username from localStorage
    const userId = localStorageUtils.getStoredUser()?.id;
    if(!userId){
      setErrors(prev => ({...prev, submit:  `User not found...` }));
      setIsSubmitting(false);
      return;
    }

    // API call
    try{
      const response = await passwordChange({
        userId: Number(userId) || 0,
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmNewPassword: formData.confirmNewPassword
      });
      
      if(response.success){
        ToastAlertComponentController.show({
          message: "Password changed successfully",
          type: "success"
        });
      
        // Optional: redirect after success
        setTimeout(() => navigateTo("/app/profile"), 1500);
      } else {
         ToastAlertComponentController.show({
          message: response.message || "Password change failed",
          type: "error"
        });
      }
      
    } catch(error: any){
      const errorMsg = error?.message || "Failed to change password. Please try again.";
      setErrors(prev => ({...prev, submit: errorMsg}));
      ToastAlertComponentController.show({
        message: errorMsg,
        type: "error"
      });
    } finally {
      // ✅ Re-enable button after API response resolves
      setIsSubmitting(false);
    }
  };

  return(
    <>
      <PageHeaderTitle title='Change Password' icon='UserLock' />

      <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Current Password */}
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type={showPasswords.currentPassword ? "text" : "password"}
                  className={`w-full px-4 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.currentPassword 
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                      : "border-gray-300 focus:ring-emerald-500 focus:border-emerald-500"
                  }`}
                  placeholder="Enter current password"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('currentPassword')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.currentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <XCircle size={12} /> {errors.currentPassword}
                </p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showPasswords.newPassword ? "text" : "password"}
                  className={`w-full px-4 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.newPassword 
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                      : "border-gray-300 focus:ring-emerald-500 focus:border-emerald-500"
                  }`}
                  placeholder="Enter new password"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('newPassword')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.newPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              
              {/* Strength Meter */}
              {formData.newPassword && (
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Strength: <span className={`font-medium ${strength.score >= 3 ? 'text-emerald-600' : 'text-gray-700'}`}>{strength.label}</span></span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${strength.color}`} 
                      style={{ width: `${(strength.score / 4) * 100}%` }}
                    ></div>
                  </div>
                  
                  {/* Requirements Checklist */}
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <RequirementItem met={strength.requirements.length} label="8+ Characters" />
                    <RequirementItem met={strength.requirements.uppercase} label="Uppercase" />
                    <RequirementItem met={strength.requirements.lowercase} label="Lowercase" />
                    <RequirementItem met={strength.requirements.number} label="Number" />
                    <RequirementItem met={strength.requirements.specialChar} label="SpecialChars" />
                  </div>
                </div>
              )}

              {errors.newPassword && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <XCircle size={12} /> {errors.newPassword}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="confirmNewPassword"
                  name="confirmNewPassword"
                  type={showPasswords.confirmNewPassword ? "text" : "password"}
                  className={`w-full px-4 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.confirmNewPassword 
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                      : formData.confirmNewPassword && validationUtils.checkPasswordMatch(formData.newPassword, formData.confirmNewPassword)
                        ? "border-emerald-300 focus:ring-emerald-500 focus:border-emerald-500"
                        : "border-gray-300 focus:ring-emerald-500 focus:border-emerald-500"
                  }`}
                  placeholder="Confirm new password"
                  value={formData.confirmNewPassword}
                  onChange={handleInputChange}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {formData.confirmNewPassword && (
                    validationUtils.checkPasswordMatch(formData.newPassword, formData.confirmNewPassword) ? (
                      <CheckCircle size={20} className="text-emerald-500" />
                    ) : (
                      <XCircle size={20} className="text-red-500" />
                    )
                  )}
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirmNewPassword')}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.confirmNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              {errors.confirmNewPassword && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <XCircle size={12} /> {errors.confirmNewPassword}
                </p>
              )}

              {formData.confirmNewPassword && (
                    validationUtils.checkPasswordMatch(formData.newPassword, formData.confirmNewPassword) ? (
                      null
                    ) : (
                      <p className="text-red-500 text-xs mt-2">Confirm Password must match New Password</p>
                    )
                  )}
            </div>

            {/* Submit & Cancel Buttons - 50/50 Split */}
            <div className="pt-4 grid grid-cols-2 gap-4">
              <button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className={`w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-all ${
                  (!isFormValid || isSubmitting)
                    ? "bg-gray-400 cursor-not-allowed opacity-75" 
                    : "bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 cursor-pointer"
                }`}
              >
                {isSubmitting ? (
                  <>
                    {/* ✅ Loading spinner shows immediately on valid submit */}
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    Update Password
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => navigateTo("/app/profile")}
                disabled={isSubmitting}
                className={`w-full cursor-pointer flex justify-center items-center gap-2 py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all ${
                  isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Cancel
              </button>
            </div>
            
            {errors.submit && (
              <p className="text-center text-sm text-red-600 -mt-2">{errors.submit}</p>
            )}
          </form>
    </>
  );
};

// Helper Component for Requirements
const RequirementItem: React.FC<{ met: boolean; label: string }> = ({ met, label }) => (
  <div className={`flex items-center gap-1.5 text-xs ${met ? 'text-emerald-600' : 'text-gray-400'}`}>
    {met ? <CheckCircle size={12} className="fill-emerald-50" /> : <div className="w-3 h-3 rounded-full border border-gray-300" />}
    <span>{label}</span>
  </div>
);

export default PasswordChange;