import { useState } from "react";
import {
  useListCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  getListCategoriesQueryKey,
  type Category,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Edit2, Trash2, Tags, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

function CategoryForm({
  initial,
  onSave,
  saving,
}: {
  initial?: Partial<Category>;
  onSave: (data: Record<string, unknown>) => void;
  saving: boolean;
}) {
  const [nameAr, setNameAr] = useState(initial?.nameAr ?? "");
  const [nameEn, setNameEn] = useState(initial?.nameEn ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [icon, setIcon] = useState(initial?.icon ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [imagePreview, setImagePreview] = useState(initial?.imageUrl ?? "");

  const handleImageUrlChange = (url: string) => {
    setImageUrl(url);
    setImagePreview(url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameAr || !nameEn || !slug) { toast.error("جميع الحقول الأساسية مطلوبة"); return; }
    onSave({ nameAr, nameEn, slug, icon: icon || null, imageUrl: imageUrl || null });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-2" dir="rtl">
      <div>
        <label className="text-sm font-medium mb-1 block">الاسم (عربي) *</label>
        <Input value={nameAr} onChange={e => setNameAr(e.target.value)} placeholder="مثال: توابل" data-testid="input-category-name-ar" />
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">الاسم (إنجليزي) *</label>
        <Input value={nameEn} onChange={e => setNameEn(e.target.value)} placeholder="Spices" dir="ltr" data-testid="input-category-name-en" />
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">المعرف (slug) *</label>
        <Input value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))} placeholder="spices" dir="ltr" data-testid="input-category-slug" />
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">الأيقونة (رمز تعبيري)</label>
        <Input value={icon} onChange={e => setIcon(e.target.value)} placeholder="🌶" className="text-xl" />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground mb-1 block flex items-center gap-1">
          <ImageIcon className="w-4 h-4" />
          رابط صورة القسم
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
      <Button type="submit" className="w-full font-bold" disabled={saving} data-testid="button-save-category">
        {saving ? "جاري الحفظ..." : "حفظ القسم"}
      </Button>
    </form>
  );
}

export default function CategoriesAdmin() {
  const queryClient = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const { data: categories, isLoading } = useListCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });

  const handleCreate = (data: Record<string, unknown>) => {
    createCategory.mutate({ data } as Parameters<typeof createCategory.mutate>[0], {
      onSuccess: () => { toast.success("تم إضافة القسم"); setAddOpen(false); invalidate(); },
      onError: () => toast.error("حدث خطأ أثناء الإضافة"),
    });
  };

  const handleUpdate = (data: Record<string, unknown>) => {
    if (!editCat) return;
    updateCategory.mutate({ id: editCat.id, data } as Parameters<typeof updateCategory.mutate>[0], {
      onSuccess: () => { toast.success("تم تحديث القسم"); setEditOpen(false); invalidate(); },
      onError: () => toast.error("حدث خطأ أثناء التحديث"),
    });
  };

  const handleDelete = (id: number) => {
    deleteCategory.mutate({ id } as Parameters<typeof deleteCategory.mutate>[0], {
      onSuccess: () => { toast.success("تم حذف القسم"); invalidate(); },
      onError: () => toast.error("حدث خطأ أثناء الحذف"),
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground">إدارة الأقسام</h1>
          <p className="text-muted-foreground mt-1">{categories?.length ?? 0} قسم</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 font-bold" data-testid="button-add-category">
              <Plus className="w-4 h-4" /> إضافة قسم
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader><DialogTitle>إضافة قسم جديد</DialogTitle></DialogHeader>
            <CategoryForm onSave={handleCreate} saving={createCategory.isPending} />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {(categories ?? []).map((cat) => (
            <div
              key={cat.id}
              className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden group hover:border-primary/30 transition-colors"
              data-testid={`category-card-${cat.id}`}
            >
              {cat.imageUrl && (
                <div className="w-full h-32 overflow-hidden bg-muted">
                  <img src={cat.imageUrl} alt={cat.nameAr} className="w-full h-full object-cover group-hover:scale-105 transition-transform" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                </div>
              )}
              <div className="p-5 flex items-start gap-3">
                {cat.icon && (
                  <span className="text-3xl shrink-0">{cat.icon}</span>
                )}
                {!cat.icon && !cat.imageUrl && (
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                    <Tags className="w-5 h-5 text-primary" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground">{cat.nameAr}</p>
                  <p className="text-sm text-muted-foreground">{cat.nameEn}</p>
                  <p className="text-xs text-muted-foreground/60 font-mono mt-0.5">{cat.slug}</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Dialog open={editOpen && editCat?.id === cat.id} onOpenChange={(o) => { setEditOpen(o); if (!o) setEditCat(null); }}>
                    <DialogTrigger asChild>
                      <Button size="icon" variant="ghost" className="w-8 h-8" onClick={() => setEditCat(cat)} data-testid={`button-edit-category-${cat.id}`}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md" dir="rtl">
                      <DialogHeader><DialogTitle>تعديل القسم</DialogTitle></DialogHeader>
                      {editCat && <CategoryForm initial={editCat} onSave={handleUpdate} saving={updateCategory.isPending} />}
                    </DialogContent>
                  </Dialog>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="icon" variant="ghost" className="w-8 h-8 text-destructive hover:text-destructive" data-testid={`button-delete-category-${cat.id}`}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent dir="rtl">
                      <AlertDialogHeader>
                        <AlertDialogTitle>حذف القسم</AlertDialogTitle>
                        <AlertDialogDescription>هل أنت متأكد من حذف قسم "{cat.nameAr}"؟</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(cat.id)} className="bg-destructive text-destructive-foreground">حذف</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ))}
          {(categories ?? []).length === 0 && (
            <div className="col-span-3 text-center py-16 text-muted-foreground">
              <Tags className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>لا توجد أقسام بعد</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
