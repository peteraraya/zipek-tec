import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ConsentAwareAnalytics from "@/components/layout/ConsentAwareAnalytics";
import AccessibilityWidget from "@/components/layout/AccessibilityWidget";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import CookieConsent from "@/components/layout/CookieConsent";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="public-site min-h-screen">
      <Navbar />
      {children}
      <Footer />
      <WhatsAppButton />
      <AccessibilityWidget />
      <CookieConsent />
      <ConsentAwareAnalytics />
    </div>
  );
}
