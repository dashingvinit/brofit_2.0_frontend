import { useEffect, useState } from "react";
import { Share, Download, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import brandLogo from "@/assets/brand_logo.png";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "pwa-install-dismissed";

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isInStandaloneMode() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && (navigator as any).standalone === true)
  );
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const ios = isIOS();

  useEffect(() => {
    // Don't show if already installed or previously dismissed
    if (isInStandaloneMode()) return;
    if (sessionStorage.getItem(DISMISSED_KEY)) return;

    if (ios) {
      // Small delay so the app has time to paint first
      const t = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(t);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShow(true), 2000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [ios]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShow(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISSED_KEY, "1");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 sm:hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="rounded-xl border bg-card shadow-lg p-4">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3 pr-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg overflow-hidden">
            <img src={brandLogo} alt="Brofit" className="h-10 w-10 object-contain" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">Add Brofit to Home Screen</p>
            {ios ? (
              <p className="text-xs text-muted-foreground mt-0.5">
                Tap <Share className="inline h-3 w-3 mx-0.5" /> then{" "}
                <strong>Add to Home Screen</strong> for the full app experience.
              </p>
            ) : (
              <p className="text-xs text-muted-foreground mt-0.5">
                Install for faster access and a native app feel.
              </p>
            )}
          </div>
        </div>

        {!ios && (
          <Button
            size="sm"
            className="mt-3 w-full h-8 text-xs"
            onClick={handleInstall}
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Install App
          </Button>
        )}
      </div>
    </div>
  );
}
