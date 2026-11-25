import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { Network } from '@capacitor/network';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { WifiOff, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MobileBridge = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useAuth();
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [checkingNetwork, setCheckingNetwork] = useState(false);

  const locationRef = useRef(location);
  const lastBackPressRef = useRef(0);

  useEffect(() => {
    locationRef.current = location;
  }, [location]);

  // Native status bar & splash screen initialization
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return undefined;

    const initNativeUI = async () => {
      try {
        await StatusBar.setOverlaysWebView({ overlay: false });
        await StatusBar.setBackgroundColor({ color: '#0f172a' });
        await StatusBar.setStyle({ style: Style.Dark });
      } catch {
        // Ignore on unsupported devices
      }
      try {
        await SplashScreen.hide();
      } catch {
        // Ignore if already hidden
      }
    };

    initNativeUI();
    return undefined;
  }, []);

  // Scroll focused form inputs into view above Android soft keyboard
  useEffect(() => {
    const handleFocusIn = (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const tag = target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
        window.setTimeout(() => {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 260);
      }
    };

    document.addEventListener('focusin', handleFocusIn);
    return () => document.removeEventListener('focusin', handleFocusIn);
  }, []);

  // Open external links in system browser instead of navigating WebView away
  useEffect(() => {
    const handleLinkClick = async (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest('a[href]');
      if (!anchor) return;

      const rawHref = anchor.getAttribute('href') || '';
      if (!rawHref || rawHref.startsWith('#') || rawHref.startsWith('/')) return;
      if (rawHref.startsWith('blob:') || rawHref.startsWith('data:')) return;

      let parsedUrl;
      try {
        parsedUrl = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }

      const isHttp = parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
      if (!isHttp || parsedUrl.origin === window.location.origin) return;

      event.preventDefault();
      if (Capacitor.isNativePlatform()) {
        try {
          await Browser.open({ url: parsedUrl.toString() });
        } catch {
          window.open(parsedUrl.toString(), '_blank', 'noopener,noreferrer');
        }
      } else {
        window.open(parsedUrl.toString(), '_blank', 'noopener,noreferrer');
      }
    };

    document.addEventListener('click', handleLinkClick, true);
    return () => document.removeEventListener('click', handleLinkClick, true);
  }, []);

  // Handle 401 session expiration via React Router
  useEffect(() => {
    const handleUnauthorized = (event) => {
      const msg = event?.detail?.message || 'Session expired. Please login again.';
      navigate('/login', { replace: true, state: { error: msg } });
    };
    window.addEventListener('academyflow:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('academyflow:unauthorized', handleUnauthorized);
  }, [navigate]);

  // Android hardware back button handling
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return undefined;

    let listenerHandle = null;
    const registerListener = async () => {
      listenerHandle = await CapApp.addListener('backButton', () => {
        if (document.body.dataset.drawerOpen === 'true') {
          window.dispatchEvent(new CustomEvent('academyflow:close-drawer'));
          return;
        }

        const historyIdx = window.history.state?.idx ?? 0;
        const currentPath = locationRef.current.pathname;
        const isExitScreen =
          currentPath === '/' ||
          (historyIdx === 0 &&
            (currentPath === '/student/dashboard' || currentPath === '/admin/dashboard'));

        if (isExitScreen) {
          const now = Date.now();
          if (now - lastBackPressRef.current < 2000) {
            CapApp.exitApp();
          } else {
            lastBackPressRef.current = now;
            showToast('Press back again to exit AcademyFlow.', 'info');
          }
          return;
        }

        if (historyIdx > 0) {
          navigate(-1);
        } else {
          navigate('/', { replace: true });
        }
      });
    };

    registerListener();
    return () => {
      if (listenerHandle) {
        listenerHandle.remove();
      }
    };
  }, [navigate, showToast]);

  // Network connectivity listener
  useEffect(() => {
    let networkHandle = null;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const initNetwork = async () => {
      try {
        const status = await Network.getStatus();
        setIsOnline(status.connected);
        networkHandle = await Network.addListener('networkStatusChange', (next) => {
          setIsOnline(next.connected);
        });
      } catch {
        // Fallback to window online/offline events
      }
    };

    initNetwork();
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (networkHandle) {
        networkHandle.remove();
      }
    };
  }, []);

  const handleRetryConnection = async () => {
    setCheckingNetwork(true);
    try {
      const status = await Network.getStatus();
      setIsOnline(status.connected);
      if (status.connected) {
        showToast('Internet connection restored.', 'info');
      } else {
        showToast('No internet connection.', 'error');
      }
    } catch {
      const online = typeof navigator !== 'undefined' ? navigator.onLine : true;
      setIsOnline(online);
    } finally {
      setCheckingNetwork(false);
    }
  };

  if (isOnline) return null;

  return (
    <div
      role="status"
      className="sticky top-0 z-50 border-b border-amber-300 bg-amber-50 px-4 py-2.5 text-amber-950 shadow-sm safe-area-top"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
          <WifiOff className="h-4 w-4 shrink-0 text-amber-700" />
          <span>No internet connection. Please check your internet connection and try again.</span>
        </div>
        <button
          type="button"
          onClick={handleRetryConnection}
          disabled={checkingNetwork}
          className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-amber-300 bg-white px-2.5 py-1 text-xs font-semibold text-amber-900 hover:bg-amber-100 transition"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${checkingNetwork ? 'animate-spin' : ''}`} />
          Retry
        </button>
      </div>
    </div>
  );
};

export default MobileBridge;
