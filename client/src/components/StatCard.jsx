const StatCard = ({ label, value, icon, sub, color = 'green' }) => {
  const colors = {
    green: 'text-green-400 bg-green-500/10 border-green-500/20',
    yellow: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    red: 'text-red-400 bg-red-500/10 border-red-500/20',
  };

  return (
    <div className="card flex items-center gap-4">
      {icon && (
        <div className={`w-11 h-11 rounded-xl border flex items-center justify-center text-xl shrink-0 ${colors[color]}`}>
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <p className="text-gray-500 text-xs font-medium">{label}</p>
        <p className="text-2xl font-bold text-white mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-600 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
};

export default StatCard;
