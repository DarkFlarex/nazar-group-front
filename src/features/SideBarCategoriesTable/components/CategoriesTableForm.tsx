import { Form, Input, Modal } from "antd";
import { useEffect } from "react";
import "./CategoriesTableForm.css";

export interface CategoryFormValues {
    code?: string;
    title: string;
}

interface Props {
    open: boolean;
    onCancel: () => void;
    onSubmit: (values: CategoryFormValues) => void;
    initialValues?: CategoryFormValues;
}

const CategoriesTableForm = ({
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
                    code: "",
                    title: "",
                }
            );
        }
    }, [open, initialValues, form]);

    return (
        <Modal
            title={initialValues ? "Редактировать категорию" : "Добавить категорию"}
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
            </Form>
        </Modal>
    );
};

export default CategoriesTableForm;
