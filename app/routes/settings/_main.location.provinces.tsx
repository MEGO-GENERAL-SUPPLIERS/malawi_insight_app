import React, { useMemo, useRef, useState } from "react";
import { ModalComponent, type ModalButton } from "~/components/system/ModalComponent";
import ProvinceAddForm from "~/components/forms/province.add";
import { type IProvince } from "~/types/interfaces/IProvinceInterfaces";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";

const Provinces = () => {
  const modalRef = useRef<any>(null);
  const [tableData, setTableData] = useState<IProvince[]>([
    { id: 1, country_id: 1, name: "Northern Region", code: "NR", void: 0 },
    { id: 2, country_id: 1, name: "Central Region", code: "CR", void: 0 }
  ]);

  const [editingRow, setEditingRow] = useState<IProvince | null>(null);

  const handleOpenModal = (rowData?: IProvince) => {
    setEditingRow(rowData ?? null); // if rowData exists, we are editing
    modalRef.current?.openModal();
  };

  const handleGetData = () => {
    const data = modalRef.current?.getSlotData?.();
    console.log("Slotted component data:", data ?? "No data");
  };

  const customButtons: ModalButton[] = [
    {
      label: "Submit",
      className: "btn btn-success",
      onClick: (data) => {
        console.log("Submit clicked with data:", data);
        // Optional: Add or update tableData here
        if (editingRow) {
          // Update existing row
          setTableData((prev) =>
            prev.map((row) => (row.id === editingRow.id ? { ...row, ...data } : row))
          );
        } else {
          // Add new row
          setTableData((prev) => [
            ...prev,
            { id: prev.length + 1, country_id: 1, void: 0, ...data },
          ]);
        }
      },
    },
  ];

  const columns = useMemo<MRT_ColumnDef<IProvince>[]>(() => [
    {
      accessorKey: "name",
      header: "Name",
      muiTableHeadCellProps: { style: { color: 'green'} },
      enableHiding: false
    },
    {
      accessorKey: "void",
      header: "Status",
      muiTableHeadCellProps: { style: { color: 'green'} },
      Cell: ({ cell }) => (cell.getValue() === 0 ? "Active" : "Inactive")
    },
    {
    id: "actions",                        // special id
    header: "Actions",
    size: 150,
    enableColumnActions: false,
    enableSorting: false,
    position: "last",                     // ✅ ensures far-right placement
    Cell: ({ row }) => (
      <div className="flex gap-2">
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => handleEditRow(row.original) }
        >
          Edit
        </button>
        <button
          className="btn btn-danger btn-sm"
          onClick={() => handleDeleteRow(row.original) }
        >
          Delete
        </button>
      </div>
    )
  }
  ], []);

  const handleAddRow = (data: any) => {
    console.log(`✅ Add`, data);
    alert(`✅ Add ${data}`);
  };

  const handleEditRow = (data: any) => {
    console.log(`✅ Edit`,  data);
    alert(`✅ Edit ${data}`);
  };

  const handleDeleteRow = (data: any) => {
    console.log(`✅ Deletr `, data);
    alert(`✅ Delete ${data}`);
  };

  return (
    <section className="space-y-4 p-4">
      <h5 className="text-lg font-semibold">Provinces</h5>

      <div className="flex gap-2 mb-2">
        <button onClick={() => handleOpenModal()} className="btn btn-success">
          Add Province
        </button>
        <button onClick={handleGetData} className="btn btn-default">
          Get Modal Data
        </button>
      </div>

      <MaterialReactTable
        data={tableData}
        columns={columns}
        enableColumnActions={true}
        mrtTheme={(theme) => ({ baseBackgroundColor: theme.palette.background.default })}
      />

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
