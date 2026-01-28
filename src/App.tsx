import Layout from "./UI/Layout/Layout.tsx";
import {Route, Routes} from "react-router-dom";
import MainPage from "./features/main/MainPage.tsx";
import ProductsPage from "./features/SideBarProductsTable/ProductsPage.tsx";
import {useState} from "react";
import {mockProducts, type Product} from "./types/products.ts";

const App = () => {
    const [products] = useState<Product[]>(mockProducts);

  return (
      <Layout>
          <Routes>
              <Route  path={"/"} element={
                  <MainPage />
              }/>
              <Route
                  path="/products/:id"
                  element={<ProductsPage products={products} />}
              />
              <Route path="*" element={<span>Not found</span>} />
          </Routes>
      </Layout>
  )
}

export default App
