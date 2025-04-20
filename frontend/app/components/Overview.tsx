'use client';

import React, { useEffect, useState } from 'react';
import {
  getOverview,
  getUserTips,
  getUpcomingEvents,
  submitTip,
  getLeaderboard,
} from '../utils/api';
import { Card } from 'primereact/card';
import { Skeleton } from 'primereact/skeleton';
import { Tag } from 'primereact/tag';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { EventWithTips } from '../utils/api';
import { Button } from 'primereact/button';

interface OverviewData {
  points: number;
}

interface UserTip {
  id: number;
  question: string;
  selectedOption: string;
  pointsEarned: number;
}

interface LeaderboardEntry {
  username: string;
  points: number;
}

interface JwtPayload {
  username?: string;
  [key: string]: any;
}

const OverView: React.FC = () => {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [userTips, setUserTips] = useState<UserTip[]>([]);
  const [jwtPayload, setJwtPayload] = useState<JwtPayload | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<EventWithTips[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number>>({});
  const [selectedEvent, setSelectedEvent] = useState<EventWithTips | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  const parseJwt = (token: string | null): JwtPayload | null => {
    if (!token) return null;
    try {
      const base64Url = token.split('.')[1];
      if (!base64Url) return null;
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (err) {
      console.error('Error parsing JWT:', err);
      return null;
    }
  };

  useEffect(() => {
    const loadEntries = async () => {
      const token = localStorage.getItem('token');
      const tips = await getUserTips();
      const events = await getUpcomingEvents();
      const overviewData = await getOverview();
      const leaderboardData = await getLeaderboard();

      setUpcomingEvents(events || []);
      setUserTips(tips || []);
      setLeaderboard(leaderboardData || []);
      setOverview(overviewData || { points: 0 });
      const decoded = parseJwt(token);
      setJwtPayload(decoded);
    };
    loadEntries();
  }, []);

  if (!overview) {
    return (
      <Card className="mb-4">
        <Skeleton width="100%" height="6rem" />
      </Card>
    );
  }

  return (
    <>
      <h1>Willkommen {jwtPayload?.username}</h1>
      <div className="flex flex-col md:flex-row gap-6 justify-center">
        <Card title="Meine Übersicht" className="p-4 max-w-xl w-full">
          <ul className="list-none p-0 m-0">
            <li className="mb-3">
              <div className="font-bold text-sm mb-1">Erreichte Punkte</div>
              <Tag value={`${overview.points} Punkte`} severity="success" />
            </li>
            <li className="mb-3">
              <div className="font-bold text-sm mb-1">Deine Tipps</div>
              {/* <ul className="list-disc pl-4">
                {userTips.length > 0 ? (
                  userTips.map((tip) => (
                    <li key={tip.id} className="mb-1">
                      <span className="font-semibold">{tip.question}</span>:{" "}
                      <span>{tip.selectedOption}</span>
                      {tip.pointsEarned !== undefined && (
                        <span className="ml-2 text-sm text-gray-600">({tip.pointsEarned} Punkte)</span>
                      )}
                    </li>
                  ))
                ) : (
                  <li>Du hast noch keine Tipps abgegeben.</li>
                )}
              </ul> */}
            </li>
          </ul>
        </Card>

        <Card title="Rangliste" className="p-4 max-w-xl w-full">
          <DataTable value={leaderboard} stripedRows>
            <Column field="username" header="Benutzer" />
            <Column field="points" header="Punkte" />
          </DataTable>
        </Card>
      </div>

      <Card title="Tippabgabe" className="p-4 max-w-3xl mx-auto mt-6">
        <div className="mb-4">
          <label className="font-semibold block mb-2">Event auswählen</label>
          <Dropdown
            value={selectedEvent?.id ?? null}
            onChange={(e) => {
              const found = upcomingEvents.find(ev => ev.id === e.value);
              setSelectedEvent(found || null);
            }}
            options={upcomingEvents}
            optionLabel="name"
            optionValue="id"
            placeholder="Wähle ein Event"
            className="w-full md:w-30rem"
          />
        </div>
        <p>Gewähltes Event: {selectedEvent?.name || 'Keins'}</p>
        {/* {selectedEvent && ( */}
        <div className="mt-4">
        {selectedEvent?.tips.map((tip) => (
      <div key={tip.id} className="mb-4">
        <strong>{tip.question}</strong>
        <div className="mt-2">
          {tip.tip_options.map((option) => (
            <label key={option.id} className="block mb-1">
              <input
                type="radio"
                name={`tip-${tip.id}`}
                value={option.id}
                checked={selectedOptions[tip.id] === option.id}
                onChange={() =>
                  setSelectedOptions((prev) => ({
                    ...prev,
                    [tip.id]: option.id,
                  }))
                }
              />
              <span className="ml-2">{option.answer}</span>
            </label>
          ))}
        </div>
        <Button
          className="mt-2 bg-blue-600 text-white py-1 px-3 rounded"
          // disabled={!selectedOptions[tip.id]}
          onClick={() => {
              submitTip(tip.id, selectedOptions[tip.id])
                .then(() => alert('Tipp gespeichert!'))
                .catch(() => alert('Fehler beim Speichern des Tipps.'));
          }}
        >
          Tipp abgeben
        </Button>
      </div>
    ))}
  </div>
{/* )} */}

      </Card>
    </>
  );
};

export default OverView;
