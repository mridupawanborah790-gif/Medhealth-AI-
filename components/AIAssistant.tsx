import React from 'react';
import { HealthProfile } from '../types';

interface AIAssistantProps {
  profile: HealthProfile;
  onClose: () => void;
}

const avatarSrc = `https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80`;
const customerSrc = `https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80`;

export const AIAssistant: React.FC<AIAssistantProps> = ({ profile, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 animate-fadeIn bg-gradient-to-br from-rose-200 via-pink-200 to-orange-300 p-4">
      <div className="mx-auto flex h-full w-full max-w-5xl items-center justify-center">
        <button
          onClick={onClose}
          className="absolute right-6 top-4 rounded-full bg-black/20 px-3 py-1 text-3xl font-bold text-white hover:bg-black/30"
          aria-label="Close"
        >
          &times;
        </button>

        <div className="relative w-full max-w-sm rounded-[3rem] border-[10px] border-slate-900 bg-[#ececf0] shadow-2xl">
          <div className="mx-auto mt-3 h-1.5 w-24 rounded-full bg-slate-700" />
          <div className="px-4 pb-8 pt-6">
            <div className="mb-8 text-center">
              <img src={customerSrc} alt="Customer service" className="mx-auto h-20 w-20 rounded-full object-cover" />
              <h2 className="mt-4 text-5xl font-semibold tracking-tight text-slate-900" style={{ fontSize: '2.2rem', lineHeight: '1.05' }}>
                Customer
                <br />
                Service
              </h2>
              <p className="mt-2 text-xs text-slate-500">Hi {profile.name}, welcome to Questions & Answers</p>
            </div>

            <div className="space-y-6 text-slate-800">
              <div className="relative rounded-2xl rounded-tr-md bg-white px-5 py-4 shadow">
                <p className="text-2xl" style={{ fontSize: '1.7rem' }}>What is the expected duration for the shipment?</p>
                <span className="absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 rotate-45 bg-white" />
              </div>

              <div className="relative rounded-2xl rounded-tl-md bg-rose-100 px-5 py-4 shadow">
                <p className="text-2xl" style={{ fontSize: '1.7rem' }}>
                  Your order will be delivered within 4-6 business days from the payment date.
                </p>
                <span className="absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rotate-45 bg-rose-100" />
              </div>

              <div className="relative rounded-2xl rounded-tr-md bg-white px-5 py-4 shadow">
                <p className="text-2xl" style={{ fontSize: '1.7rem' }}>
                  thanks for the speedy reply. Have a great day!
                </p>
                <span className="absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 rotate-45 bg-white" />
              </div>
            </div>

            <p className="mt-8 text-center text-4xl font-medium text-slate-900" style={{ fontSize: '2rem' }}>
              Questions &amp; Answers
            </p>
          </div>

          <img
            src={customerSrc}
            alt="Customer"
            className="absolute -left-16 top-[48%] h-14 w-14 rounded-full border-4 border-white object-cover shadow"
          />
          <img
            src={avatarSrc}
            alt="Agent"
            className="absolute -right-16 top-[38%] h-14 w-14 rounded-full border-4 border-white object-cover shadow"
          />
          <img
            src={avatarSrc}
            alt="Agent"
            className="absolute -right-16 top-[70%] h-14 w-14 rounded-full border-4 border-white object-cover shadow"
          />
        </div>
      </div>
    </div>
  );
};
