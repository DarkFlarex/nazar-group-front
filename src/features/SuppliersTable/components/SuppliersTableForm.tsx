import { Form, Input, Modal } from "antd";
import { useEffect } from "react";

export interface SupplierFormValues {
    title: string;
    address?: string;
    contacts?: string;
}

interface Props {
    open: boolean;
    onCancel: () => void;
    onSubmit: (values: SupplierFormValues) => void;
    initialValues?: SupplierFormValues;
}

const SuppliersTableForm = ({
                                open,
                                onCancel,
                                onSubmit,
                                initialValues,
                            }: Props) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (open) {
            form.setFieldsValue(
                initialValues || {
                    title: "",
                    address: "",
                    contacts: "",
                }
            );
        }
    }, [open, initialValues, form]);

    return (
        <Modal
            title={initialValues ? "Редактировать поставщика" : "Добавить поставщика"}
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
                <Form.Item
                    name="title"
                    label="Наименование"
                    rules={[{ required: true, message: "Введите наименование" }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item name="address" label="Адрес">
                    <Input />
                </Form.Item>

                <Form.Item name="contacts" label="Контакты">
                    <Input />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default SuppliersTableForm;
