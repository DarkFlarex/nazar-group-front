import SideBarProductsTableForm, {
  type ProductFormValues,
} from "./components/SideBarProductsTableForm";
import { toast } from "react-toastify";

interface PropsEdit {
  open: boolean;
  onCancel: () => void;
  initialValues: ProductFormValues;
  updateProduct: (values: ProductFormValues) => void;
}

const SideBarProductsTableEditForm: React.FC<PropsEdit> = ({
  open,
  onCancel,
  initialValues,
  updateProduct,
}) => {
  const onSubmit = async (values: ProductFormValues) => {
    try {
      updateProduct(values);
      onCancel();
      toast.success("продукт успешно обновлен.");
    } catch {
      toast.error("Произошла ошибка при обновлении продукта");
    }
  };

  return (
    <SideBarProductsTableForm
      open={open}
      onCancel={onCancel}
      onSubmit={onSubmit}
      initialValues={initialValues}
    />
  );
};

export default SideBarProductsTableEditForm;
