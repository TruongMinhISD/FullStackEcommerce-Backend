import { IsEnum, IsNotEmpty } from 'class-validator';
export enum categoryType {
  operatingSystem = 'Operating System',
  applicationSoftware = ' Application Software',
}

export enum platformType {
  windows = 'Windows',
  mac = 'Mac',
  linux = 'Linux',
  android = 'Android',
  ios = 'Ios',
}

export enum baseType {
  computer = 'Computer',
  mobile = 'Mobile',
}

export class CreateProductDto {
  @IsNotEmpty()
  productName: string;
  @IsNotEmpty()
  description: string;
  @IsNotEmpty()
  image: string;
  @IsNotEmpty()
  category: string;
  @IsNotEmpty()
  @IsEnum(platformType)
  platformType: string;
  @IsNotEmpty()
  baseType: string;
  @IsNotEmpty()
  productUrl: string;
  @IsNotEmpty()
  dowloadUrl: string;
  avgRating: number;
  feedbackDetails: string;
  skuDetail: string;
  imageDetails: Record<string, any>;
  requirementSpecification: Record<string, any>[];
  highlights: string[];
  stripeProductId: string;
}
