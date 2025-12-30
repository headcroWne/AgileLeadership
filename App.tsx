
import React, { useState, useEffect } from 'react';
import SurveyForm from './components/SurveyForm';
import Dashboard from './components/Dashboard';
import { SurveyResponse } from './types';

async function saveResponseToDB(response: any) {
  await fetch("/api/responses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(response),
  });
}

enum View {
  SURVEY,
  DASHBOARD
}

const App: React.FC = () => {

  const isAdmin =
  new URLSearchParams(window.location.search).get("admin") === "EVET";

  
  const [view, setView] = useState<View>(View.SURVEY);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);

  const loadResponsesFromDB = async () => {
  try {
    const res = await fetch("/api/responses?nocache=1");
    const data = await res.json();

    if (data?.rows) {
      const parsed = data.rows
        .map((r: any) => {
          try {
            return JSON.parse(r.payload);
          } catch {
            return null;
          }
        })
        .filter(Boolean);

      setResponses(parsed);
    }
  } catch (err) {
    console.error("DB fetch failed", err);
  }
};

  
  useEffect(() => {
  if (view !== View.DASHBOARD) return;

  fetch("/api/responses?nocache=1")
    .then((res) => res.json())
    .then((data) => {
      if (data?.rows) {
        const parsed = data.rows
          .map((r: any) => {
            try {
              return JSON.parse(r.payload);
            } catch {
              return null;
            }
          })
          .filter(Boolean);

        setResponses(parsed);
      }
    })
    .catch((err) => {
      console.error("DB fetch failed", err);
    });
}, [view]);



  const handleSurveySubmit = async (response: SurveyResponse) => {
  const newResponses = [...responses, response];
  setResponses(newResponses);
//  localStorage.setItem('agile_survey_responses', JSON.stringify(newResponses));

  await saveResponseToDB(response);

    await loadResponsesFromDB();

    
  alert('Anketiniz başarıyla gönderildi. Katkınız için teşekkürler!');
  setView(View.DASHBOARD);
};


  const clearData = () => {
    if (confirm('Tüm verileri silmek istediğinize emin misiniz?')) {
      localStorage.removeItem('agile_survey_responses');
      setResponses([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-xl">A</span>
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                Agile Leadership
              </span>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={() => setView(View.SURVEY)}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  view === View.SURVEY 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                Anket
              </button>
              <button
                onClick={() => setView(View.DASHBOARD)}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  view === View.DASHBOARD 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow py-8 overflow-y-auto">
        {view === View.SURVEY ? (
          <SurveyForm onSubmit={handleSurveySubmit} />
        ) : (
          <Dashboard responses={responses} />
        )}
      </main>

      <footer className="bg-white border-t py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm italic">
            © 2024 Agile Leadership Assessment Tool. Tüm hakları saklıdır.
          </p>
          <div className="flex gap-4">
            <button 
              onClick={clearData}
              className="text-xs text-red-400 hover:text-red-600 transition-colors"
            >
              Verileri Temizle
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
