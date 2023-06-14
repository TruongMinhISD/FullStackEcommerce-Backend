import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Users {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  name: string;
  @Column()
  email: string;
  @Column()
  password: string;
  @Column()
  type: string;
  @Column()
  isVerified: boolean = false;
  @Column()
  otp: string = null;
  @Column()
  otpExpiryTime: Date = null;
}
