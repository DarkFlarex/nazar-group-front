import { useEffect } from "react";
import { Form, Input, InputNumber, Select, Typography, Button } from "antd";

const { Option } = Select;

export interface IncomingGoodsFormValues {
    supplier: string;
    barcode: string;
    product: string;
    warehouse: string;
    currency: string;
    price: number;
    priceKgs: number;
    quantity: number;
    total: number;
    totalKgs: number;
}

interface ProductByBarcode {
    product: string;
    currency: "USD" | "KGS";
    price: number;
    priceKgs: number;
}

const productsByBarcode: Record<string, ProductByBarcode> = {
    "123456": {
        product: "Зеркало боковое MB Sprinter",
        currency: "KGS",
        price: 3200,
        priceKgs: 3200,
    },
    "234567": {
        product: "Фара передняя левая MB Sprinter",
        currency: "USD",
        price: 65,
        priceKgs: 5800,
    },
};

interface Props {
    onAdd: (values: IncomingGoodsFormValues) => void;
}

const PrihodForm = ({ onAdd }: Props) => {
    const [form] = Form.useForm<IncomingGoodsFormValues>();

    useEffect(() => {
        form.resetFields();
    }, [form]);

    const handleBarcodeChange = (barcode: string) => {
        const product = productsByBarcode[barcode];

        if (!product) return;

        form.setFieldsValue({
            product: product.product,
            currency: product.currency,
            price: product.price,
            priceKgs: product.priceKgs,
            quantity: 1,
            total: product.price,
            totalKgs: product.priceKgs,
        });
    };

    const handleQuantityChange = (quantity: number | null) => {
        const qty = quantity ?? 0;
        const price = form.getFieldValue("price") || 0;
        const priceKgs = form.getFieldValue("priceKgs") || 0;

        form.setFieldsValue({
            total: price * qty,
            totalKgs: priceKgs * qty,
        });
    };

    const handleSubmit = (values: IncomingGoodsFormValues) => {
        onAdd(values);
        form.resetFields();
    };

    return (
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Typography.Title level={4}>Приход товаров</Typography.Title>

            <Form.Item name="supplier" label="Поставщик" rules={[{ required: true }]}>
                <Select>
                    <Option value="autoparts">ОсОО «AutoParts Sprinter KG»</Option>
                </Select>
            </Form.Item>

            <Form.Item name="barcode" label="Штрихкод" rules={[{ required: true }]}>
                <Select showSearch onChange={handleBarcodeChange}>
                    {Object.keys(productsByBarcode).map((barcode) => (
                        <Option key={barcode} value={barcode}>
                            {barcode}
                        </Option>
                    ))}
                </Select>
            </Form.Item>

            <Form.Item name="product" label="Товар">
                <Input disabled />
            </Form.Item>

            <Form.Item name="warehouse" label="Склад" rules={[{ required: true }]}>
                <Select>
                    <Option value="moscow">Москва</Option>
                    <Option value="bishkek">Бишкек</Option>
                </Select>
            </Form.Item>

            <Form.Item name="currency" label="Валюта">
                <Input disabled />
            </Form.Item>

            <Form.Item name="price" label="Цена">
                <InputNumber disabled style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item name="priceKgs" label="Цена (сом)">
                <InputNumber disabled style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item name="quantity" label="Количество" rules={[{ required: true }]}>
                <InputNumber min={1} onChange={handleQuantityChange} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item name="total" label="Сумма">
                <InputNumber disabled style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item name="totalKgs" label="Сумма (сом)">
                <InputNumber disabled style={{ width: "100%" }} />
            </Form.Item>

            {/* 🔥 КНОПКА */}
            <Button type="primary" htmlType="submit" block>
                Добавить
            </Button>
        </Form>
    );
};

export default PrihodForm;
