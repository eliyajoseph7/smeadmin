import React, { useState } from "react";
import { Modal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";
import { otpApiService } from "../../../services/api/otp-api-service";
import type { OTPPurpose } from "../../../types/otp";
import { Phone, Mail, Key, Clock, CheckCircle, XCircle } from "lucide-react";
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  OTP Validity
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Generated OTP will be valid for 60 minutes
                </p>
              </div>
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
            <Button type="submit" disabled={loading}>
              {loading ? "Generating..." : "Generate OTP"}
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          {/* Success Message */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-sm font-medium text-green-900">
                OTP Generated Successfully!
              </p>
            </div>
          </div>

          {/* OTP Code Display */}
          <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-6 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Key className="w-5 h-5 text-gray-600" />
              <label className="text-sm font-medium text-gray-700">
                OTP Code
              </label>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <p className="text-4xl font-bold text-gray-900 tracking-wider font-mono">
                {generatedOTP.otpCode}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(generatedOTP.otpCode)}
              >
                Copy
              </Button>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm text-gray-600">Phone Number</span>
              <span className="text-sm font-medium text-gray-900">
                {phoneNumber}
              </span>
            </div>

            {email && (
              <div className="flex items-center justify-between py-2 border-b border-gray-200">
                <span className="text-sm text-gray-600">Email</span>
                <span className="text-sm font-medium text-gray-900">
                  {email}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm text-gray-600">Purpose</span>
              <span className="text-sm font-medium text-gray-900">
                {purpose}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm text-gray-600">Expires At</span>
              <span className="text-sm font-medium text-gray-900">
                {formatExpiryTime(generatedOTP.expiresAt)}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm text-gray-600">Valid For</span>
              <span className="text-sm font-medium text-gray-900">
                {generatedOTP.expiryMinutes} minutes
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm text-gray-600">SMS Sent</span>
              <span className="flex items-center space-x-1">
                {generatedOTP.smsSent ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-600">
                      Yes
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium text-red-600">No</span>
                  </>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm text-gray-600">Email Sent</span>
              <span className="flex items-center space-x-1">
                {generatedOTP.emailSent ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-600">
                      Yes
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium text-red-600">No</span>
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-900">Important</p>
                <p className="text-xs text-yellow-700 mt-1">
                  Please share this OTP with the user immediately. It will
                  expire in {generatedOTP.expiryMinutes} minutes.
                </p>
              </div>
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
