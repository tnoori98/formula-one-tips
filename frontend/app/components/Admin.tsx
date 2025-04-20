"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  createDriver,
  createTeam,
  createEvent,
  createTipOption,
  createUser,
  getDrivers,
  getTeams,
  getEvents,
  getTipOptions,
  getUsers,
  createTip
  // deleteDriver,
  // deleteTeam,
  // deleteEvent,
  // deleteTipOption,
} from "../utils/api";

import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { TabView, TabPanel } from "primereact/tabview";
import { Toast } from "primereact/toast";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dropdown } from "primereact/dropdown";

interface EntityInput {
  id: number;
  name?: string;
  firstname?: string;
  lastname?: string;
  event_date?: string;
}

interface EventInput {
  id: number;
  name?: string;
  event_date: string;
}

const Admin: React.FC = () => {
  const toast = useRef<Toast>(null);

  const [users, setUsers] = useState<EntityInput[]>([]);
  const [drivers, setDrivers] = useState<EntityInput[]>([]);
  const [teams, setTeams] = useState<EntityInput[]>([]);
  const [events, setEvents] = useState<EntityInput[]>([]);
  const [tipOptions, setTipOptions] = useState<EntityInput[]>([]);

  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [newDriverName, setNewDriverName] = useState("");
  const [newDriverLastName, setNewDriverLastName] = useState("");
  const [newTeamName, setNewTeamName] = useState("");
  const [newEventName, setNewEventName] = useState("");
  const [newTipOption, setNewTipOption] = useState("");
  const [newTipQuestion, setNewTipQuestion] = useState("");
  const [newTipPoints, setNewTipPoints] = useState(0);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      setUsers(await getUsers() as EntityInput[]);
      setDrivers(await getDrivers() as EntityInput[]);
      setTeams(await getTeams() as EntityInput[]);
      setEvents(await getEvents() as EntityInput[]);
      setTipOptions(await getTipOptions() as EntityInput[]);
    } catch (err) {
      toast.current?.show({ severity: "error", summary: "Fehler", detail: "Laden fehlgeschlagen" });
    }
  };

  const handleAddUser = async () => {
    await createUser({ username, password });
    toast.current?.show({ severity: "success", summary: "Benutzer erstellt" });
    setUserName("");
    setPassword("");
    loadEntries();
  };

  const handleAddDriver = async () => {
    await createDriver({ firstname: newDriverName, lastname: newDriverLastName });
    toast.current?.show({ severity: "success", summary: "Fahrer erstellt" });
    setNewDriverName("");
    setNewDriverLastName("");
    loadEntries();
  };

  const handleAddTeam = async () => {
    await createTeam({ name: newTeamName });
    toast.current?.show({ severity: "success", summary: "Team erstellt" });
    setNewTeamName("");
    loadEntries();
  };

  const handleAddEvent = async () => {
    await createEvent({ name: newEventName });
    toast.current?.show({ severity: "success", summary: "Event erstellt" });
    setNewEventName("");
    loadEntries();
  };

  const handleAddTipOption = async () => {
    await createTipOption({ name: newTipOption });
    toast.current?.show({ severity: "success", summary: "Tippoption erstellt" });
    setNewTipOption("");
    loadEntries();
  };

  const handleAddTip = async () => {
    if (!selectedEventId) {
      toast.current?.show({ severity: "warn", summary: "Bitte Event auswählen" });
      return;
    }
  
    await createTip({
      question: newTipQuestion,
      points: newTipPoints,
      eventId: selectedEventId,
    });
  
    toast.current?.show({ severity: "success", summary: "Tipp erstellt" });
    setNewTipQuestion("");
    setNewTipPoints(0);
    setSelectedEventId(null);
    loadEntries();
  };
  

  // const handleDelete = async (type: string, id: number) => {
  //   try {
  //     switch (type) {
  //       case "driver":
  //         await deleteDriver(id);
  //         break;
  //       case "team":
  //         await deleteTeam(id);
  //         break;
  //       case "event":
  //         await deleteEvent(id);
  //         break;
  //       case "tip":
  //         await deleteTipOption(id);
  //         break;
  //     }
  //     toast.current?.show({ severity: "warn", summary: "Eintrag gelöscht" });
  //     loadEntries();
  //   } catch {
  //     toast.current?.show({ severity: "error", summary: "Fehler beim Löschen" });
  //   }
  // };

const renderDriverTable = (title: string, data: EntityInput[], type: string) => (
    <Card title={title} className="mb-4">
    <DataTable
      value={data.filter(i => i.id > 0)}
      tableStyle={{ minWidth: '50rem' }}
      stripedRows
      className="p-datatable-sm rounded-lg shadow-md"
    >
      <Column
        header="Name"
        body={(item) => `${item.firstname || ''} ${item.lastname || item.name || ''}`}
      />
      <Column
        header="Aktion"
        body={(item) => (
          <div className="text-center">
            {/* Uncomment and customize once delete handler is available */}
            {/* <Button
              icon="pi pi-trash"
              severity="danger"
              size="small"
              onClick={() => handleDelete(type, item.id)}
            /> */}
          </div>
        )}
      />
    </DataTable>
    </Card>
);

