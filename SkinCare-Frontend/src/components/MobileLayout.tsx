import React from 'react';

interface MobileLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ children, className = '' }) => {
  return (
    <div className={`min-h-screen bg-white ${className}`}>
      {/* Safe area for mobile devices */}
      <div className="safe-area-inset-top safe-area-inset-bottom">
        {children}
      </div>
    </div>
  );
};

export default MobileLayout;