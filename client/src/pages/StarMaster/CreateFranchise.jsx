import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api';

const categories = ['외식/패스트푸드', '외식/분식', '카페/음료', '헬스/뷰티', '교육', '유통/서비스', '기타'];

const CreateFranchise = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: '', category: '', description: '', business_description: '',
    investment_min: '', investment_max: '', royalty_rate: '',
    location: '', requirements: '', incubating_available: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      api.get(`/franchises/${id}`).then(r => {
        const f = r.data;
        setForm({
          name: f.name || '', category: f.category || '', description: f.description || '',
          business_description: f.business_description || '', investment_min: f.investment_min || '',
          investment_max: f.investment_max || '', royalty_rate: f.royalty_rate || '',
          location: f.location || '', requirements: f.requirements || '',
          incubating_available: f.incubating_available === 1,
        });
      });
    }
  }, [id, isEdit]);

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.category) { setError('브랜드명과 카테고리는 필수입니다.'); return; }
    setError('');
    setLoading(true);
    try {
      const payload = {
        ...form,
        investment_min: Number(form.investment_min) || 0,
        investment_max: Number(form.investment_max) || 0,
        royalty_rate: Number(form.royalty_rate) || 0,
      };
      if (isEdit) {
        await api.put(`/franchises/${id}`, payload);
      } else {
        await api.post('/franchises', payload);
      }
      navigate('/master/franchises');
    } catch (err) {
      setError(err.response?.data?.message || '저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title={isEdit ? '프랜차이즈 수정' : '프랜차이즈 등록'} subtitle={isEdit ? '프랜차이즈 정보를 수정합니다' : '새 프랜차이즈를 등록하세요'}>
      <div className="max-w-2xl">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg px-4 py-3 text-sm mb-6">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="card space-y-4">
            <h3 className="font-bold text-white text-sm border-b border-[#1f1f1f] pb-3">기본 정보</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">브랜드명 *</label>
                <input type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder="예: 버거스타" className="input" required />
              </div>
              <div>
                <label className="label">카테고리 *</label>
                <select value={form.category} onChange={e => set('category', e.target.value)} className="input" required>
                  <option value="">선택하세요</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="label">한 줄 소개</label>
              <input type="text" value={form.description} onChange={e => set('description', e.target.value)} placeholder="브랜드를 한 줄로 소개해주세요" className="input" />
            </div>
            <div>
              <label className="label">상세 설명</label>
              <textarea value={form.business_description} onChange={e => set('business_description', e.target.value)} placeholder="브랜드 철학, 경쟁력, 지원 사항 등을 상세히 작성해주세요" className="input min-h-[100px] resize-none" rows={4} />
            </div>
          </div>

          {/* Investment */}
          <div className="card space-y-4">
            <h3 className="font-bold text-white text-sm border-b border-[#1f1f1f] pb-3">투자 조건</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">최소 창업비용 (원)</label>
                <input type="number" value={form.investment_min} onChange={e => set('investment_min', e.target.value)} placeholder="30000000" className="input" />
              </div>
              <div>
                <label className="label">최대 창업비용 (원)</label>
                <input type="number" value={form.investment_max} onChange={e => set('investment_max', e.target.value)} placeholder="60000000" className="input" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">로열티 (%)</label>
                <input type="number" step="0.1" value={form.royalty_rate} onChange={e => set('royalty_rate', e.target.value)} placeholder="5.0" className="input" />
              </div>
              <div>
                <label className="label">운영 지역</label>
                <input type="text" value={form.location} onChange={e => set('location', e.target.value)} placeholder="전국, 수도권 등" className="input" />
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="card space-y-4">
            <h3 className="font-bold text-white text-sm border-b border-[#1f1f1f] pb-3">가맹 조건</h3>
            <div>
              <label className="label">자격 요건</label>
              <textarea value={form.requirements} onChange={e => set('requirements', e.target.value)} placeholder="가맹 희망자에게 필요한 조건을 작성해주세요" className="input resize-none" rows={3} />
            </div>
            <div className="flex items-center gap-3 p-4 bg-purple-500/5 border border-purple-500/20 rounded-lg">
              <input
                type="checkbox"
                id="incubating"
                checked={form.incubating_available}
                onChange={e => set('incubating_available', e.target.checked)}
                className="w-4 h-4 accent-purple-500"
              />
              <div>
                <label htmlFor="incubating" className="text-white text-sm font-medium cursor-pointer">인큐베이팅 프로그램 운영</label>
                <p className="text-gray-500 text-xs mt-0.5">체크 시 스타메이커의 인큐베이팅 신청이 가능해집니다</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => navigate('/master/franchises')} className="btn-ghost flex-1 justify-center py-3">취소</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center py-3 disabled:opacity-50">
              {loading ? '저장 중...' : (isEdit ? '수정 완료' : '등록하기')}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CreateFranchise;
