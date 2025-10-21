import React, { useRef } from "react";
import { ModalComponent, type ModalButton } from "~/components/system/ModalComponent";
import ProvinceAddForm from "~/components/forms/province.add";

const Provinces = () => {
  const modalRef = useRef<any>(null);

  const handleOpenModal = () => {
    modalRef.current?.openModal();
  };

  const handleGetData = () => {
    const data = modalRef.current?.getSlotData();
    console.log("Slotted component data:", data);
  };

  const customButtons: ModalButton[] = [
    {
      label: "Submit",
      className: "btn btn-success",
      onClick: (data) => console.log("Submit clicked with data:", data),
    },
  ];

  return (
    <section className="space-y-4 p-4">
      <h5 className="text-lg font-semibold">Provinces</h5>

      <button
        onClick={handleOpenModal}
        className="btn btn-success"
      >
        Add Province
      </button>
      <button
        onClick={handleGetData}
        className="btn btn-default"
      >
        Get Modal Data
      </button>

      <ModalComponent
        ref={modalRef}
        title="Province Details"
        icon="MapPin"
        size="md"
        blur={1}
        backdropOpacity={0.4}
        dismissable={false}
        showCloseButton={true}
        customButtons={customButtons}
      >
        <ProvinceAddForm />
      </ModalComponent>
    </section>
  );
};

export default Provinces;
