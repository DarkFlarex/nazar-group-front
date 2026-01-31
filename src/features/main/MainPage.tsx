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
import CardsPage from "../CardsPage.tsx";
import ExpensePage from "../ExpensePage.tsx";
import CardsPageOZ from "../CardsPageOzon.tsx";
import ReportsPage from "../ReportsPage .tsx";
import OrdersWBPage from "../orderWB.tsx";
import SupplierOrdersPage from "../SupplierOrdersPage.tsx";

const { Content } = Layout;

const MainPage = () => {
  const [selectedSection, setSelectedSection] = useState("customerOrdersPage");
  const [products, setProducts] = useState<Product[]>(mockProducts);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <SideBar selectedKey={selectedSection} onSelect={setSelectedSection} />

      <Layout>
        <Content style={{ padding: 5 }}>
          {selectedSection === "prihod" && <PrihodPage />}
          {selectedSection === "rashod" && <ExpensePage />}
          {selectedSection === "wildberis" && <MarketplaceForm />}
          {selectedSection === "cardsmerket" && <CardsPage />}
          {selectedSection === "ozonCards" && <CardsPageOZ />}
          {selectedSection === "ozon" && <MarketplaceForm />}
          {selectedSection === "customerOrdersPage" && <CustomerOrdersPage />}
          {selectedSection === "clients" && <SideBarClientsTable />}
          {selectedSection === "products" && (
            <SideBarProductsTable
              products={products}
              setProducts={setProducts}
            />
          )}
          {selectedSection === "reports" && <ReportsPage />}
          {selectedSection === "categories" && <CategoriesTable />}
          {selectedSection === "suppliers" && <SuppliersTable />}
          {selectedSection === "orderWB" && <OrdersWBPage />}
          {selectedSection === "orderSuplier" && <SupplierOrdersPage />}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainPage;
