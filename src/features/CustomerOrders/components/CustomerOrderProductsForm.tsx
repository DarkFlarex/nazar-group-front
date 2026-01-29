import { Form, Input, Select, Button, Typography } from "antd";

const { Option } = Select;

interface ProductByBarcode {
    price: string;
    unit: string;
    article: string;
    nomenclature: string;
    supplier: string;
}
const productsByBarcode: Record<string, ProductByBarcode> = {
    "123456": {
        price: "3200",
        unit: "шт",
        article: "125",
        nomenclature: "Зеркало боковое (электр. в сборе) MB Sprinter",
        supplier: "Поставщик 1",
    },
    "234567": {
        price: "5500",
        unit: "шт",
        article: "234",
        nomenclature: "Фара передняя левая MB Sprinter",
        supplier: "Поставщик 2",
    },
    // добавь другие товары сюда...
};

const CustomerOrderProductsForm = () => {
    const [form] = Form.useForm();

    const onBarcodeChange = (barcode: string) => {
        const product = productsByBarcode[barcode];
        if (product) {
            form.setFieldsValue({
                price: product.price,
                unit: product.unit,
                article: product.article,
                nomenclature: product.nomenclature,
                supplier: product.supplier,
            });
        } else {
            // Если штрих-код не найден — очистить поля
            form.setFieldsValue({
                price: "",
                unit: "",
                article: "",
                nomenclature: "",
                supplier: "",
            });
        }
    };

    const onFinish = (values: string) => {
        console.log("Форма отправлена с данными:", values);
    };

    return (
        <Form form={form} layout="vertical" onFinish={onFinish} style={{ maxWidth: 600 }}>
            <Typography.Title level={3} style={{ marginBottom: 24 }}>
                Создание товара
            </Typography.Title>

            <div style={{ display: "flex", gap: 24 }}>
                <div style={{ flex: 1 }}>
                    <Form.Item
                        label="Штрих код"
                        name="barcode"
                        rules={[{ required: true, message: "Пожалуйста, выберите штрих код" }]}
                    >
                        <Select
                            placeholder="Выберите штрих код"
                            onChange={onBarcodeChange}
                            allowClear
                        >
                            {Object.keys(productsByBarcode).map((barcode) => (
                                <Option key={barcode} value={barcode}>
                                    {barcode}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Цена"
                        name="price"
                        rules={[{ required: true, message: "Пожалуйста, введите цену" }]}
                    >
                        <Input placeholder="Введите цену" />
                    </Form.Item>

                    <Form.Item
                        label="Скидка (%)"
                        name="discount"
                    >
                        <Input placeholder="Введите скидку" />
                    </Form.Item>

                    <Form.Item
                        label="Количество"
                        name="quantity"
                        rules={[{ required: true, message: "Пожалуйста, введите количество" }]}
                    >
                        <Input placeholder="Введите количество" />
                    </Form.Item>
                </div>

                <div style={{ flex: 1 }}>
                    <Form.Item
                        label="Единица измерения"
                        name="unit"
                        rules={[{ required: true, message: "Пожалуйста, выберите единицу измерения" }]}
                    >
                        <Select placeholder="Выберите единицу измерения">
                            <Option value="шт">шт</Option>
                            <Option value="кг">кг</Option>
                            <Option value="л">л</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Артикул"
                        name="article"
                        rules={[{ required: true, message: "Пожалуйста, введите артикул" }]}
                    >
                        <Input placeholder="Введите артикул" />
                    </Form.Item>

                    <Form.Item
                        label="Номенклатура"
                        name="nomenclature"
                        rules={[{ required: true, message: "Пожалуйста, введите номенклатуру" }]}
                    >
                        <Input placeholder="Введите номенклатуру" />
                    </Form.Item>

                    <Form.Item
                        label="Поставщик"
                        name="supplier"
                        rules={[{ required: true, message: "Пожалуйста, выберите поставщика" }]}
                    >
                        <Select placeholder="Выберите поставщика" disabled>
                            {/* Чтобы поставщик не редактировать вручную, он только для показа */}
                            <Option value={form.getFieldValue("supplier")}>
                                {form.getFieldValue("supplier")}
                            </Option>
                        </Select>
                    </Form.Item>
                </div>
            </div>

            <Form.Item style={{ textAlign: "right", marginTop: "5px" }}>
                <Button type="primary" htmlType="submit" style={{ minWidth: 150 }}>
                    Создать товар
                </Button>
            </Form.Item>
        </Form>
    );
};

export default CustomerOrderProductsForm;
