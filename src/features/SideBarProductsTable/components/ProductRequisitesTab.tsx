import { Descriptions } from "antd";
import type { Product } from "../../../types/products.ts";

interface Props {
    product: Product;
}

const ProductRequisitesTab = ({ product }: Props) => {
    return (
        <Descriptions bordered column={1}>
            <Descriptions.Item label="Код">
                {product.code}
            </Descriptions.Item>
            <Descriptions.Item label="Производитель">
                {product.manufacturer || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Артикул">
                {product.sku || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Номер производителя">
                {product.manufacturerNumber || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Номер оригинала">
                {product.originalNumber || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Габариты">
                {product.dimensions || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Вес">
                {product.weight ? `${product.weight} кг` : "-"}
            </Descriptions.Item>
        </Descriptions>
    );
};

export default ProductRequisitesTab;
