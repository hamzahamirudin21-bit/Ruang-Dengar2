import type { RoomVisualConfig } from './roomVisualConfig';

export interface RoomEnvironmentLayerProps {
  config: RoomVisualConfig;
  reducedMotion: boolean;
}

/**
 * PHASE 3 — MULTI-ROOM ENVIRONMENT PERSONALIZATION LAYER
 * Merender lingkungan laboratorium/ruangan futuristik AAA yang spesifik untuk ke-11 ruangan:
 * 1. Architectural ceiling & ambient lighting accents per ruangan
 * 2. Room-specific Wall Display Panel di kanan-tengah atas (mis. ALUR FIRMWARE & TELEMETRI: sensor() -> filter() -> sendMQTT() untuk Pemrograman)
 * 3. Room-specific Workstation / Server Rack / Equipment silhouette di latar kiri & bawah
 */
export function RoomEnvironmentLayer({ config, reducedMotion }: RoomEnvironmentLayerProps) {
  const { roomId, wallDisplayTitle, wallDisplayNodes, wallDisplayKind, moodCategory } = config;
  const [node1, node2, node3] = wallDisplayNodes;

  const isTechLab =
    roomId === 'pemrograman' || roomId === 'elektronik-iot' || roomId === 'cetak-3d';
  const isIndustrial = roomId === 'las' || roomId === 'gudang-alat';
  const isCreative = roomId === 'studio-desain';

  return (
    <div
      aria-hidden="true"
      className="vn-room-env-layer pointer-events-none absolute inset-0 z-[1] overflow-hidden"
      data-room-env={roomId}
      data-room-category={moodCategory}
    >
      {/* 1. Garis Arsitektur Plafon & Ambient Glow Spesifik Ruangan */}
      <div className="vn-room-ceiling-trim" />
      <div className="vn-room-ambient-glow" />

      {/* 2. Peralatan Latar Kiri Spesifik Ruangan (Server Rack / Rak Alat / Rak Pustaka) */}
      <div className="vn-room-left-fixture">
        {isTechLab ? (
          <div className="vn-env-server-rack">
            <div className="vn-env-server-header">
              <span className="vn-env-led vn-env-led--cyan" />
              <span className="vn-env-led vn-env-led--gold" />
              <span className="vn-env-led vn-env-led--cyan" />
            </div>
            {[0, 1, 2, 3, 4, 5].map((slot) => (
              <div key={slot} className="vn-env-server-blade">
                <span className="vn-env-blade-bars" />
                <span
                  className={`vn-env-led ${
                    slot % 2 === 0 ? 'vn-env-led--cyan' : 'vn-env-led--gold'
                  }`}
                />
              </div>
            ))}
          </div>
        ) : isIndustrial ? (
          <div className="vn-env-industrial-cabinet">
            <div className="vn-env-hazard-stripe" />
            <div className="vn-env-cabinet-grid">
              {[0, 1, 2, 3].map((r) => (
                <div key={r} className="vn-env-cabinet-drawer">
                  <span className="vn-env-drawer-handle" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="vn-env-bookcase">
            {[0, 1, 2].map((shelf) => (
              <div key={shelf} className="vn-env-bookshelf-row">
                <span className="vn-env-book-spine vn-env-book-spine--1" />
                <span className="vn-env-book-spine vn-env-book-spine--2" />
                <span className="vn-env-book-spine vn-env-book-spine--3" />
                <span className="vn-env-book-spine vn-env-book-spine--4" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. PANEL VISUALISASI DINDING KANAN-ATAS SPESIFIK RUANGAN (Sesuai Gambar Referensi) */}
      <div
        className={`vn-room-wall-board ${reducedMotion ? 'vn-room-wall-board--static' : ''}`}
        data-testid="vn-room-wall-display"
        data-display-kind={wallDisplayKind}
      >
        <div className="vn-wall-board-header">
          <span className="vn-wall-board-dot" />
          <span className="vn-wall-board-title">{wallDisplayTitle}</span>
          <span className="vn-wall-board-tag">{roomId.toUpperCase()}</span>
        </div>

        {/* Diagram Alur 3 Simpul: mis. sensor() -> filter() -> sendMQTT() */}
        <div className="vn-wall-flow-row">
          <div className="vn-wall-node vn-wall-node--1">
            <span>{node1}</span>
          </div>
          <div className="vn-wall-arrow">
            <span className="vn-wall-arrow-line" />
            <span className="vn-wall-arrow-head">▶</span>
          </div>
          <div className="vn-wall-node vn-wall-node--2">
            <span>{node2}</span>
          </div>
          <div className="vn-wall-arrow">
            <span className="vn-wall-arrow-line" />
            <span className="vn-wall-arrow-head">▶</span>
          </div>
          <div className="vn-wall-node vn-wall-node--3">
            <span>{node3}</span>
          </div>
        </div>

        {/* Kurva Telemetri / Visualisasi Sinyal di Bawah Simpul (Sesuai Gambar Referensi) */}
        <svg
          className="vn-wall-telemetry-svg"
          viewBox="0 0 320 56"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Garis dasar & titik sumbu */}
          <line
            x1="18"
            y1="42"
            x2="302"
            y2="42"
            stroke="rgba(22, 139, 255, 0.55)"
            strokeWidth="2"
          />
          {/* Kurva lengkung magenta/cyan menghubungkan simpul 1 -> 2 -> 3 */}
          <path
            d="M 48 40 Q 160 -2 272 40"
            stroke={isIndustrial ? '#FFB547' : isCreative ? '#E879F9' : '#EC4899'}
            strokeWidth="2.4"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 48 40 Q 104 16 160 40 T 272 40"
            stroke="rgba(0, 229, 255, 0.72)"
            strokeWidth="1.6"
            strokeDasharray="4 3"
            fill="none"
          />
          {[48, 120, 198, 272].map((cx, i) => (
            <circle
              key={i}
              cx={cx}
              cy="42"
              r="4.2"
              fill={i % 2 === 0 ? '#00E5FF' : '#3B82F6'}
              stroke="#061522"
              strokeWidth="1.4"
            />
          ))}
        </svg>
      </div>

      {/* 4. Deretan Monitor Workstation / Meja Kerja Belakang di Tengah-Bawah Latar */}
      <div className="vn-room-midground-desk">
        <div className="vn-mid-monitor vn-mid-monitor--left">
          <div className="vn-mid-monitor-screen">
            <span />
            <span />
            <span />
          </div>
          <div className="vn-mid-monitor-stand" />
        </div>
        <div className="vn-mid-monitor vn-mid-monitor--right">
          <div className="vn-mid-monitor-screen">
            <span />
            <span />
            <span />
          </div>
          <div className="vn-mid-monitor-stand" />
        </div>
      </div>
    </div>
  );
}

export default RoomEnvironmentLayer;
