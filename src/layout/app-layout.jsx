import React from 'react'
import { Outlet } from 'react-router-dom'
import { Toaster } from 'sonner'
const AppLayout = () => {

  const BackgroundBeams = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Moving Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      
      {/* Top Center Glow (The "Aurora") */}
      <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-white opacity-20 blur-[100px]"></div>
    </div>
  );
};
    
  return (
    <div>

       
        
        <main className='min-h-screen w-full'>
        
            <Toaster 
              position="bottom-right" 
              toastOptions={{
                style: {
                  background: '#0c0a09', // stone-950
                  border: '1px solid #292524', // stone-800
                  color: '#fafaf9', // stone-50
                  boxShadow: '0 0 20px -5px rgba(0, 0, 0, 0.5)',
                  fontSize: '0.875rem',
                },
                className: 'font-sans',
              }}
            />
         <Outlet/>

        </main>
    </div>
  )
}

export default AppLayout