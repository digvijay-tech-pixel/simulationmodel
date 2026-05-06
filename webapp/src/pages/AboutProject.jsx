import { LineChart, Map, MessageSquare, Sliders, Target, CheckCircle2, Bookmark } from 'lucide-react';

export default function AboutProject() {
  return (
    <div className="min-h-screen bg-[#080d17] text-slate-100 p-8 font-sans">
      
      {/* INNOVATIVE SECTION */}
      <div className="max-w-7xl mx-auto mb-16 grid grid-cols-1 lg:grid-cols-12 rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
        
        {/* Left Column - Current Features */}
        <div className="lg:col-span-8 bg-[#0a1120] p-10">
          <h1 className="text-4xl font-bold text-white mb-2">What Makes This</h1>
          <h1 className="text-4xl font-bold text-teal-400 mb-10">Project Innovative?</h1>
          
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-teal-500/10 rounded-lg shrink-0 mt-1">
                <LineChart className="w-6 h-6 text-teal-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Real-Time Graph Updates</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Dynamic SEIR curves update day-by-day showing Susceptible, Exposed, Infected & Recovered trends instantly as parameters change.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-500/10 rounded-lg shrink-0 mt-1">
                <Map className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Geo-Map Visualization</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  3D Globe mapping and heat-map overlays display how disease outbreaks spread across geographic regions based on district data.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-500/10 rounded-lg shrink-0 mt-1">
                <MessageSquare className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">AI Chatbot Integration</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Users can query disease symptoms, prevention tips, and outbreak data in real time using conversational AI.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-orange-500/10 rounded-lg shrink-0 mt-1">
                <Sliders className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Customizable Parameters</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Infection rate (β), incubation periods, and infectious durations are fully adjustable by the user to test scenarios.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Future Expansion */}
        <div className="lg:col-span-4 bg-[#0d1627] p-10 border-l border-slate-800">
          <h2 className="text-2xl font-bold text-teal-400 mb-8 text-center">Future<br/>Expansion</h2>
          
          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-teal-600 shrink-0 transform -skew-x-12 mt-1"></div>
              <p className="text-slate-300 text-sm">Machine Learning-based outbreak forecasting</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-teal-600 shrink-0 transform -skew-x-12 mt-1"></div>
              <p className="text-slate-300 text-sm">Real-time integration with WHO / CDC data feeds</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-teal-600 shrink-0 transform -skew-x-12 mt-1"></div>
              <p className="text-slate-300 text-sm">Mobile-responsive progressive web app</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-teal-600 shrink-0 transform -skew-x-12 mt-1"></div>
              <p className="text-slate-300 text-sm">Multi-region simultaneous simulation</p>
            </div>
          </div>
        </div>
      </div>

      {/* SDG GOALS SECTION */}
      <div className="max-w-7xl mx-auto mb-16 bg-[#1a1a1a] rounded-2xl p-10 shadow-xl border border-slate-800">
        <h2 className="text-2xl font-semibold text-white mb-8 flex items-center gap-3">
          <Target className="w-7 h-7 text-white" /> SDG Goals for the simulation model
        </h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg text-slate-300 mb-2 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-slate-400"></div> SDG 3 · Good Health & Well-being
            </h3>
            <p className="text-slate-400 pl-4 leading-relaxed">
              Stronger health systems increase the recovery rate (γ), reducing disease burden and duration of outbreaks.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg text-slate-300 mb-2 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-slate-400"></div> SDG 6 · Clean Water & Sanitation
            </h3>
            <p className="text-slate-400 pl-4 leading-relaxed">
              Improved sanitation directly lowers the infection transmission rate (β), slowing the spread at its source.
            </p>
          </div>

          <div>
            <h3 className="text-lg text-slate-300 mb-2 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-slate-400"></div> SDG 10 · Reduced Inequalities
            </h3>
            <p className="text-slate-400 pl-4 leading-relaxed">
              Closing equity gaps ensures uniform treatment access across populations, preventing marginalised groups from becoming persistent reservoirs.
            </p>
          </div>
        </div>
      </div>

      {/* CONCLUSION & REFERENCES SECTION */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-[#0a1120] rounded-t-2xl p-6 border border-b-0 border-slate-800">
          <h2 className="text-3xl font-bold text-white">Conclusion & References</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 rounded-b-2xl overflow-hidden border border-slate-800">
          
          {/* Conclusion */}
          <div className="bg-[#0a1120] p-10 border-r border-slate-800 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-teal-500 mb-6">Conclusion</h3>
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="bg-slate-800 p-1 rounded-full shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    The platform bridges mathematical modeling and interactive visualization for intuitive disease spread understanding.
                  </p>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-slate-800 p-1 rounded-full shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    The integrated chatbot enhances user engagement and provides contextual disease awareness at every step.
                  </p>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-slate-800 p-1 rounded-full shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    Future expansion via ML-driven forecasting and live data feeds will further enhance its real-world applicability.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-12 bg-teal-500 py-3 px-6 rounded text-center">
              <span className="text-white font-bold text-lg">Thank you for your attention — Questions are welcome!</span>
            </div>
          </div>

          {/* References */}
          <div className="bg-[#0d1627] p-10">
            <h3 className="text-xl font-bold text-teal-500 mb-6">References</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-3 border-b border-slate-800 pb-4">
                <Bookmark className="w-4 h-4 text-slate-500 shrink-0 mt-1" />
                <p className="text-slate-400 text-sm leading-relaxed">
                  [1] W. O. Kermack and A. G. McKendrick, "A Contribution to the Mathematical Theory of Epidemics," Proc. R. Soc. London A, vol. 115, no. 772, pp. 700-721, 1927.
                </p>
              </div>
              <div className="flex items-start gap-3 border-b border-slate-800 pb-4">
                <Bookmark className="w-4 h-4 text-slate-500 shrink-0 mt-1" />
                <p className="text-slate-400 text-sm leading-relaxed">
                  [2] World Health Organization, "Dengue and Severe Dengue," WHO Fact Sheet, 2023. [Online]. Available: https://www.who.int/news-room/fact-sheets/detail/dengue-and-severe-dengue
                </p>
              </div>
              <div className="flex items-start gap-3 border-b border-slate-800 pb-4">
                <Bookmark className="w-4 h-4 text-slate-500 shrink-0 mt-1" />
                <p className="text-slate-400 text-sm leading-relaxed">
                  [3] J. Ma and D. Earn, "Generality of the Final Size Formula," Bull. Math. Biol., vol. 68, no. 3, pp. 679-702, 2006.
                </p>
              </div>
              <div className="flex items-start gap-3 border-b border-slate-800 pb-4">
                <Bookmark className="w-4 h-4 text-slate-500 shrink-0 mt-1" />
                <p className="text-slate-400 text-sm leading-relaxed">
                  [4] Dr.Saroj Revankar https://scholar.google.com/citations?view_op=view_citation&hl=en&user=6Qw5PtgAAAAJ&citation_for_view=6Qw5PtgAAAAJ:zYLM7Y9cAGgC
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Bookmark className="w-4 h-4 text-slate-500 shrink-0 mt-1" />
                <p className="text-slate-400 text-sm leading-relaxed">
                  [5] CDC, "Influenza (Flu) – Key Facts," Centers for Disease Control and Prevention, 2024. [Online]. Available: https://www.cdc.gov/flu
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
