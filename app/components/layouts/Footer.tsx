import React from "react";
import ServerStatusIndicator from "~/components/system/ServerNetworkIndicator";
import pkg from "~/../package.json"; // adjust path if Footer is nested

const Footer: React.FC = () => (
  <footer className="bg-gray-200 backdrop-blur-lg border-t border-white/30 p-4 flex items-center justify-between">
    <p className="text-sm text-gray-600">Malawi Integrated Data System &copy; {new Date().getFullYear()}</p>
    
    <div className="flex items-center space-x-4">
      {/* App Version */}
      <span className="text-sm text-gray-600">v {pkg.version}</span>

      {/* Vertical divider */}
      <span className="border-l border-gray-400 h-5" />

      {/* Server/Network Indicator */}
      <ServerStatusIndicator showServerIndicator showNetworkIndicator={false} />
    </div>

    {/* Right side content (optional) */}
  </footer>
);

export default Footer;
