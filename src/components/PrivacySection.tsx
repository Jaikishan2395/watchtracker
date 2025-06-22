import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Server, Eye, Link2, Shield, Lock } from "lucide-react";

export function PrivacySection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Privacy & Data Storage</CardTitle>
        <CardDescription>
          Learn about how your data is stored and protected
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Data Storage Section */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100/80 dark:bg-blue-900/30 p-2.5 rounded-lg">
              <Server className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Data Storage</h3>
              <div className="space-y-3 text-sm text-gray-600 dark:text-slate-300">
                <p>All your data is stored locally in your browser using localStorage. This means:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Your data never leaves your device</li>
                  <li>No data is sent to external servers</li>
                  <li>Data persists between browser sessions</li>
                  <li>Data is cleared when you clear browser data</li>
                </ul>
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          {/* App Capabilities */}
          <div className="flex items-start gap-3">
            <div className="bg-yellow-100/80 dark:bg-yellow-900/30 p-2.5 rounded-lg">
              <Eye className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">App Capabilities</h3>
              <div className="space-y-3 text-sm text-gray-600 dark:text-slate-300">
                <p>As a web application, Watch can:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Track time spent within Watch</li>
                  <li>Store your watch history and preferences</li>
                  <li>Provide focus timers and reminders</li>
                  <li>Save your progress and achievements</li>
                </ul>
                <p className="mt-2 font-medium">Limitations:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Cannot monitor other websites you visit</li>
                  <li>Cannot block or redirect to other websites</li>
                  <li>Cannot access browser tabs or system settings</li>
                </ul>
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Browser Extension Option */}
          <div className="flex items-start gap-3">
            <div className="bg-green-100/80 dark:bg-green-900/30 p-2.5 rounded-lg">
              <Link2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Browser Extension</h3>
              <div className="space-y-3 text-sm text-gray-600 dark:text-slate-300">
                <p>For enhanced features, consider using our browser extension:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Monitor time spent on different websites</li>
                  <li>Set up website blocking during focus sessions</li>
                  <li>Track browsing habits (with your consent)</li>
                  <li>Sync data with Watch (optional)</li>
                </ul>
                <div className="mt-4 p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Note:</strong> The extension requires explicit permission to access browser data. 
                    All data is stored locally unless you choose to sync with Watch.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Privacy Protection */}
          <div className="flex items-start gap-3">
            <div className="bg-purple-100/80 dark:bg-purple-900/30 p-2.5 rounded-lg">
              <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Privacy Protection</h3>
              <div className="space-y-3 text-sm text-gray-600 dark:text-slate-300">
                <p>Your privacy is our priority:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>No data is shared with third parties</li>
                  <li>No analytics or tracking</li>
                  <li>No user accounts required</li>
                  <li>Complete control over your data</li>
                  <li>Easy data reset option available</li>
                </ul>
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Data Control */}
          <div className="flex items-start gap-3">
            <div className="bg-red-100/80 dark:bg-red-900/30 p-2.5 rounded-lg">
              <Lock className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Control</h3>
              <div className="space-y-3 text-sm text-gray-600 dark:text-slate-300">
                <p>You have complete control over your data:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Reset all data at any time</li>
                  <li>Clear individual playlists</li>
                  <li>Export your data (coming soon)</li>
                  <li>Manage watch history</li>
                  <li>Control notification preferences</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Privacy Note */}
        <div className="mt-6 p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
          <p className="text-sm">
            <strong className="text-blue-900 dark:text-blue-200 font-semibold">Important:</strong>
            <span className="text-blue-800 dark:text-blue-100 ml-1">
              Watch is a client-side application that runs entirely in your browser. While we take privacy seriously, 
              please be aware that this means we cannot monitor or block other websites you visit. For enhanced features 
              like website monitoring and blocking, please consider using our browser extension.
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 