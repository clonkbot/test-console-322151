import { useState, useEffect, useRef } from 'react';

function Waveform({ className = '', color = '#39ff14', speed = 1, amplitude = 30 }: { className?: string; color?: string; speed?: number; amplitude?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const offsetRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.beginPath();

      const centerY = canvas.height / 2;
      for (let x = 0; x < canvas.width; x++) {
        const y = centerY + Math.sin((x + offsetRef.current) * 0.02) * amplitude +
                  Math.sin((x + offsetRef.current * 1.5) * 0.05) * (amplitude * 0.5);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      offsetRef.current += speed * 2;
      animationRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [color, speed, amplitude]);

  return <canvas ref={canvasRef} className={className} />;
}

function FlickerNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplay(value + (Math.random() - 0.5) * value * 0.02);
    }, 100);
    return () => clearInterval(interval);
  }, [value]);

  return <span>{display.toFixed(2)}{suffix}</span>;
}

function StatusIndicator({ label, status }: { label: string; status: 'ok' | 'warning' | 'testing' }) {
  const colors = {
    ok: 'bg-[#39ff14]',
    warning: 'bg-amber-400',
    testing: 'bg-cyan-400 animate-pulse'
  };

  return (
    <div className="flex items-center gap-2 md:gap-3">
      <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${colors[status]} shadow-lg`}
           style={{ boxShadow: `0 0 10px ${status === 'ok' ? '#39ff14' : status === 'warning' ? '#fbbf24' : '#22d3ee'}` }} />
      <span className="text-xs md:text-sm uppercase tracking-wider text-zinc-400">{label}</span>
    </div>
  );
}

function TestModule({ title, children, delay = 0 }: { title: string; children: React.ReactNode; delay?: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`border border-zinc-700 bg-zinc-900/80 backdrop-blur-sm p-3 md:p-5 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      style={{ boxShadow: '0 0 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)' }}
    >
      <div className="flex items-center gap-2 mb-3 md:mb-4 pb-2 md:pb-3 border-b border-zinc-800">
        <div className="w-1.5 md:w-2 h-1.5 md:h-2 bg-[#39ff14] rounded-full" />
        <h3 className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-zinc-500 font-medium">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function App() {
  const [systemTime, setSystemTime] = useState(new Date());
  const [testProgress, setTestProgress] = useState(0);
  const [testPhase, setTestPhase] = useState('INITIALIZING');

  useEffect(() => {
    const timer = setInterval(() => setSystemTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const phases = ['INITIALIZING', 'CALIBRATING', 'ANALYZING', 'VALIDATING', 'COMPLETE'];
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 3;
      if (progress >= 100) {
        progress = 0;
      }
      setTestProgress(progress);
      setTestPhase(phases[Math.floor(progress / 25)] || phases[0]);
    }, 150);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 overflow-hidden relative flex flex-col">
      {/* CRT Scanlines Overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-50 opacity-[0.03]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)'
        }}
      />

      {/* Noise Texture */}
      <div
        className="fixed inset-0 pointer-events-none z-40 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />

      {/* Header */}
      <header className="relative z-10 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-8 h-8 md:w-10 md:h-10 border-2 border-[#39ff14] flex items-center justify-center relative">
              <span className="text-[#39ff14] font-bold text-sm md:text-lg">T</span>
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#39ff14] animate-pulse" />
            </div>
            <div>
              <h1 className="font-bold text-base md:text-lg tracking-tight" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                TEST CONSOLE
              </h1>
              <p className="text-[10px] md:text-xs text-zinc-500 tracking-widest">DIAGNOSTIC INTERFACE v2.4.1</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[#39ff14] font-mono text-lg md:text-2xl tracking-wider">
              {systemTime.toLocaleTimeString('en-US', { hour12: false })}
            </div>
            <div className="text-[10px] md:text-xs text-zinc-600 tracking-wide">
              {systemTime.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-4 md:py-8">
        {/* Status Bar */}
        <div className="flex flex-wrap gap-3 md:gap-6 mb-6 md:mb-8 p-3 md:p-4 bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm">
          <StatusIndicator label="System" status="ok" />
          <StatusIndicator label="Network" status="ok" />
          <StatusIndicator label="Memory" status="warning" />
          <StatusIndicator label="Process" status="testing" />
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Primary Waveform */}
          <div className="lg:col-span-2">
            <TestModule title="Primary Signal Analysis" delay={100}>
              <div className="h-32 md:h-48 relative overflow-hidden rounded bg-zinc-950">
                <Waveform className="w-full h-full" color="#39ff14" speed={1.5} amplitude={40} />
                <div className="absolute inset-0 pointer-events-none border border-zinc-800 rounded" />
                <div className="absolute top-2 left-2 md:top-3 md:left-3 text-[10px] md:text-xs text-zinc-500 font-mono">CH1 :: 440Hz</div>
                <div className="absolute bottom-2 right-2 md:bottom-3 md:right-3 text-[10px] md:text-xs text-[#39ff14] font-mono">
                  <FlickerNumber value={98.7} suffix="%" />
                </div>
              </div>
            </TestModule>
          </div>

          {/* Metrics Panel */}
          <TestModule title="Live Metrics" delay={200}>
            <div className="space-y-3 md:space-y-4">
              {[
                { label: 'Latency', value: 12.4, unit: 'ms', color: '#39ff14' },
                { label: 'Throughput', value: 847.2, unit: 'MB/s', color: '#22d3ee' },
                { label: 'Error Rate', value: 0.02, unit: '%', color: '#f472b6' },
                { label: 'Uptime', value: 99.99, unit: '%', color: '#a78bfa' },
              ].map((metric) => (
                <div key={metric.label} className="flex justify-between items-center">
                  <span className="text-xs md:text-sm text-zinc-500 uppercase tracking-wide">{metric.label}</span>
                  <span className="font-mono text-sm md:text-lg" style={{ color: metric.color }}>
                    <FlickerNumber value={metric.value} suffix={metric.unit} />
                  </span>
                </div>
              ))}
            </div>
          </TestModule>

          {/* Secondary Waveform */}
          <TestModule title="Secondary Channel" delay={300}>
            <div className="h-20 md:h-24 relative overflow-hidden rounded bg-zinc-950">
              <Waveform className="w-full h-full" color="#22d3ee" speed={2} amplitude={20} />
              <div className="absolute inset-0 pointer-events-none border border-zinc-800 rounded" />
            </div>
          </TestModule>

          {/* Test Progress */}
          <TestModule title="Test Execution" delay={400}>
            <div className="space-y-3 md:space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs md:text-sm text-zinc-400">Phase</span>
                <span className="text-xs md:text-sm text-cyan-400 font-mono animate-pulse">{testPhase}</span>
              </div>
              <div className="relative h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#39ff14] to-cyan-400 transition-all duration-150"
                  style={{ width: `${testProgress}%` }}
                />
              </div>
              <div className="text-right font-mono text-xs md:text-sm text-zinc-500">
                {testProgress.toFixed(1)}%
              </div>
            </div>
          </TestModule>

          {/* Data Grid */}
          <TestModule title="Test Results Matrix" delay={500}>
            <div className="grid grid-cols-4 gap-1 md:gap-2">
              {Array.from({ length: 16 }).map((_, i) => {
                const status = Math.random() > 0.1 ? 'pass' : 'fail';
                return (
                  <div
                    key={i}
                    className={`aspect-square rounded-sm flex items-center justify-center text-[8px] md:text-[10px] font-mono transition-all duration-300 ${
                      status === 'pass'
                        ? 'bg-[#39ff14]/20 text-[#39ff14] border border-[#39ff14]/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    {status === 'pass' ? 'OK' : 'ER'}
                  </div>
                );
              })}
            </div>
          </TestModule>
        </div>

        {/* Console Output */}
        <div className="mt-4 md:mt-6">
          <TestModule title="Console Output" delay={600}>
            <div className="h-24 md:h-32 overflow-hidden font-mono text-[10px] md:text-xs text-zinc-500 space-y-1">
              <p><span className="text-zinc-600">[{systemTime.toLocaleTimeString()}]</span> <span className="text-[#39ff14]">INFO</span> System initialized successfully</p>
              <p><span className="text-zinc-600">[{systemTime.toLocaleTimeString()}]</span> <span className="text-cyan-400">TEST</span> Running diagnostic sequence...</p>
              <p><span className="text-zinc-600">[{systemTime.toLocaleTimeString()}]</span> <span className="text-[#39ff14]">INFO</span> All subsystems nominal</p>
              <p><span className="text-zinc-600">[{systemTime.toLocaleTimeString()}]</span> <span className="text-amber-400">WARN</span> Memory usage above threshold</p>
              <p><span className="text-zinc-600">[{systemTime.toLocaleTimeString()}]</span> <span className="text-cyan-400">TEST</span> Validating test parameters...</p>
              <p className="text-zinc-600 animate-pulse">_ awaiting input...</p>
            </div>
          </TestModule>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-800/50 bg-zinc-950/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4 text-center">
          <p className="text-[10px] md:text-xs text-zinc-600 tracking-wide">
            Requested by <span className="text-zinc-500">@web-user</span> · Built by <span className="text-zinc-500">@clonkbot</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
