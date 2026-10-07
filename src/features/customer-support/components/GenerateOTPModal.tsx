import React, { useState } from "react";
import { Modal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";
import { otpApiService } from "../../../services/api/otp-api-service";
import type { OTPPurpose } from "../../../types/otp";
import { Phone, Mail, Key, Clock, CheckCircle, XCircle, ShieldCheck, Copy } from "lucide-react";
import toast from "react-hot-toast";

interface GenerateOTPModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPhoneNumber?: string;
}

export const GenerateOTPModal: React.FC<GenerateOTPModalProps> = ({
  isOpen,
  onClose,
  defaultPhoneNumber = "",
}) => {
  const [phoneNumber, setPhoneNumber] = useState(defaultPhoneNumber);
  const [email, setEmail] = useState("");
  const [purpose, setPurpose] = useState<OTPPurpose>("LOGIN");
  const [loading, setLoading] = useState(false);
  const [generatedOTP, setGeneratedOTP] = useState<{
    otpCode: string;
    expiresAt: string;
    expiryMinutes: number;
    smsSent: boolean;
    emailSent: boolean;
  } | null>(null);

  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^\+255[67]\d{8}$/;
    return phoneRegex.test(phone);
  };

  const handleGenerateOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePhoneNumber(phoneNumber)) {
      toast.error("Invalid phone number. Must be in format: +255[6-7]XXXXXXXX");
      return;
    }

    setLoading(true);
    try {
      const response = await otpApiService.generateOTP({
        phoneNumber,
        email: email || null,
        purpose,
      });

      setGeneratedOTP(response.data);
      toast.success(response.message);
    } catch (error: any) {
      if (error.message.includes("does not exist")) {
        toast.error(
          "User not found. Please check the phone number or use REGISTRATION purpose.",
        );
      } else {
        toast.error(error.message || "Failed to generate OTP");
      }
      console.error("Error generating OTP:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPhoneNumber(defaultPhoneNumber);
    setEmail("");
    setPurpose("LOGIN");
    setGeneratedOTP(null);
    onClose();
  };

  const formatExpiryTime = (expiresAt: string) => {
    const date = new Date(expiresAt);
    return date.toLocaleString();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("OTP copied to clipboard!");
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Generate OTP for User">
      {!generatedOTP ? (
        <form onSubmit={handleGenerateOTP} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+255712345678"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Format: +255[6-7]XXXXXXXX (Tanzanian number)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email (Optional)
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              OTP will also be sent to this email if provided
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Purpose *
            </label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value as OTPPurpose)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="LOGIN">LOGIN - User must exist</option>
              <option value="REGISTRATION">REGISTRATION - New user</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              {purpose === "LOGIN"
                ? "User must exist in the system for LOGIN purpose"
                : "Use REGISTRATION for new users who don't exist yet"}
            </p>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-primary-100 bg-primary-50 p-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
              <Clock className="w-4 h-4 text-primary-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-primary-900">
                OTP Validity
              </p>
              <p className="text-xs text-primary-700 mt-0.5">
                Generated OTP will be valid for 60 minutes
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={loading} className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              {loading ? "Generating..." : "Generate OTP"}
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-6 animate-fade-in">
          {/* Success Message */}
          <div className="flex items-center gap-2 rounded-xl border border-success-200 bg-success-50 p-4">
            <CheckCircle className="w-5 h-5 text-success-600" />
            <p className="text-sm font-medium text-success-900">
              OTP Generated Successfully!
            </p>
          </div>

          {/* OTP Code Display */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 p-6 text-center shadow-large">
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <div className="relative flex items-center justify-center space-x-2 mb-3">
              <ShieldCheck className="w-5 h-5 text-primary-100" />
              <label className="text-sm font-medium uppercase tracking-wide text-primary-100">
                OTP Code
              </label>
            </div>
            <div className="relative flex items-center justify-center gap-2">
              {generatedOTP.otpCode.split("").map((digit, i) => (
                <span
                  key={i}
                  className="flex h-14 w-11 items-center justify-center rounded-lg bg-white/15 text-3xl font-bold text-white ring-1 ring-inset ring-white/20 font-mono"
                >
                  {digit}
                </span>
              ))}
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(generatedOTP.otpCode)}
              className="relative mt-4 inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/25"
            >
              <Copy className="h-3.5 w-3.5" />
              Copy code
            </button>
          </div>

          {/* Details */}
          <div className="space-y-1 rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="flex items-center gap-2 text-sm text-gray-600"><Phone className="h-4 w-4 text-gray-400" />Phone Number</span>
              <span className="text-sm font-medium text-gray-900">
                {phoneNumber}
              </span>
            </div>

            {email && (
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="flex items-center gap-2 text-sm text-gray-600"><Mail className="h-4 w-4 text-gray-400" />Email</span>
                <span className="text-sm font-medium text-gray-900">
                  {email}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Purpose</span>
              <span className="inline-flex items-center rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-semibold text-primary-800">
                {purpose}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="flex items-center gap-2 text-sm text-gray-600"><Clock className="h-4 w-4 text-gray-400" />Expires At</span>
              <span className="text-sm font-medium text-gray-900">
                {formatExpiryTime(generatedOTP.expiresAt)}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Valid For</span>
              <span className="text-sm font-medium text-gray-900">
                {generatedOTP.expiryMinutes} minutes
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">SMS Sent</span>
              <span className="flex items-center space-x-1">
                {generatedOTP.smsSent ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-success-600" />
                    <span className="text-sm font-medium text-success-600">
                      Yes
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-danger-600" />
                    <span className="text-sm font-medium text-danger-600">No</span>
                  </>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">Email Sent</span>
              <span className="flex items-center space-x-1">
                {generatedOTP.emailSent ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-success-600" />
                    <span className="text-sm font-medium text-success-600">
                      Yes
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-danger-600" />
                    <span className="text-sm font-medium text-danger-600">No</span>
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-3 rounded-xl border border-warning-200 bg-warning-50 p-4">
            <Clock className="w-5 h-5 text-warning-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-warning-900">Important</p>
              <p className="text-xs text-warning-700 mt-1">
                Please share this OTP with the user immediately. It will
                expire in {generatedOTP.expiryMinutes} minutes.
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="ghost" onClick={handleClose}>
              Close
            </Button>
            <Button
              onClick={() => {
                setGeneratedOTP(null);
                setPhoneNumber(defaultPhoneNumber);
                setEmail("");
                setPurpose("LOGIN");
              }}
            >
              Generate Another OTP
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
