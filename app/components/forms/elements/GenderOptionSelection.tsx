import React, { useState, useEffect } from "react";
import { fetchGenders } from "~/services/genderService";
import CustomRadio from "~/components/generic_components/CustomRadio";
import type { IGender } from "~/types/interfaces/IGenderInterfaces";

interface GenderOptionSelectionProps {
  label?: string;
  value?: IGender | null;
  onChange: (payload: { value: IGender | null; valid: boolean }) => void;
  validate?: boolean;
  validationMessage?: string;
  disabled?: boolean;
  direction?: "row" | "column";
  radioLabelPosition?: "left" | "right" | "top" | "bottom";
  refreshable?: boolean;
  defaultGenderName?: string;
}

const GenderOptionSelection: React.FC<GenderOptionSelectionProps> = ({
  label="Gender",
  value = null,
  onChange,
  validate = true,
  validationMessage = "Please select a gender",
  disabled = false,
  direction = "row",
  radioLabelPosition = "right",
  refreshable = true,
  defaultGenderName = "Prefer not to say",
}) => {
  const [genders, setGenders] = useState<IGender[] | null>(null);
  const [loading, setLoading] = useState(true);

  const loadGenders = async (): Promise<IGender[] | null> => {
    setLoading(true);
    const fallback: IGender[] = [
      { id: 1, name: "Male" },
      { id: 2, name: "Female" },
      { id: 0, name: "Prefer not to say" },
    ];

    try {
      const response = await fetchGenders();
      const data = response?.data?.length ? response.data : fallback;
      setGenders(data);
      return data;
    } catch {
      setGenders(fallback);
      return fallback;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      const data = await loadGenders();

      if (data && !value) {
        const defaultGender = data.find(
          (g) => g.name.toLowerCase() === defaultGenderName.toLowerCase()
        );

        if (defaultGender) {
          // Defer to next tick to prevent React update race
          setTimeout(() => {
            onChange({ value: defaultGender, valid: true });
          }, 0);
        }
      }
    })();
  }, []);

  if (loading && !genders) return <p>Loading genders...</p>;

  return (
    <CustomRadio<IGender>
      label={label}
      options={genders}
      value={value}
      getOptionLabel={(opt) => opt.name}
      getOptionValue={(opt) => opt.id}
      validate={validate}
      validationMessage={validationMessage}
      onChange={onChange}
      disabled={disabled}
      direction={direction}
      radioLabelPosition={radioLabelPosition}
      refreshable={refreshable}
      onRefresh={loadGenders}
    />
  );
};

export default GenderOptionSelection;
