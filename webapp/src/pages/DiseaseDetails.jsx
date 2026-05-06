import { BookOpen, ShieldAlert, Thermometer, Info, Syringe } from 'lucide-react';

export default function DiseaseDetails() {
  return (
    <div className="p-6 font-sans max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-purple-400" />
          Disease Encyclopedia
        </h1>
        <p className="text-slate-400 mt-2">Comprehensive information on tracked diseases</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Info className="w-48 h-48" />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-100 mb-4">COVID-19 (SARS-CoV-2)</h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-slate-300 leading-relaxed">
                Coronavirus disease (COVID-19) is an infectious disease caused by the SARS-CoV-2 virus. 
                Most people infected with the virus will experience mild to moderate respiratory illness and 
                recover without requiring special treatment. However, some will become seriously ill and require medical attention.
              </p>
              
              <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3 flex items-center gap-2">
                <Thermometer className="w-5 h-5 text-red-400" /> Common Symptoms
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300 list-disc pl-5">
                <li>Fever or chills</li>
                <li>Cough</li>
                <li>Shortness of breath</li>
                <li>Fatigue</li>
                <li>Muscle or body aches</li>
                <li>Loss of taste or smell</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-orange-400" /> Transmission
              </h3>
              <p className="text-slate-300 leading-relaxed">
                The virus can spread from an infected person's mouth or nose in small liquid particles when they cough, 
                sneeze, speak, sing or breathe. These particles range from larger respiratory droplets to smaller aerosols.
                You can be infected by breathing in the virus if you are near someone who has COVID-19, or by touching a 
                contaminated surface and then your eyes, nose or mouth.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
              <Syringe className="w-5 h-5 text-blue-400" /> Prevention Measures
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2"></div>
                <span className="text-slate-300 text-sm leading-relaxed">Get vaccinated and stay up to date with COVID-19 vaccines</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2"></div>
                <span className="text-slate-300 text-sm leading-relaxed">Wear a properly fitted mask when indoors in public</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2"></div>
                <span className="text-slate-300 text-sm leading-relaxed">Avoid poorly ventilated spaces and crowds</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2"></div>
                <span className="text-slate-300 text-sm leading-relaxed">Wash your hands often with soap and water</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-indigo-900 to-purple-900 border border-indigo-800 rounded-xl p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-white mb-2">Model Parameters Explained</h3>
            <p className="text-indigo-200 text-sm mb-4">Understanding the SEIR dashboard</p>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-white text-sm font-medium">Infection Rate (β)</h4>
                <p className="text-indigo-300 text-xs mt-1">Probability of transmitting disease between a susceptible and infected individual.</p>
              </div>
              <div>
                <h4 className="text-white text-sm font-medium">Incubation Period</h4>
                <p className="text-indigo-300 text-xs mt-1">Time from exposure to development of symptoms (Exposed state).</p>
              </div>
              <div>
                <h4 className="text-white text-sm font-medium">Days Infectious</h4>
                <p className="text-indigo-300 text-xs mt-1">Duration a person remains capable of transmitting the virus.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
