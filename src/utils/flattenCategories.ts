// utils/mapOzonTreeToTable.js
export const mapOzonTreeToTable = (categories: any) => {
  return categories.map((cat: any) => ({
    key: cat.description_category_id,
    name: cat.category_name,
    type: "Категория",
    disabled: cat.disabled,
    children: cat.children?.map((child: any) => ({
      key: child.description_category_id || child.type_id,
      name: child.category_name || child.type_name,
      type: child.category_name ? "Подкатегория" : "Тип",
      disabled: child.disabled,
      children: child.children?.map((child_type: any) => ({
        key: child_type.description_category_id || child_type.type_id,
        name: child_type.category_name || child_type.type_name,
        type: child_type.type_name ?? "Тип",
        disabled: child_type.disabled,
        children: null,
      })),
    })),
  }));
};
