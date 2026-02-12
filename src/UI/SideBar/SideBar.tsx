// SideBar.tsx
import { Menu, theme } from "antd";
import Sider from "antd/es/layout/Sider";
import { BarsOutlined, SnippetsOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

interface SideBarProps {
  selectedKey: string;
}

const menuItems = [
  {
    key: "/orders",
    icon: <SnippetsOutlined />,
    label: "Заказы МП",
    children: [
      { key: "/orders/orderWb", label: "Валберс" },
      { key: "/orders/orderOzon", label: "Ozon" },
    ],
  },
  {
    key: "/supply",
    icon: <SnippetsOutlined />,
    label: "Поставки",
    children: [
      { key: "/supply/SupplyTable", label: "Валберс" },
      { key: "/supply/PostingsOzon", label: "Ozon" },
    ],
  },
  {
    key: "/market",
    icon: <SnippetsOutlined />,
    label: "Маркетплейс",
    children: [
      { key: "/market/wildberis", label: "Валберс" },
      { key: "/market/OzonStatus", label: "Ozon проверка" },
      { key: "/market/OzonProductForm", label: "Ozon" },
      { key: "/market/cardsmerket", label: "Карточки Валберс" },
      { key: "/market/OzonProductList", label: "Карточки Ozon" },
    ],
  },
  {
    key: "/invoices",
    icon: <SnippetsOutlined />,
    label: "Накладные",
    children: [
      { key: "/invoices/prihod", label: "Приход" },
      { key: "/invoices/rashod", label: "Расход" },
      { key: "/invoices/customerOrdersPage", label: "Заказы клиентов" },
    ],
  },
  {
    key: "/directories",
    icon: <BarsOutlined />,
    label: "Справочники",
    children: [
      { key: "/directories/clients", label: "Клиенты" },
      { key: "/directories/products", label: "Номенклатура" },
      { key: "/directories/categories", label: "Категории" },
      { key: "/directories/suppliers", label: "Поставщики" },
    ],
  },
  {
    key: "/reports",
    icon: <BarsOutlined />,
    label: "Отчеты",
    children: [{ key: "/reports/main", label: "Основной" }],
  },
];

const SideBar = () => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const navigate = useNavigate();

  return (
    <Sider width={200} style={{ background: colorBgContainer }}>
      <Menu
        mode="inline"
        defaultOpenKeys={menuItems.map((item) => item.key)}
        style={{ height: "100%", borderRight: 0 }}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
      />
    </Sider>
  );
};

export default SideBar;
