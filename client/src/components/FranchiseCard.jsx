import { Link } from 'react-router-dom';

const categoryColors = {
  '외식/패스트푸드': 'bg-orange-500/10 text-orange-400',
  '카페/음료': 'bg-amber-500/10 text-amber-400',
  '헬스/뷰티': 'bg-pink-500/10 text-pink-400',
  '외식/분식': 'bg-red-500/10 text-red-400',
  '교육': 'bg-blue-500/10 text-blue-400',
  '유통/서비스': 'bg-purple-500/10 text-purple-400',
};

const formatMoney = (n) => {
  if (!n) return '협의';
  if (n >= 100000000) return `${(n / 100000000).toFixed(0)}억`;
  return `${(n / 10000).toFixed(0)}만`;
};

const FranchiseCard = ({ franchise, to, onClick }) => {
  const content = (
    <div className="card-hover group h-full flex flex-col">
      {/* Header color bar */}
      <div className="h-1 w-full bg-gradient-to-r from-green-500 to-green-400 rounded-t-xl -mt-5 -mx-5 mb-4 w-[calc(100%+2.5rem)]" style={{ marginTop: '-1.25rem', marginLeft: '-1.25rem', width: 'calc(100% + 2.5rem)', borderRadius: '0.75rem 0.75rem 0 0' }} />

      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-base truncate group-hover:text-green-400 transition-colors">
            {franchise.name}
          </h3>
          <p className="text-gray-500 text-xs mt-0.5 truncate">{franchise.owner_name}</p>
        </div>
        <span className={`shrink-0 text-xs px-2 py-1 rounded-md font-medium ${categoryColors[franchise.category] || 'bg-gray-500/10 text-gray-400'}`}>
          {franchise.category}
        </span>
      </div>

      <p className="text-gray-400 text-sm line-clamp-2 flex-1 mb-4">{franchise.description || '설명 없음'}</p>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-[#0f0f0f] rounded-lg p-2.5">
          <p className="text-[10px] text-gray-600 mb-0.5">창업비용</p>
          <p className="text-sm font-semibold text-white">
            {formatMoney(franchise.investment_min)} ~ {formatMoney(franchise.investment_max)}
          </p>
        </div>
        <div className="bg-[#0f0f0f] rounded-lg p-2.5">
          <p className="text-[10px] text-gray-600 mb-0.5">로열티</p>
          <p className="text-sm font-semibold text-white">{franchise.royalty_rate || 0}%</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {franchise.incubating_available === 1 && (
            <span className="badge-green text-[10px] px-2 py-0.5">인큐베이팅</span>
          )}
          {franchise.application_count > 0 && (
            <span className="text-[10px] text-gray-600">신청 {franchise.application_count}건</span>
          )}
        </div>
        <span className="text-[10px] text-gray-600">{franchise.location || '전국'}</span>
      </div>
    </div>
  );

  if (to) return <Link to={to} className="block h-full">{content}</Link>;
  if (onClick) return <div onClick={onClick} className="h-full">{content}</div>;
  return content;
};

export default FranchiseCard;
