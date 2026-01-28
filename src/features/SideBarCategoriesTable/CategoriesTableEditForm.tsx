import CategoriesTableForm, {
    type CategoryFormValues,
} from "./components/CategoriesTableForm";
import { toast } from "react-toastify";

interface Props {
    open: boolean;
    onCancel: () => void;
    initialValues: CategoryFormValues;
    updateCategory: (values: CategoryFormValues) => void;
}

const CategoriesTableEditForm: React.FC<Props> = ({
                                                      open,
                                                      onCancel,
                                                      initialValues,
                                                      updateCategory,
                                                  }) => {
    const onSubmit = async (values: CategoryFormValues) => {
        try {
            updateCategory(values);
            onCancel();
            toast.success("Категория успешно обновлена.");
        } catch {
            toast.error("Ошибка при обновлении категории.");
        }
    };

    return (
        <CategoriesTableForm
            open={open}
            onCancel={onCancel}
            onSubmit={onSubmit}
            initialValues={initialValues}
        />
    );
};

export default CategoriesTableEditForm;
