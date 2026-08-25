import { useOutletContext } from "react-router-dom";
import { HelpCircle, Mail, Phone, ExternalLink } from "lucide-react";

export const CollegeHelpPage = () => {
  const { darkMode } = useOutletContext() || {};

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Help & Support
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Need assistance with the College Management platform? We're here to help.
        </p>
      </div>

      {/* Support Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/40 flex items-center justify-center text-[#ff6d34]">
            <Mail className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Email Support</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Reach out to our technical team for account or platform issues.
          </p>
          <a
            href="mailto:support@uptoskills.com"
            className="inline-flex items-center text-sm font-medium text-[#ff6d34] hover:underline pt-2"
          >
            support@uptoskills.com <ExternalLink className="w-4 h-4 ml-1" />
          </a>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/40 flex items-center justify-center text-[#ff6d34]">
            <Phone className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Direct Helpline</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Contact your dedicated account manager during business hours.
          </p>
          <p className="text-sm font-medium text-gray-900 dark:text-white pt-2">
            +91 (800) 123-4567
          </p>
        </div>
      </div>

      {/* FAQs Placeholder */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 text-gray-900 dark:text-white">
          <HelpCircle className="w-5 h-5 text-[#ff6d34]" />
          <h3 className="font-semibold">Frequently Asked Questions</h3>
        </div>
        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-sm text-gray-600 dark:text-gray-300">
          Detailed documentation and self-service guides are currently being prepared. Check back soon for full access!
        </div>
      </div>
    </div>
  );
};

export default CollegeHelpPage;