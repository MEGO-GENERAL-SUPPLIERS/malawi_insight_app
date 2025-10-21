// province.add.tsx
import React, { useState } from "react";

interface ProvinceFormProps {
  setSlotData?: (data: any) => void;
}

const ProvinceAddForm: React.FC<ProvinceFormProps> = ({ setSlotData }) => {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);
    setSlotData?.(updated); // emit data to modal
  };

  return (
    <div className="flex flex-col gap-2">
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Province Name"
        className="border px-2 py-1 rounded"
      />
      <input
        type="text"
        name="code"
        value={formData.code}
        onChange={handleChange}
        placeholder="Province Code"
        className="border px-2 py-1 rounded"
      />
    </div>
  );
};

export default ProvinceAddForm;
