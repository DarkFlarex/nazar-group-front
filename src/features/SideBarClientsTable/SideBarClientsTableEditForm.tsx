import SideBarClientsTableForm, {
  type ClientFormValues,
} from "./components/SideBarClientsTableForm";
import { toast } from "react-toastify";

interface Props {
  open: boolean;
  onCancel: () => void;
  initialValues: ClientFormValues;
  updateClient: (values: ClientFormValues) => void;
}

const SideBarClientsTableEditForm: React.FC<Props> = ({
  open,
  onCancel,
  initialValues,
  updateClient,
}) => {
  const onSubmit = async (values: ClientFormValues) => {
    try {
      updateClient(values);
      onCancel();
      toast.success("Клиент успешно обновлен.");
    } catch {
      toast.error("Ошибка при обновлении клиента.");
    }
  };

  return (
    <SideBarClientsTableForm
      open={open}
      onCancel={onCancel}
      onSubmit={onSubmit}
      initialValues={initialValues}
    />
  );
};

export default SideBarClientsTableEditForm;
