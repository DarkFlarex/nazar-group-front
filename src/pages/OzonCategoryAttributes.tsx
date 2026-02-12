import { Table, Tag } from "antd";
import { useEffect, useState } from "react";
import { useGetDescriptionCategoryAttributesMutation } from "../store/api/ozonCategoryApi";

interface Props {
  descriptionCategoryId: number;
  typeId: number;
}

export default function OzonCategoryAttributes({
  descriptionCategoryId,
  typeId = 125,
}: Props) {
  const [loadAttributes, { data, isLoading, error }] =
    useGetDescriptionCategoryAttributesMutation();

  const [tableData, setTableData] = useState<any[]>([]);

  useEffect(() => {
    loadAttributes({
      description_category_id: descriptionCategoryId,
      type_id: typeId,
      language: "RU",
    });
  }, [descriptionCategoryId, typeId]);

  useEffect(() => {
    if (data?.result) {
      setTableData(
        data.result.map((item: any) => ({
          key: item.id,
          ...item,
        }))
      );
    }
  }, [data]);

  const columns = [
    {
      title: "Название",
      dataIndex: "name",
    },
    {
      title: "Тип",
      dataIndex: "type",
    },
    {
      title: "Обязательная",
      dataIndex: "is_required",
      render: (v: boolean) => (v ? <Tag color="red">Да</Tag> : "Нет"),
    },
    {
      title: "Аспект",
      dataIndex: "is_aspect",
      render: (v: boolean) => (v ? <Tag color="orange">Да</Tag> : "Нет"),
    },
    {
      title: "Коллекция",
      dataIndex: "is_collection",
      render: (v: boolean) => (v ? <Tag color="blue">Да</Tag> : "Нет"),
    },
    {
      title: "Справочник",
      dataIndex: "dictionary_id",
      render: (id: number) =>
        id === 0 ? "Нет" : <Tag color="green">Есть</Tag>,
    },
    {
      title: "Группа",
      dataIndex: "group_name",
    },
  ];

  if (isLoading) return <p>Загрузка характеристик...</p>;
  if (error) return <p>Ошибка загрузки</p>;

  return (
    <Table
      columns={columns}
      dataSource={tableData}
      pagination={false}
      size="small"
    />
  );
}
