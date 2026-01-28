// products.ts
export interface Product {
    key: string;
    code: string;
    name: string;
    manufacturer?: string;
    sku?: string;
    manufacturerNumber?: string;
    originalNumber?: string;
    dimensions?: string;
    weight?: number;
    imageUrl?: string;
}

export const mockProducts: Product[] = [
    {
        key: "1",
        code: "PR001",
        name: "Радиатор основной MB Sprinter 906  FREY",
        manufacturer: "Производитель А",
        sku: "SKU12345",
        manufacturerNumber: "MN-98765",
        originalNumber: "ON-54321",
        dimensions: "100x50x30",
        weight: 2.5,
        imageUrl: "https://via.placeholder.com/200",
    },
    {
        key: "2",
        code: "PR002",
        name: "Товар 2",
        manufacturer: "Производитель Б",
        sku: "SKU67890",
        manufacturerNumber: "MN-12345",
        originalNumber: "ON-67890",
        dimensions: "120x60x40",
        weight: 3.1,
        imageUrl: "https://via.placeholder.com/200",
    },
];