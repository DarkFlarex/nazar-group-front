import { Button, Popconfirm, Table } from "antd";
import { useState } from "react";
import CategoriesTableNewForm from "./CategoriesTableNewForm";
import CategoriesTableEditForm from "./CategoriesTableEditForm";
import type { CategoryFormValues } from "./components/CategoriesTableForm";

interface Category extends CategoryFormValues {
    key: string;
}

const initialData: Category[] = [
    {
        key: "1",
        code: "CAT001",
        title: "Электроника",
    },
];

const columns = (
    onEdit: (record: Category) => void,
    onDelete: (key: string) => void
) => [
    { title: "Код", dataIndex: "code" },
    { title: "Наименование", dataIndex: "title" },
    {
        title: "Действия",
        key: "action",
        render: (_: unknown, record: Category) => (
            <>
                <Button type="link" onClick={() => onEdit(record)}>
                    Редактировать
                </Button>
                <Popconfirm
                    title="Удалить категорию?"
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
const generateCategoriesCode = (index: number) => {
    return `PR-${String(index).padStart(4, "0")}`;
};
const CategoriesTable = () => {
    const [dataSource, setDataSource] = useState<Category[]>(initialData);
    const [openNew, setOpenNew] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [editingCategory, setEditingCategory] =
        useState<Category | null>(null);

    const handleAdd = () => {
        setOpenNew(true);
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setOpenEdit(true);
    };

    const handleDelete = (key: string) => {
        setDataSource((prev) => prev.filter((item) => item.key !== key));
    };

    const handleNewSubmit = (values: CategoryFormValues) => {
        setDataSource((prev) => {
        const newCategory: Category = {
            key: Date.now().toString(),
            code: generateCategoriesCode(prev.length + 1),
            ...values,
        };
        return [...prev, newCategory]
    });
        setOpenNew(false);
    };

    const handleEditSubmit = (values: CategoryFormValues) => {
        if (!editingCategory) return;

        setDataSource((prev) =>
            prev.map((item) =>
                item.key === editingCategory.key
                    ? { ...item, ...values }
                    : item
            )
        );

        setOpenEdit(false);
        setEditingCategory(null);
    };

    return (
        <>
            <Button
                type="primary"
                onClick={handleAdd}
                style={{ marginBottom: 16 }}
            >
                Добавить категорию
            </Button>

            <Table
                dataSource={dataSource}
                columns={columns(handleEdit, handleDelete)}
                rowKey="key"
                pagination={{ pageSize: 10 }}
                bordered
            />

            {/* Добавление */}
            <CategoriesTableNewForm
                open={openNew}
                onCancel={() => setOpenNew(false)}
                addCategory={handleNewSubmit}
            />

            {/* Редактирование */}
            {editingCategory && (
                <CategoriesTableEditForm
                    open={openEdit}
                    onCancel={() => {
                        setOpenEdit(false);
                        setEditingCategory(null);
                    }}
                    updateCategory={handleEditSubmit}
                    initialValues={editingCategory}
                />
            )}
        </>
    );
};

export default CategoriesTable;
