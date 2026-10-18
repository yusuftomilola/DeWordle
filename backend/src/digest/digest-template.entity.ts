import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

/** Single-row table (id = 1) holding the admin-editable digest template. */
@Entity('digest_templates')
export class DigestTemplate {
  @PrimaryColumn({ type: 'int' })
  id: number;

  @Column({ type: 'varchar', length: 200 })
  subject: string;

  @Column({ type: 'text' })
  bodyHtml: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  updatedBy: string | null;

  @UpdateDateColumn()
  updatedAt: Date;
}
