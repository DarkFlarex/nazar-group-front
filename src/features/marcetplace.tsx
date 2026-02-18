import { useState, useEffect } from "react";
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

  // 📦 Загружаем все справочники один раз
  const { data: categories = [], refetch: refetchCategory } =
    useGetCategoriesQuery();
  const { data: subjects = [], refetch: refetchsubjects } = useGetSubjectsQuery(
    { parentID: formData.category }
  );
  const { data: colors = [], refetch: refetchcolors } = useGetColorsQuery();
  const { data: countries = [], refetch: refetchcountries } =
    useGetCountriesQuery();

  // состояния для каскада
  const [filteredSubjects, setFilteredSubjects] = useState<any>();

  const { data: chars = [] } = useGetCharsQuery(filteredSubjects, {
    skip: !filteredSubjects,
  });
  // Обновляем предметы при выборе категории
  const handleCategoryChange = (value: any) => {
    setFormData({ category: value });
  };

  // Обновляем характеристики при выборе предмета
  const handleSubjectChange = (subjectId: number) => {
    setFilteredSubjects(subjectId);
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
      const images = fileList.map((f) => f.originFileObj);

      const payload = [
        {
          subjectID: values.subjectId,
          variants: [
            {
              vendorCode: `SANDBOX-CARD-${Date.now()}`,
              title: "Тестовая карто3211чка",
              brand: "SandboxBrand",
              description: "Создано через локальный test сервер",
              characteristics: [
                { id: values.charId },
                { id: values.colorId },
                { id: values.countryId },
              ],
              dimensions: { length: 10, width: 10, height: 10 },
              weight: 0.3,
              sizes: [{ skus: [values.sku] }],
              images,
            },
          ],
        },
      ];

      const res = await fetch(
        "https://nazar-backend.333.kg/api/wb/content/cards/update",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
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

  useEffect(() => {
    const fetchDataSequentially = async () => {
      await refetchCategory?.();
      await new Promise((resolve) => setTimeout(resolve, 1000));

      await refetchsubjects?.();
      console.log("Subjects loaded");

      await new Promise((resolve) => setTimeout(resolve, 1000));

      await refetchcolors?.();
      console.log("Colors loaded");

      await new Promise((resolve) => setTimeout(resolve, 1000));

      await refetchcountries?.();
      console.log("Countries loaded");

      await new Promise((resolve) => setTimeout(resolve, 1000));
    };

    fetchDataSequentially();
  }, []);

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
          {fileList.length < 5 && "+ Upload"}
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

        <Form.Item name="charId" label="Характеристика">
          <Select placeholder="Выберите характеристику">
            {chars.map((c) => (
              <Option key={c.id} value={c.id}>
                {c.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="colorId" label="Цвет">
          <Select placeholder="Выберите цвет">
            {colors.map((c) => (
              <Option key={c.id} value={c.id}>
                {c.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="countryId"
          label="Страна"
          rules={[{ required: true, message: "Выберите страну" }]}
        >
          <Select placeholder="Выберите страну">
            {countries.map((c) => (
              <Option key={c.id} value={c.id}>
                {c.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Button
          type="primary"
          block
          loading={loading}
          style={{ borderRadius: 6 }}
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
