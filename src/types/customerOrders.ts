// CustomerOrders.ts
export interface CustomerOrders {
    guid: string;
    number: string;
    date: string;
    amount?: string;
    client?: string;
    currentState?: string; // закрыт / ожидается оплата / в процессе отгрузки
}


export const mockCustomerOrders: CustomerOrders[] = [
    {
        guid: "1",
        number: "0000-001",
        date: "10.01.2025",
        amount: "125 000",
        client: "ООО «АвтоДеталь»",
        currentState: "ожидается оплата",
    },
    {
        guid: "2",
        number: "0000-002",
        date: "12.01.2025",
        amount: "89 500",
        client: "ИП Иванов",
        currentState: "в процессе отгрузки",
    },
    {
        guid: "3",
        number: "0000-003",
        date: "14.01.2025",
        amount: "42 300",
        client: "ОсОО «ТехСнаб»",
        currentState: "закрыт",
    },
];