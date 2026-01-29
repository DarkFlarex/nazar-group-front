import { Layout } from "antd";
import { useState } from "react";
import SideBar from "../../UI/SideBar/SideBar";
import SideBarClientsTable from "../SideBarClientsTable/SideBarClientsTable";
import SideBarProductsTable from "../SideBarProductsTable/SideBarProductsTable";
import CategoriesTable from "../SideBarCategoriesTable/CategoriesTable.tsx";
import SuppliersTable from "../SuppliersTable/SuppliersTable.tsx";
import { mockProducts, type Product } from "../../types/products.ts";
import CustomerOrdersPage from "../CustomerOrders/CustomerOrdersPage.tsx";
import PrihodPage from "../PrihodPage/PrihodPage.tsx";
import MarketplaceForm from "../marcetplace.tsx";

const { Content } = Layout;

const MainPage = () => {
  const [selectedSection, setSelectedSection] = useState("customerOrdersPage");
  const [products, setProducts] = useState<Product[]>(mockProducts);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <SideBar selectedKey={selectedSection} onSelect={setSelectedSection} />

      <Layout>
        <Content style={{ padding: 5 }}>
          {selectedSection === "prihod" && <MarketplaceForm />}
          {selectedSection === "customerOrdersPage" && <CustomerOrdersPage />}
          {selectedSection === "clients" && <SideBarClientsTable />}
          {selectedSection === "products" && (
            <SideBarProductsTable
              products={products}
              setProducts={setProducts}
            />
          )}
          {selectedSection === "categories" && <CategoriesTable />}
          {selectedSection === "suppliers" && <SuppliersTable />}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainPage;
