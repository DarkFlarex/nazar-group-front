import { Form, Input, Select, Button, Typography } from "antd";

const { Option } = Select;

const CustomerOrderForm = () => {
    const [form] = Form.useForm();

    const onFinish = (values: any) => {
        console.log("Форма отправлена с данными:", values);
    };

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            style={{ maxWidth: 600 }}
        >
            <Typography.Title level={3} style={{ marginBottom: 24 }}>
                Заказ клиента (создание)
            </Typography.Title>

            <div style={{ display: "flex", gap: 24 }}>
                <div style={{ flex: 1 }}>
                    <Form.Item
                        label="Номер"
                        name="number"
                        rules={[{ required: true, message: "Пожалуйста, введите номер заказа" }]}
                    >
                        <Input placeholder="Введите номер заказа" />
                    </Form.Item>

                    <Form.Item
                        label="Клиент"
                        name="client"
                        rules={[{ required: true, message: "Пожалуйста, выберите клиента" }]}
                    >
                        <Select placeholder="Выберите клиента">
                            <Option value="client1">ООО «АвтоДеталь»</Option>
                            <Option value="client2">ИП Иванов</Option>
                            <Option value="client3">ОсОО «ТехСнаб»</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Соглашение"
                        name="agreement"
                        rules={[{ required: true, message: "Пожалуйста, укажите соглашение" }]}
                    >
                        <Input placeholder="Введите соглашение" />
                    </Form.Item>
                </div>

                <div style={{ flex: 1 }}>
                    <Form.Item
                        label="Операция"
                        name="operation"
                        rules={[{ required: true, message: "Пожалуйста, выберите операцию" }]}
                    >
                        <Select placeholder="Выберите операцию">
                            <Option value="realization">Реализация</Option>
                            <Option value="purchase">Покупка</Option>
                            <Option value="return">Возврат</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Склад"
                        name="warehouse"
                        rules={[{ required: true, message: "Пожалуйста, выберите склад" }]}
                    >
                        <Select placeholder="Выберите склад">
                            <Option value="moscow">Москва</Option>
                            <Option value="spb">Санкт-Петербург</Option>
                            <Option value="nsk">Новосибирск</Option>
                        </Select>
                    </Form.Item>
                </div>
            </div>

            <Form.Item label="Комментарий" name="comment">
                <Input.TextArea rows={3} placeholder="Введите комментарий" />
            </Form.Item>

            <Form.Item style={{ textAlign: "right", marginTop:"5px" }}>
                <Button type="primary" htmlType="submit" style={{ minWidth: 150 }}>
                    Создать заказ
                </Button>
            </Form.Item>
        </Form>
    );
};

export default CustomerOrderForm;
