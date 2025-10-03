'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, X, Type, User, Clock } from 'lucide-react';

interface QRScannerProps {
  onScan: (qrCode: string) => void;
  onClose: () => void;
  isLoading?: boolean;
}

export default function QRScanner({ onScan, onClose, isLoading }: QRScannerProps) {
  const [mode, setMode] = useState<'manual' | 'camera'>('manual');
  const [qrInput, setQrInput] = useState('');
  const [hasCamera, setHasCamera] = useState(false);

  // Verificar si tiene cámara disponible
  useEffect(() => {
    if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
      setHasCamera(true);
    }
  }, []);

  const handleManualSubmit = () => {
    if (!qrInput.trim()) return;
    onScan(qrInput.trim());
    setQrInput('');
  };

  const simulateCameraScan = () => {
    const qrCode = prompt('🔍 Simulando escaneo con cámara\n\nPara producción: usarás una librería como react-qr-scanner\n\nIngresa aquí el código QR escaneado:');
    if (qrCode && qrCode.trim()) {
      onScan(qrCode.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            📱 Escanear Código QR
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isLoading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="px-4 py-3 border-b">
          <div className="flex space-x-2">
            <button
 onClick={() => setMode('manual')}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                mode === 'manual'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Type className="h-4 w-4 mr-2" />
              Manual
            </button>
            
            {hasCamera && (
              <button
                onClick={() => setMode('camera')}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  mode === 'camera'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Camera className="h-4 w-4 mr-2" />
                Cámara
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {mode === 'manual' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código QR
                </label>
                <textarea
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value)}
                  placeholder="📋 Pega aquí el código QR completo que recibiste del administrador"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={4}
                  disabled={isLoading}
                />
              </div>
              
              <div className="bg-blue-50 p-3 rounded-md">
                <div className="flex items-start">
                  <User className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">📝 Cómo obtener el código QR:</p>
                    <ol className="mt-1 list-decimal list-inside space-y-1">
                      <li>Pídele al administrador que genere un código QR</li>
                      <li>Copia TODO el código desde la pantalla</li>
                      <li>Pégalo aquí para marcar tu asistencia</li>
                    </ol>
                  </div>
                </div>
              </div>

              <button
                onClick={handleManualSubmit}
                disabled={isLoading || !qrInput.trim()}
                className="w-full btn btn-primary btn-lg disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="loading-spinner mr-2"></div>
                    Procesando...
                  </div>
                ) : (
                  '✅ Marcar Asistencia'
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Camera Placeholder */}
              <div className="relative bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                <div className="text-center">
                  <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">📷 Vista previa de cámara</p>
                  <p className="text-sm text-gray-400">
                    En producción se usaría una librería como react-qr-scanner
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-600 text-center">
                📱 Apunta la cámara hacia el código QR del administrador
              </p>

              <button
                onClick={simulateCameraScan}
                disabled={isLoading}
                className="w-full btn btn-primary btn-lg disabled:opacity-50"
              >
                {isLoading ? 'Escaneando...' : '🔄 Simular Escaneo'}
              </button>

              <div className="bg-yellow-50 p-3 rounded-md">
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">⏰ Los códigos QR expiran en 5 minutos</p>
                    <p className="mt-1">Escanea el código fresco del administrador</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-6 pt-4 border-t">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              💡 Consejos para producción:
            </h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Para cámara real: usar react-qr-scanner o @zxing/library</li>
              <li>• El código QR es válido por solo 5 minutos</li>
              <li>• Solo puedes marcar asistencia una vez por día</li>
              <li>• Si tienes problemas, usa el modo manual</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}