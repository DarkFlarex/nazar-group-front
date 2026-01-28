import SuppliersTableForm, {
    type SupplierFormValues,
} from "./components/SuppliersTableForm";
import { toast } from "react-toastify";

interface Props {
    open: boolean;
    onCancel: () => void;
    addSupplier: (values: SupplierFormValues) => void;
}

const SuppliersTableNewForm: React.FC<Props> = ({
                                                    open,
                                                    onCancel,
                                                    addSupplier,
                                                }) => {
    const onSubmit = async (values: SupplierFormValues) => {
        try {
            addSupplier(values);
            onCancel();
            toast.success("Поставщик успешно добавлен.");
        } catch {
            toast.error("Ошибка при добавлении поставщика.");
        }
    };

    return (
        <SuppliersTableForm
            open={open}
            onCancel={onCancel}
            onSubmit={onSubmit}
            initialValues={undefined}
        />
    );
};

export default SuppliersTableNewForm;
