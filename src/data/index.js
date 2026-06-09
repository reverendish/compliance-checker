import { ECOMMERCE } from './sectors/ecommerce.js';
import { FINANCIAL_SERVICES } from './sectors/financial-services.js';
import { HEALTHCARE } from './sectors/healthcare.js';
import { LEGAL_SERVICES } from './sectors/legal-services.js';
import { ESTATE_AGENTS } from './sectors/estate-agents.js';
import { LETTING_AGENTS } from './sectors/letting-agents.js';
import { FOOD_BEVERAGE } from './sectors/food-beverage.js';
import { GAMBLING } from './sectors/gambling.js';
import { TRAVEL_TOURISM } from './sectors/travel-tourism.js';
import { CHARITIES } from './sectors/charities.js';
import { CONSTRUCTION_TRADES } from './sectors/construction-trades.js';
import { INSURANCE } from './sectors/insurance.js';
import { ACCOUNTANCY } from './sectors/accountancy.js';
import { CHILDCARE_EDUCATION } from './sectors/childcare-education.js';
import { RECRUITMENT } from './sectors/recruitment.js';
import { PHARMACEUTICALS } from './sectors/pharmaceuticals.js';
import { COSMETICS } from './sectors/cosmetics.js';
import { AGE_RESTRICTED } from './sectors/age-restricted.js';
import { AUTOMOTIVE } from './sectors/automotive.js';
import { SAAS_SOFTWARE } from './sectors/saas-software.js';
import { MEDIA_PUBLISHING } from './sectors/media-publishing.js';

export const SECTOR_REGISTRY = [
  ECOMMERCE, FINANCIAL_SERVICES, HEALTHCARE, LEGAL_SERVICES,
  ESTATE_AGENTS, LETTING_AGENTS, FOOD_BEVERAGE, GAMBLING,
  TRAVEL_TOURISM, CHARITIES, CONSTRUCTION_TRADES, INSURANCE,
  ACCOUNTANCY, CHILDCARE_EDUCATION, RECRUITMENT, PHARMACEUTICALS,
  COSMETICS, AGE_RESTRICTED, AUTOMOTIVE, SAAS_SOFTWARE, MEDIA_PUBLISHING
];

export const SECTOR_MAP = Object.fromEntries(
  SECTOR_REGISTRY.map(s => [s.id, s])
);
