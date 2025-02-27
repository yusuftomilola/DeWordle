import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('sub_admin')
export class SubAdmin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: 'sub-admin' })
  role: string;

  @Column({ nullable: true })
  resetToken?: string;

  @Column({ type: 'timestamp', nullable: true })
  resetTokenExpires?: Date;
}
