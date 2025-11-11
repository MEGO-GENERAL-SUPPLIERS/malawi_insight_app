import React from "react";
import type { IContactType } from "~/types/interfaces/IContactTypeInterfaces";
import type { IContact } from "~/types/interfaces/IContactInterfaces";
import { fetchContactTypes } from "~/services/contactTypeService";
import CustomMultiSelectInput from "~/components/generic_components/CustomMultiSelectInput";
import { validationUtils } from "~/utils/validationUtils";

interface ContactSelectInputProps {
  value?: IContact[];
  onChange: (payload: { data: IContact[]; valid: boolean }) => void;
  label?: string;
  validate?: boolean;
  liveValidation?: boolean;
  refreshable?: boolean;
  showErrorMessage?: boolean;
  maxFields?: number;
}

const ContactSelectInput: React.FC<ContactSelectInputProps> = ({
  value = [],
  onChange,
  label = "User Contacts",
  validate = true,
  liveValidation = true,
  refreshable = true,
  showErrorMessage = true,
  maxFields
}) => {
  const fetchOptions = async (): Promise<IContactType[]> => {
    const response = await fetchContactTypes();
    return response.data || [];
  };

  const defaultValues = value.length
    ? value.map((v) => ({
        option: v.contact_type || null,
        contact: v.contact || "",
      }))
    : [];

  // Per-option validation depending on contact type
  const validateInput = (option: IContactType | null, value: string) => {
    if (!option) return false;
    switch (option.name.toLowerCase()) {
      case "email":
        return validationUtils.isValidEmail(value);
      case "phone":
        return validationUtils.isValidMalawianNumber(value) || validationUtils.isValidInternationalNumber(value);
      case "number":
        return validationUtils.isDecimal(value);
      case "string":
      default:
        return validationUtils.isValidInput(value);
    }
  };

  return (
    <CustomMultiSelectInput<IContactType>
      label={label}
      fetchMethod={fetchOptions}
      getOptionLabel={(opt) => opt.name}
      getOptionValue={(opt) => opt.id}
      defaultValues={defaultValues}
      validate={validate}
      liveValidation={liveValidation}
      refreshable={refreshable}
      showErrorMessage={showErrorMessage}
      validateValue={validateInput}
      onChange={({ data, valid }) => {
        const mapped: IContact[] = data.map((d) => ({
          contact_type: d.option || undefined,
          contact: d.contact,
        }));
        onChange({ data: mapped, valid });
      }}
      maxItems={maxFields}
    />
  );
};

export default ContactSelectInput;
