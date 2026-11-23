import React, { useState } from 'react';
import { getStudentBackground } from '../../data/studentBackgrounds';
import { STRINGS } from '../../data/strings';
import {
  IconJadwal,
  IconLog,
  IconPanahCiut,
  IconPanahLuas,
  IconProfil,
  IconRelasi,
  IconRiwayat,
} from '../components/GameIcons';
import type { ProfileTabId, StudentProfile } from './studentProfile';

const TABS: readonly { id: ProfileTabId; Icon: React.FC<{ className?: string }> }[] = [
  { id: 'profil', Icon: IconProfil },
  { id: 'jadwal', Icon: IconJadwal },
  { id: 'riwayat', Icon: IconRiwayat },
  { id: 'relasi', Icon: IconRelasi },
];

const Field: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="mb-3 rounded-2xl border-2 border-[#3e2517]/25 bg-[#fffdf7] p-3 shadow-[inset_0_-2px_0_#efe0c0]">
    <h3 className="mb-1 font-['Fredoka'] text-[0.72rem] font-bold uppercase tracking-wider text-[#7a5234]">
      {title}
    </h3>
    <div className="text-sm font-medium leading-snug text-[#3e2517]">{children}</div>
  </section>
);

export interface ProfileCardProps {
  profile: StudentProfile;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onOpenLog: () => void;
  initialTab?: ProfileTabId;
  className?: string;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  collapsed,
  onToggleCollapsed,
  onOpenLog,
  initialTab = 'profil',
  className = '',
}) => {
  const S = STRINGS.story;
  const [tab, setTab] = useState<ProfileTabId>(initialTab);
  const toggleLabel = collapsed ? S.expandPanel : S.collapsePanel;
  const m = profile.missionHistory;

  const onTabKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const i = TABS.findIndex((t) => t.id === tab);
    let next = i;
    if (e.key === 'ArrowRight') next = (i + 1) % TABS.length;
    else if (e.key === 'ArrowLeft') next = (i - 1 + TABS.length) % TABS.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = TABS.length - 1;
    else return;
    e.preventDefault();
    setTab(TABS[next].id);
    document.getElementById(`profile-tab-${TABS[next].id}`)?.focus();
  };

  return (
    <aside
      aria-label={S.profileCardAria}
      className={`flex flex-col overflow-hidden ${className}`}
      style={{ color: 'var(--vnp-ink)' }}
    >
      <div className="flex shrink-0 items-center justify-between gap-2 border-b-[2.5px] border-[#3e2517] bg-gradient-to-r from-[#f8e6c1] to-[#f2d8a6] px-4 py-3">
        {!collapsed && (
          <div className="min-w-0">
            <h2 className="truncate font-['Fredoka'] text-base font-bold text-[#3e2517]">
              {profile.name}
            </h2>
            <div className="mt-0.5 flex flex-wrap gap-1.5 text-[0.72rem] font-semibold text-[#6b482e]">
              <span>{S.profileIdBadge(profile.number)}</span>
              <span aria-hidden="true">·</span>
              <span>{S.profileCohortBadge(profile.cohort)}</span>
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-label={toggleLabel}
          aria-expanded={!collapsed}
          title={toggleLabel}
          className="vn-pill ml-auto !min-h-[28px] !px-2.5"
        >
          {collapsed ? <IconPanahLuas className="h-3.5 w-3.5" /> : <IconPanahCiut className="h-3.5 w-3.5" />}
        </button>
      </div>

      {!collapsed && (
        <>
          <div
            role="tablist"
            aria-label={S.profileTabsAria}
            onKeyDown={onTabKeyDown}
            className="grid shrink-0 grid-cols-4 gap-1.5 border-b-2 border-[#3e2517]/20 bg-[#f9eed6] p-2"
          >
            {TABS.map(({ id, Icon }) => {
              const selected = tab === id;
              return (
                <button
                  key={id}
                  id={`profile-tab-${id}`}
                  role="tab"
                  type="button"
                  aria-selected={selected}
                  aria-controls="profile-tabpanel"
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setTab(id)}
                  className={`flex flex-col items-center justify-center gap-0.5 rounded-xl border-2 px-1.5 py-1.5 font-['Fredoka'] text-[0.7rem] font-bold transition ${
                    selected
                      ? 'border-[#3e2517] bg-[#2e8274] text-[#fffdf6] shadow-[0_2px_0_#3e2517]'
                      : 'border-transparent bg-transparent text-[#6b482e] hover:bg-[#f2dfb9]'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="truncate">{S.profileTabs[id]}</span>
                </button>
              );
            })}
          </div>

          <div
            role="tabpanel"
            id="profile-tabpanel"
            aria-labelledby={`profile-tab-${tab}`}
            className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden break-words p-3.5"
          >
            {tab === 'profil' && (() => {
              const bg = getStudentBackground(profile.id);
              return (
                <>
                  <Field title="Tipe & Karakter">
                    <span className="inline-block rounded-full border border-[#3e2517]/40 bg-[#ffe9a6] px-2.5 py-0.5 font-['Fredoka'] text-xs font-bold text-[#3e2517]">
                      ✦ {bg.typeTag}
                    </span>
                    <p className="mt-1.5 text-xs leading-relaxed text-[#5c3d26]">
                      {bg.communicationStyle}
                    </p>
                  </Field>
                  <Field title="Latar Belakang">
                    <p className="text-xs font-semibold text-[#7a5234]">{bg.originAndCohort}</p>
                    <p className="mt-1 text-xs leading-relaxed text-[#3e2517]">{bg.background}</p>
                  </Field>
                  <Field title="Kesukaan & Minat">
                    <p className="text-xs leading-relaxed text-[#3e2517]">{bg.likes}</p>
                    {profile.interests.length > 0 && (
                      <ul className="mt-2 flex flex-wrap gap-1.5">
                        {profile.interests.map((i) => (
                          <li
                            key={i}
                            className="rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                            style={{
                              borderColor: 'var(--vnp-border-strong)',
                              background: '#f5ecdc',
                              color: 'var(--vnp-ink)',
                            }}
                          >
                            {i}
                          </li>
                        ))}
                      </ul>
                    )}
                  </Field>
                </>
              );
            })()}
            {tab === 'jadwal' && (
              <>
                <Field title={S.profileSectionActivity}>{profile.currentActivity}</Field>
                <Field title={S.profileSectionLocation}>{profile.currentZoneLabel}</Field>
              </>
            )}
            {tab === 'riwayat' && (
              <>
                <Field title={S.profileSectionMission}>{S.missionStatus[m.status]}</Field>
                <Field title={S.profileSectionSessions}>{m.sessions}</Field>
                <Field title={S.profileSectionLastOutcome}>
                  {m.lastOutcomeLabel ?? S.missionOutcomeWords.belum}
                </Field>
                <button
                  type="button"
                  onClick={onOpenLog}
                  aria-label={S.historyAria}
                  className="vn-topbtn w-full justify-center"
                >
                  <IconLog className="h-4 w-4" />
                  <span>{S.logBtn}</span>
                </button>
              </>
            )}
            {tab === 'relasi' && (
              <Field title={S.profileSectionRelations}>
                {profile.withNames.length > 0 ? (
                  <ul className="list-disc pl-5">
                    {profile.withNames.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                  </ul>
                ) : (
                  S.relasiNeutralNote
                )}
              </Field>
            )}
          </div>
        </>
      )}
    </aside>
  );
};
