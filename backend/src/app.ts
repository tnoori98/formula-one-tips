import express, { Request, Response } from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { DataSource } from 'typeorm';
import { authenticateToken } from './auth-middleware';
import { UserEntity } from './entity/user-entity';
import { UserTipEntity } from './entity/user-tip-entity';
import { TipEntity } from './entity/tip-entity';
import { TeamEntity } from './entity/team-entity';
import { DriverEntity } from './entity/driver-entity';
import { EventEntity } from './entity/event-entity';
import { TipOptionEntity } from './entity/tip-options-entity';
import "reflect-metadata";
import { MoreThan } from 'typeorm';

dotenv.config();

const corsSettings = {
  origin: [
    'http://frontend:5001', 
    'http://192.168.0.200:5001', 
    'http://localhost:5001', 
    'http://localhost:3000', 
    '*'
  ],
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

const app = express();

app.use(cors(corsSettings));
app.use(express.json());

let connection: any;

(async function initializeDatabase() {
  try {
    connection = new DataSource({
      type: (process.env.DB_TYPE as any) || 'postgres',
      host: process.env.DB_HOST || 'db',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'databasename',
      entities: [__dirname + "/entity/*.{js,ts}"],
      synchronize: true,
    });

    await connection.initialize();

    console.log('Database connection established');
    
    await initializeDefaults();
  } catch (error) {
    console.error('TypeORM connection error:', error);
    process.exit(1);
  }
})();

async function initializeDefaults(): Promise<void> {
  try {
    const userRepository = connection.getRepository(UserEntity);
    const exists = await userRepository.findOne({ where: { id: -1 } });

    if (!exists) {
      const newPassword = 'admin123';
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      await userRepository.save({
        id: -1,
        username: 'admin',
        password: hashedPassword,
        role: 'admin',
        salt: salt,
        created_at: new Date(),
        updated_at: new Date(),
        is_deleted: false,
      });
    }
  } catch (err) {
    console.error("Error during DB init:", err);
  }
}

app.post('/api/login', async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body as { username: string; password: string };

  try {
    const userRepository = connection.getRepository(UserEntity);
    const user = await userRepository.findOne({
      where: { username: username, is_deleted: false },
    });

    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, user.salt);
    const validPass = user.password === hashedPassword;

    if (!validPass) {
      res.status(401).json({ message: 'Invalid password' });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      res.status(500).json({ message: 'Server configuration error' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, username: user.username },
      jwtSecret,
      { expiresIn: '3h' },
    );

    res.json({ token, role: user.role, username: user.username });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/get-drivers-teams', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const driverRepository = connection.getRepository(DriverEntity);
    const driversWithTeams = await driverRepository.find({ relations: ['team'] });
    res.json(driversWithTeams);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch drivers' });
  }
});

app.get('/api/get-users', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userRepository = connection.getRepository(UserEntity);
    const users = await userRepository.find({ select: ['id','username'], where: { is_deleted: false } });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

app.get('/api/get-tipoptions', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const TipOptionRepository = connection.getRepository(TipOptionEntity);
    const teams = await TipOptionRepository.find({ select: ['id','answer'], where: { is_deleted: false } });
    res.json(teams);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch tip options' });
  }
});

app.get('/api/get-usertips', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const usertipsRepository = connection.getRepository(TipOptionEntity);
    const teams = await usertipsRepository.find({ select: ['id','answer'], where: { is_deleted: false } });
    res.json(teams);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch tip options' });
  }
});

app.get('/api/get-teams', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const teamRepository = connection.getRepository(TeamEntity);
    const teams = await teamRepository.find({ select: ['id','name'], where: { is_deleted: false } });
    res.json(teams);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch teams' });
  }
});

app.get('/api/get-events', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  //ToDo von API fetchen
  try {
    const eventRepository = connection.getRepository(EventEntity);
    const events = await eventRepository.find({ select: ['id', 'name', 'event_date'], where: { is_deleted: false } });
    res.json(events);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch teams' });
  }
});

app.get('/api/events/upcoming', authenticateToken, async (req: Request, res: Response) => {
  try {
    const eventRepo = connection.getRepository(EventEntity);

    const today = new Date();

    const events = await eventRepo.find({
      where: {
        is_deleted: false,
        // event_date: MoreThan(today),
      },
      relations: ['tips', 'tips.tip_options'],
      order: {
        event_date: 'ASC',
      }
    });

    res.json(events);
  } catch (error: any) {
    console.error('Error fetching upcoming events:', error);
    res.status(500).json({ message: 'Fehler beim Laden der Events' });
  }
});

app.post('/api/tips/submit', authenticateToken, async (req: Request, res: Response) : Promise<void> => {
  try {
    const { tipId, optionId } = req.body;
    const userId = (req as any).user.id;

    const userTipRepo = connection.getRepository(UserTipEntity);
    const userRepo = connection.getRepository(UserEntity);
    const tipRepo = connection.getRepository(TipEntity);
    const optionRepo = connection.getRepository(TipOptionEntity);

    const existing = await userTipRepo.findOne({
      where: {
        tip: { id: tipId },
        user: { id: userId },
      },
    });

    if (existing) {
      res.status(409).json({ message: 'Tipp wurde bereits abgegeben.' });
      return;
    }

    const user = await userRepo.findOneByOrFail({ id: userId });
    const tip = await tipRepo.findOneByOrFail({ id: tipId });
    const option = await optionRepo.findOneByOrFail({ id: optionId });

    const userTip = userTipRepo.create({
      user,
      tip,
      // selected_option: option,
      created_at: new Date(),
      updated_at: new Date(),
      is_deleted: false,
    });

    await userTipRepo.save(userTip);

    res.status(201).json({ message: 'Tipp erfolgreich gespeichert.' });
  } catch (err) {
    console.error('Fehler beim Speichern des Tipps:', err);
    res.status(500).json({ message: 'Fehler beim Speichern des Tipps' });
  }
});