const renderEventTable = (title: string, data: EntityInput[], type: string) => (
  <Card title={title} className="mb-4">
  <DataTable
    value={data.filter(i => i.id > 0)}
    tableStyle={{ minWidth: '50rem' }}
    stripedRows
    className="p-datatable-sm rounded-lg shadow-md"
  >
    <Column
      header="Name"
      body={(item) => `${item.name || ''}`}
    />
    <Column
      header="Datum"
      body={(item) => `${item.event_date || ''}`}
    />
    <Column
      header="Aktion"
      body={(item) => (
        <div className="text-center">
          {/* Uncomment and customize once delete handler is available */}
          {/* <Button
            icon="pi pi-trash"
            severity="danger"
            size="small"
            onClick={() => handleDelete(type, item.id)}
          /> */}
        </div>
      )}
    />
  </DataTable>
  </Card>
);

const renderTipOptions = (title: string, data: EntityInput[], type: string) => (
  <Card title={title} className="mb-4">
  <DataTable
    value={data.filter(i => i.id > 0)}
    tableStyle={{ minWidth: '50rem' }}
    stripedRows
    className="p-datatable-sm rounded-lg shadow-md"
  >
    <Column
      header="Name"
      body={(item) => `${item.answer || ''}`}
    />
    <Column
      header="Aktion"
      body={(item) => (
        <div className="text-center">
          {/* Uncomment and customize once delete handler is available */}
          {/* <Button
            icon="pi pi-trash"
            severity="danger"
            size="small"
            onClick={() => handleDelete(type, item.id)}
          /> */}
        </div>
      )}
    />
  </DataTable>
  </Card>
);

const renderUserTable = (title: string, data: EntityInput[], type: string) => (
  <Card title={title} className="mb-4">
  <DataTable
    value={data.filter(i => i.id > 0)}
    tableStyle={{ minWidth: '50rem' }}
    stripedRows
    className="p-datatable-sm rounded-lg shadow-md"
  >
    <Column
      header="Name"
      body={(item) => `${item.username || ''}`}
    />
    <Column
      header="Aktion"
      body={(item) => (
        <div className="text-center">
          {/* Uncomment and customize once delete handler is available */}
          {/* <Button
            icon="pi pi-trash"
            severity="danger"
            size="small"
            onClick={() => handleDelete(type, item.id)}
          /> */}
        </div>
      )}
    />
  </DataTable>
  </Card>
);

  return (
    <div className="p-4">
      <Toast ref={toast} />
      <TabView>
        <TabPanel header="Benutzer">
          <Card title="Benutzer erstellen" className="mb-4">
            <InputText value={username} onChange={(e) => setUserName(e.target.value)} placeholder="Benutzername" />
            <InputText value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Passwort" />
            <Button label="Erstellen" className="mt-2" onClick={handleAddUser} />
          </Card>
          {renderUserTable("Alle Benutzer", users, "user")}
        </TabPanel>
        <TabPanel header="Fahrer">
          <Card title="Fahrer erstellen" className="mb-4">
            <InputText value={newDriverName} onChange={(e) => setNewDriverName(e.target.value)} placeholder="Vorname" />
            <InputText value={newDriverLastName} onChange={(e) => setNewDriverLastName(e.target.value)} placeholder="Nachname" />
            <Button label="Erstellen" className="mt-2" onClick={handleAddDriver} />
          </Card>
          {renderDriverTable("Alle Fahrer", drivers, "driver")}
        </TabPanel>
        <TabPanel header="Teams">
          <Card title="Team erstellen" className="mb-4">
            <InputText value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} placeholder="Teamname" />
            <Button label="Erstellen" className="mt-2" onClick={handleAddTeam} />
          </Card>
          {renderDriverTable("Alle Teams", teams, "team")}
        </TabPanel>
        <TabPanel header="Events">
          <Card title="Event erstellen" className="mb-4">
            <InputText value={newEventName} onChange={(e) => setNewEventName(e.target.value)} placeholder="Eventname" />
            <Button label="Erstellen" className="mt-2" onClick={handleAddEvent} />
          </Card>
          {renderEventTable("Alle Events", events, "event")}
        </TabPanel>
        <TabPanel header="Tippoptionen">
          <Card title="Tippoption erstellen" className="mb-4">
            <InputText value={newTipOption} onChange={(e) => setNewTipOption(e.target.value)} placeholder="Tippoption" />
            <Button label="Erstellen" className="mt-2" onClick={handleAddTipOption} />
          </Card>
          {renderTipOptions("Alle Tippoptionen", tipOptions, "tip")}
        </TabPanel>
        <TabPanel header="Tipp anlegen">
        <Card title="Tipp erstellen" className="mb-4">
          <InputText value={newTipQuestion} onChange={(e) => setNewTipQuestion(e.target.value)} placeholder="Frage" />
          <InputText value={String(newTipPoints)} onChange={(e) => setNewTipPoints(Number(e.target.value))} placeholder="Punkte" />
          <Dropdown
            value={selectedEventId}
            options={events.map((e) => ({ label: e.name, value: e.id }))}
            onChange={(e) => setSelectedEventId(e.value)}
            placeholder="Event auswählen"
          />
          <Button label="Tipp erstellen" className="mt-2" onClick={handleAddTip} />
        </Card>
        </TabPanel>
      </TabView>
    </div>
  );
};

export default Admin;
