import { useParams } from "react-router-dom";
import {
  Card,
  Spin,
  Typography,
  Descriptions,
  Table,
  Input,
  Image,
  Divider,
  Tag,
} from "antd";
import { useGetProductAttributesQuery } from "../store/api/ozonProduct";

const { Title } = Typography;

const ProductAttributesPage = () => {
  const { type, value } = useParams();

  const queryParams: any = {};

  if (type === "sku") queryParams.sku = value;
  if (type === "product_id") queryParams.product_id = Number(value);
  if (type === "offer_id") queryParams.offer_id = value;

  const { data, isLoading } = useGetProductAttributesQuery(queryParams, {
    skip: !type || !value,
  });

  if (isLoading) return <Spin />;

  const product = data?.result?.[0];

  if (!product) return <div>Товар не найден</div>;

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 120,
    },
    {
      title: "Значение",
      render: (_: any, record: any) =>
        record.values.map((v: any, i: number) => (
          <Input key={i} defaultValue={v.value} style={{ marginBottom: 8 }} />
        )),
    },
  ];

  return (
    <Card>
      <Title level={4}>Характеристики товара</Title>

      {/* ---------- ОСНОВНАЯ ИНФОРМАЦИЯ ---------- */}
      <Descriptions bordered column={2} style={{ marginBottom: 20 }}>
        <Descriptions.Item label="Название">{product.name}</Descriptions.Item>
        <Descriptions.Item label="Offer ID">
          {product.offer_id}
        </Descriptions.Item>
        <Descriptions.Item label="Product ID">{product.id}</Descriptions.Item>
        <Descriptions.Item label="SKU">{product.sku}</Descriptions.Item>
      </Descriptions>

      {/* ---------- ИЗОБРАЖЕНИЯ ---------- */}
      {product.images?.length > 0 && (
        <>
          <Divider>Изображения</Divider>
          <Image.PreviewGroup>
            {product.images.map((img: string, index: number) => (
              <Image
                key={index}
                src={img}
                width={120}
                style={{ marginRight: 10, marginBottom: 10 }}
              />
            ))}
          </Image.PreviewGroup>
        </>
      )}

      {/* ---------- ВИДЕО ---------- */}
      {product.complex_attributes?.some((a: any) =>
        a.values?.some((v: any) => v.value?.includes(".mp4"))
      ) && (
        <>
          <Divider>Видео</Divider>
          {product.complex_attributes.map((attr: any) =>
            attr.values
              ?.filter((v: any) => v.value?.includes(".mp4"))
              .map((v: any, i: number) => (
                <video
                  key={i}
                  src={v.value}
                  controls
                  width="400"
                  style={{ marginBottom: 15 }}
                />
              ))
          )}
        </>
      )}

      {/* ---------- PDF ---------- */}
      {product.pdf_list?.length > 0 && (
        <>
          <Divider>PDF</Divider>
          {product.pdf_list.map((pdf: string, index: number) => (
            <div key={index}>
              <a href={pdf} target="_blank" rel="noopener noreferrer">
                PDF {index + 1}
              </a>
            </div>
          ))}
        </>
      )}

      {/* ---------- АТРИБУТЫ (редактируемые) ---------- */}
      <Divider>Атрибуты</Divider>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={product.attributes}
        pagination={false}
        scroll={{ y: 500 }}
      />

      {/* ---------- COMPLEX ATTRIBUTES (только просмотр) ---------- */}
      {product.complex_attributes?.length > 0 && (
        <>
          <Divider>Комплексные атрибуты</Divider>
          <Descriptions bordered column={1} size="small">
            {product.complex_attributes.map((attr: any) => (
              <Descriptions.Item
                key={`${attr.id}-${attr.complex_id}`}
                label={`ID: ${attr.id} | Complex: ${attr.complex_id}`}
              >
                {attr.values?.map((v: any, i: number) => (
                  <Tag color="blue" key={i}>
                    {v.value}
                  </Tag>
                ))}
              </Descriptions.Item>
            ))}
          </Descriptions>
        </>
      )}
    </Card>
  );
};

export default ProductAttributesPage;
