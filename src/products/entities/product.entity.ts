import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';

export enum categoryType {
  operatingSystem = 'Operating System',
  applicationSoftware = 'Application Software',
}

export enum platformType {
  windows = 'Windows',
  mac = 'Mac',
  linux = 'Linux',
  android = 'Android',
  ios = 'iOS',
}

export enum baseType {
  computer = 'Computer',
  mobile = 'Mobile',
}

@Entity({ name: 'feedbackers' })
export class Feedbackers {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  customerId: string;

  @Column()
  customerName: string;

  @Column()
  rating: number;

  @Column()
  feedbackMsg: string;
}

@Entity({ name: 'sku_details' })
export class SkuDetails {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  skuName: string;

  @Column()
  price: number;

  @Column()
  validity: number; // in days

  @Column()
  lifetime: boolean;

  @Column()
  stripePriceId: string;

  @Column({ nullable: true })
  skuCode?: string;
}

@Entity({ name: 'products' })
export class Products {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productName: string;

  @Column()
  description: string;

  @Column({
    default:
      'https://us.123rf.com/450wm/pavelstasevich/pavelstasevich1811/pavelstasevich181101027/112815900-no-image-available-icon-flat-vector.jpg?ver=6',
  })
  image?: string;

  @Column({
    enum: [categoryType.applicationSoftware, categoryType.operatingSystem],
  })
  category: string;

  @Column({
    enum: [
      platformType.android,
      platformType.ios,
      platformType.linux,
      platformType.mac,
      platformType.windows,
    ],
  })
  platformType: string;

  @Column({ enum: [baseType.computer, baseType.mobile] })
  baseType: string;

  @Column()
  productUrl: string;

  @Column()
  downloadUrl: string;

  @Column({ nullable: true })
  avgRating: number;

  @OneToMany(() => Feedbackers, (feedbacker) => feedbacker)
  feedbackDetails: Feedbackers[];

  @OneToMany(() => SkuDetails, (skuDetails) => skuDetails)
  skuDetails: SkuDetails[];

  @Column({ type: 'json', nullable: true })
  imageDetails: Record<string, any>;

  @Column('json', { nullable: true })
  requirementSpecification: Record<string, any>[];

  @Column('simple-array', { nullable: true })
  highlights: string[];

  @Column()
  stripeProductId: string;
}
