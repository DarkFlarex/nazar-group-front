import SuppliersTableForm, {
    type SupplierFormValues,
} from "./components/SuppliersTableForm";
import { toast } from "react-toastify";

interface Props {
    open: boolean;
    onCancel: () => void;
    initialValues: SupplierFormValues;
    updateSupplier: (values: SupplierFormValues) => void;
}

const SuppliersTableEditForm: React.FC<Props> = ({
                                                     open,
                                                     onCancel,
                                                     initialValues,
                                                     updateSupplier,
                                                 }) => {
    const onSubmit = async (values: SupplierFormValues) => {
        try {
            updateSupplier(values);
            onCancel();
            toast.success("Поставщик успешно обновлен.");
        } catch {
            toast.error("Ошибка при обновлении поставщика.");
        }
    };

    return (
        <SuppliersTableForm
            open={open}
            onCancel={onCancel}
            onSubmit={onSubmit}
            initialValues={initialValues}
        />
    );
};

export default SuppliersTableEditForm;
