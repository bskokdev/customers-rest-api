import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { UUID } from '../../shared/types/uuid.type';

@Entity()
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: UUID;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column()
  phone: string;
}
