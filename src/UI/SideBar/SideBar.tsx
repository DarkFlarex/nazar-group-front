// SideBar.tsx
import { Menu, theme } from "antd";
import Sider from "antd/es/layout/Sider";
import {
  BarsOutlined,
  SnippetsOutlined,
  FolderOpenOutlined,
  ProfileOutlined,
  DatabaseOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";

const SideBar = () => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: "/orders",
      icon: <SnippetsOutlined />,
      label: "Заказы МП",
      children: [
        { key: "/orders/orderWb", label: "WB" },
        { key: "/orders/orderOzon", label: "Ozon" },
        { key: "/orders/tasksOzon", label: "Сборочные задания" },
        { key: "/orders/return", label: "Возвраты" },
        { key: "/orders/claims", label: "Заявки на возврат" },
      ],
    },
    {
      key: "/supply",
      icon: <FolderOpenOutlined />,
      label: "Поставки",
      children: [
        { key: "/supply/SupplyTable", label: "WB" },
        { key: "/supply/PostingsOzon", label: "Ozon" },
      ],
    },
    {
      key: "/market",
      icon: <ProfileOutlined />,
      label: "Маркетплейс",
      children: [
        { key: "/market/wildberis", label: "WB" },
        { key: "/market/OzonStatus", label: "Статус Ozon" },
        // { key: "/market/StocksQoanPage", label: "Склад" },
        { key: "/market/OzonProductForm", label: "Ozon Форма" },
        { key: "/market/cardsmerket", label: "Карточки WB" },
        { key: "/market/OzonProductList", label: "Карточки Ozon" },
      ],
    },
    {
      key: "/invoices",
      icon: <DatabaseOutlined />,
      label: "Накладные",
      children: [
        { key: "/invoices/prihod", label: "Приход" },
        { key: "/invoices/see/income", label: "Накладные" },
        { key: "/invoices/rashod", label: "Расход" },
        // { key: "/invoices/customerOrdersPage", label: "Заказы клиентов" },
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
      icon: <ProfileOutlined />,
      label: "Отчеты",
      children: [{ key: "/reports/main", label: "Основной" }],
    },
  ];

  return (
    <Sider
      width={220}
      style={{ background: colorBgContainer }}
      breakpoint="lg"
      collapsedWidth="80"
    >
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        style={{ height: "100%", borderRight: 0 }}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
      />
    </Sider>
  );
};

export default SideBar;
