import CategoriesTableForm, {
    type CategoryFormValues,
} from "./components/CategoriesTableForm";
import { toast } from "react-toastify";

interface Props {
    open: boolean;
    onCancel: () => void;
    addCategory: (values: CategoryFormValues) => void;
}

const CategoriesTableNewForm: React.FC<Props> = ({
                                                     open,
                                                     onCancel,
                                                     addCategory,
                                                 }) => {
    const onSubmit = async (values: CategoryFormValues) => {
        try {
            addCategory(values);
            onCancel();
            toast.success("Категория успешно добавлена.");
        } catch {
            toast.error("Ошибка при добавлении категории.");
        }
    };

    return (
        <CategoriesTableForm
            open={open}
            onCancel={onCancel}
            onSubmit={onSubmit}
            initialValues={undefined}
        />
    );
};

export default CategoriesTableNewForm;
