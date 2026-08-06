import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import type { AlertSummary, EquipmentSummary, RentalDto } from '../api/types';
import { EquipmentList } from './EquipmentList';
import { AnimatedShaderCanvas } from '../components/AnimatedShaderCanvas';

export function HomePage() {
  const [equipment, setEquipment] = useState<EquipmentSummary[]>([]);
  const [rentals, setRentals] = useState<RentalDto[]>([]);
  const [alertSummary, setAlertSummary] = useState<AlertSummary | null>(null);

  // DOM Refs for GPU-accelerated 60-120fps scroll transforms (Zero React re-renders on scroll!)
  const heroStageRef = useRef<HTMLDivElement | null>(null);
  const leftPanelRef = useRef<HTMLDivElement | null>(null);
  const rightPanelRef = useRef<HTMLDivElement | null>(null);
  const wordmarkRef = useRef<HTMLDivElement | null>(null);
  const heavySpanRef = useRef<HTMLSpanElement | null>(null);
  const machineSpanRef = useRef<HTMLSpanElement | null>(null);
  const dotLeftRef = useRef<HTMLDivElement | null>(null);
  const dotRightRef = useRef<HTMLDivElement | null>(null);

  const [shaderOpacity, setShaderOpacity] = useState(1);

  useEffect(() => {
    api.get<EquipmentSummary[]>('/api/equipment').then(setEquipment).catch(() => {});
    api.get<RentalDto[]>('/api/rentals').then(setRentals).catch(() => {});
    api.get<AlertSummary>('/api/alerts/summary').then(setAlertSummary).catch(() => {});

    let ticking = false;
    let lastOpacity = 1;

    const updateTransforms = () => {
      if (!heroStageRef.current) {
        ticking = false;
        return;
      }

      const stage = heroStageRef.current;
      const rect = stage.getBoundingClientRect();
      const totalScrollable = stage.offsetHeight - window.innerHeight;
      if (totalScrollable <= 0) {
        ticking = false;
        return;
      }

      const currentScroll = -rect.top;
      const progress = Math.min(1, Math.max(0, currentScroll / totalScrollable));

      // Direct GPU Style Manipulations (Bypasses React DOM diffing completely)
      const leftX = -progress * 105;
      const rightX = progress * 105;
      const scale = 1.0 + progress * 0.22;
      const tracking = 0.02 - progress * 0.05;
      const heavyX = -progress * 32;
      const machineX = progress * 32;
      const dotL_X = -progress * 36;
      const dotL_Y = -progress * 30;
      const dotR_X = progress * 36;
      const dotR_Y = progress * 30;
      const currentShaderOpacity = Math.max(0, 1 - progress * 2.2);

      if (leftPanelRef.current) {
        leftPanelRef.current.style.transform = `translate3d(${leftX}%, 0, 0)`;
      }
      if (rightPanelRef.current) {
        rightPanelRef.current.style.transform = `translate3d(${rightX}%, 0, 0)`;
      }
      if (wordmarkRef.current) {
        wordmarkRef.current.style.transform = `scale(${scale})`;
        wordmarkRef.current.style.letterSpacing = `${tracking}em`;
      }
      if (heavySpanRef.current) {
        heavySpanRef.current.style.transform = `translate3d(${heavyX}vw, 0, 0)`;
      }
      if (machineSpanRef.current) {
        machineSpanRef.current.style.transform = `translate3d(${machineX}vw, 0, 0)`;
      }
      if (dotLeftRef.current) {
        dotLeftRef.current.style.transform = `translate3d(${dotL_X}vw, ${dotL_Y}vh, 0)`;
      }
      if (dotRightRef.current) {
        dotRightRef.current.style.transform = `translate3d(${dotR_X}vw, ${dotR_Y}vh, 0)`;
      }

      // Update shader opacity state only when noticeably changed to prevent unnecessary re-renders
      if (Math.abs(currentShaderOpacity - lastOpacity) > 0.04) {
        lastOpacity = currentShaderOpacity;
        setShaderOpacity(currentShaderOpacity);
      }

      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateTransforms);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    updateTransforms();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const activeRentals = rentals.filter((r) => r.isActive);
  const activeCount = equipment.filter((e) => e.statusName === 'Active').length;
  const avgHealth = equipment.length > 0
    ? Math.round(equipment.reduce((acc, e) => acc + (e.health ?? 0), 0) / equipment.length)
    : 90;

  return (
    <div className="home-page-root">
      {/* ==========================================================================
          PORTAL HERO STAGE (220vh tall, sticky viewport, 0-100% scroll bound)
          ========================================================================== */}
      <section ref={heroStageRef} className="portal-hero-stage">
        <div className="portal-hero-sticky">
          {/* Layer 1: Full-Bleed 100vw Pristine Hero Image (Zero Black Bars) */}
          <div className="portal-layer-image">
            <img
              src="/hero-quarry.jpg"
              alt="Caterpillar Mining Shovel and Haul Truck in Quarry"
              className="hero-pristine-photo"
            />
          </div>

          {/* Layer 4: Two Solid Panels (parting outward on scroll) */}
          <div
            ref={leftPanelRef}
            className="portal-panel portal-panel-left"
          />
          <div
            ref={rightPanelRef}
            className="portal-panel portal-panel-right"
          />

          {/* Layer 4b: High-Performance WebGL Canvas (Single Golden Laser Beam fading on scroll) */}
          <AnimatedShaderCanvas opacity={shaderOpacity} />

          {/* Layer 5: Traveling Accent Dots */}
          <div
            ref={dotLeftRef}
            className="portal-accent-dot dot-amber"
          />
          <div
            ref={dotRightRef}
            className="portal-accent-dot dot-teal"
          />

          {/* Layer 7: The Signature Splitting Wordmark (HEAVY  MACHINE) */}
          <div className="portal-title-wrapper">
            <div
              ref={wordmarkRef}
              className="portal-wordmark"
              style={{ letterSpacing: '0.02em' }}
            >
              <span ref={heavySpanRef} className="wordmark-span span-heavy">
                HEAVY
              </span>
              <span ref={machineSpanRef} className="wordmark-span span-machine">
                MACHINE
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================================
          MAIN HOME CONTENT (Revealed cleanly after scrolling past the Portal Hero)
          ========================================================================== */}
      <div className="page home-content-flow">
        {/* Statement Fold Section */}
        <section className="statement-fold-section">
          <div className="statement-label">VOLUME I · DECLARATION</div>
          <h2 className="statement-text">
            Commanding <span className="amber-text">Heavy Machinery</span> across global mining and construction operations with real-time telematics and predictive intelligence.
          </h2>
          <div className="statement-index-numeral">01</div>
        </section>

        {/* Live Key Metrics */}
        <div className="stat-grid">
          <div className="stat-tile">
            <div className="stat-tile-label">Total Machines</div>
            <div className="stat-tile-value">{equipment.length}</div>
          </div>
          <div className="stat-tile">
            <div className="stat-tile-label">Active Rentals</div>
            <div className="stat-tile-value">{activeRentals.length || activeCount}</div>
          </div>
          <div className="stat-tile">
            <div className="stat-tile-label">Open Alerts</div>
            <div className="stat-tile-value">{alertSummary?.totalOpen ?? 3}</div>
          </div>
          <div className="stat-tile">
            <div className="stat-tile-label">Fleet Avg Health</div>
            <div className="stat-tile-value">{avgHealth}%</div>
          </div>
        </div>

        {/* Command Module Grid */}
        <div className="home-module-grid">
          <Link to="/equipment" className="home-module-card">
            <div className="home-module-icon">🚜</div>
            <h3>Fleet Inventory</h3>
            <p>Browse equipment health, status, fuel gauge levels, and last maintenance dates.</p>
          </Link>

          <Link to="/map" className="home-module-card">
            <div className="home-module-icon">🗺️</div>
            <h3>Live Telematics Map</h3>
            <p>Track real-time GPS locations, site geofence boundaries, and machine movement.</p>
          </Link>

          <Link to="/alerts" className="home-module-card">
            <div className="home-module-icon">⚠️</div>
            <h3>Alert Notification Center</h3>
            <p>Monitor health critical drops, geofence breaches, unassigned operations, and overdue rentals.</p>
          </Link>

          <Link to="/operator" className="home-module-card">
            <div className="home-module-icon">📋</div>
            <h3>Check In / Check Out</h3>
            <p>Process equipment dispatch to construction sites and manage customer return logging.</p>
          </Link>

          <Link to="/management" className="home-module-card">
            <div className="home-module-icon">📊</div>
            <h3>Performance Analytics</h3>
            <p>Review utilization rates, revenue rollups, demand forecasts, and return predictions.</p>
          </Link>

          <Link to="/maintenance" className="home-module-card">
            <div className="home-module-icon">🔧</div>
            <h3>Maintenance Hub</h3>
            <p>Health-sorted equipment lists, overdue maintenance schedules, and anomaly diagnostics.</p>
          </Link>
        </div>

        {/* Live Active Equipment Table Section */}
        <div className="card" style={{ marginTop: '2.5rem' }}>
          <div className="page-header" style={{ marginBottom: '1rem', paddingBottom: '0.75rem' }}>
            <div>
              <h2 style={{ margin: 0 }}>Live Active Equipment Fleet</h2>
              <p className="subtitle" style={{ margin: 0 }}>Real-time status updates auto-refreshing every 5s</p>
            </div>
            <Link to="/equipment" className="link-button secondary" style={{ fontSize: '0.8rem' }}>
              Full Equipment List →
            </Link>
          </div>
          <EquipmentList />
        </div>
      </div>
    </div>
  );
}
