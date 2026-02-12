import { Tabs, type TabsProps } from "antd";
import CustomerOrderForm from "./components/CustomerOrderForm";
import CustomerOrderProductsTable from "./components/CustomerOrderProductsTable";

const CustomerOrdersTabs = () => {
  const items: TabsProps["items"] = [
    {
      key: "main",
      label: "Основное",
      children: <CustomerOrderForm />,
    },
    {
      key: "products",
      label: "Товары",
      children: <CustomerOrderProductsTable />,
    },
  ];

  return <Tabs defaultActiveKey="main" items={items} onChange={() => {}} />;
};

export default CustomerOrdersTabs;
