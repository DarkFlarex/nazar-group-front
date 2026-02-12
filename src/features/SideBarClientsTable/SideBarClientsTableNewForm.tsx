import SideBarClientsTableForm, {
  type ClientFormValues,
} from "./components/SideBarClientsTableForm";
import { toast } from "react-toastify";

interface Props {
  open: boolean;
  onCancel: () => void;
  addClient: (values: ClientFormValues) => void;
}

const SideBarClientsTableNewForm: React.FC<Props> = ({
  open,
  onCancel,
  addClient,
}) => {
  const onSubmit = async (values: ClientFormValues) => {
    try {
      addClient(values);
      onCancel();
      toast.success("Клиент успешно добавлен.");
    } catch {
      toast.error("Ошибка при добавлении клиента.");
    }
  };

  return (
    <SideBarClientsTableForm
      open={open}
      onCancel={onCancel}
      onSubmit={onSubmit}
      initialValues={undefined}
    />
  );
};

export default SideBarClientsTableNewForm;
