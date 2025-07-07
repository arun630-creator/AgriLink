import React from 'react';

// UPI Icon Component - with realistic UPI symbol and colors
export const UPIIcon = () => (
  <div className="h-10 w-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-sm relative overflow-hidden">
    {/* UPI Symbol */}
    <div className="text-white font-bold text-xs tracking-wider">UPI</div>
    {/* Decorative elements */}
    <div className="absolute top-1 left-1 w-1 h-1 bg-white/30 rounded-full"></div>
    <div className="absolute bottom-1 right-1 w-1 h-1 bg-white/30 rounded-full"></div>
  </div>
);

// Paytm Icon Component - with realistic Paytm branding
export const PaytmIcon = () => (
  <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm relative overflow-hidden">
    {/* Paytm "P" with realistic styling */}
    <div className="text-white font-bold text-lg" style={{ fontFamily: 'Arial, sans-serif' }}>P</div>
    {/* Paytm brand elements */}
    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent"></div>
    <div className="absolute top-0 left-0 w-full h-1 bg-white/20"></div>
  </div>
);

// Google Pay Icon Component - with realistic Google Pay branding
export const GooglePayIcon = () => (
  <div className="h-10 w-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-sm relative overflow-hidden">
    {/* Google Pay "G" with realistic styling */}
    <div className="text-white font-bold text-lg" style={{ fontFamily: 'Arial, sans-serif' }}>G</div>
    {/* Google Pay brand elements */}
    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent"></div>
    <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20"></div>
  </div>
);

// PhonePe Icon Component - with realistic PhonePe branding
export const PhonePeIcon = () => (
  <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm relative overflow-hidden">
    {/* PhonePe "P" with realistic styling */}
    <div className="text-white font-bold text-lg" style={{ fontFamily: 'Arial, sans-serif' }}>P</div>
    {/* PhonePe brand elements */}
    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent"></div>
    <div className="absolute top-0 right-0 w-1 h-full bg-white/20"></div>
  </div>
);

// Card Type Icons - with realistic card brand styling
export const getCardTypeIcon = (cardNumber: string) => {
  const cleaned = cardNumber.replace(/\s/g, '');
  if (cleaned.startsWith('4')) {
    return (
      <div className="h-8 w-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded flex items-center justify-center shadow-sm relative overflow-hidden">
        <span className="text-white text-xs font-bold tracking-wider">VISA</span>
        {/* VISA brand elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-white/20"></div>
        <div className="absolute bottom-0 right-0 w-2 h-2 bg-white/30 rounded-full"></div>
      </div>
    );
  } else if (cleaned.startsWith('5')) {
    return (
      <div className="h-8 w-12 bg-gradient-to-r from-red-600 to-red-700 rounded flex items-center justify-center shadow-sm relative overflow-hidden">
        <span className="text-white text-xs font-bold tracking-wider">MC</span>
        {/* Mastercard brand elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-white/20"></div>
        <div className="absolute bottom-0 left-0 w-2 h-2 bg-white/30 rounded-full"></div>
      </div>
    );
  } else if (cleaned.startsWith('6')) {
    return (
      <div className="h-8 w-12 bg-gradient-to-r from-orange-600 to-orange-700 rounded flex items-center justify-center shadow-sm relative overflow-hidden">
        <span className="text-white text-xs font-bold tracking-wider">RUPAY</span>
        {/* RuPay brand elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-white/20"></div>
        <div className="absolute bottom-0 left-0 w-2 h-2 bg-white/30 rounded-full"></div>
      </div>
    );
  }
  return (
    <div className="h-8 w-12 bg-gradient-to-r from-gray-600 to-gray-700 rounded flex items-center justify-center shadow-sm relative overflow-hidden">
      <span className="text-white text-xs font-bold tracking-wider">CARD</span>
      {/* Generic card elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-white/20"></div>
      <div className="absolute bottom-0 left-0 w-2 h-2 bg-white/30 rounded-full"></div>
    </div>
  );
}; 