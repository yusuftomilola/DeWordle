import { Column,Entity,PrimaryGeneratedColumn} from 'typeorm'; 

@Entity ()
export class GameMode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;
}