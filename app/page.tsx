'use client';
import { useState, useRef } from 'react';

// 1. Updated Interface: Hazards are now 'visual' (static objects) or 'event' (behaviors/audio/moving people)
interface Hazard {
  id: number;
  name: string;
  type: 'visual' | 'event';
  startTime: number;
  endTime: number;
  x?: number;       // Optional, only needed for visual
  y?: number;       // Optional
  width?: number;   // Optional
  height?: number;  // Optional
  options?: string[]; // Multiple choice options for event hazards
}

// 2. Finalized Hazard Data
const hazardData: Hazard[] = [
  { id: 1, type: 'visual', name: "Food on diathermy machine as soon as the video begins", startTime: 5.0, endTime: 243.0, x: 29, y: 57, width: 5, height: 10 },
  { 
    id: 2, type: 'event', name: "Not paying attention to Scrub Practitioner(SP)", startTime: 11.0, endTime: 21.0, 
    options: ["Dropping a sterile instrument", "Not paying attention to Scrub Practitioner(SP)", "Incorrect tray preparation", "Touching a non-sterile surface"]
  },
  { 
    id: 3, type: 'event', name: "Walking away before SP set up at table", startTime: 26.0, endTime: 46.0, 
    options: ["Leaving the theatre doors open", "Forgetting to sign the safety checklist", "Talking loudly over the surgeon", "Walking away before SP set up at table"] 
  },
  {
    id: 4, type: 'event', name: "Loud music", startTime: 74.0, endTime: 84.0,
    options: ["Equipment alarm ringing", "Loud music", "Intercom announcement", "Patient coughing"]
  },
  {
    id: 5, type: 'event', name: "Anaesthetist shouting across the room to get Anaesthetic Practitioner’s(AP) attention", startTime: 85.0, endTime: 98.0,
    options: ["Surgeon whispering", "Dropped surgical instrument", "Anaesthetist shouting across the room to get Anaesthetic Practitioner’s(AP) attention", "Mobile phone ringing"]
  },
  { 
    id: 6, type: 'event', name: "AP hair hanging out of theatre cap", startTime: 89.0, endTime: 100.0, 
    options: ["Improper face mask fit", "AP hair hanging out of theatre cap", "No eye protection worn", "Scrub top tucked in incorrectly"]
  },
  { id: 7, type: 'visual', name: "Anaesthetist & AP looking at holidays on PC", startTime: 117.0, endTime: 137.0, x: 35, y: 39, width: 10, height: 10 },
  { 
    id: 8, type: 'event', name: "Staff member enters using the sluice door, wearing gloves from another theatre, and not BBE", startTime: 120.0, endTime: 130.0, 
    options: ["Staff member enters using the sluice door, wearing gloves from another theatre, and not BBE", "Unauthorised personnel in theatre", "Staff member running in theatre", "Doors propped open illegally"]
  },
  {
    id: 9, type: 'event', name: "Not listening to surgeon", startTime: 125.0, endTime: 135.0,
    options: ["Incorrect swab count", "Not listening to surgeon", "Patient waking up", "Sluice door slamming"]
  },
  { id: 10, type: 'event', name: "Distracting SP, SFA takes swab unnoticed", startTime: 127.0, endTime: 137.0,
    options: ["Tripping hazard left on the floor", "Staff member eating", "Distracting SP, SFA takes swab unnoticed", "Surgeon breaks scrub"]
   },
  { 
    id: 11, type: 'event', name: "Staff member grazes past sterile field with bellowing open gown and uses exit doors to leave", startTime: 134.0, endTime: 144.0, 
    options: ["Tripping hazard left on the floor", "Staff member grazes past sterile field with bellowing open gown and uses exit doors to leave", "Wrong patient notes brought into theatre", "Surgeon breaks scrub"]
  },
  { 
    id: 12, type: 'event', name: "Anaesthetist leaves theatre through exit doors to take phone call", startTime: 147.0, endTime: 157.0, 
    options: ["Anaesthetist leaves theatre through exit doors to take phone call", "Taking a drink in the operating theatre", "Improper disposal of sharps", "Failing to document procedure"]
  },
  { 
    id: 13, type: 'event', name: "Continuous use of exit doors by Anaesthetist", startTime: 160.0, endTime: 174.0, 
    options: ["Continuous use of exit doors by Anaesthetist", "Not wearing a lead apron during X-ray", "Talking over the time-out", "Leaving the patient unmonitored"]
  },
  { 
    id: 14, type: 'event', name: "Circulator grazes past sterile trolley", startTime: 173.0, endTime: 183.0, 
    options: ["Touching face with sterile gloves", "Incorrect instrument count", "Circulator grazes past sterile trolley", "Adjusting lights without sterile handles"]
  },
  { id: 15, type: 'visual', name: "Mobile phone out and left out", startTime: 186.0, endTime: 240.0, x: 20, y: 62, width: 15, height: 15 },
  {
    id: 16, type: 'event', name: "Circulator shouts across theatre to speak with Surgeon", startTime: 208.0, endTime: 218.0,
    options: ["Circulator shouts across theatre to speak with Surgeon", "Monitor alarming", "Music turned up too high", "Trolley squeaking loudly"]
  },
  {
    id: 17, type: 'event', name: "Staff member from another theatre enters to chat. The group’s conversation becomes too loud.", startTime: 238.0, endTime: 248.0,
    options: ["Surgeon requesting instruments loudly", "Patient coughing", "Staff member from another theatre enters to chat. The group’s conversation becomes too loud.", "Fire alarm testing"]
  },
];

