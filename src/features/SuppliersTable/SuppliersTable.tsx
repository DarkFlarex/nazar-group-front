import { Button, Popconfirm, Table } from "antd";
import { useState } from "react";
import SuppliersTableNewForm from "./SuppliersTableNewForm";
import SuppliersTableEditForm from "./SuppliersTableEditForm";
import type { SupplierFormValues } from "./components/SuppliersTableForm";

interface Supplier extends SupplierFormValues {
    key: string;
    code: string;
}

const initialData: Supplier[] = [
    {
        key: "1",
        code: "SUP-0001",
        title: "ОсОО ЭлектроСнаб",
        address: "г. Бишкек, ул. Ленина 10",
        contacts: "+996 700 111 222",
    },
];

const generateSupplierCode = (index: number) => {
    return `SUP-${String(index).padStart(4, "0")}`;
};

const columns = (
    onEdit: (record: Supplier) => void,
    onDelete: (key: string) => void
) => [
    { title: "Код", dataIndex: "code" },
    { title: "Наименование", dataIndex: "title" },
    { title: "Адрес", dataIndex: "address" },
    { title: "Контакты", dataIndex: "contacts" },
    {
        title: "Действия",
        key: "action",
        render: (_: unknown, record: Supplier) => (
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
    const [dataSource, setDataSource] = useState<Supplier[]>(initialData);
    const [openNew, setOpenNew] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [editingSupplier, setEditingSupplier] =
        useState<Supplier | null>(null);

    const handleAdd = () => setOpenNew(true);

    const handleEdit = (supplier: Supplier) => {
        setEditingSupplier(supplier);
        setOpenEdit(true);
    };

    const handleDelete = (key: string) => {
        setDataSource((prev) => prev.filter((item) => item.key !== key));
    };

    const handleNewSubmit = (values: SupplierFormValues) => {
        setDataSource((prev) => {
            const newSupplier: Supplier = {
                key: Date.now().toString(),
                code: generateSupplierCode(prev.length + 1),
                ...values,
            };
            return [...prev, newSupplier];
        });
        setOpenNew(false);
    };

    const handleEditSubmit = (values: SupplierFormValues) => {
        if (!editingSupplier) return;

        setDataSource((prev) =>
            prev.map((item) =>
                item.key === editingSupplier.key
                    ? { ...item, ...values }
                    : item
            )
        );

        setOpenEdit(false);
        setEditingSupplier(null);
    };

    return (
        <>
            <Button
                type="primary"
                onClick={handleAdd}
                style={{ marginBottom: 16 }}
            >
                Добавить поставщика
            </Button>

            <Table
                dataSource={dataSource}
                columns={columns(handleEdit, handleDelete)}
                rowKey="key"
                pagination={{ pageSize: 10 }}
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
