// SideBar.tsx
import { Menu, theme } from "antd";
import Sider from "antd/es/layout/Sider";
import { BarsOutlined } from "@ant-design/icons";
import { SnippetsOutlined} from "@ant-design/icons";

interface SideBarProps {
    selectedKey: string;
    onSelect: (key: string) => void;
}

const menuItems = [
    {
        key: "invoices",
        icon: <SnippetsOutlined/>,
        label: "Накладные",
        children: [
            { key: "income", label: "Приход" },
            { key: "customerOrdersPage", label: "Заказы клиентов" },
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
