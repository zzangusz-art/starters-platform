import Sidebar from './Sidebar';

const Layout = ({ children, title, subtitle, actions }) => (
  <div className="flex min-h-screen bg-brand-black">
    <Sidebar />
    <main className="flex-1 ml-60">
      {(title || actions) && (
        <div className="sticky top-0 z-20 bg-[#080808]/90 backdrop-blur border-b border-[#1a1a1a] px-8 py-4 flex items-center justify-between">
          <div>
            {title && <h1 className="text-xl font-bold text-white">{title}</h1>}
            {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>
      )}
      <div className="p-8">{children}</div>
    </main>
  </div>
);

export default Layout;
