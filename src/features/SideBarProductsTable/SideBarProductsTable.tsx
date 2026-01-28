import { Button, Popconfirm, Table } from "antd";
import { useState } from "react";
import SideBarProductsTableNewForm from "../SideBarProductsTable/SideBarProductsTableNewForm.tsx";
import SideBarProductsTableEditForm from "../SideBarProductsTable/SideBarProductsTableEditForm.tsx";
import type { ProductFormValues } from "./components/SideBarProductsTableForm.tsx";
import { useNavigate } from "react-router-dom";
import type { Product } from "../../types/products.ts";

interface Props {
    products: Product[];
    setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

const columns = (onEdit: (record: Product) => void, onDelete: (key: string) => void) => [
    { title: "Код", dataIndex: "code" },
    { title: "Наименование", dataIndex: "name" },
    { title: "Производитель", dataIndex: "manufacturer" },
    { title: "Артикул", dataIndex: "sku" },
    { title: "Номер производителя (Автозапчасти)", dataIndex: "manufacturerNumber" },
    { title: "Номер оригинала (Общие)", dataIndex: "originalNumber" },
    { title: "Габариты (Общие)", dataIndex: "dimensions" },
    { title: "Вес", dataIndex: "weight", render: (value: number) => (value ? `${value} кг` : "-") },
    {
        title: "Действия",
        key: "action",
        render: (_value: unknown, record: Product) => (
            <>
                <Button type="link" onClick={() => onEdit(record)}>Редактировать</Button>
                <Popconfirm title="Удалить товар?" onConfirm={() => onDelete(record.key)}>
                    <Button type="link" danger>Удалить</Button>
                </Popconfirm>
            </>
        ),
    },
];

const generateProductCode = (index: number) => {
    return `PR-${String(index).padStart(4, "0")}`;
};

const SideBarProductsTable = ({ products, setProducts }: Props) => {
    const navigate = useNavigate();
    const [openNew, setOpenNew] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

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

    const handleDelete = (key: string) => {
        setProducts((prev) => prev.filter((product) => product.key !== key));
    };

    const handleNewSubmit = (values: ProductFormValues) => {
        setProducts((prev) => {
            const newProduct: Product = {
                key: Date.now().toString(),
                ...values,
                code: generateProductCode(prev.length + 1),
            };
            return [...prev, newProduct];
        });
        setOpenNew(false);
    };

    const handleEditSubmit = (values: ProductFormValues) => {
        if (!editingProduct) return;
        setProducts((prev) =>
            prev.map((product) =>
                product.key === editingProduct.key ? { ...product, ...values } : product
            )
        );
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
                pagination={{ pageSize: 10 }}
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
