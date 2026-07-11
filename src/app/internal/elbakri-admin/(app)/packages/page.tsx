import { createClient } from "@/lib/supabase/server";
import { PackagesManager } from "./PackagesManager";

type Dest = { id: string; name_ar: string; display_order: number };
type Cat = {
  id: string;
  name_ar: string;
  destination_id: string;
  is_published: boolean;
  is_archived: boolean;
  price_unit: string;
  display_order: number;
};

export default async function PackagesPage() {
  const supabase = await createClient();
  const [{ data: destinations }, { data: categories }] = await Promise.all([
    supabase.from("destinations").select("id,name_ar,display_order").order("display_order"),
    supabase
      .from("package_categories")
      .select("id,name_ar,destination_id,is_published,is_archived,price_unit,display_order")
      .order("display_order"),
  ]);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-extrabold text-navy">الباقات</h1>
      <p className="mb-6 text-sm text-muted">أضِف باقات إلى الوجهات وتحكّم في نشرها وأرشفتها.</p>
      <PackagesManager
        destinations={(destinations ?? []) as Dest[]}
        categories={(categories ?? []) as Cat[]}
      />
    </div>
  );
}
