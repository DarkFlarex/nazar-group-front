import { Layout, ConfigProvider, Typography } from "antd";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {
  ShopOutlined,
  AppstoreOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";

import SideBar from "../../UI/SideBar/SideBar";

import SideBarClientsTable from "../SideBarClientsTable/SideBarClientsTable";
import SideBarProductsTable from "../SideBarProductsTable/SideBarProductsTable";
import SuppliersTable from "../SuppliersTable/SuppliersTable";
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
import PostingsTable from "../../pages/PostingsTable";
import StocksQoanPage from "../../pages/OzonStockQuan";
import WbOrdersPage from "../../pages/WBOrderPage";
import InvoiceIncomeTable from "../../pages/InvoiceIncomeTable";
import ProductAttributesEditor from "../../pages/ProductAttributesEditor";
import TaskStatusComponent from "../../pages/TaskStatusComponent";
import RashodPage from "../../pages/Rashod";
import ReturnsPage from "../../pages/OzonReturnsPage";
import WbClaimsPage from "../../pages/WbClaimsPage";

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

const MainPage = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1677ff",
          borderRadius: 8,
        },
      }}
    >
      <Router>
        <Layout style={{ height: "100vh", overflow: "hidden" }}>
          <SideBar />

          <Layout
            style={{
              height: "100vh",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* HEADER */}
            <Header
              style={{
                background: "#fff",
                padding: "0 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                zIndex: 10,
                flexShrink: 0,
              }}
            >
              <Title level={4} style={{ margin: 0 }}>
                📦 Warehouse System
              </Title>

              <div style={{ display: "flex", gap: 20 }}>
                <ShopOutlined style={{ fontSize: 20 }} />
                <ShoppingCartOutlined style={{ fontSize: 20 }} />
                <AppstoreOutlined style={{ fontSize: 20 }} />
              </div>
            </Header>

            {/* CONTENT */}
            <Content
              style={{
                flex: 1,
                minHeight: 0,
                padding: "20px",
                background: "#f5f6fa",
                overflowY: "auto",
                overflowX: "hidden",
              }}
            >
              <Routes>
                <Route path="/invoices/prihod" element={<PrihodPage />} />
                <Route path="/invoices/rashod" element={<RashodPage />} />
                <Route
                  path="/invoices/see/income"
                  element={<InvoiceIncomeTable />}
                />

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
                  element={<SideBarProductsTable />}
                />

                <Route path="/reports/main" element={<ReportsPage />} />
                <Route path="/directories/categories" element={<Category />} />
                <Route path="/categories" element={<CategoriesPage />} />

                <Route
                  path="/directories/suppliers"
                  element={<SuppliersTable />}
                />

                <Route path="/orders/orderWB" element={<WbOrdersPage />} />

                <Route
                  path="/market/OzonStatus"
                  element={<OzonProductImportStatus />}
                />

                <Route
                  path="/market/StocksQoanPage"
                  element={<StocksQoanPage />}
                />

                <Route path="/orders/orderWb" element={<OrdersWBPage />} />
                <Route path="/orders/OrderOzon" element={<OzonOrders />} />

                <Route
                  path="/orders/tasksOzon"
                  element={<TaskStatusComponent />}
                />

                <Route path="/orders/return" element={<ReturnsPage />} />
                <Route path="/orders/claims" element={<WbClaimsPage />} />

                <Route
                  path="/orders/orderSuplier"
                  element={<SupplierOrdersPage />}
                />

                <Route
                  path="/market/OzonProductForm"
                  element={<OzonProductForm />}
                />

                <Route path="/supply/SupplyTable" element={<SupplyTable />} />

                <Route
                  path="/supply/PostingsOzon"
                  element={<PostingsTable />}
                />

                <Route
                  path="/product/:type/:value"
                  element={<ProductAttributesEditor />}
                />

                <Route path="/invoices/rashodlist" element={<ExpensePage />} />
              </Routes>
            </Content>

            {/* FOOTER */}
            <Footer
              style={{
                textAlign: "center",
                background: "#fff",
                borderTop: "1px solid #eee",
                flexShrink: 0,
              }}
            >
              Warehouse System ©2026 | Powered by React + Ant Design
            </Footer>
          </Layout>
        </Layout>
      </Router>
    </ConfigProvider>
  );
};

export default MainPage;
