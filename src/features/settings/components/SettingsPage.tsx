import React, { useState, useEffect } from "react";
import { PageHeader } from "../../../components/layout/PageHeader";
import { Card } from "../../../components/ui/Card";
import {
  Settings,
  Package,
  Tag,
  CreditCard,
  Crown,
  Smartphone,
} from "lucide-react";
import { UnitOfMeasureManager } from "./UnitOfMeasureManager";
import { CategoryManager } from "./CategoryManager";
import { DiscountOptionsManager } from "./DiscountOptionsManager";
import { SubscriptionPlansManager } from "./SubscriptionPlansManager";
import { VersionCheckManager } from "./VersionCheckManager";

type SettingsTab =
  | "units"
  | "categories"
  | "discounts"
  | "subscriptions"
  | "versions";

const SETTINGS_ACTIVE_TAB_KEY = 'smeadmin_settings_active_tab';

export const SettingsPage: React.FC = () => {
  // Initialize activeTab from localStorage or default to "units"
  const [activeTab, setActiveTab] = useState<SettingsTab>(() => {
    if (typeof window !== 'undefined') {
      const savedTab = localStorage.getItem(SETTINGS_ACTIVE_TAB_KEY) as SettingsTab;
      return savedTab && ['units', 'categories', 'discounts', 'subscriptions', 'versions'].includes(savedTab) 
        ? savedTab 
        : 'units';
    }
    return 'units';
  });

  // Save activeTab to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SETTINGS_ACTIVE_TAB_KEY, activeTab);
    }
  }, [activeTab]);

  const tabs = [
    {
      id: "units" as SettingsTab,
      name: "Units of Measure",
      icon: Package,
      description: "Manage product units of measure",
    },
    {
      id: "categories" as SettingsTab,
      name: "Categories",
      icon: Tag,
      description: "Manage product categories",
    },
    {
      id: "discounts" as SettingsTab,
      name: "Discount Options",
      icon: CreditCard,
      description: "Manage billing discounts",
    },
    {
      id: "subscriptions" as SettingsTab,
      name: "Subscription Plans",
      icon: Crown,
      description: "Manage subscription plans",
    },
    {
      id: "versions" as SettingsTab,
      name: "Version Check",
      icon: Smartphone,
      description: "Manage app version checks",
    },
  ];

  return (
    <>
      {/* Page Header */}
      <PageHeader
        title="Settings"
        description="Manage your product settings and configurations"
        icon={Settings}
      />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 px-2 py-8">
        {/* Left Sidebar - Navigation */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Product Settings
            </h3>
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                      activeTab === tab.id
                        ? "bg-primary-50 text-primary-700 border border-primary-200"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        activeTab === tab.id
                          ? "text-primary-600"
                          : "text-gray-500"
                      }`}
                    />
                    <div>
                      <div className="font-medium text-sm">{tab.name}</div>
                      <div className="text-xs text-gray-500">
                        {tab.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </Card>
        </div>

        {/* Right Content Area */}
        <div className="lg:col-span-3">
          {activeTab === "units" && <UnitOfMeasureManager />}
          {activeTab === "categories" && <CategoryManager />}
          {activeTab === "discounts" && <DiscountOptionsManager />}
          {activeTab === "subscriptions" && <SubscriptionPlansManager />}
          {activeTab === "versions" && <VersionCheckManager />}
        </div>
      </div>
    </>
  );
};
