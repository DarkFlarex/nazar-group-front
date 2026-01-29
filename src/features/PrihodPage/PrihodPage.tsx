import { useState } from "react";
import PrihodForm from "./components/PrihodForm";
import PrihodTable from "./PrihodTable";
import type { IncomingGoodsFormValues } from "./components/PrihodForm";

const initialData = [
    {
        key: "1",
        product: "Зеркало боковое MB Sprinter",
        quantity: 1,
        price: 3200,
        total: 3200,
        priceKgs: 3200,
        totalKgs: 3200,
    },
    {
        key: "2",
        product: "Фара передняя левая MB Sprinter",
        quantity: 2,
        price: 5500,
        total: 11000,
        priceKgs: 5500,
        totalKgs: 11000,
    },
];

const PrihodPage = () => {
    const [items, setItems] = useState<any[]>([]);

    const handleAdd = (values: IncomingGoodsFormValues) => {
        setItems((prev) => [
            ...prev,
            {
                key: Date.now().toString(),
                product: values.product,
                quantity: values.quantity,
                price: values.price,
                total: values.total,
                priceKgs: values.priceKgs,
                totalKgs: values.totalKgs,
            },
        ]);
    };

    // Объединяем исходные данные и добавленные
    const combinedData = [...initialData, ...items];

    return (
        <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
            <div style={{ width: 360 }}>
                <PrihodForm onAdd={handleAdd} />
            </div>

            <div style={{ flex: 1 }}>
                <PrihodTable data={combinedData} />
            </div>
        </div>
    );
};

export default PrihodPage;
