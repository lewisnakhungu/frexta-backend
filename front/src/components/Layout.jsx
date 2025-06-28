import React, { useState } from 'react';
import SideBar from "./SideBar";
import { Outlet } from 'react-router-dom';

const Layout = ({children}) => {
    const [isExpanded, setIsExpanded] = useState(true);
   
  return (
    <div className="flex">
      <SideBar
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
        onToggle={(state) => console.log('Sidebar toggled:', state)}
        onExpand={() => console.log('Expanded')}
        onCollapse={() => console.log('Collapsed')}
      />
      <main className="flex-1 overflow-y-auto p-6">{children}
        <Outlet/>
      </main>
    </div>
  );
};

export default Layout;