import { Button, Popconfirm, Table } from "antd";
import { useState } from "react";
import SideBarProductsTableNewForm from "../SideBarProductsTable/SideBarProductsTableNewForm";
import SideBarProductsTableEditForm from "../SideBarProductsTable/SideBarProductsTableEditForm";
import type { ProductFormValues } from "./components/SideBarProductsTableForm";
import { useNavigate } from "react-router-dom";
import type { Product } from "../../types/products.ts";
import { useGetgoodsQuery } from "../../store/api/goodsApi.ts";

const columns = (
  onEdit: (record: Product) => void,
  onDelete: (key: string) => void
) => [
  { title: "Код", dataIndex: "code" },
  { title: "Наименование", dataIndex: "nameid" },
  { title: "Производитель", dataIndex: "manufacturer" },
  { title: "Артикул", dataIndex: "articul" },
  {
    title: "Номер производителя (Автозапчасти)",
    dataIndex: "manufacturer_number",
  },
  { title: "Номер оригинала (Общие)", dataIndex: "original_number" },
  { title: "Габариты (Общие)", dataIndex: "gross_weight" },
  {
    title: "Вес",
    dataIndex: "gross_weight",
    render: (value: number) => (value ? `${value} кг` : "-"),
  },
  {
    title: "Действия",
    key: "action",
    render: (_value: unknown, record: Product) => (
      <>
        <Button type="link" onClick={() => onEdit(record)}>
          Редактировать
        </Button>
        <Popconfirm
          title="Удалить товар?"
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

const SideBarProductsTable = () => {
  const navigate = useNavigate();
  const [openNew, setOpenNew] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { data: products } = useGetgoodsQuery();
  const onRowClick = (record: Product) => {
    navigate(`/products/${record.key}`);
  };

  const handleAdd = () => {
    setOpenNew(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setOpenEdit(true);
  };

  const handleDelete = (key: any) => {
    console.log(key);
  };

  const handleNewSubmit = (values: any) => {
    console.log(values);
  };

  const handleEditSubmit = (values: ProductFormValues) => {
    if (!editingProduct) return;
    console.log(values);

    setOpenEdit(false);
    setEditingProduct(null);
  };

  return (
    <>
      <Button type="primary" onClick={handleAdd} style={{ marginBottom: 16 }}>
        Добавить Номенклатуру
      </Button>

      <Table
        dataSource={products}
        columns={columns(handleEdit, handleDelete)}
        rowKey="key"
        pagination={{ pageSize: 15 }}
        bordered
        onRow={(record) => ({
          onClick: () => onRowClick(record),
          style: { cursor: "pointer" },
        })}
      />

      <SideBarProductsTableNewForm
        open={openNew}
        onCancel={() => setOpenNew(false)}
        addProduct={handleNewSubmit}
      />

      {editingProduct && (
        <SideBarProductsTableEditForm
          open={openEdit}
          onCancel={() => {
            setOpenEdit(false);
            setEditingProduct(null);
          }}
          updateProduct={handleEditSubmit}
          initialValues={editingProduct}
        />
      )}
    </>
  );
};

export default SideBarProductsTable;