const dummyOptions = [
  "Equipment alarm ignored", 
  "Incorrect instrument passed", 
  "Sterile field breach", 
  "Patient movement detected"
];

export default function HazardPerceptionVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null); 
  
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [foundHazards, setFoundHazards] = useState<number[]>([]);
  const [videoEnded, setVideoEnded] = useState<boolean>(false);
  
  const [showTick, setShowTick] = useState<{ x: number, y: number } | null>(null);
  const [showCross, setShowCross] = useState<{ x: number, y: number } | null>(null);
  
  const [activeModal, setActiveModal] = useState<Hazard | 'dummy' | null>(null);
  
  const [debugMode, setDebugMode] = useState<boolean>(false);
  const [mouseCoords, setMouseCoords] = useState<{ x: number, y: number }>({ x: 0, y: 0 });

  const finalHazardTime = Math.max(...hazardData.map(h => h.endTime));
  const isSimulationComplete = videoEnded || (currentTime > finalHazardTime && finalHazardTime > 0);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleVisualHazardClick = (e: React.MouseEvent, hazard: Hazard) => {
    e.stopPropagation();
    e.preventDefault();

    if (!foundHazards.includes(hazard.id)) {
      setFoundHazards([...foundHazards, hazard.id]);
      setScore(score + 1);
      
      setShowTick({ x: hazard.x || 50, y: hazard.y || 50 });
      setTimeout(() => setShowTick(null), 1500); 
    }
  };

  const handleEventButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    videoRef.current?.pause(); 

    const activeEvent = hazardData.find(h => 
      h.type === 'event' && 
      currentTime >= h.startTime && 
      currentTime <= h.endTime && 
      !foundHazards.includes(h.id)
    );

    if (activeEvent) {
      setActiveModal(activeEvent);
    } else {
      setActiveModal('dummy'); 
    }
  };

  const handleModalAnswer = (selectedOption: string) => {
    if (activeModal !== 'dummy' && activeModal && selectedOption === activeModal.name) {
      setFoundHazards([...foundHazards, activeModal.id]);
      setScore(score + 1);
      setShowTick({ x: 50, y: 50 }); 
      setTimeout(() => setShowTick(null), 1500);
    } else {
      setShowCross({ x: 50, y: 50 });
      setTimeout(() => setShowCross(null), 1500);
    }
    
    setActiveModal(null);
    videoRef.current?.play();
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!debugMode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMouseCoords({ x: Math.round(x), y: Math.round(y) });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 p-4 font-sans">
      <div className="w-full max-w-5xl relative">
        
        <div className="flex justify-between text-white mb-4 text-xl font-semibold items-center">
          <h2>Theatre Hazard Perception</h2>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setDebugMode(!debugMode)}
              className={`px-3 py-1 text-sm rounded ${debugMode ? 'bg-amber-600' : 'bg-slate-700'}`}
            >
              🛠 Dev Mode: {debugMode ? 'ON' : 'OFF'}
            </button>
            <p>Score: {score} / {hazardData.length}</p>
            <button 
              onClick={toggleFullScreen}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm transition-colors"
            >
              ⛶ Fullscreen
            </button>
          </div>
        </div>

        <div 
          ref={containerRef} 
          className="w-full bg-black flex flex-col items-center justify-center rounded-lg shadow-2xl"
        >
          <div 
            className="relative w-full overflow-hidden"
            style={{
              aspectRatio: '16/9',
              maxHeight: '100vh',
              maxWidth: 'calc(100vh * (16/9))', 
            }}
            onMouseMove={handleMouseMove}
          >
            {/* Start Screen Overlay */}
            {!hasStarted && (
              <div className="absolute inset-0 bg-slate-900 z-50 flex flex-col items-center justify-center text-white p-8 text-center">
                <h1 className="text-4xl font-bold mb-6 text-blue-400">Theatre Hazard Perception</h1>
                <div className="text-lg max-w-2xl space-y-4 mb-8 text-left bg-slate-800 p-6 rounded-lg border border-slate-700">
                  <p>Welcome to the simulation. Your goal is to identify all hazards in the operating theatre.</p>
                  <ul className="list-disc pl-6 space-y-3">
                    <li><strong>Environmental Scans (Static):</strong> If you spot an object that shouldn't be there (e.g., a mobile phone left out, food on a machine), click directly on it in the video.</li>
                    <li><strong>Behavioral & Audio Observations (Action/Movement):</strong> For moving hazards, inappropriate staff actions, or distracting noises, click the red <strong>"⚠️ Report Event"</strong> button in the bottom corner and select what you observed.</li>
                  </ul>
                </div>
                <button
                  onClick={() => {
                    setHasStarted(true);
                    videoRef.current?.play();
                  }}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold text-xl transition-colors shadow-lg"
                >
                  Start Simulation
                </button>
              </div>
            )}

            <video
              ref={videoRef}
              src="/theatre-video.mp4" 
              className="absolute inset-0 w-full h-full object-contain" 
              controls
              controlsList="nofullscreen" 
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setVideoEnded(true)}
            />

            {/* Bottom Right: Event Button */}
            {hasStarted && !isSimulationComplete && (
              <button
                onClick={handleEventButtonClick}
                className="absolute bottom-16 right-6 z-20 bg-red-600 hover:bg-red-500 text-white px-5 py-3 rounded-lg font-bold shadow-xl flex items-center gap-2 border-2 border-red-400 transition-transform active:scale-95"
              >
                ⚠️ Report Event
              </button>
            )}

            {/* Event Multiple Choice Modal */}
            {activeModal && (
              <div className="absolute inset-0 bg-black/80 z-40 flex flex-col items-center justify-center p-4">
                <div className="bg-slate-800 text-white p-6 rounded-xl max-w-lg w-full shadow-2xl border border-slate-600">
                  <h3 className="text-2xl font-bold mb-6 text-center">What hazard or event did you detect?</h3>
                  <div className="flex flex-col gap-3">
                    {(activeModal === 'dummy' ? dummyOptions : activeModal.options)?.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleModalAnswer(opt)}
                        className="p-4 bg-slate-700 hover:bg-blue-600 rounded-lg text-left font-medium transition-colors"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                  <div className="mt-6 text-center">
                    <button
                      onClick={() => {
                        setActiveModal(null);
                        videoRef.current?.play();
                      }}
                      className="text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      Cancel / Resume Video
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Dev Mode Grid */}
            {debugMode && (
              <div 
                className="absolute inset-0 pointer-events-none opacity-30"
                style={{
                  backgroundImage: `linear-gradient(to right, cyan 1px, transparent 1px), linear-gradient(to bottom, cyan 1px, transparent 1px)`,
                  backgroundSize: '10% 10%'
                }}
              />
            )}

            {/* Dev Mode Coordinates */}
            {debugMode && (
              <div 
                className="absolute bg-black/80 text-cyan-400 font-mono text-sm px-2 py-1 rounded pointer-events-none z-50 transition-none"
                style={{ left: `calc(${mouseCoords.x}% + 15px)`, top: `calc(${mouseCoords.y}% + 15px)` }}
              >
                X: {mouseCoords.x}% | Y: {mouseCoords.y}%
              </div>
            )}

            {/* Render Visual Hotspots */}
            {!isSimulationComplete && hazardData.map((hazard) => {
              if (hazard.type !== 'visual') return null; 
              
              const isActive = currentTime >= hazard.startTime && currentTime <= hazard.endTime;
              const isFound = foundHazards.includes(hazard.id);

              if (isActive && !isFound) {
                return (
                  <div
                    key={hazard.id}
                    onClick={(e) => handleVisualHazardClick(e, hazard)}
                    className="absolute cursor-crosshair z-10"
                    style={{
                      left: `${hazard.x}%`,
                      top: `${hazard.y}%`,
                      width: `${hazard.width}%`,
                      height: `${hazard.height}%`,
                      border: debugMode ? '2px solid red' : 'none', 
                      backgroundColor: debugMode ? 'rgba(255, 0, 0, 0.2)' : 'transparent', 
                    }}
                  />
                );
              }
              return null;
            })}

            {/* Success Tick */}
            {showTick && (
              <div
                className="absolute z-50 text-green-500 font-bold text-7xl drop-shadow-lg pointer-events-none"
                style={{ left: `${showTick.x}%`, top: `${showTick.y}%`, transform: 'translate(-50%, -50%)' }}
              >
                ✅
              </div>
            )}

            {/* Incorrect Cross */}
            {showCross && (
              <div
                className="absolute z-50 text-red-500 font-bold text-7xl drop-shadow-lg pointer-events-none"
                style={{ left: `${showCross.x}%`, top: `${showCross.y}%`, transform: 'translate(-50%, -50%)' }}
              >
                ❌
              </div>
            )}

            {/* End Screen with Detailed Debrief List */}
            {isSimulationComplete && (
              <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center text-white z-50 pointer-events-auto p-4 md:p-8">
                <h2 className="text-3xl md:text-4xl font-bold mb-2 text-blue-400">Simulation Complete</h2>
                <p className="text-xl md:text-2xl mb-6">You successfully identified {score} out of {hazardData.length} hazards.</p>
                
                {/* Scrollable Feedback List */}
                <div className="w-full max-w-3xl bg-slate-800 rounded-lg border border-slate-600 p-4 md:p-6 mb-6 overflow-y-auto max-h-[50vh] shadow-inner">
                  <ul className="space-y-3">
                    {hazardData.map((hazard) => {
                      const isFound = foundHazards.includes(hazard.id);
                      return (
                        <li key={hazard.id} className="flex items-start gap-4 border-b border-slate-700 pb-3 last:border-0 last:pb-0">
                          <span className="text-2xl mt-1">{isFound ? '✅' : '❌'}</span>
                          <div className="flex-1">
                            <span className={`block font-medium ${isFound ? 'text-slate-100' : 'text-slate-400 line-through'}`}>
                              {hazard.name}
                            </span>
                            <span className="text-xs uppercase tracking-wider text-slate-500 mt-1 block">
                              {hazard.type === 'visual' ? 'Visual Scan' : 'Reported Event'}
                            </span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <button 
                  onClick={() => window.location.reload()}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold text-xl transition-colors shadow-lg"
                >
                  Restart Scenario
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}