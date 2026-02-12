import { Layout } from "antd";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import SideBar from "../../UI/SideBar/SideBar";
import SideBarClientsTable from "../SideBarClientsTable/SideBarClientsTable";
import SideBarProductsTable from "../SideBarProductsTable/SideBarProductsTable";
import SuppliersTable from "../SuppliersTable/SuppliersTable";
import { mockProducts, type Product } from "../../types/products";
import CustomerOrdersPage from "../CustomerOrders/CustomerOrdersPage";
import PrihodPage from "../PrihodPage/PrihodPage";
import MarketplaceForm from "../marcetplace";
import ExpensePage from "../ExpensePage";
import CardsPageOZ from "../CardsPageOzon";
import ReportsPage from "../ReportsPage ";
import OrdersWBPage from "../orderWB";
import SupplierOrdersPage from "../SupplierOrdersPage";
import Category from "../Category";
import CategoriesPage from "../../pages/CategoriesPage";
import OzonProductForm from "../../pages/OzonProductForm";
import OzonProductImportStatus from "../../pages/OzonProductImportStatus";
import OzonProductList from "../../pages/OzonProductList";
import CardsListWB from "../../pages/wbCards";
import OzonOrders from "../../pages/OzonOrders";
import SupplyTable from "../../pages/SupplyTable";
import { useState } from "react";
import PostingsTable from "../../pages/PostingsTable";

const { Content } = Layout;

const MainPage = () => {
  const [products, setProducts] = useState<Product[]>(mockProducts);

  return (
    <Router>
      <Layout style={{ minHeight: "100vh" }}>
        <SideBar />

        <Layout>
          <Content style={{ padding: 5 }}>
            <Routes>
              <Route path="/invoices/prihod" element={<PrihodPage />} />
              <Route path="/invoices/rashod" element={<ExpensePage />} />
              <Route path="/market/wildberis" element={<MarketplaceForm />} />
              <Route path="/market/cardsmerket" element={<CardsListWB />} />
              <Route path="/market/ozonCards" element={<CardsPageOZ />} />
              <Route
                path="/invoices/customerOrdersPage"
                element={<CustomerOrdersPage />}
              />
              <Route
                path="/directories/clients"
                element={<SideBarClientsTable />}
              />
              <Route
                path="/market/OzonProductList"
                element={<OzonProductList />}
              />
              <Route
                path="/directories/products"
                element={
                  <SideBarProductsTable
                    products={products}
                    setProducts={setProducts}
                  />
                }
              />
              <Route path="/reports/main" element={<ReportsPage />} />
              <Route path="/directories/categories" element={<Category />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route
                path="/directories/suppliers"
                element={<SuppliersTable />}
              />
              <Route path="/orders/orderWB" element={<OrdersWBPage />} />
              <Route
                path="/market/OzonStatus"
                element={<OzonProductImportStatus />}
              />
              <Route path="/orders/orderWb" element={<OrdersWBPage />} />
              <Route path="/orders/OrderOzon" element={<OzonOrders />} />
              <Route
                path="/orders/orderSuplier"
                element={<SupplierOrdersPage />}
              />
              <Route
                path="/market/OzonProductForm"
                element={<OzonProductForm />}
              />
              <Route path="/supply/SupplyTable" element={<SupplyTable />} />
              <Route path="/supply/PostingsOzon" element={<PostingsTable />} />

              <Route
                path="*"
                element={<Navigate to="/invoices/customerOrdersPage" />}
              />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </Router>
  );
};

export default MainPage;
