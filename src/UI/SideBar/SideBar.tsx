// SideBar.tsx
import { Menu, theme } from "antd";
import Sider from "antd/es/layout/Sider";
import { BarsOutlined } from "@ant-design/icons";
import { SnippetsOutlined } from "@ant-design/icons";

interface SideBarProps {
  selectedKey: string;
  onSelect: (key: string) => void;
}

const menuItems = [
  {
    key: "market",
    icon: <SnippetsOutlined />,
    label: "Маркетплейс",
    children: [
      { key: "wildberis", label: "Валберс" },
      { key: "ozon", label: "Ozon" },
      { key: "cardsmerket", label: "Карточки Валберс" },
      { key: "ozonCards", label: "Карточки Ozon" },
    ],
  },
  {
    key: "invoices",
    icon: <SnippetsOutlined />,
    label: "Накладные",
    children: [
      { key: "prihod", label: "Приход" },
      { key: "rashod", label: "Расход" },
      { key: "customerOrdersPage", label: "Заказы клиентов" },
    ],
  },
  {
    key: "orders",
    icon: <SnippetsOutlined />,
    label: "Заказы",
    children: [
      { key: "orderWB", label: "Закзы WB" },
      { key: "orderOzon", label: "Закзы Ozon" },
      { key: "orderSuplier", label: "Закзы поставщику" },
    ],
  },
  {
    key: "directories",
    icon: <BarsOutlined />,
    label: "Справочники",
    children: [
      {
        key: "clients",
        label: "Клиенты",
      },
      {
        key: "products",
        label: "Номенклатура",
      },
      {
        key: "categories",
        label: "Категории",
      },
      {
        key: "suppliers",
        label: "Поставщики",
      },
    ],
  },
  {
    key: "reports",
    icon: <BarsOutlined />,
    label: "Отчеты",
    children: [
      {
        key: "reports",
        label: "Основной",
      },
    ],
  },
];

const SideBar = ({ selectedKey, onSelect }: SideBarProps) => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  return (
    <Sider width={200} style={{ background: colorBgContainer }}>
      <Menu
        mode="inline"
        defaultOpenKeys={["invoices"]}
        selectedKeys={[selectedKey]}
        style={{ height: "100%", borderRight: 0 }}
        items={menuItems}
        onClick={({ key }) => onSelect(key)}
      />
    </Sider>
  );
};

export default SideBar;
