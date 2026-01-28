import { Form, Input, Modal, InputNumber } from "antd";
import { useEffect } from "react";

export interface ProductFormValues {
    name: string;                 // Наименование
    manufacturer?: string;        // Производитель
    sku?: string;                 // Артикул
    manufacturerNumber?: string;  // Номер производителя (Автозапчасти)
    originalNumber?: string;      // Номер оригинала (Общие)
    dimensions?: string;          // Габариты (Общие)
    weight?: number;              // Вес
}

interface Props {
    open: boolean;
    onCancel: () => void;
    onSubmit: (values: ProductFormValues) => void;
    initialValues?: ProductFormValues;
}

const SideBarProductsTableForm = ({ open, onCancel, onSubmit, initialValues }: Props) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (open) {
            form.setFieldsValue(initialValues || {
                name: "",
                manufacturer: "",
                sku: "",
                manufacturerNumber: "",
                originalNumber: "",
                dimensions: "",
                weight: 0,
            });
        }
    }, [open, initialValues, form]);

    return (
        <Modal
            title={initialValues ? "Редактировать номенклатуру" : "Добавить номенклатуру"}
            open={open}
            onCancel={() => {
                form.resetFields();
                onCancel();
            }}
            onOk={() => form.submit()}
            okText="Сохранить"
            cancelText="Отмена"
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={(values) => {
                    onSubmit(values);
                    form.resetFields();
                }}
            >
                <Form.Item name="name" label="Наименование" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>

                <Form.Item name="manufacturer" label="Производитель">
                    <Input />
                </Form.Item>

                <Form.Item name="sku" label="Артикул">
                    <Input />
                </Form.Item>

                <Form.Item name="manufacturerNumber" label="Номер производителя (Автозапчасти)">
                    <Input />
                </Form.Item>

                <Form.Item name="originalNumber" label="Номер оригинала (Общие)">
                    <Input />
                </Form.Item>

                <Form.Item name="dimensions" label="Габариты (Общие)">
                    <Input />
                </Form.Item>

                <Form.Item name="weight" label="Вес (кг)">
                    <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default SideBarProductsTableForm;