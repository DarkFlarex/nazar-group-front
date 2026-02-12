import { Table, Tag } from "antd";
import { useEffect, useState } from "react";
import { useGetDescriptionCategoryTreeMutation } from "../store/api/ozonCategoryApi";
import { mapOzonTreeToTable } from "../utils/flattenCategories";

const columns = [
  { title: "Название", dataIndex: "name" },
  {
    title: "Тип",
    dataIndex: "type",
    render: (text: string) => (
      <Tag
        color={
          text === "Категория"
            ? "blue"
            : text === "Подкатегория"
            ? "green"
            : "orange"
        }
      >
        {text}
      </Tag>
    ),
  },
  {
    title: "Отключена",
    dataIndex: "disabled",
    render: (v: boolean) => (v ? "Да" : "Нет"),
  },
];

export default function OzonCategories() {
  const [getTree, { data, isLoading, error }] =
    useGetDescriptionCategoryTreeMutation();

  const [tableData, setTableData] = useState<any[]>([]);

  useEffect(() => {
    getTree({ language: "RU" });
  }, []);

  useEffect(() => {
    if (data?.result) {
      setTableData(mapOzonTreeToTable(data.result));
    }
  }, [data]);

  if (isLoading) return <p>Загрузка...</p>;
  if (error) return <p>Ошибка</p>;

  return (
    <Table
      columns={columns}
      dataSource={tableData}
      pagination={false}
      rowKey="key"
    />
  );
}
