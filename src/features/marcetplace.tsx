import { useState } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  message,
  Card,
  Typography,
  Upload,
} from "antd";
import type { UploadFile, UploadProps } from "antd";
import ImgCrop from "antd-img-crop";

import {
  useGetColorsQuery,
  useGetSubjectsQuery,
  useGetCategoriesQuery,
  useGetCountriesQuery,
  useGetCharsQuery,
} from "../store/api/wbDirectory";

const { Option } = Select;
const { Title } = Typography;

const MarketplaceForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [cardResponse, setCardResponse] = useState<any>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [formData, setFormData] = useState<any>({});
  const [charValues, setCharValues] = useState<Record<number, any>>({});

  // Справочники
  const { data: categories = [] } = useGetCategoriesQuery();
  const { data: subjects = [] } = useGetSubjectsQuery({
    parentID: formData.category,
  });
  const { data: colors = [] } = useGetColorsQuery();
  const { data: countries = [] } = useGetCountriesQuery();
  const { data: chars = [] } = useGetCharsQuery(formData.subjectId, {
    skip: !formData.subjectId,
  });

  const handleCategoryChange = (value: any) => {
    setFormData({ category: value, subjectId: null });
    setCharValues({});
    form.setFieldsValue({ subjectId: undefined });
  };

  const handleSubjectChange = (value: any) => {
    setFormData({ ...formData, subjectId: value });
    setCharValues({});
  };

  const handleCharValueChange = (charId: number, value: any) => {
    setCharValues((prev) => ({ ...prev, [charId]: value }));
  };

  const onUploadChange: UploadProps["onChange"] = ({
    fileList: newFileList,
  }) => {
    setFileList(newFileList);
  };

  const onUploadPreview = async (file: UploadFile) => {
    let src = file.url as string;
    if (!src && file.originFileObj) {
      src = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj as File);
        reader.onload = () => resolve(reader.result as string);
      });
    }
    const image = new Image();
    image.src = src!;
    const imgWindow = window.open(src);
    imgWindow?.document.write(image.outerHTML);
  };

  const handleCreateCard = async () => {
    const values = form.getFieldsValue();
    if (!values.sku) {
      message.error("Введите SKU!");
      return;
    }

    setLoading(true);
    setCardResponse(null);

    try {
      // Формируем характеристики
      const characteristics = Object.entries(charValues).map(([id, val]) => ({
        id: Number(id),
        value: Array.isArray(val) ? val : [val],
      }));

      // Размеры и вес
      const dimensions = {
        length: values.length || 0,
        width: values.width || 0,
        height: values.height || 0,
        weightBrutto: values.weight || 0,
      };

      // Размеры WB
      const sizes = [
        {
          techSize: values.techSize || "0",
          wbSize: values.wbSize || "",
          price: values.price || 0,
          skus: [values.sku],
        },
      ];

      // Payload для WB API
      const payload = [
        {
          subjectID: values.subjectId,
          variants: [
            {
              vendorCode: values.vendorCode || `SANDBOX-${Date.now()}`,
              title: values.title || "",
              description: values.description || "",
              brand: values.brand || "",
              dimensions,
              characteristics,
              sizes,
              images: fileList.map((f) => f.originFileObj),
              wholesale: {
                enabled: values.wholesaleEnabled || false,
                quantum: values.wholesaleQuantum || 0,
              },
            },
          ],
        },
      ];

      const res = await fetch(
        "https://nazar-backend.333.kg/api/wb/content/cards/upload",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify([
            {
              subjectID: 2874,
              variants: [
                {
                  vendorCode: "44444444444444444444",
                  title: "44444444444444444444",
                  description: "44444444444444444444",
                  brand: "44444444444444444444",
                  characteristics: [
                    { id: 51, value: ["44444444444444444444"] },
                    { id: 8606, value: ["44444444444444444444"] },
                    { id: 10924, value: ["44444444444444444444"] },
                    { id: 19717, value: ["1"] },
                    // остальные характеристики
                  ],
                  dimensions: {
                    length: 1,
                    width: 1,
                    height: 1,
                    weightBrutto: 1,
                  },
                  sizes: [
                    {
                      techSize: "1",
                      wbSize: "1",
                      price: 1,
                      skus: ["44444444444444444444"],
                    },
                  ],
                  images: ["https://example.com/image1.jpg"],
                  wholesale: { enabled: false, quantum: 0 },
                },
              ],
            },
          ]),
        }
      );

      const data = await res.json();
      setCardResponse(data);

      if (!data.error) message.success("Карточка успешно создана!");
      else message.error(data.errorText || "Ошибка при создании карточки");
    } catch (err) {
      console.error(err);
      message.error("Ошибка при создании карточки!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      style={{
        margin: "30px auto",
        borderRadius: 10,
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
      }}
    >
      <Title level={3} style={{ textAlign: "center", marginBottom: 20 }}>
        Создание карточки Wildberries
      </Title>

      <ImgCrop rotationSlider>
        <Upload
          action="https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload"
          listType="picture-card"
          fileList={fileList}
          onChange={onUploadChange}
          onPreview={onUploadPreview}
        >
          {fileList.length < 10 && "+ Upload"}
        </Upload>
      </ImgCrop>

      <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
        <Form.Item
          name="sku"
          label="SKU товара"
          rules={[{ required: true, message: "Введите SKU" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item name="vendorCode" label="Артикул продавца">
          <Input />
        </Form.Item>

        <Form.Item name="title" label="Название">
          <Input />
        </Form.Item>

        <Form.Item name="description" label="Описание">
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item name="brand" label="Бренд">
          <Input />
        </Form.Item>

        <Form.Item
          name="categoryId"
          label="Категория"
          rules={[{ required: true, message: "Выберите категорию" }]}
        >
          <Select
            placeholder="Выберите категорию"
            onChange={handleCategoryChange}
          >
            {categories.map((c) => (
              <Option key={c.id} value={c.id}>
                {c.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="subjectId"
          label="Предмет"
          rules={[{ required: true, message: "Выберите предмет" }]}
        >
          <Select onChange={handleSubjectChange}>
            {subjects.map((s: any) => (
              <Option key={s.subjectID} value={s.subjectID}>
                {s.subjectName}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Динамические характеристики */}
        {chars.map((char: any) => (
          <Form.Item
            key={char.charcID}
            label={`${char.name}${char.required ? " *" : ""}`}
            required={char.required}
          >
            <Input
              value={charValues[char.charcID] || ""}
              onChange={(e) =>
                handleCharValueChange(char.charcID, e.target.value)
              }
              placeholder={`Введите значение для "${char.name}"`}
            />
          </Form.Item>
        ))}

        <Form.Item name="length" label="Длина">
          <Input type="number" />
        </Form.Item>
        <Form.Item name="width" label="Ширина">
          <Input type="number" />
        </Form.Item>
        <Form.Item name="height" label="Высота">
          <Input type="number" />
        </Form.Item>
        <Form.Item name="weight" label="Вес">
          <Input type="number" />
        </Form.Item>

        <Form.Item name="techSize" label="Технический размер">
          <Input />
        </Form.Item>
        <Form.Item name="wbSize" label="Размер WB">
          <Input />
        </Form.Item>
        <Form.Item name="price" label="Цена">
          <Input type="number" />
        </Form.Item>

        <Form.Item name="wholesaleEnabled" label="Оптовая продажа">
          <Select>
            <Option value={true}>Да</Option>
            <Option value={false}>Нет</Option>
          </Select>
        </Form.Item>
        <Form.Item name="wholesaleQuantum" label="Количество для опта">
          <Input type="number" />
        </Form.Item>

        <Button
          type="primary"
          block
          loading={loading}
          onClick={handleCreateCard}
        >
          Создать карточку WB
        </Button>

        {cardResponse && (
          <pre
            style={{
              background: "#f0f0f0",
              padding: 10,
              borderRadius: 6,
              marginTop: 10,
            }}
          >
            {JSON.stringify(cardResponse, null, 2)}
          </pre>
        )}
      </Form>
    </Card>
  );
};

export default MarketplaceForm;
//9999999999999999
