
import React, { useState, useEffect } from 'react';
import { DIMENSIONS } from '../constants';
import { SurveyResponse } from '../types';
import AgileRadarChart from './RadarChart';
import { analyzeFeedback } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  responses: SurveyResponse[];
}

const Dashboard: React.FC<DashboardProps> = ({ responses }) => {
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const calculateStats = () => {
    if (responses.length === 0) return null;

    const totals: Record<string, number> = {};
    DIMENSIONS.forEach(d => (totals[d.id] = 0));

    // Fix: Cast score as number to resolve 'unknown' type error in += operation when iterating over scores
    responses.forEach(r => {
      Object.entries(r.scores).forEach(([id, score]) => {
        if (id in totals) {
          totals[id] += (score as number);
        }
      });
    });

    const averages = Object.entries(totals).map(([id, total]) => ({
      subject: DIMENSIONS.find(d => d.id === id)?.title.split(' ')[0] || id,
      A: Number((total / responses.length).toFixed(2)),
      fullMark: 5
    }));

    const overallScore = averages.reduce((acc, curr) => acc + curr.A, 0) / averages.length;
    const percentage = ((overallScore / 5) * 100).toFixed(1);

    return { averages, overallScore, percentage };
  };

  const stats = calculateStats();

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    const result = await analyzeFeedback(responses);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  if (!stats) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-dashed border-gray-300">
        <h2 className="text-xl text-gray-500">Henüz yanıt alınmadı.</h2>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-indigo-600 p-8 rounded-3xl text-white shadow-xl flex flex-col justify-center items-center text-center">
          <h3 className="text-lg font-medium opacity-90 mb-2">Genel Agile Liderlik Skoru</h3>
          <div className="text-6xl font-black mb-2">{stats.percentage}%</div>
          <div className="text-sm opacity-75">100 üzerinden normalize edilmiş değer</div>
        </div>
        
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-center items-center">
          <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Katılımcı Sayısı</h3>
          <div className="text-5xl font-extrabold text-gray-800">{responses.length}</div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-center items-center">
          <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Ortalama Puan</h3>
          <div className="text-5xl font-extrabold text-gray-800">{stats.overallScore.toFixed(2)}<span className="text-lg text-gray-400">/5</span></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Yetkinlik Radar Analizi</h3>
          <AgileRadarChart data={stats.averages} />
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Boyut Bazlı Karşılaştırma</h3>
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.averages} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 5]} hide />
                <YAxis dataKey="subject" type="category" width={100} style={{ fontSize: '12px' }} />
                <Tooltip />
                <Bar dataKey="A" radius={[0, 4, 4, 0]}>
                  {stats.averages.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.A > 4 ? '#10b981' : entry.A > 3 ? '#4f46e5' : '#f59e0b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">Yapay Zeka (Gemini) Analizi</h3>
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="px-6 py-2 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition-all disabled:opacity-50"
          >
            {isAnalyzing ? 'Analiz Ediliyor...' : 'Geri Bildirimleri Analiz Et'}
          </button>
        </div>
        
        {aiAnalysis ? (
          <div className="prose prose-indigo max-w-none bg-indigo-50 p-6 rounded-2xl border border-indigo-100 text-gray-700 whitespace-pre-wrap">
            {aiAnalysis}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-400 italic">
            Katılımcıların metin tabanlı geri bildirimlerini özetlemek için analiz butonuna basın.
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['stopDoing', 'startDoing', 'keepDoing'].map((type) => (
            <div key={type} className="bg-white p-6 rounded-3xl shadow border border-gray-100">
              <h4 className="text-lg font-bold text-gray-800 mb-4 capitalize">
                {type === 'stopDoing' ? 'Bırakılması Gerekenler' : type === 'startDoing' ? 'Başlanması Gerekenler' : 'Devam Edilmesi Gerekenler'}
              </h4>
              <ul className="space-y-3">
                {responses
                  .map(r => r.feedback[type as keyof typeof r.feedback])
                  .filter(Boolean)
                  .slice(0, 5)
                  .map((text, i) => (
                    <li key={i} className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 italic">
                      "{text}"
                    </li>
                  ))}
                {responses.length === 0 && <li className="text-gray-400">Henüz veri yok.</li>}
              </ul>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Dashboard;
