import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { UserProfile } from './UserProfile';

@Entity()
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  jsonData: string;

  @ManyToOne(type => UserProfile, profile => profile.subscriptions)
  profile: UserProfile;
}
