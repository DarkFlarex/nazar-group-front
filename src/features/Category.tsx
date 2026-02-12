import React, { useEffect, useState } from "react";
import { Table, Tag } from "antd";
import { useGetDescriptionCategoryTreeMutation } from "../store/api/ozonCategoryApi";
import { mapOzonTreeToTable } from "../utils/flattenCategories";

const columns = [
  {
    title: "Название",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Тип",
    dataIndex: "type",
    key: "type",
    render: (text: any) => {
      let color =
        text === "Категория"
          ? "blue"
          : text === "Подкатегория"
          ? "green"
          : "orange";
      return <Tag color={color}>{text}</Tag>;
    },
  },
  {
    title: "Отключена",
    dataIndex: "disabled",
    key: "disabled",
    render: (disabled: any) => (disabled ? "Да" : "Нет"),
  },
];

export default function OzonCategoryTable() {
  const [getTree, { data, isLoading, error }] =
    useGetDescriptionCategoryTreeMutation();
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    getTree({ language: "RU" });
  }, []);

  useEffect(() => {
    if (data?.result) {
      setTableData(mapOzonTreeToTable(data.result));
    }
  }, [data]);

  if (isLoading) return <p>Загрузка...</p>;
  if (error) return <p>Ошибка при загрузке данных</p>;

  return (
    <Table
      columns={columns}
      dataSource={tableData}
      pagination={false}
      rowKey="key"
    />
  );
}
