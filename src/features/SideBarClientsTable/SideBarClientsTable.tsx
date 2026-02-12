import { Button, Popconfirm, Table } from "antd";
import { useState } from "react";
import SideBarClientsTableNewForm from "./SideBarClientsTableNewForm";
import SideBarClientsTableEditForm from "./SideBarClientsTableEditForm";
import type { ClientFormValues } from "./components/SideBarClientsTableForm";

interface Client extends ClientFormValues {
  key: string;
  code?: string;
}

const initialData: Client[] = [
  {
    key: "1",
    code: "CL001",
    lastName: "Иванов",
    firstName: "Иван",
    country: "Кыргызстан",
    city: "Бишкек",
    region: "Чуйская область",
    postalCode: "720001",
    contacts: "+996 700 000 000",
    discount: 10,
    points: 250,
  },
  {
    key: "2",
    code: "CL001",
    lastName: "Иванов",
    firstName: "Иван",
    country: "Кыргызстан",
    city: "Бишкек",
    region: "Чуйская область",
    postalCode: "720001",
    contacts: "+996 700 000 000",
    discount: 10,
    points: 250,
  },
  {
    key: "3",
    code: "CL001",
    lastName: "Иванов",
    firstName: "Иван",
    country: "Кыргызстан",
    city: "Бишкек",
    region: "Чуйская область",
    postalCode: "720001",
    contacts: "+996 700 000 000",
    discount: 10,
    points: 250,
  },
];

const columns = (
  onEdit: (record: Client) => void,
  onDelete: (key: string) => void
) => [
  { title: "Код", dataIndex: "code" },
  { title: "Фамилия", dataIndex: "lastName" },
  { title: "Имя", dataIndex: "firstName" },
  { title: "Страна", dataIndex: "country" },
  { title: "Город", dataIndex: "city" },
  { title: "Регион", dataIndex: "region" },
  { title: "Почтовый индекс", dataIndex: "postalCode" },
  { title: "Контакты", dataIndex: "contacts" },
  {
    title: "Скидка %",
    dataIndex: "discount",
    render: (v: number) => `${v}%`,
  },
  { title: "Баллы", dataIndex: "points" },
  {
    title: "Действия",
    key: "action",
    render: (_value: unknown, record: Client) => (
      <>
        <Button type="link" onClick={() => onEdit(record)}>
          Редактировать
        </Button>
        <Popconfirm
          title="Удалить клиента?"
          onConfirm={() => onDelete(record.key)}
        >
          <Button type="link" danger>
            Удалить
          </Button>
        </Popconfirm>
      </>
    ),
  },
];

const generateClientCode = (index: number) => {
  return `PR-${String(index).padStart(4, "0")}`;
};
const SideBarClientsTable = () => {
  const [dataSource, setDataSource] = useState<Client[]>(initialData);
  const [openNew, setOpenNew] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const handleAdd = () => {
    setOpenNew(true);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setOpenEdit(true);
  };

  const handleDelete = (key: string) => {
    setDataSource((prev) => prev.filter((client) => client.key !== key));
  };

  const handleNewSubmit = (values: ClientFormValues) => {
    setDataSource((prev) => {
      const newClient: Client = {
        key: Date.now().toString(),
        code: generateClientCode(prev.length + 1),
        ...values,
      };
      return [...prev, newClient];
    });
    setOpenNew(false);
  };

  const handleEditSubmit = (values: ClientFormValues) => {
    if (!editingClient) return;
    setDataSource((prev) =>
      prev.map((client) =>
        client.key === editingClient.key ? { ...client, ...values } : client
      )
    );
    setOpenEdit(false);
    setEditingClient(null);
  };

  return (
    <>
      <Button type="primary" onClick={handleAdd} style={{ marginBottom: 16 }}>
        Добавить клиента
      </Button>

      <Table
        dataSource={dataSource}
        columns={columns(handleEdit, handleDelete)}
        rowKey="key"
        pagination={{ pageSize: 100 }}
        bordered
      />

      {/* Добавление */}
      <SideBarClientsTableNewForm
        open={openNew}
        onCancel={() => setOpenNew(false)}
        addClient={handleNewSubmit}
      />

      {/* Редактирование */}
      {editingClient && (
        <SideBarClientsTableEditForm
          open={openEdit}
          onCancel={() => {
            setOpenEdit(false);
            setEditingClient(null);
          }}
          updateClient={handleEditSubmit}
          initialValues={editingClient}
        />
      )}
    </>
  );
};

export default SideBarClientsTable;
