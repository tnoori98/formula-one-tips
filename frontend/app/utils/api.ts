import axios, { AxiosResponse } from "axios";
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';

const API_URL: string = process.env.API_URL || "http://localhost:5000/api";

function getLocalStorageToken(): string | null {
    return localStorage.getItem("token");
}

interface LoginResponse {
    token: string;
    role: string;
}

interface OverviewResponse {
    requiredMonthlyHours: number;
    hoursWorkedThisMonth: number;
    remainingHolidays: number;
    sickDaysThisYear: number;
    points: number;
}

interface Tip {
    id: number;
    question: string;
    selectedOption: string;
    pointsEarned: number;
}

interface EntityPayload {
    id: number;
    name: string;
}

interface EntityInput {
    name: string;
}

interface DriverInput {
    firstname: string;
    lastname: string;
}

interface UserInput {
    username: string;
    password: string;
}

export interface EventWithTips {
    id: number;
    name: string;
    event_date: string;
    tips: {
      id: number;
      question: string;
      points: number;
      tip_options: {
        id: number;
        answer: string;
      }[];
    }[];
}

export const login = async (username: string, password: string): Promise<LoginResponse> => {
    try {
        const res: AxiosResponse<LoginResponse> = await axios.post(`${API_URL}/login`, { username, password });
        return res.data;
    } catch (error) {
        console.error('Login error', error);
        throw error;
    }
};

export const getOverview = async (): Promise<OverviewResponse | null> => {
    try {
        const token = getLocalStorageToken();
        const res: AxiosResponse<OverviewResponse> = await axios.get(`${API_URL}/get-events`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    } catch (error) {
        console.error('Get overview error', error);
        return null;
    }
};

export const getUpcomingEvents = async (): Promise<EventWithTips[]> => {
    const token = getLocalStorageToken();
    const res = await axios.get(`${API_URL}/events/upcoming`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};

export const getUserTips = async (): Promise<Tip[] | null> => {
    try {
        const token = getLocalStorageToken();
        const res: AxiosResponse<Tip[]> = await axios.get(`${API_URL}/get-tipoptions`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    } catch (error) {
        console.error('Get tips error', error);
        return null;
    }
};

export const submitTip = async (tipId: number, optionId: number): Promise<void> => {
    const token = getLocalStorageToken();
    await axios.post(`${API_URL}/tips/submit`, {
      tipId,
      optionId,
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
};

export const createUser = async (payload: UserInput): Promise<void> => {
    const token = getLocalStorageToken();
    await axios.post(`${API_URL}/users`, payload, {
        headers: { Authorization: `Bearer ${token}` },
    });
};

export const createDriver = async (payload: DriverInput): Promise<void> => {
    const token = getLocalStorageToken();
    await axios.post(`${API_URL}/drivers`, payload, {
        headers: { Authorization: `Bearer ${token}` },
    });
};

export const createTeam = async (payload: EntityInput): Promise<void> => {
    const token = getLocalStorageToken();
    await axios.post(`${API_URL}/teams`, payload, {
        headers: { Authorization: `Bearer ${token}` },
    });
};

export const createEvent = async (payload: EntityInput): Promise<void> => {
    const token = getLocalStorageToken();
    await axios.post(`${API_URL}/events`, payload, {
        headers: { Authorization: `Bearer ${token}` },
    });
};

export const createTipOption = async (payload: EntityInput): Promise<void> => {
    const token = getLocalStorageToken();
    await axios.post(`${API_URL}/tipoptions`, payload, {
        headers: { Authorization: `Bearer ${token}` },
    });
};

export const createTip = async (data: {
    question: string;
    points: number;
    eventId: number;
  }) => {
    const token = getLocalStorageToken();
    await axios.post(`${API_URL}/tips`, data, {
        headers: { Authorization: `Bearer ${token}` },
    });
};

export const getDrivers = async (): Promise<EntityInput[]> => {
    const token = getLocalStorageToken();
    const res: AxiosResponse<EntityPayload[]> = await axios.get(`${API_URL}/get-drivers-teams`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

export const getTeams = async (): Promise<EntityInput[]> => {
    const token = getLocalStorageToken();
    const res: AxiosResponse<EntityPayload[]> = await axios.get(`${API_URL}/get-teams`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

export const getUsers = async (): Promise<EntityInput[]> => {
    const token = getLocalStorageToken();
    const res: AxiosResponse<EntityPayload[]> = await axios.get(`${API_URL}/get-users`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

export const getEvents = async (): Promise<EntityInput[]> => {
    const token = getLocalStorageToken();
    const res: AxiosResponse<EntityPayload[]> = await axios.get(`${API_URL}/get-events`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    console.log("abca", res.data)
    return res.data;
};

export const getTipOptions = async (): Promise<EntityInput[]> => {
    const token = getLocalStorageToken();
    const res: AxiosResponse<EntityPayload[]> = await axios.get(`${API_URL}/get-tipoptions`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

export const getLeaderboard = async (): Promise<{ username: string; points: number }[]> => {
    try {
      const token = localStorage.getItem("token");
      const response: AxiosResponse<{ username: string; points: number }[]> = await axios.get(`${API_URL}/leaderboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Fehler beim Abrufen der Rangliste:", error);
      return [];
    }
};
  