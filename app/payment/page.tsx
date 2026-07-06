"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useXeero } from "@/lib/context";
import { Lock, CheckCircle, ArrowLeft, Zap, Tag, X } from "lucide-react";

declare global {
  interface Window {
    PaystackPop: any;
  }
}

export default function PaymentPage() {
  const router = useRouter();
  const { user, profile, profileLoading, refreshProfile } = useXeero();

  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [error, setError] = useState("");

  // Pricing
  const [ngnBase, setNgnBase] = useState<number | null>(null);
  const [ngnFinal, setNgnFinal] = useState<number | null>(null);
  const [rate, setRate] = useState<number | null>(null);

  // Coupon
  const [couponCode, setCouponCode] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);

  // Load Paystack script
  useEffect(() => {
    if (document.querySelector('script[src="https://js.paystack.co/v2/inline.js"]')) {
      setScriptLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v2/inline.js";
    script.onload = () => setScriptLoaded(true);
    document.head.appendChild(script);
  }, []);

  // Fetch exchange rate on load
  useEffect(() => {
    fetch("https://api.exchangerate-api.com/v4/latest/USD")
      .then((r) => r.json())
      .then((data) => {
        const r = data.rates.NGN || 1500;
        setRate(Math.round(r));
        const base = Math.ceil((9 * r) / 500) * 500;
        setNgnBase(base);
        setNgnFinal(base);
      })
      .catch(() => {
        setRate(1500);
        setNgnBase(13500);
        setNgnFinal(13500);
      });
  }, []);

  // Apply coupon — validates against Supabase directly
  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    setCouponApplied(false);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/coupons?code=eq.${couponInput.toUpperCase().trim()}&active=eq.true&select=*`,
        {
          headers: {
            "apikey": process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
        }
      );

      const data = await res.json();

      if (!data || data.length === 0) {
        setCouponError("Invalid or expired coupon code.");
        setCouponLoading(false);
        return;
      }

      const coupon = data[0];

      if (coupon.max_uses !== null && coupon.uses >= coupon.max_uses) {
        setCouponError("This coupon has reached its usage limit.");
        setCouponLoading(false);
        return;
      }

      // Valid — apply discount
      const discount = coupon.discount_percent;
      setDiscountPercent(discount);
      setCouponCode(couponInput.toUpperCase().trim());
      setCouponApplied(true);

      if (ngnBase !== null) {
        const discountAmount = Math.floor(ngnBase * (discount / 100));
        setNgnFinal(ngnBase - discountAmount);
      }

    } catch {
      setCouponError("Could not validate coupon. Please try again.");
    }

    setCouponLoading(false);
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setCouponInput("");
    setCouponApplied(false);
    setDiscountPercent(0);
    setCouponError("");
    setNgnFinal(ngnBase);
  };

  const handlePay = async () => {
    if (!user || !profile) return;
    setInitializing(true);
    setError("");
  
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/initialize-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            user_id: user.id,
            email: user.email,
            profile_id: profile.id,
            coupon_code: couponCode || null,
          }),
        }
      );
  
      const data = await res.json();
      console.log("initialize-payment response:", data);
  
      if (!res.ok || data.error) {
        setError(data.error || "Failed to initialize payment.");
        setInitializing(false);
        return;
      }
  
      if (data.free) {
        setLoading(true);
        await refreshProfile();
        router.push("/dashboard?payment=success");
        return;
      }
  
      setInitializing(false);
  
      // Check Paystack script loaded
      if (!window.PaystackPop) {
        setError("Payment system not loaded. Please refresh and try again.");
        return;
      }
  
      console.log("Opening Paystack with key:", process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY);
      console.log("Amount:", data.ngn_amount * 100);
      console.log("Reference:", data.reference);
  
      const handler = window.PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email: user.email!,
        amount: data.ngn_amount * 100,
        ref: data.reference,
        currency: "NGN",
        metadata: {
          profile_id: profile.id,
          user_id: user.id,
          usd_price: 9,
          custom_fields: [
            {
              display_name: "Profile ID",
              variable_name: "profile_id",
              value: profile.id,
            },
          ],
        },
        callback: async (response: any) => {
          console.log("Paystack callback:", response);
          setLoading(true);
          await new Promise((r) => setTimeout(r, 3000));
          await refreshProfile();
          router.push("/dashboard?payment=success");
        },
        onClose: () => {
          console.log("Paystack closed");
          setError("Payment cancelled. You can try again anytime.");
          setInitializing(false);
        },
      });
  
      handler.openIframe();
  
    } catch (err) {
      console.error("handlePay error:", err);
      setError("Something went wrong. Please try again.");
      setInitializing(false);
    }
  };

  if (profileLoading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loadingDot} />
      </div>
    );
  }

  if (!user || !profile) {
    router.push("/auth");
    return null;
  }

  if (profile.is_live) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.successIcon}>
            <CheckCircle size={28} color="#38a169" />
          </div>
          <h1 style={styles.title}>You're already live!</h1>
          <p style={styles.subtitle}>
            Your profile at <strong>xeero.me/{profile.slug}</strong> is already published.
          </p>
          <button style={styles.payBtn} onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loadingDot} />
        <p style={styles.loadingText}>Activating your profile...</p>
      </div>
    );
  }

  const isFree = discountPercent === 100;

  return (
    <div style={styles.page}>
      <button style={styles.backBtn} onClick={() => router.push("/dashboard")}>
        <ArrowLeft size={14} /> Dashboard
      </button>

      <div style={styles.card}>

        {/* Header */}
        <div style={styles.cardHeader}>
          <div style={styles.lockBadge}>
            <Zap size={20} color="#111111" />
          </div>
          <h1 style={styles.title}>Go Live</h1>
          <p style={styles.subtitle}>
            Publish your profile at{" "}
            <strong>xeero.me/{profile.slug}</strong>{" "}
            and unlock all features.
          </p>
        </div>

        {/* Price */}
        <div style={styles.priceCard}>
          <div style={styles.priceRow}>
            <div>
              <p style={styles.priceLabel}>One-time payment</p>
              <div style={styles.priceBig}>
                <span style={styles.priceUsd}>$9</span>
                <span style={styles.priceForever}>forever</span>
              </div>
            </div>
            <div style={styles.priceNgn}>
              {ngnFinal !== null ? (
                <>
                  {discountPercent > 0 && ngnBase !== null && (
                    <p style={styles.priceStrike}>₦{ngnBase.toLocaleString()}</p>
                  )}
                  <p style={{
                    ...styles.priceNgnAmount,
                    color: discountPercent > 0 ? "#38a169" : "#111111",
                  }}>
                    {isFree ? "FREE" : `₦${ngnFinal.toLocaleString()}`}
                  </p>
                  <p style={styles.priceNgnRate}>
                    Rate: ₦{rate?.toLocaleString()}/USD
                  </p>
                </>
              ) : (
                <p style={styles.priceNgnRate}>Fetching rate...</p>
              )}
            </div>
          </div>

          {discountPercent > 0 && (
            <div style={styles.discountBadge}>
              <CheckCircle size={12} color="#38a169" />
              <span>
                {discountPercent}% discount applied
                {isFree ? " — this is free!" : ` — saving ₦${(ngnBase! - ngnFinal!).toLocaleString()}`}
              </span>
            </div>
          )}

          <p style={styles.priceNote}>
            Charged in Nigerian Naira at today's exchange rate, rounded up to the nearest ₦500.
          </p>
        </div>

        {/* Coupon */}
        <div style={styles.couponSection}>
          <p style={styles.couponLabel}>
            <Tag size={12} /> Have a coupon?
          </p>

          {couponApplied ? (
            <div style={styles.couponAppliedRow}>
              <div style={styles.couponAppliedBadge}>
                <CheckCircle size={13} color="#38a169" />
                <span style={styles.couponAppliedText}>{couponCode}</span>
              </div>
              <button style={styles.couponRemoveBtn} onClick={handleRemoveCoupon}>
                <X size={13} /> Remove
              </button>
            </div>
          ) : (
            <div style={styles.couponRow}>
              <input
                style={styles.couponInput}
                placeholder="Enter code"
                value={couponInput}
                onChange={(e) => {
                  setCouponInput(e.target.value.toUpperCase());
                  setCouponError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleApplyCoupon();
                }}
                disabled={couponLoading}
              />
              <button
                style={{
                  ...styles.couponApplyBtn,
                  opacity: couponInput.trim() ? 1 : 0.4,
                }}
                onClick={handleApplyCoupon}
                disabled={!couponInput.trim() || couponLoading}
              >
                {couponLoading ? "..." : "Apply"}
              </button>
            </div>
          )}

          {couponError && (
            <p style={styles.couponError}>{couponError}</p>
          )}
        </div>

        {/* What you get */}
        <div style={styles.featuresCard}>
          <p style={styles.featuresTitle}>What you unlock</p>
          {[
            "Public profile at xeero.me/" + profile.slug,
            "Investors can find and view your profile",
            "Data room access requests from investors",
            "Waitlist collection goes live",
            "Pitch deck visible to visitors",
            "All future features included",
          ].map((f) => (
            <div key={f} style={styles.featureRow}>
              <CheckCircle size={14} color="#38a169" />
              <span style={styles.featureText}>{f}</span>
            </div>
          ))}
        </div>

        {error && <p style={styles.errorText}>{error}</p>}

        <button
          style={{
            ...styles.payBtn,
            opacity: initializing || !scriptLoaded ? 0.6 : 1,
            backgroundColor: isFree ? "#38a169" : "#111111",
          }}
          onClick={handlePay}
          disabled={initializing || (!scriptLoaded && !isFree)}
        >
          {isFree
            ? <><CheckCircle size={14} />Activate for Free</>
            : <><Lock size={14} />{initializing ? "Preparing..." : `Pay ₦${ngnFinal?.toLocaleString() || "..."} and Go Live`}</>
          }
        </button>

        <p style={styles.disclaimer}>
          {isFree
            ? "Your profile will be activated instantly."
            : "Secure payment via Paystack. No subscription. No recurring charges."
          }
        </p>

      </div>
    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };

const styles: Styles = {
  page: { minHeight: "100vh", backgroundColor: "#f5f5f5", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px" },
  loadingPage: { minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", backgroundColor: "#f5f5f5" },
  loadingDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#cccccc" },
  loadingText: { fontSize: "14px", color: "#888888", margin: "0" },
  backBtn: { display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#888888", backgroundColor: "transparent", border: "none", cursor: "pointer", marginBottom: "20px", alignSelf: "flex-start" },
  card: { backgroundColor: "#ffffff", borderRadius: "20px", padding: "36px", maxWidth: "480px", width: "100%", border: "1px solid #f0f0f0", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: "20px" },
  cardHeader: { textAlign: "center" },
  lockBadge: { width: "56px", height: "56px", borderRadius: "16px", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto" },
  title: { fontSize: "22px", fontWeight: "700", color: "#111111", margin: "0 0 8px 0" },
  subtitle: { fontSize: "14px", color: "#666666", lineHeight: "1.6", margin: "0" },
  priceCard: { backgroundColor: "#f9f9f9", borderRadius: "14px", padding: "20px", border: "1px solid #f0f0f0", display: "flex", flexDirection: "column", gap: "10px" },
  priceRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  priceLabel: { fontSize: "11px", fontWeight: "600", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 4px 0" },
  priceBig: { display: "flex", alignItems: "baseline", gap: "6px" },
  priceUsd: { fontSize: "36px", fontWeight: "800", color: "#111111" },
  priceForever: { fontSize: "14px", color: "#aaaaaa" },
  priceNgn: { textAlign: "right" },
  priceStrike: { fontSize: "13px", color: "#cccccc", textDecoration: "line-through", margin: "0 0 2px 0" },
  priceNgnAmount: { fontSize: "20px", fontWeight: "700", margin: "0 0 2px 0" },
  priceNgnRate: { fontSize: "11px", color: "#aaaaaa", margin: "0" },
  priceNote: { fontSize: "11px", color: "#aaaaaa", margin: "0", lineHeight: "1.5" },
  discountBadge: { display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#f0fff4", border: "1px solid #c6f6d5", borderRadius: "8px", padding: "8px 12px", fontSize: "12px", color: "#38a169", fontWeight: "500" },
  couponSection: { display: "flex", flexDirection: "column", gap: "8px" },
  couponLabel: { display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", fontWeight: "500", color: "#888888", margin: "0" },
  couponRow: { display: "flex", gap: "8px" },
  couponInput: { flex: 1, padding: "10px 13px", fontSize: "13px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", backgroundColor: "#fafafa", fontFamily: "inherit", letterSpacing: "0.08em", textTransform: "uppercase" },
  couponApplyBtn: { padding: "10px 18px", fontSize: "13px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "8px", cursor: "pointer", flexShrink: 0, transition: "opacity 0.2s ease" },
  couponAppliedRow: { display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#f0fff4", border: "1px solid #c6f6d5", borderRadius: "8px", padding: "10px 14px" },
  couponAppliedBadge: { display: "flex", alignItems: "center", gap: "6px" },
  couponAppliedText: { fontSize: "13px", fontWeight: "600", color: "#38a169", letterSpacing: "0.08em" },
  couponRemoveBtn: { display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#888888", backgroundColor: "transparent", border: "none", cursor: "pointer" },
  couponError: { fontSize: "12px", color: "#e53e3e", margin: "0" },
  featuresCard: { display: "flex", flexDirection: "column", gap: "10px" },
  featuresTitle: { fontSize: "12px", fontWeight: "600", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 4px 0" },
  featureRow: { display: "flex", alignItems: "center", gap: "10px" },
  featureText: { fontSize: "13px", color: "#444444" },
  errorText: { fontSize: "13px", color: "#e53e3e", margin: "0", textAlign: "center" },
  payBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", padding: "15px", fontSize: "15px", fontWeight: "700", color: "#ffffff", border: "none", borderRadius: "12px", cursor: "pointer", transition: "all 0.2s ease" },
  disclaimer: { fontSize: "11px", color: "#bbbbbb", textAlign: "center", margin: "0" },
  successIcon: { width: "56px", height: "56px", borderRadius: "16px", backgroundColor: "#f0fff4", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto" },
};