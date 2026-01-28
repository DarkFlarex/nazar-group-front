import { Form, Input, Modal, InputNumber } from "antd";
import { useEffect } from "react";
import './SideBarClientsTableForm.css'

export interface ClientFormValues {
    lastName: string;
    firstName: string;
    country?: string;
    city?: string;
    region?: string;
    postalCode?: string;
    contacts?: string;
    discount?: number;
    points?: number;
}

interface Props {
    open: boolean;
    onCancel: () => void;
    onSubmit: (values: ClientFormValues) => void;
    initialValues?: ClientFormValues;
}

const SideBarClientsTableForm = ({ open, onCancel, onSubmit, initialValues }: Props) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (open) {
            form.setFieldsValue(initialValues || {
                lastName: "",
                firstName: "",
                country: "",
                city: "",
                region: "",
                postalCode: "",
                contacts: "",
                discount: 0,
                points: 0,
            });
        }
    }, [open, initialValues, form]);

    return (
        <Modal
            title={initialValues ? "Редактировать клиента" : "Добавить клиента"}
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
                style={{ ['--ant-form-item-margin-bottom' as any]: '0px' }}
            >
                <Form.Item name="lastName" label="Фамилия" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>

                <Form.Item name="firstName" label="Имя" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>

                <Form.Item name="country" label="Страна">
                    <Input />
                </Form.Item>

                <Form.Item name="city" label="Город">
                    <Input />
                </Form.Item>

                <Form.Item name="region" label="Регион">
                    <Input />
                </Form.Item>

                <Form.Item name="postalCode" label="Почтовый индекс">
                    <Input />
                </Form.Item>

                <Form.Item name="contacts" label="Контакты">
                    <Input />
                </Form.Item>

                <Form.Item name="discount" label="Скидка %">
                    <InputNumber min={0} max={100} style={{ width: "100%" }} />
                </Form.Item>

                <Form.Item name="points" label="Баллы">
                    <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default SideBarClientsTableForm;
