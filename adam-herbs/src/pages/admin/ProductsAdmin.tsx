import { useState } from "react";
import {
  useListProducts,
  useListCategories,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  getListProductsQueryKey,
  type Product,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Edit2, Trash2, Search, Package, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

function ProductForm({
  initial,
  categories,
  onSave,
  saving,
}: {
  initial?: Partial<Product>;
  categories: Array<{ id: number; nameAr: string }>;
  onSave: (data: Record<string, unknown>) => void;
  saving: boolean;
}) {
  const [nameAr, setNameAr] = useState(initial?.nameAr ?? "");
  const [nameEn, setNameEn] = useState(initial?.nameEn ?? "");
  const [price, setPrice] = useState(String(initial?.price ?? ""));
  const [originalPrice, setOriginalPrice] = useState(String(initial?.originalPrice ?? ""));
  const [categoryId, setCategoryId] = useState(String(initial?.categoryId ?? ""));
  const [unit, setUnit] = useState(initial?.unit ?? "");
  const [inStock, setInStock] = useState(initial?.inStock ?? true);
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [descriptionAr, setDescriptionAr] = useState(initial?.descriptionAr ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [imagePreview, setImagePreview] = useState(initial?.imageUrl ?? "");

  const handleImageUrlChange = (url: string) => {
    setImageUrl(url);
    setImagePreview(url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameAr || !price) { toast.error("الاسم والسعر مطلوبان"); return; }
    onSave({
      nameAr, nameEn, price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : null,
      categoryId: categoryId ? parseInt(categoryId) : null,
      unit: unit || null, inStock, featured,
      descriptionAr: descriptionAr || null,
      imageUrl: imageUrl || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-2" dir="rtl">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">الاسم (عربي) *</label>
          <Input value={nameAr} onChange={e => setNameAr(e.target.value)} placeholder="اسم المنتج بالعربية" data-testid="input-product-name-ar" />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">الاسم (إنجليزي)</label>
          <Input value={nameEn} onChange={e => setNameEn(e.target.value)} placeholder="Product name in English" dir="ltr" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">السعر (ج.م) *</label>
          <Input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="0" dir="ltr" data-testid="input-product-price" />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">السعر قبل الخصم</label>
          <Input type="number" value={originalPrice} onChange={e => setOriginalPrice(e.target.value)} placeholder="0" dir="ltr" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">القسم</label>
          <select
            value={categoryId}
            onChange={e => setCategoryId(e.target.value)}
            className="w-full h-10 border border-border rounded-lg px-3 bg-background text-foreground text-sm"
            data-testid="select-product-category"
          >
            <option value="">-- اختر القسم --</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.nameAr}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">الوحدة</label>
          <Input value={unit} onChange={e => setUnit(e.target.value)} placeholder="كجم، غرام، لتر..." />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-foreground mb-1 block">وصف المنتج</label>
        <Input value={descriptionAr} onChange={e => setDescriptionAr(e.target.value)} placeholder="وصف مختصر للمنتج" />
      </div>

      {/* Image URL field */}
      <div>
        <label className="text-sm font-medium text-foreground mb-1 block flex items-center gap-1">
          <ImageIcon className="w-4 h-4" />
          رابط صورة المنتج
        </label>
        <Input
          value={imageUrl}
          onChange={e => handleImageUrlChange(e.target.value)}
          placeholder="https://example.com/image.jpg"
          dir="ltr"
          className="text-left"
        />
        {imagePreview && (
          <div className="mt-2 relative w-full h-32 rounded-xl overflow-hidden border border-border bg-muted">
            <img
              src={imagePreview}
              alt="معاينة الصورة"
              className="w-full h-full object-cover"
              onError={() => setImagePreview("")}
            />
          </div>
        )}
        {!imagePreview && (
          <p className="text-xs text-muted-foreground mt-1">أدخل رابط الصورة لمعاينتها</p>
        )}
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={inStock} onChange={e => setInStock(e.target.checked)} className="w-4 h-4 accent-primary" />
          <span className="text-sm font-medium">متاح في المخزون</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} className="w-4 h-4 accent-primary" />
          <span className="text-sm font-medium">مميز (يظهر في الرئيسية)</span>
        </label>
      </div>
      <Button type="submit" className="w-full font-bold" disabled={saving} data-testid="button-save-product">
        {saving ? "جاري الحفظ..." : "حفظ المنتج"}
      </Button>
    </form>
  );
}

export default function ProductsAdmin() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const { data: products, isLoading } = useListProducts({ search: search || undefined });
  const { data: categories } = useListCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });

  const handleCreate = (data: Record<string, unknown>) => {
    createProduct.mutate({ data } as Parameters<typeof createProduct.mutate>[0], {
      onSuccess: () => { toast.success("تم إضافة المنتج"); setAddOpen(false); invalidate(); },
      onError: () => toast.error("حدث خطأ أثناء الإضافة"),
    });
  };

  const handleUpdate = (data: Record<string, unknown>) => {
    if (!editProduct) return;
    updateProduct.mutate({ id: editProduct.id, data } as Parameters<typeof updateProduct.mutate>[0], {
      onSuccess: () => { toast.success("تم تحديث المنتج"); setEditOpen(false); invalidate(); },
      onError: () => toast.error("حدث خطأ أثناء التحديث"),
    });
  };

  const handleDelete = (id: number) => {
    deleteProduct.mutate({ id } as Parameters<typeof deleteProduct.mutate>[0], {
      onSuccess: () => { toast.success("تم حذف المنتج"); invalidate(); },
      onError: () => toast.error("حدث خطأ أثناء الحذف"),
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground">إدارة المنتجات</h1>
          <p className="text-muted-foreground mt-1">{products?.length ?? 0} منتج</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 font-bold" data-testid="button-add-product">
              <Plus className="w-4 h-4" /> إضافة منتج
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" dir="rtl">
            <DialogHeader>
              <DialogTitle>إضافة منتج جديد</DialogTitle>
            </DialogHeader>
            <ProductForm categories={categories ?? []} onSave={handleCreate} saving={createProduct.isPending} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="البحث في المنتجات..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pr-10 h-11"
          data-testid="input-search-products"
        />
      </div>

      {/* Products Table */}
      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
      ) : (
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-right px-4 py-3 font-semibold text-muted-foreground">المنتج</th>
                  <th className="text-right px-4 py-3 font-semibold text-muted-foreground">السعر</th>
                  <th className="text-right px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">القسم</th>
                  <th className="text-right px-4 py-3 font-semibold text-muted-foreground">الحالة</th>
                  <th className="text-right px-4 py-3 font-semibold text-muted-foreground">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {(products ?? []).map((p) => {
                  const cat = categories?.find(c => c.id === p.categoryId);
                  return (
                    <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors" data-testid={`product-row-${p.id}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-border bg-muted">
                            {p.imageUrl ? (
                              <img src={p.imageUrl} alt={p.nameAr} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-primary/10">
                                <Package className="w-4 h-4 text-primary" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{p.nameAr}</p>
                            <p className="text-xs text-muted-foreground">{p.nameEn}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-bold text-primary">{p.price} ج.م</td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{cat?.nameAr ?? "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
                          <Badge variant={p.inStock ? "default" : "secondary"} className="text-xs">{p.inStock ? "متاح" : "غير متاح"}</Badge>
                          {p.featured && <Badge variant="outline" className="text-xs border-secondary text-secondary">مميز</Badge>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Dialog open={editOpen && editProduct?.id === p.id} onOpenChange={(o) => { setEditOpen(o); if (!o) setEditProduct(null); }}>
                            <DialogTrigger asChild>
                              <Button size="icon" variant="ghost" className="w-8 h-8" onClick={() => setEditProduct(p)} data-testid={`button-edit-product-${p.id}`}>
                                <Edit2 className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" dir="rtl">
                              <DialogHeader>
                                <DialogTitle>تعديل المنتج</DialogTitle>
                              </DialogHeader>
                              {editProduct && <ProductForm initial={editProduct} categories={categories ?? []} onSave={handleUpdate} saving={updateProduct.isPending} />}
                            </DialogContent>
                          </Dialog>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="icon" variant="ghost" className="w-8 h-8 text-destructive hover:text-destructive" data-testid={`button-delete-product-${p.id}`}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent dir="rtl">
                              <AlertDialogHeader>
                                <AlertDialogTitle>حذف المنتج</AlertDialogTitle>
                                <AlertDialogDescription>هل أنت متأكد من حذف "{p.nameAr}"؟ لا يمكن التراجع.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(p.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">حذف</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {(products ?? []).length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">لا توجد منتجات</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
