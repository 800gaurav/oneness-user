import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Loader2, QrCode, RefreshCw, Smartphone, X, LogOut, Hash } from 'lucide-react';
import { whatsappAPI } from '../../services/api';

const POLL_INTERVAL = 4000;

const WhatsAppStatusBanner = () => {
  const [status, setStatus] = useState('disconnected');
  const [qr, setQr] = useState(null);
  const [pairingCode, setPairingCode] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [connectMode, setConnectMode] = useState('qr'); // 'qr' | 'pairing'
  const [phoneInput, setPhoneInput] = useState('');
  const [loading, setLoading] = useState(false);
  const pollRef = useRef(null);

  const fetchStatus = async () => {
    try {
      const res = await whatsappAPI.getStatus();
      setStatus(res.data.status);
      setQr(res.data.qr || null);
      setPairingCode(res.data.pairingCode || null);
      if (res.data.status === 'qr_ready' && res.data.qr) setShowModal(true);
      if (res.data.status === 'pairing_ready') setShowModal(true);
      if (res.data.status === 'connected') setShowModal(false);
    } catch {}
  };

  useEffect(() => {
    fetchStatus();
    pollRef.current = setInterval(fetchStatus, POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, []);

  const handleConnect = async () => {
    setLoading(true);
    try {
      if (connectMode === 'pairing') {
        if (!phoneInput.trim()) { setLoading(false); return; }
        let rawPhone = phoneInput.replace(/\D/g, '');
        if (rawPhone.length === 10) {
          rawPhone = '91' + rawPhone;
        }
        await whatsappAPI.connect({ phoneNumber: rawPhone });
      } else {
        await whatsappAPI.connect({});
      }
      await fetchStatus();
      setShowModal(true);
    } catch {}
    setLoading(false);
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      await whatsappAPI.disconnect();
      setQr(null);
      setPairingCode(null);
      setShowModal(false);
      await fetchStatus();
    } catch {}
    setLoading(false);
  };

  const bannerConfig = {
    connected:    { bg: 'bg-emerald-50 border-emerald-200', icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" />, text: 'WhatsApp connected — campaigns will send automatically.', textColor: 'text-emerald-800' },
    qr_ready:     { bg: 'bg-amber-50 border-amber-200',    icon: <QrCode className="h-4 w-4 text-amber-600" />,        text: 'QR code ready — scan with WhatsApp to connect.',       textColor: 'text-amber-800' },
    pairing_ready:{ bg: 'bg-blue-50 border-blue-200',      icon: <Hash className="h-4 w-4 text-blue-600" />,           text: 'Pairing code ready — enter it in WhatsApp.',          textColor: 'text-blue-800' },
    connecting:   { bg: 'bg-blue-50 border-blue-200',      icon: <Loader2 className="h-4 w-4 animate-spin text-blue-600" />, text: 'Connecting to WhatsApp...', textColor: 'text-blue-800' },
    disconnected: { bg: 'bg-red-50 border-red-200',        icon: <AlertTriangle className="h-4 w-4 text-red-500" />,   text: 'WhatsApp not connected. Campaigns will not send.',    textColor: 'text-red-800' },
  };

  const cfg = bannerConfig[status] || bannerConfig.disconnected;

  return (
    <>
      <div className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 ${cfg.bg}`}>
        <div className="flex items-center gap-2.5">
          {cfg.icon}
          <p className={`text-sm font-semibold ${cfg.textColor}`}>{cfg.text}</p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {(status === 'qr_ready' || status === 'pairing_ready') && (
            <button onClick={() => setShowModal(true)} className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-700 transition-colors">
              Show Code
            </button>
          )}

          {status === 'connected' && (
            <button onClick={handleDisconnect} disabled={loading} className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50 transition-colors disabled:opacity-50">
              <LogOut className="h-3.5 w-3.5" /> Disconnect
            </button>
          )}

          {status === 'disconnected' && (
            <button onClick={() => setShowModal(true)} disabled={loading} className="inline-flex items-center gap-1.5 rounded-lg bg-[rgb(var(--color-brown))] px-3 py-1.5 text-xs font-bold text-white hover:opacity-90 transition-opacity disabled:opacity-50">
              <Smartphone className="h-3.5 w-3.5" /> Connect WhatsApp
            </button>
          )}

          {status === 'connecting' && (
            <button onClick={fetchStatus} className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-50 transition-colors">
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </button>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <button onClick={() => setShowModal(false)} className="absolute right-4 top-4 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
              <X className="h-5 w-5" />
            </button>

            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                <Smartphone className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="font-black text-[rgb(var(--color-text-primary))]">Connect WhatsApp</h2>
                <p className="text-xs text-[rgb(var(--color-text-secondary))]">Choose your preferred method</p>
              </div>
            </div>

            {/* Method Tabs — only show when disconnected */}
            {status === 'disconnected' && (
              <>
                <div className="mb-5 flex rounded-xl border border-gray-200 p-1 gap-1">
                  <button
                    onClick={() => setConnectMode('qr')}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold transition-all ${connectMode === 'qr' ? 'bg-[rgb(var(--color-brown))] text-white shadow' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                    <QrCode className="h-4 w-4" /> QR Code
                  </button>
                  <button
                    onClick={() => setConnectMode('pairing')}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold transition-all ${connectMode === 'pairing' ? 'bg-[rgb(var(--color-brown))] text-white shadow' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                    <Hash className="h-4 w-4" /> Pairing Code
                  </button>
                </div>

                {connectMode === 'pairing' && (
                  <div className="mb-4">
                    <label className="block text-sm font-bold text-gray-700 mb-2">WhatsApp Phone Number</label>
                    <input
                      type="tel"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-brown))]"
                    />
                    <p className="mt-1.5 text-xs text-gray-500">Enter the number registered on WhatsApp with country code</p>
                  </div>
                )}

                <button
                  onClick={handleConnect}
                  disabled={loading || (connectMode === 'pairing' && !phoneInput.trim())}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[rgb(var(--color-brown))] py-3 text-sm font-black text-white hover:opacity-90 disabled:opacity-50 transition-all mb-4"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Smartphone className="h-4 w-4" />}
                  {loading ? 'Connecting...' : `Connect via ${connectMode === 'qr' ? 'QR Code' : 'Pairing Code'}`}
                </button>
              </>
            )}

            {/* QR Code display */}
            {(status === 'qr_ready' || status === 'connecting') && (
              <div className="space-y-4">
                <div className="rounded-xl border-2 border-dashed border-emerald-200 bg-emerald-50 p-4 min-h-[224px] flex items-center justify-center">
                  {qr ? (
                    <img src={qr} alt="WhatsApp QR Code" className="mx-auto h-56 w-56 rounded-lg" />
                  ) : (
                    <div className="text-center space-y-3.5">
                      <Loader2 className="h-10 w-10 animate-spin text-emerald-600 mx-auto" />
                      <p className="text-xs font-bold text-emerald-800">Generating QR Code...</p>
                      <p className="text-[10px] text-emerald-600/70 max-w-[200px]">Generating a secure QR stream. Keep this window open.</p>
                    </div>
                  )}
                </div>
                {qr && (
                  <ol className="space-y-1.5 text-sm text-gray-600">
                    <li className="flex items-start gap-2"><span className="font-black text-emerald-600">1.</span> Open WhatsApp on your phone</li>
                    <li className="flex items-start gap-2"><span className="font-black text-emerald-600">2.</span> Tap Menu → Linked Devices</li>
                    <li className="flex items-start gap-2"><span className="font-black text-emerald-600">3.</span> Tap "Link a Device" and scan this QR</li>
                  </ol>
                )}
                <p className="text-center text-xs text-gray-400">QR refreshes automatically. Keep this window open.</p>
              </div>
            )}

            {/* Pairing Code display */}
            {status === 'pairing_ready' && pairingCode && (
              <div className="space-y-4">
                <div className="rounded-xl border-2 border-dashed border-blue-200 bg-blue-50 p-6 text-center">
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-3">Your Pairing Code</p>
                  <p className="text-4xl font-black tracking-[0.3em] text-blue-900">{pairingCode}</p>
                </div>
                <ol className="space-y-1.5 text-sm text-gray-600">
                  <li className="flex items-start gap-2"><span className="font-black text-blue-600">1.</span> Open WhatsApp on your phone</li>
                  <li className="flex items-start gap-2"><span className="font-black text-blue-600">2.</span> Tap Menu → Linked Devices</li>
                  <li className="flex items-start gap-2"><span className="font-black text-blue-600">3.</span> Tap "Link with phone number"</li>
                  <li className="flex items-start gap-2"><span className="font-black text-blue-600">4.</span> Enter the code shown above</li>
                </ol>
              </div>
            )}

            {/* Connected state */}
            {status === 'connected' && (
              <div className="space-y-4">
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-6 text-center">
                  <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto mb-2" />
                  <p className="font-black text-emerald-800">WhatsApp Connected!</p>
                  <p className="text-sm text-emerald-600 mt-1">Campaigns will now send automatically</p>
                </div>
                <button
                  onClick={handleDisconnect}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-red-200 py-3 text-sm font-black text-red-600 hover:bg-red-50 disabled:opacity-50 transition-all"
                >
                  <LogOut className="h-4 w-4" />
                  {loading ? 'Disconnecting...' : 'Disconnect WhatsApp'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default WhatsAppStatusBanner;
