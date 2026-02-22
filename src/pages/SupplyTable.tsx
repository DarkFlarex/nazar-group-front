import React, { useState } from "react";
import { Table, Tag, Button, Space, Input, message, Spin, Modal } from "antd";
import { useNavigate } from "react-router-dom";
import {
  useGetWBSuppliesQuery,
  useCreateWBSupplyMutation,
  useDeleteWBSupplyMutation,
} from "../store/api/wbOrdersApi";

const { confirm } = Modal;

const SupplyTable: React.FC = () => {
  const navigate = useNavigate();
  const [supplyName, setSupplyName] = useState("");
  const { data, isLoading, refetch } = useGetWBSuppliesQuery({
    next: 165035659,
    limit: 1000,
  });
  const [createSupply, { isLoading: isCreating }] = useCreateWBSupplyMutation();
  const [deleteSupply] = useDeleteWBSupplyMutation();

  const handleAddOrder = (record: any) => {
    navigate("/orders/orderWb", { state: record });
  };

  const handleCreateSupply = async () => {
    if (!supplyName || supplyName.length > 128) {
      message.error("Название поставки обязательно и до 128 символов");
      return;
    }
    try {
      await createSupply({ name: supplyName }).unwrap();
      message.success("Поставка успешно создана");
      setSupplyName("");
      refetch();
    } catch (err: any) {
      message.error(
        `Ошибка создания поставки: ${err.data?.error || err.message}`
      );
    }
  };

  const handleDeleteSupply = (record: any) => {
    if (record.done) {
      message.warning("Невозможно удалить выполненную поставку");
      return;
    }

    confirm({
      title: "Удалить поставку?",
      content: `Вы уверены, что хотите удалить поставку "${record.name}"?`,
      okText: "Да",
      cancelText: "Отмена",
      onOk: async () => {
        try {
          await deleteSupply({ id: record.id }).unwrap();
          message.success("Поставка удалена");
          refetch();
        } catch (err: any) {
          message.error(`Ошибка удаления: ${err.data?.error || err.message}`);
        }
      },
    });
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Название", dataIndex: "name", key: "name" },
    {
      title: "Выполнено",
      dataIndex: "done",
      key: "done",
      render: (done: boolean) =>
        done ? <Tag color="green">Да</Tag> : <Tag color="red">Нет</Tag>,
    },
    {
      title: "Дата создания",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: "Дата закрытия",
      dataIndex: "closedAt",
      key: "closedAt",
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: "Дата сканирования",
      dataIndex: "scanDt",
      key: "scanDt",
      render: (date: string) => new Date(date).toLocaleString(),
    },
    { title: "Тип груза", dataIndex: "cargoType", key: "cargoType" },
    {
      title: "Тип пересечения границы",
      dataIndex: "crossBorderType",
      key: "crossBorderType",
    },
    {
      title: "ID офиса назначения",
      dataIndex: "destinationOfficeId",
      key: "destinationOfficeId",
    },
    {
      title: "Действия",
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          <Button type="primary" onClick={() => handleAddOrder(record)}>
            Добавить заказ
          </Button>
          <Button danger onClick={() => handleDeleteSupply(record)}>
            Удалить
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2>Список поставок</h2>

      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Название новой поставки"
          value={supplyName}
          onChange={(e) => setSupplyName(e.target.value)}
          maxLength={128}
        />
        <Button
          type="primary"
          onClick={handleCreateSupply}
          loading={isCreating}
        >
          Создать поставку
        </Button>
      </Space>

      {isLoading ? (
        <Spin />
      ) : (
        <Table
          dataSource={data?.supplies || []}
          columns={columns}
          rowKey="id"
        />
      )}
    </div>
  );
};

export default SupplyTable;
