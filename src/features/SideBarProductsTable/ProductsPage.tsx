
import { Tabs } from "antd";
import { useParams } from "react-router-dom";
import type { Product } from "../../types/products.ts";
import ProductCardTab from "./components/ProductCardTab.tsx";
import ProductRequisitesTab from "./components/ProductRequisitesTab.tsx";

const { TabPane } = Tabs;

interface ProductsPageProps {
    products: Product[];
}

const ProductsPage = ({ products }: ProductsPageProps) => {
    const { id } = useParams<{ id: string }>();
    const selectedProduct = products.find(p => p.key === id);

    if (!selectedProduct) {
        return <div>Продукт не найден</div>;
    }

    return (
        <Tabs defaultActiveKey="card">
            <TabPane tab="Карточка" key="card"
                     style={{ marginBottom: "16px" }}
            >
                <ProductCardTab product={selectedProduct} />
            </TabPane>

            <TabPane tab="Реквизиты" key="requisites">
                <ProductRequisitesTab product={selectedProduct} />
            </TabPane>
        </Tabs>
    );
};

export default ProductsPage;
