import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  OneToMany,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Material } from '../../material/entities/material.entity';

@Entity('usuario') // Nome da tabela
export class Usuario {
  @PrimaryGeneratedColumn()
  id_usuario: number;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: false })
  email: string;

  @Column({ type: 'varchar', nullable: false })
  senha: string;

  @OneToMany(() => Material, (material) => material.usuario_criador)
  materiais_criados: Material[];

  @BeforeInsert()
  async hashPassword() {
    this.senha = await bcrypt.hash(this.senha, 10);
  }

  async validatePassword(senhaDigitada: string): Promise<boolean> {
    return bcrypt.compare(senhaDigitada, this.senha);
  }
}