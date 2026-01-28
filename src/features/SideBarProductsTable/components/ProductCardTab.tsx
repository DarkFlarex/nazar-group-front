import React, {type ChangeEvent, useEffect, useRef, useState} from "react";
import {
    Descriptions,
    Image,
    Row,
    Col,
    Typography,
    Input, Button,
} from "antd";
import Checkbox from "antd/es/checkbox/Checkbox";
import type { Product } from "../../../types/products.ts";
import productImage from "../../../assets/images/700-nw.jpg";

const { Text } = Typography;

interface Props {
    product: Product;
}

const ProductCardTab = ({ product }: Props) => {

    const [editableProduct, setEditableProduct] = useState<Product>({ ...product });

    const [manufacturerNumber, setManufacturerNumber] = useState("723827301");
    const [originalNumber, setOriginalNumber] = useState("9065000102MT");
    const [ozon, setOzon] = useState("Нет");
    const [wildberries, setWildberries] = useState("Нет");
    const [avito906, setAvito906] = useState("Нет");
    const [avito901, setAvito901] = useState("Нет");
    const [yandexMarket, setYandexMarket] = useState("Нет");
    const [photo, setPhoto] = useState("Нет");
    const [video, setVideo] = useState("Нет");
    const [dimensions, setDimensions] = useState("Значение не задано");
    const [weight, setWeight] = useState("Значение не задано");
    const [manufacturerNumber2, setManufacturerNumber2] = useState("723927301");
    const [dimensions2, setDimensions2] = useState("Значение не задано");
    const [weight2, setWeight2] = useState("Значение не задано");

    const [producerImporter, setProducerImporter] = useState("Не указан");
    const [producerBrand, setProducerBrand] = useState("FREY");
    const [brand, setBrand] = useState("Не указан");
    const [countryOrigin, setCountryOrigin] = useState("Китай");

    const [listGroup, setListGroup] = useState("Не указана");
    const [nomenclatureType, setNomenclatureType] = useState("Автозапчасти");
    const [nomenclatureKind, setNomenclatureKind] = useState("Товар");
    const [vatRate, setVatRate] = useState("Без НДС");

    const [packageUse, setPackageUse] = useState("Не используется");
    const [storageUnit, setStorageUnit] = useState("шт");
    const [weightMeas, setWeightMeas] = useState("Не измеряется");
    const [volume, setVolume] = useState("Не измеряется");
    const [length, setLength] = useState("Не измеряется");
    const [area, setArea] = useState("Не измеряется");
    const [someField, setSomeField] = useState("Не указан");
    const [isExciseProduct, setIsExciseProduct] = useState(false);

    const [kvpdCode, setKvpdCode] = useState("Не указан");


    const onChangeField = (field: keyof Product) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditableProduct(prev => ({
            ...prev,
            [field]: e.target.value,
        }));
    };

    const [images, setImages] = useState<string[]>(() => {
        const imgs = [productImage];
        if (product.imageUrl && product.imageUrl !== productImage) {
            imgs.push(product.imageUrl);
        }

        return imgs.filter((_, index) => index !== 1);
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const onTitleClick = () => {
        fileInputRef.current?.click();
    };

    const onFilesChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const filesArray = Array.from(e.target.files);

        filesArray.forEach(file => {
            const reader = new FileReader();
            reader.onload = () => {
                if (reader.result && typeof reader.result === "string") {
                    setImages(prev => [...prev, reader.result as string]);
                }
            };
            reader.readAsDataURL(file);
        });

        e.target.value = "";
    };

    useEffect(() => {
        setEditableProduct(prev => ({
            ...prev,
            imageUrl: images.length > 0 ? images[0] : undefined,
        }));
    }, [images]);

    const [currentIndex, setCurrentIndex] = useState(0);

    const prevImage = () => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const nextImage = () => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    return (
        <Row gutter={24}>
            {/* Левая колонка — описание */}
            <Col span={7}>
                <Descriptions bordered column={1}>
                    <Descriptions.Item label="Рабочее наименование:">
                        <Input
                            value={editableProduct.name}
                            onChange={onChangeField("name")}
                        />
                    </Descriptions.Item>
                    <Descriptions.Item label="Наименование для печати:">
                        <Input
                            value={editableProduct.name}
                            onChange={onChangeField("name")}
                        />
                    </Descriptions.Item>
                    <Descriptions.Item label="Артикул:">
                        <Input
                            value={editableProduct.sku || ""}
                            onChange={onChangeField("sku")}
                        />
                    </Descriptions.Item>
                    <Descriptions.Item label="Код:">
                        <Input
                            value={editableProduct.code}
                            onChange={onChangeField("code")}
                        />
                    </Descriptions.Item>
                </Descriptions>

                <Typography.Title level={5} className="section-title">
                    Описание
                </Typography.Title>
                {/* Карусель картинок — показываем одну картинку и кнопки */}
                <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
                    <Button
                        onClick={prevImage}
                        disabled={images.length === 0}
                        style={{ marginRight: 8 }}
                    >
                        &#8592;
                    </Button>

                    {images.length > 0 ? (
                        <Image
                            src={images[currentIndex]}
                            alt={`uploaded-${currentIndex}`}
                            width={400}
                            height={400}
                            style={{ objectFit: "contain", borderRadius: 6 }}
                            preview={false}
                        />
                    ) : (
                        <p>Нет изображения</p>
                    )}

                    <Button
                        onClick={nextImage}
                        disabled={images.length === 0}
                        style={{ marginLeft: 8 }}
                    >
                        &#8594;
                    </Button>
                </div>
                <Descriptions bordered column={1}>
                    <Descriptions.Item label="Текстовое описание:">
                        <Input
                            value={editableProduct.code}
                            onChange={onChangeField("code")}
                        />
                    </Descriptions.Item>
                    <Descriptions.Item label="Файл для описание сайта:">
                        <Input
                            value={someField}
                            onChange={e => setSomeField(e.target.value)}
                        />
                    </Descriptions.Item>
                </Descriptions>

                <Typography.Title
                    style={{width: "25%", color: '#1890ff', cursor: 'pointer', fontWeight: 500}}
                    level={5}
                    onClick={onTitleClick}
                >
                    Файл ({images.length})
                </Typography.Title>
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    style={{display: "none"}}
                    ref={fileInputRef}
                    onChange={onFilesChange}
                />
                <Typography.Title level={5} className="section-title">
                    Дополнительные реквезиты
                </Typography.Title>
                <Descriptions bordered column={1}>
                    <Descriptions.Item label="Номер производителя:">
                        <Input value={manufacturerNumber} onChange={e => setManufacturerNumber(e.target.value)}/>
                    </Descriptions.Item>
                    <Descriptions.Item label="Номер оригинала:">
                        <Input value={originalNumber} onChange={e => setOriginalNumber(e.target.value)}/>
                    </Descriptions.Item>
                    <Descriptions.Item label="OZON:">
                        <Input value={ozon} onChange={e => setOzon(e.target.value)}/>
                    </Descriptions.Item>
                    <Descriptions.Item label="Wildberries:">
                        <Input value={wildberries} onChange={e => setWildberries(e.target.value)}/>
                    </Descriptions.Item>
                    <Descriptions.Item label="Авито 906:">
                        <Input value={avito906} onChange={e => setAvito906(e.target.value)}/>
                    </Descriptions.Item>
                    <Descriptions.Item label="Авито 901:">
                        <Input value={avito901} onChange={e => setAvito901(e.target.value)}/>
                    </Descriptions.Item>
                    <Descriptions.Item label="Яндекс Маркет:">
                        <Input value={yandexMarket} onChange={e => setYandexMarket(e.target.value)}/>
                    </Descriptions.Item>
                    <Descriptions.Item label="Фото:">
                        <Input value={photo} onChange={e => setPhoto(e.target.value)}/>
                    </Descriptions.Item>
                    <Descriptions.Item label="Видео:">
                        <Input value={video} onChange={e => setVideo(e.target.value)}/>
                    </Descriptions.Item>
                    <Descriptions.Item label="Габариты:">
                        <Input value={dimensions} onChange={e => setDimensions(e.target.value)}/>
                    </Descriptions.Item>
                    <Descriptions.Item label="Вес:">
                        <Input value={weight} onChange={e => setWeight(e.target.value)}/>
                    </Descriptions.Item>
                    <Descriptions.Item label="Номер производителя:">
                        <Input value={manufacturerNumber2} onChange={e => setManufacturerNumber2(e.target.value)}/>
                    </Descriptions.Item>
                    <Descriptions.Item label="Габариты:">
                        <Input value={dimensions2} onChange={e => setDimensions2(e.target.value)}/>
                    </Descriptions.Item>
                    <Descriptions.Item label="Вес:">
                        <Input value={weight2} onChange={e => setWeight2(e.target.value)}/>
                    </Descriptions.Item>
                </Descriptions>

                <Typography.Title level={5} className="section-title">
                    Сведения о производителе
                </Typography.Title>
                <Descriptions bordered column={1}>
                    <Descriptions.Item label="Производитель, импортер (контрагент):">
                        <Input value={producerImporter} onChange={e => setProducerImporter(e.target.value)}/>
                    </Descriptions.Item>
                    <Descriptions.Item label="Производитель(бренд):">
                        <Input value={producerBrand} onChange={e => setProducerBrand(e.target.value)}/>
                    </Descriptions.Item>
                    <Descriptions.Item label="Марка (бренд):">
                        <Input value={brand} onChange={e => setBrand(e.target.value)}/>
                    </Descriptions.Item>
                    <Descriptions.Item label="Страна происхождения:">
                        <Input value={countryOrigin} onChange={e => setCountryOrigin(e.target.value)}/>
                    </Descriptions.Item>
                </Descriptions>
            </Col>

            {/* Правая колонка — штрихкоды и параметры */}
            <Col span={6}>
                <Text strong style={{color: '#1890ff', cursor: 'pointer', display: 'block', marginBottom: 8}}>
                    Номенклатура с аналогичными свойствами
                </Text>

                <Text strong style={{color: '#1890ff', cursor: 'pointer', display: 'block', marginBottom: 8}}>
                    ШтрихКоды (1)
                </Text>

                <Typography.Title level={5} className="section-title">
                    Основные параметры учета
                </Typography.Title>
                <Descriptions bordered column={1}>
                    <Descriptions.Item label="Группа списка:">
                        <Input value={listGroup} onChange={e => setListGroup(e.target.value)}/>
                    </Descriptions.Item>
                    <Descriptions.Item label="Вид номенклатуры:">
                        <Input value={nomenclatureType} onChange={e => setNomenclatureType(e.target.value)}/>
                    </Descriptions.Item>
                    <Descriptions.Item label="Тип номенклатуры:">
                        <Input value={nomenclatureKind} onChange={e => setNomenclatureKind(e.target.value)}/>
                    </Descriptions.Item>
                    <Descriptions.Item label="Ставка НДС:">
                    <Input value={vatRate} onChange={e => setVatRate(e.target.value)}/>
                    </Descriptions.Item>
                </Descriptions>

                <Typography.Title style={{color: '#1890ff', cursor: 'pointer', fontWeight: 500}} level={5}>
                    Все ставки (1)
                </Typography.Title>

                <Typography.Title level={5} className="section-title">
                    Единица измерения и условия хранения
                </Typography.Title>
                <Descriptions bordered column={1}>
                    <Descriptions.Item label="Упаковки:">
                        <Input value={packageUse} onChange={e => setPackageUse(e.target.value)}/>
                    </Descriptions.Item>
                    <Descriptions.Item label="Единица хранения">
                        <Input value={storageUnit} onChange={e => setStorageUnit(e.target.value)}/>
                    </Descriptions.Item>
                    <Descriptions.Item label="Вес">
                        <Input value={weightMeas} onChange={e => setWeightMeas(e.target.value)} />
                    </Descriptions.Item>
                    <Descriptions.Item label="Объем">
                        <Input value={volume} onChange={e => setVolume(e.target.value)} />
                    </Descriptions.Item>
                    <Descriptions.Item label="Длина">
                        <Input value={length} onChange={e => setLength(e.target.value)} />
                    </Descriptions.Item>
                    <Descriptions.Item label="Площадь">
                        <Input value={area} onChange={e => setArea(e.target.value)} />
                    </Descriptions.Item>
                </Descriptions>

                <Typography.Title style={{ color: '#1890ff', cursor: 'pointer', fontWeight: 500 }} level={5}>
                    Размещение номенклатуры по ячейкам (справочно)
                </Typography.Title>

                <Typography.Title level={5} className="section-title">
                    Регламентированный учет
                </Typography.Title>
                <Descriptions bordered column={1}>
                    <Descriptions.Item label="Подакцизный товар:">
                        <Checkbox checked={isExciseProduct} onChange={e => setIsExciseProduct(e.target.checked)} />
                    </Descriptions.Item>
                </Descriptions>

                <Typography.Title level={5} className="section-title">
                    Общероссийские классификаторы
                </Typography.Title>
                <Descriptions bordered column={1}>
                    <Descriptions.Item label="Код по КВПД:">
                        <Input value={kvpdCode} onChange={e => setKvpdCode(e.target.value)} />
                    </Descriptions.Item>
                </Descriptions>
            </Col>
        </Row>
    );
};

export default ProductCardTab;
