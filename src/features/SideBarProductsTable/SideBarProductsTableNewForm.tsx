import SideBarProductsTableForm, {
  type ProductFormValues,
} from "./components/SideBarProductsTableForm";
import { toast } from "react-toastify";

interface PropsNew {
  open: boolean;
  onCancel: () => void;
  addProduct: (values: ProductFormValues) => void;
}

const SideBarProductsTableNewForm: React.FC<PropsNew> = ({
  open,
  onCancel,
  addProduct,
}) => {
  const onSubmit = async (values: ProductFormValues) => {
    try {
      addProduct(values);
      onCancel();
      toast.success("продукт успешно создан.");
    } catch {
      toast.error("Произошла ошибка при создании продукта");
    }
  };
  return (
    <SideBarProductsTableForm
      open={open}
      onCancel={onCancel}
      onSubmit={onSubmit}
      initialValues={undefined}
    />
  );
};

export default SideBarProductsTableNewForm;
