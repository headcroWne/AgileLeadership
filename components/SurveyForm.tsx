
import React, { useState } from 'react';
import { DIMENSIONS, OPEN_QUESTIONS } from '../constants';
import { SurveyResponse } from '../types';

interface SurveyFormProps {
  onSubmit: (response: SurveyResponse) => void;
}

const SurveyForm: React.FC<SurveyFormProps> = ({ onSubmit }) => {
  const [scores, setScores] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState({
    stopDoing: '',
    startDoing: '',
    keepDoing: ''
  });

  const handleScoreChange = (id: string, value: number) => {
    setScores(prev => ({ ...prev, [id]: value }));
  };

  const isComplete = DIMENSIONS.every(d => scores[d.id] !== undefined);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isComplete) {
      alert('Lütfen tüm derecelendirme sorularını yanıtlayın.');
      return;
    }
    const response: SurveyResponse = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      scores,
      feedback
    };
    onSubmit(response);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
      <div className="border-b pb-4 mb-6">
        <h2 className="text-3xl font-extrabold text-gray-900">Agile Leadership Anketi</h2>
        <p className="mt-2 text-gray-600">Liderlik yetkinliklerini 1 (Zayıf) ile 5 (Mükemmel) arasında puanlayın. Katılım tamamen anonimdir.</p>
      </div>

      <div className="space-y-6">
        {DIMENSIONS.map((dim, index) => (
          <div key={dim.id} className="p-5 rounded-xl bg-gray-50 border border-gray-100 transition-all hover:shadow-md">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <span className="inline-block px-2 py-1 text-xs font-bold text-indigo-600 bg-indigo-50 rounded mb-1 uppercase tracking-wider">Boyut {index + 1}</span>
                <h3 className="text-lg font-bold text-gray-800">{dim.title}</h3>
                <p className="text-sm text-gray-500 italic mt-1">{dim.description}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleScoreChange(dim.id, val)}
                  className={`w-12 h-12 rounded-full border-2 transition-all flex items-center justify-center font-bold text-lg
                    ${scores[dim.id] === val 
                      ? 'bg-indigo-600 border-indigo-600 text-white scale-110 shadow-lg' 
                      : 'border-gray-200 text-gray-400 hover:border-indigo-300 hover:text-indigo-500 bg-white'
                    }`}
                >
                  {val}
                </button>
              ))}
              <span className="ml-4 text-xs font-medium uppercase tracking-widest text-gray-400">
                {scores[dim.id] === 1 && "Geliştirilmeli"}
                {scores[dim.id] === 3 && "Ortalama"}
                {scores[dim.id] === 5 && "Mükemmel"}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-6 pt-8 border-t">
        <h3 className="text-xl font-bold text-gray-900">Niteliksel Geri Bildirim</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{OPEN_QUESTIONS.stopDoing}</label>
            <textarea
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
              value={feedback.stopDoing}
              onChange={(e) => setFeedback(prev => ({ ...prev, stopDoing: e.target.value }))}
              placeholder="Fikirlerinizi buraya yazın..."
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{OPEN_QUESTIONS.startDoing}</label>
            <textarea
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
              value={feedback.startDoing}
              onChange={(e) => setFeedback(prev => ({ ...prev, startDoing: e.target.value }))}
              placeholder="Fikirlerinizi buraya yazın..."
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{OPEN_QUESTIONS.keepDoing}</label>
            <textarea
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
              value={feedback.keepDoing}
              onChange={(e) => setFeedback(prev => ({ ...prev, keepDoing: e.target.value }))}
              placeholder="İyi uygulamaları paylaşın..."
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={!isComplete}
        className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg
          ${isComplete 
            ? 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98]' 
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
      >
        Anketi Gönder
      </button>
    </form>
  );
};

export default SurveyForm;
