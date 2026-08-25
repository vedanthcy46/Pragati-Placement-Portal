import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Building,
  Bell,
  Sun,
  Moon,
  Shield,
  Lock,
  Loader2,
  AlertCircle,
  Edit2,
  Check,
  X,
  KeyRound,
} from "lucide-react";
import { getProfile, updateProfile, changePassword } from "../../services/collegeService";

export const CollegeSettingsPage = () => {
  const context = useOutletContext() || {};
  const darkMode = context.darkMode ?? false;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Profile Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [formData, setFormData] = useState({
    college_name: "",
    email: "",
    phone: "",
    address: "",
  });

  // Password Modal State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passData, setPassData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState(null);
  const [passSuccess, setPassSuccess] = useState(null);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getProfile();
      const data = res?.data || res || {};

      setProfile(data);
      setFormData({
        college_name: data?.name || data?.college_name || "",
        email: data?.email || data?.contact_email || "",
        phone: data?.phone || data?.contact_phone || "",
        address: data?.address || "",
      });
    } catch (err) {
      console.error("Failed to load college profile settings:", err);
      setError("Unable to load profile settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMsg("");

      const payload = {
        name: formData.college_name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
      };

      const res = await updateProfile(payload);
      const updatedData = res?.data || res;

      if (updatedData) {
        setProfile(updatedData);
        setFormData({
          college_name: updatedData?.name || updatedData?.college_name || formData.college_name,
          email: updatedData?.email || updatedData?.contact_email || formData.email,
          phone: updatedData?.phone || updatedData?.contact_phone || formData.phone,
          address: updatedData?.address || formData.address,
        });
        setIsEditing(false);
        setSuccessMsg("Profile updated successfully!");
        setTimeout(() => setSuccessMsg(""), 4000);
      } else {
        setError(res?.message || "Failed to update profile. Server returned an error.");
      }
    } catch (err) {
      console.error("Failed to update profile:", err);
      setError(err?.response?.data?.message || "Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
    setFormData({
      college_name: profile?.college_name || profile?.name || "",
      email: profile?.email || profile?.contact_email || "",
      phone: profile?.phone || profile?.contact_phone || "",
      address: profile?.address || "",
    });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);

    if (passData.newPassword !== passData.confirmPassword) {
      setPassError("New passwords do not match.");
      return;
    }

    if (passData.newPassword.length < 6) {
      setPassError("Password must be at least 6 characters long.");
      return;
    }

    try {
      setPassLoading(true);
      const res = await changePassword({
        currentPassword: passData.currentPassword,
        newPassword: passData.newPassword,
      });

      if (!res || res.success === false) {
        setPassError(res?.message || "Incorrect current password.");
        return;
      }

      setPassSuccess("Password updated successfully!");
      setPassData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setPassSuccess(null);
      }, 1500);
    } catch (err) {
      setPassError(
        err?.response?.data?.message || err?.message || "Failed to change password. Please verify current password."
      );
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          College Settings
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage your institution profile, notifications, security, and preferences.
        </p>
      </div>

      {/* A. College Profile Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
          <div className="flex items-center space-x-2 text-gray-900 dark:text-white">
            <Building className="w-5 h-5 text-[#ff6d34]" />
            <h2 className="text-lg font-semibold">College Profile</h2>
          </div>

          {!loading && !error && (
            <div>
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                  >
                    <X className="w-3.5 h-3.5" /> Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-[#ff6d34] rounded-lg hover:bg-[#e05b28] transition disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    Save Changes
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#ff6d34] bg-orange-50 dark:bg-orange-950/40 rounded-lg border border-orange-200 dark:border-orange-900 hover:bg-orange-100 transition"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit Profile
                </button>
              )}
            </div>
          )}
        </div>

        {/* Feedback Messages */}
        {successMsg && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
            <Check className="w-4 h-4" /> {successMsg}
          </div>
        )}

        {loading ? (
          <div className="flex items-center space-x-2 text-gray-500 py-4">
            <Loader2 className="w-5 h-5 animate-spin text-[#ff6d34]" />
            <span className="text-sm">Loading college profile details...</span>
          </div>
        ) : error ? (
          <div className="flex items-center space-x-2 text-red-500 py-4 text-sm">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm pt-2">
            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                College Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="college_name"
                  value={formData.college_name}
                  onChange={handleInputChange}
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff6d34]"
                />
              ) : (
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl font-medium text-gray-800 dark:text-gray-200">
                  {profile?.college_name || profile?.name || "N/A"}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                Contact Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff6d34]"
                />
              ) : (
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl font-medium text-gray-800 dark:text-gray-200">
                  {profile?.email || profile?.contact_email || "N/A"}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff6d34]"
                />
              ) : (
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl font-medium text-gray-800 dark:text-gray-200">
                  {profile?.phone || profile?.contact_phone || "N/A"}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                Address / Location
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff6d34]"
                />
              ) : (
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl font-medium text-gray-800 dark:text-gray-200">
                  {profile?.address || "N/A"}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* B. Account & Security Settings */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3">
          <Shield className="w-5 h-5 text-[#ff6d34]" />
          <h2 className="text-lg font-semibold">Account & Security</h2>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-gray-400" /> Change Password
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Update your account password periodically to enhance security.
            </p>
          </div>
          <button
            onClick={() => setIsPasswordModalOpen(true)}
            className="px-3 py-1.5 text-xs font-semibold text-[#ff6d34] bg-orange-50 dark:bg-orange-950/40 rounded-lg border border-orange-200 dark:border-orange-900 hover:bg-orange-100 transition"
          >
            Update Password
          </button>
        </div>
      </div>

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-700 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
              <div className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold">
                <KeyRound className="w-5 h-5 text-[#ff6d34]" />
                <h3>Change Account Password</h3>
              </div>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {passError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passError}</span>
              </div>
            )}

            {passSuccess && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 text-xs rounded-xl flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{passSuccess}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={passData.currentPassword}
                  onChange={(e) => setPassData({ ...passData, currentPassword: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff6d34]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={passData.newPassword}
                  onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff6d34]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={passData.confirmPassword}
                  onChange={(e) => setPassData({ ...passData, confirmPassword: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff6d34]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passLoading}
                  className="px-4 py-2 text-xs font-medium text-white bg-[#ff6d34] rounded-xl hover:bg-[#e05b28] transition flex items-center gap-1 disabled:opacity-50"
                >
                  {passLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* C. Notification Preferences */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3">
          <Bell className="w-5 h-5 text-[#ff6d34]" />
          <h2 className="text-lg font-semibold">Notification Preferences</h2>
        </div>

        <div className="space-y-3">
          {[
            { title: "Email Notifications", desc: "Receive email summaries for new notices and updates." },
            { title: "Placement Drive Alerts", desc: "Instant updates on company applications and schedule changes." },
            { title: "Student Submissions", desc: "Notifications when students submit required nomination documents." },
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-700 opacity-60">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{item.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
              </div>
              <span className="text-xs text-gray-400 font-medium">Disabled (Coming Soon)</span>
            </div>
          ))}
        </div>
      </div>

      {/* D. Appearance Settings */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3">
          {darkMode ? (
            <Moon className="w-5 h-5 text-[#ff6d34]" />
          ) : (
            <Sun className="w-5 h-5 text-[#ff6d34]" />
          )}
          <h2 className="text-lg font-semibold">Appearance</h2>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Active Theme Mode</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Currently utilizing system layout preferences.
            </p>
          </div>
          <span className="px-3 py-1 text-xs font-semibold text-[#ff6d34] bg-orange-50 dark:bg-orange-950/40 rounded-full border border-orange-200 dark:border-orange-900">
            {darkMode ? "Dark Mode Active" : "Light Mode Active"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CollegeSettingsPage;