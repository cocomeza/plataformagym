'use client';

import { useState } from 'react';
import { X, CheckCircle, Clock } from 'lucide-react';

interface AttendanceCodeInputProps {
  onSubmit: (code: string) => void;
  onClose: () => void;
  isLoading?: boolean;
}

export default function AttendanceCodeInput({ onSubmit, onClose, isLoading }: AttendanceCodeInputProps) {
  const [code, setCode] = useState('');

  const handleSubmit = () => {
    if (code.length === 4 && /^\d{4}$/.test(code)) {
      onSubmit(code);
      setCode('');
    }
  };

  const handleDigitPress = (digit: string) => {
    if (code.length < 4) {
      setCode(code + digit);
    }
  };

  const handleBackspace = () => {
    setCode(code.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            🔢 Marcar Asistencia
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isLoading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Code Display */}
          <div className="text-center mb-6">
            <div className="inline-block bg-gray-100 rounded-2xl p-6">
              <div className="flex space-x-4">
                {[0, 1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className="w-16 h-16 bg-white rounded-lg border-2 border-gray-300 flex items-center justify-center text-2xl font-bold text-gray-600"
                  >
                    {code[index] || ''}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="text-center mb-6">
            <p className="text-sm text-gray-600 mb-2">
              Ingresa el código de 4 dígitos que te dio el administrador
            </p>
            <div className="bg-blue-50 p-3 rounded-md mb-4">
              <div className="flex items-center justify-center text-blue-800">
                <Clock className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Los códigos expiran en 10 minutos</span>
              </div>
            </div>
          </div>

          {/* Number Pad */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleDigitPress(num.toString())}
                className="p-4 text-xl font-semibold bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                disabled={isLoading || code.length >= 4}
              >
                {num}
              </button>
            ))}
            <button 
              onClick={handleBackspace}
              className="p-4 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg"
              disabled={isLoading}
            >
              ⌫
            </button>
            <button
              onClick={() => handleDigitPress('0')}
              className="p-4 text-xl font-bold bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              disabled={isLoading || code.length >= 4}
            >
              0
            </button>
            <button
              onClick={() => setCode('')}
              className="p-4 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg"
              disabled={isLoading}
            >
              ✕
            </button>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={code.length !== 4 || isLoading}
            className={`w-full p-4 rounded-lg font-semibold transition-colors ${
              code.length === 4 && !isLoading
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="loading-spinner mr-2"></div>
                Procesando...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Marcar Asistencia
              </div>
            )}
          </button>

          {/* Help */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              💡 Si el código no funciona, pídelo nuevamente al administrador
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
