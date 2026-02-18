import { Button, Popconfirm, Table } from "antd";
import { useState } from "react";
import SuppliersTableNewForm from "./SuppliersTableNewForm";
import SuppliersTableEditForm from "./SuppliersTableEditForm";
import type { SupplierFormValues } from "./components/SuppliersTableForm";
import { useGetManufacturersQuery } from "../../store/api/directoryApi";

const columns = (
  onEdit: (record: any) => void,
  onDelete: (key: any) => void
) => [
  { title: "Код", dataIndex: "codeid" },
  { title: "Наименование", dataIndex: "Наименование" },
  { title: "Адрес", dataIndex: "created_at" },
  { title: "Контакты", dataIndex: "contacts" },
  {
    title: "Действия",
    key: "action",
    render: (_: unknown, record: any) => (
      <>
        <Button type="link" onClick={() => onEdit(record)}>
          Редактировать
        </Button>
        <Popconfirm
          title="Удалить поставщика?"
          onConfirm={() => onDelete(record.key)}
        >
          <Button type="link" danger>
            Удалить
          </Button>
        </Popconfirm>
      </>
    ),
  },
];

const SuppliersTable = () => {
  const { data: dataSource } = useGetManufacturersQuery();
  const [openNew, setOpenNew] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any | null>(null);

  const handleAdd = () => setOpenNew(true);

  const handleEdit = (supplier: any) => {
    setEditingSupplier(supplier);
    setOpenEdit(true);
  };

  const handleDelete = (key: any) => {
    console.log(key);
  };

  const handleNewSubmit = (values: any) => {
    console.log(values);

    setOpenNew(false);
  };

  const handleEditSubmit = (values: SupplierFormValues) => {
    if (!editingSupplier) return;

    console.log(values);

    setOpenEdit(false);
    setEditingSupplier(null);
  };

  return (
    <>
      <Button type="primary" onClick={handleAdd} style={{ marginBottom: 16 }}>
        Добавить поставщика
      </Button>

      <Table
        dataSource={dataSource}
        columns={columns(handleEdit, handleDelete)}
        rowKey="key"
        pagination={{ pageSize: 100 }}
        bordered
      />

      {/* Добавление */}
      <SuppliersTableNewForm
        open={openNew}
        onCancel={() => setOpenNew(false)}
        addSupplier={handleNewSubmit}
      />

      {/* Редактирование */}
      {editingSupplier && (
        <SuppliersTableEditForm
          open={openEdit}
          onCancel={() => {
            setOpenEdit(false);
            setEditingSupplier(null);
          }}
          updateSupplier={handleEditSubmit}
          initialValues={editingSupplier}
        />
      )}
    </>
  );
};

export default SuppliersTable;
