import React, { useState } from "react";
import {
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Button,
  Table,
  Space,
  Popconfirm,
} from "antd";
import dayjs from "dayjs";

const { Option } = Select;

const initialData = [
  {
    key: "1",
    date: dayjs(),
    counterparty: "ООО Ромашка",
    expenseType: "Транспорт",
    amount: 1500,
    comment: "Такси до клиента",
  },
];

const ExpensePage = () => {
  const [form] = Form.useForm();
  const [dataSource, setDataSource] = useState(initialData);
  const [editingKey, setEditingKey] = useState("");

  const columns = [
    {
      title: "Дата",
      dataIndex: "date",
      key: "date",
      render: (date: any) => date.format("DD.MM.YYYY"),
    },
    {
      title: "Контрагент",
      dataIndex: "counterparty",
      key: "counterparty",
    },
    {
      title: "Статья расхода",
      dataIndex: "expenseType",
      key: "expenseType",
    },
    {
      title: "Сумма",
      dataIndex: "amount",
      key: "amount",
      render: (amount: any) => `${amount} ₽`,
    },
    {
      title: "Комментарий",
      dataIndex: "comment",
      key: "comment",
    },
    {
      title: "Действия",
      key: "action",
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" onClick={() => edit(record.key)}>
            Редактировать
          </Button>
          <Popconfirm
            title="Удалить расход?"
            onConfirm={() => remove(record.key)}
          >
            <Button type="link" danger>
              Удалить
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const addExpense = (values: any) => {
    const newRecord = {
      key: Date.now().toString(),
      date: values.date,
      counterparty: values.counterparty,
      expenseType: values.expenseType,
      amount: values.amount,
      comment: values.comment,
    };
    setDataSource([...dataSource, newRecord]);
    form.resetFields();
  };

  const remove = (key: any) => {
    setDataSource(dataSource.filter((item) => item.key !== key));
  };

  const edit = (key: any) => {
    const record: any = dataSource.find((item: any) => item.key === key);
    form.setFieldsValue({
      date: record.date,
      counterparty: record.counterparty,
      expenseType: record.expenseType,
      amount: record.amount,
      comment: record.comment,
    });
    setEditingKey(key);
  };

  const updateExpense = (values: any) => {
    setDataSource(
      dataSource.map((item) =>
        item.key === editingKey ? { ...item, ...values } : item
      )
    );
    setEditingKey("");
    form.resetFields();
  };

  const onFinish = (values: any) => {
    if (editingKey) {
      updateExpense(values);
    } else {
      addExpense(values);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Ввод расхода</h2>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ date: dayjs() }}
      >
        <Form.Item
          label="Дата"
          name="date"
          rules={[{ required: true, message: "Выберите дату" }]}
        >
          <DatePicker format="DD.MM.YYYY" style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Контрагент"
          name="counterparty"
          rules={[{ required: true, message: "Введите контрагента" }]}
        >
          <Input placeholder="Контрагент" />
        </Form.Item>

        <Form.Item
          label="Статья расхода"
          name="expenseType"
          rules={[{ required: true, message: "Выберите статью расхода" }]}
        >
          <Select placeholder="Выберите статью">
            <Option value="Транспорт">Транспорт</Option>
            <Option value="Офисные расходы">Офисные расходы</Option>
            <Option value="Закупки">Закупки</Option>
            <Option value="Прочее">Прочее</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Сумма"
          name="amount"
          rules={[{ required: true, message: "Введите сумму" }]}
        >
          <InputNumber
            min={0}
            style={{ width: "100%" }}
            formatter={(value) => `${value} ₽`}
            parser={(value: any) => value.replace(/\s?₽/g, "")}
          />
        </Form.Item>

        <Form.Item label="Комментарий" name="comment">
          <Input.TextArea rows={2} placeholder="Комментарий" />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              {editingKey ? "Сохранить изменения" : "Добавить расход"}
            </Button>
            {editingKey && (
              <Button
                onClick={() => {
                  setEditingKey("");
                  form.resetFields();
                }}
              >
                Отмена
              </Button>
            )}
          </Space>
        </Form.Item>
      </Form>

      <h2 style={{ marginTop: 40 }}>Список расходов</h2>
      <Table columns={columns} dataSource={dataSource} rowKey="key" />
    </div>
  );
};

export default ExpensePage;
