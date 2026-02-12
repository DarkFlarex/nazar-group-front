import { Tabs } from "antd";
import type { TabsProps } from "antd";
import OzonCategories from "./OzonCategories";
import WbCategories from "./WbCategories";
import YmCategories from "./YmCategories";

const items: TabsProps["items"] = [
  {
    key: "ozon",
    label: "Ozon",
    children: <OzonCategories />,
  },
  {
    key: "wb",
    label: "Wildberries",
    children: <WbCategories />,
  },
  {
    key: "ym",
    label: "Яндекс Маркет",
    children: <YmCategories />,
  },
];

export default function CategoriesPage() {
  return <Tabs items={items} />;
}
