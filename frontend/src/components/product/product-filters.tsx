type ProductFiltersProps = {
  search: string;
  categoryId: number | null;
  categories: Array<{ categoryId: number; categoryName: string }>;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: number | null) => void;
};

export const ProductFilters = ({
  search,
  categoryId,
  categories,
  onSearchChange,
  onCategoryChange,
}: ProductFiltersProps) => (
  <div className="glass-panel grid gap-4 rounded-[28px] p-5 md:grid-cols-[1.6fr,1fr]">
    <input
      value={search}
      onChange={(event) => onSearchChange(event.target.value)}
      placeholder="Search products, collections, or specs"
      className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm outline-none ring-0 placeholder:text-slate-400 focus:border-brand-300"
    />
    <select
      value={categoryId ?? ""}
      onChange={(event) => onCategoryChange(event.target.value ? Number(event.target.value) : null)}
      className="form-select bg-white/80"
    >
      <option value="">All categories</option>
      {categories.map((category) => (
        <option key={category.categoryId} value={category.categoryId}>
          {category.categoryName}
        </option>
      ))}
    </select>
  </div>
);
