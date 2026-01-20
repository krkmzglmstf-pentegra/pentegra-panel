"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { saveAuth } from "@/lib/auth";
import { toast } from "sonner";

const schema = z.object({
  email: z.string().email("Gecerli bir e-posta girin."),
  password: z.string().min(6, "Sifre en az 6 karakter olmali."),
  remember: z.boolean().default(true),
  role: z.enum(["admin", "restaurant"])
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", remember: true, role: "admin" }
  });

  const remember = watch("remember");

  const onSubmit = async (values: FormValues) => {
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email, password: values.password })
      });
      if (!res.ok) {
        setError("Giris basarisiz. Bilgileri kontrol edin.");
        toast.error("Giris basarisiz");
        return;
      }
      const data = (await res.json()) as { ok?: boolean; data?: { token?: string } } | { token?: string };
      let token: string | undefined;
      if ("data" in data) {
        token = data.data?.token;
      } else {
        token = data.token;
      }
      if (!token) {
        setError("Token alinamadi. Lutfen tekrar deneyin.");
        toast.error("Giris basarisiz");
        return;
      }
      const meRes = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!meRes.ok) {
        setError("Kullanici bilgileri alinamadi.");
        toast.error("Giris basarisiz");
        return;
      }
      const mePayload = (await meRes.json()) as { ok?: boolean; data?: any } | any;
      const me = "data" in mePayload ? mePayload.data : mePayload;
      saveAuth(token, {
        id: me.user_id,
        role: me.role,
        tenantId: me.tenant_id,
        restaurantId: me.restaurant_id
      });
      toast.success("Giris basarili");
      router.replace(me.role === "restaurant" ? "/app/restaurant/dashboard" : "/app/dashboard");
    } catch {
      setError("Sunucuya baglanilamadi. Lutfen tekrar deneyin.");
      toast.error("Baglanti hatasi");
    }
  };

  return (
    <div className="min-h-screen gradient-surface">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-10 px-6 py-12 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-6">
          <div className="inline-flex items-center gap-3 rounded-full border border-border/60 bg-card/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Kurye Takip Sistemine Hos Geldiniz
          </div>
          <h1 className="text-3xl font-semibold md:text-4xl">
            Kurye operasyonlarinizi tek panelden yonetin.
          </h1>
          <p className="max-w-xl text-base text-muted-foreground">
            Restoranlar, kuryeler ve entegrasyonlar tek merkezde. Canli akis, otomatik onay ve
            performans raporlariyla operasyonlariniz hizlansin.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { title: "Canli siparis akis", desc: "Saniyelik guncellemelerle operasyonu izle." },
              { title: "Akilli atama", desc: "Mesafe ve yuk durumuna gore kurye secimi." },
              { title: "Guvenceli entegrasyon", desc: "Getir, Migros, Yemeksepeti tek panel." },
              { title: "Operasyon sagligi", desc: "Webhook ve queue durumlarini takip et." }
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-border/60 bg-card/70 p-4 shadow-soft">
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <Card className="glass-panel p-8">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Admin Girisi
            </p>
            <h2 className="text-2xl font-semibold">Hesabiniza giris yapin</h2>
            <p className="text-sm text-muted-foreground">
              Guvenli kimlik dogrulama ile panelinize erisin.
            </p>
          </div>

          {error && (
            <Alert className="mt-6 border-destructive/40 bg-destructive/10">
              <AlertTitle>Giris yapilamadi</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form className="mt-6 space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" className="pl-9" placeholder="ornek@firma.com" {...register("email")} />
              </div>
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Sifre</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="pl-9 pr-10"
                  placeholder="********"
                  {...register("password")}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Sifreyi gizle" : "Sifreyi goster"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-muted-foreground">
                <Checkbox checked={remember} onCheckedChange={(value) => setValue("remember", !!value)} />
                Beni hatirla
              </label>
              <button type="button" className="text-primary hover:underline">
                Sifremi unuttum
              </button>
            </div>
            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              Giris yap
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
