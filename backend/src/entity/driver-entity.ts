import { EntitySchema } from 'typeorm';
import { Team } from './team-entity';

export interface Driver {
  id: number;
  firstname: string;
  lastname: string;
  created_at: Date;
  updated_at: Date;
  is_deleted: boolean;
  team: Team;
}

export const DriverEntity = new EntitySchema<Driver>({
  name: 'Driver',
  tableName: 'drivers',
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    firstname: {
      type: String,
      length: 255,
    },
    lastname: {
        type: String,
        length: 255,
      },
    created_at: {
      type: 'timestamp',
      createDate: true,
    },
    updated_at: {
      type: 'timestamp',
      updateDate: true,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
  },
  relations: {
    team: {
      type: 'many-to-one',
      target: 'Team',
      inverseSide: 'drivers',
      joinColumn: true,
    },
  },
});
