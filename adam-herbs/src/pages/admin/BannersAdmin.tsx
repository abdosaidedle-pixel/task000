import { useState } from "react";
import {
  useListBanners,
  useCreateBanner,
  useUpdateBanner,
  useDeleteBanner,
  getListBannersQueryKey,
  type Banner,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Edit2, Trash2, Eye, EyeOff, Image as ImageIcon } from "lucide-react";
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

function BannerForm({
  initial,
  onSave,
  saving,
}: {
  initial?: Partial<Banner>;
  onSave: (data: Record<string, unknown>) => void;
  saving: boolean;
}) {
  const [titleAr, setTitleAr] = useState(initial?.titleAr ?? "");
  const [subtitleAr, setSubtitleAr] = useState(initial?.subtitleAr ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [bgColor, setBgColor] = useState(initial?.bgColor ?? "#3B4E38");
  const [linkUrl, setLinkUrl] = useState(initial?.linkUrl ?? "");
  const [sortOrder, setSortOrder] = useState(String(initial?.sortOrder ?? "0"));
  const [active, setActive] = useState(initial?.active ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleAr) { toast.error("العنوان مطلوب"); return; }
    onSave({
      titleAr, subtitleAr: subtitleAr || null, imageUrl: imageUrl || null,
      bgColor: bgColor || null, linkUrl: linkUrl || null,
      sortOrder: parseInt(sortOrder) || 0, active,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-2" dir="rtl">
      <div>
        <label className="text-sm font-medium mb-1 block">العنوان (عربي) *</label>
        <Input value={titleAr} onChange={e => setTitleAr(e.target.value)} placeholder="عنوان اللافتة" data-testid="input-banner-title" />
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">النص الفرعي</label>
        <Input value={subtitleAr} onChange={e => setSubtitleAr(e.target.value)} placeholder="نص توضيحي اختياري" />
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">رابط الصورة</label>
        <Input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." dir="ltr" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium mb-1 block">لون الخلفية</label>
          <div className="flex gap-2 items-center">
            <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer border border-border" />
            <Input value={bgColor} onChange={e => setBgColor(e.target.value)} dir="ltr" className="flex-1" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">ترتيب الظهور</label>
          <Input type="number" value={sortOrder} onChange={e => setSortOrder(e.target.value)} dir="ltr" />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">رابط الزر (اختياري)</label>
        <Input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="/products" dir="ltr" />
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} className="w-4 h-4 accent-primary" />
        <span className="text-sm font-medium">نشط (يظهر على الموقع)</span>
      </label>
      <Button type="submit" className="w-full font-bold" disabled={saving} data-testid="button-save-banner">
        {saving ? "جاري الحفظ..." : "حفظ اللافتة"}
      </Button>
    </form>
  );
}

export default function BannersAdmin() {
  const queryClient = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [editBanner, setEditBanner] = useState<Banner | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const { data: banners, isLoading } = useListBanners();
  const createBanner = useCreateBanner();
  const updateBanner = useUpdateBanner();
  const deleteBanner = useDeleteBanner();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListBannersQueryKey() });

  const handleCreate = (data: Record<string, unknown>) => {
    createBanner.mutate({ data } as Parameters<typeof createBanner.mutate>[0], {
      onSuccess: () => { toast.success("تم إضافة اللافتة"); setAddOpen(false); invalidate(); },
      onError: () => toast.error("حدث خطأ"),
    });
  };

  const handleUpdate = (data: Record<string, unknown>) => {
    if (!editBanner) return;
    updateBanner.mutate({ id: editBanner.id, data } as Parameters<typeof updateBanner.mutate>[0], {
      onSuccess: () => { toast.success("تم التحديث"); setEditOpen(false); invalidate(); },
      onError: () => toast.error("حدث خطأ"),
    });
  };

  const handleToggle = (banner: Banner) => {
    updateBanner.mutate(
      { id: banner.id, data: { active: !banner.active } } as Parameters<typeof updateBanner.mutate>[0],
      {
        onSuccess: () => { invalidate(); },
        onError: () => toast.error("حدث خطأ"),
      }
    );
  };

  const handleDelete = (id: number) => {
    deleteBanner.mutate({ id } as Parameters<typeof deleteBanner.mutate>[0], {
      onSuccess: () => { toast.success("تم حذف اللافتة"); invalidate(); },
      onError: () => toast.error("حدث خطأ"),
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground">إدارة اللافتات</h1>
          <p className="text-muted-foreground mt-1">شرائح العروض والإعلانات</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 font-bold" data-testid="button-add-banner">
              <Plus className="w-4 h-4" /> إضافة لافتة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" dir="rtl">
            <DialogHeader><DialogTitle>إضافة لافتة جديدة</DialogTitle></DialogHeader>
            <BannerForm onSave={handleCreate} saving={createBanner.isPending} />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {(banners ?? []).map((banner) => (
            <div
              key={banner.id}
              className={`rounded-2xl border overflow-hidden shadow-sm transition-all ${banner.active ? "border-primary/20" : "border-border opacity-60"}`}
              data-testid={`banner-card-${banner.id}`}
            >
              <div className="h-24 flex items-center justify-center relative" style={{ backgroundColor: banner.bgColor ?? "#3B4E38" }}>
                {banner.imageUrl ? (
                  <img src={banner.imageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon className="w-10 h-10 text-white/40" />
                )}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center p-4">
                  <div className="text-center text-white">
                    <p className="font-bold text-sm">{banner.titleAr}</p>
                    {banner.subtitleAr && <p className="text-xs opacity-80 mt-0.5">{banner.subtitleAr}</p>}
                  </div>
                </div>
              </div>
              <div className="p-3 bg-card flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${banner.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                    {banner.active ? "نشط" : "مخفي"}
                  </span>
                  <span className="text-xs text-muted-foreground">ترتيب: {banner.sortOrder}</span>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="w-8 h-8" onClick={() => handleToggle(banner)} data-testid={`button-toggle-banner-${banner.id}`}>
                    {banner.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Dialog open={editOpen && editBanner?.id === banner.id} onOpenChange={(o) => { setEditOpen(o); if (!o) setEditBanner(null); }}>
                    <DialogTrigger asChild>
                      <Button size="icon" variant="ghost" className="w-8 h-8" onClick={() => setEditBanner(banner)} data-testid={`button-edit-banner-${banner.id}`}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" dir="rtl">
                      <DialogHeader><DialogTitle>تعديل اللافتة</DialogTitle></DialogHeader>
                      {editBanner && <BannerForm initial={editBanner} onSave={handleUpdate} saving={updateBanner.isPending} />}
                    </DialogContent>
                  </Dialog>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="icon" variant="ghost" className="w-8 h-8 text-destructive hover:text-destructive" data-testid={`button-delete-banner-${banner.id}`}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent dir="rtl">
                      <AlertDialogHeader>
                        <AlertDialogTitle>حذف اللافتة</AlertDialogTitle>
                        <AlertDialogDescription>هل أنت متأكد من حذف هذه اللافتة؟</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(banner.id)} className="bg-destructive text-destructive-foreground">حذف</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ))}
          {(banners ?? []).length === 0 && (
            <div className="col-span-2 text-center py-16 text-muted-foreground">
              <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>لا توجد لافتات بعد</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