app.post('/api/create-drivers-teams', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const { firstname, lastname, teamname } = req.body as { firstname: string; lastname: string; teamname: string };

  try {
    const driverRepository = connection.getRepository(DriverEntity);
    const teamRepository = connection.getRepository(TeamEntity);

    let team = await teamRepository.findOne({ where: { name: teamname, is_deleted: false } });
    if (!team) {
      team = teamRepository.create({ name: teamname, created_at: new Date(), updated_at: new Date(), is_deleted: false });
      await teamRepository.save(team);
    }

    const newDriver = driverRepository.create({ firstname, lastname, team, created_at: new Date(), updated_at: new Date(), is_deleted: false });
    await driverRepository.save(newDriver);

    res.status(201).json(newDriver);
  } catch (error: any) {
    res.status(500).json({ message: 'Error adding entry' });
  }
});

app.post('/api/users', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;
    const repository = connection.getRepository(UserEntity);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newDriver = repository.create({ username: username, password: hashedPassword, salt: salt, is_deleted: false, created_at: new Date(), updated_at: new Date() });
    await repository.save(newDriver);
    res.status(201).json(newDriver);
  } catch (error) {
    res.status(500).json({ message: 'Error creating user' });
  }
});

app.post('/api/drivers', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstname, lastname } = req.body;
    const repository = connection.getRepository(DriverEntity);
    const newDriver = repository.create({ firstname: firstname, lastname: lastname, is_deleted: false, created_at: new Date(), updated_at: new Date() });
    await repository.save(newDriver);
    res.status(201).json(newDriver);
  } catch (error) {
    res.status(500).json({ message: 'Error creating driver' });
  }
});

app.post('/api/teams', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    const repository = connection.getRepository(TeamEntity);
    const newTeam = repository.create({ name, is_deleted: false, created_at: new Date(), updated_at: new Date() });
    await repository.save(newTeam);
    res.status(201).json(newTeam);
  } catch (error) {
    res.status(500).json({ message: 'Error creating team' });
  }
});

app.post('/api/events', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    const repository = connection.getRepository(EventEntity);
    const newEvent = repository.create({ name, is_deleted: false, event_date: new Date(), is_active:true, created_at: new Date(), updated_at: new Date() });
    await repository.save(newEvent);
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ message: 'Error creating event' });
  }
});

app.get('/api/leaderboard', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userRepo = connection.getRepository(UserEntity);
    
    const users = await userRepo.find({
      where: { is_deleted: false },
      select: ['username', 'points'],
      order: { points: 'DESC' },
    });

    res.json(users);
  } catch (error) {
    console.error('Fehler beim Abrufen der Rangliste:', error);
    res.status(500).json({ message: 'Serverfehler bei der Rangliste' });
  }
});

app.post('/api/tipoptions', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    const repository = connection.getRepository(TipOptionEntity);
    const newOption = repository.create({ answer: name, is_deleted: false, created_at: new Date(), updated_at: new Date() });
    await repository.save(newOption);
    res.status(201).json(newOption);
  } catch (error) {
    res.status(500).json({ message: 'Error creating tip option' });
  }
});

app.post('/api/tips', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { question, points, eventId } = req.body;

    if (!question || !points || !eventId) {
      res.status(400).json({ message: 'Missing question, points, or eventId' });
      return;
    }

    const eventRepo = connection.getRepository(EventEntity);
    const tipRepo = connection.getRepository(TipEntity);

    const event = await eventRepo.findOne({ where: { id: eventId } });

    if (!event) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }

    const newTip = tipRepo.create({
      question,
      points,
      event,
      is_deleted: false,
      created_at: new Date(),
      updated_at: new Date(),
    });

    await tipRepo.save(newTip);
    res.status(201).json(newTip);
  } catch (error) {
    console.error('Error creating tip:', error);
    res.status(500).json({ message: 'Error creating tip' });
  }
});

app.post('/api/usertips', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { tipId, selectedOptionId } = req.body;

    if (!tipId || !selectedOptionId) {
      res.status(400).json({ message: "tipId and selectedOptionId are required." });
      return;
    }

    const userId = (req as any).user?.id;

    const tipRepo = connection.getRepository(TipEntity);
    const optionRepo = connection.getRepository(TipOptionEntity);
    const userTipRepo = connection.getRepository(UserTipEntity);

    const tip = await tipRepo.findOne({ where: { id: tipId }, relations: ['event'] });
    const selectedOption = await optionRepo.findOne({ where: { id: selectedOptionId } });

    if (!tip || !selectedOption) {
      res.status(404).json({ message: "Tip or selected option not found." });
      return;
    }

    const existingTip = await userTipRepo.findOne({ where: { user: { id: userId }, tip: { id: tipId } } });
    if (existingTip) {
      res.status(400).json({ message: "You have already submitted a tip for this question." });
      return;
    }

    const isCorrect = tip.correct_tip_option_id === selectedOptionId;

    const newUserTip = userTipRepo.create({
      tip,
      user: { id: userId },
      selected_option: selectedOption,
      is_correct: isCorrect,
      created_at: new Date(),
      updated_at: new Date(),
      is_deleted: false,
    });

    await userTipRepo.save(newUserTip);

    res.status(201).json({ message: "Tipp erfolgreich gespeichert." });
  } catch (error) {
    console.error("Error submitting user tip:", error);
    res.status(500).json({ message: "Fehler beim Speichern des Tipps." });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));