/* tslint:disable */
import { UpdateCollateralsDto } from './update-collaterals-dto';
import { UpdateGuarantorsDto } from './update-guarantors-dto';
import { UpdateMarketMakerDto } from './update-market-maker-dto';
import { UpdateUnderwriterDto } from './update-underwriter-dto';

export interface UpdateBourseInstrumentDetailsDto {
    account?: string;
    bankId?: number;
    basePrice?: number;
    callRate?: number;
    callable?: number;
    cancellationDate?: string;
    collaterals?: Array<UpdateCollateralsDto>;
    contractSize?: number;
    convertible?: number;
    currency?: string;
    embeded?: number;
    etfTypeId?: number;
    exerciseRate?: number;
    guarantors?: Array<UpdateGuarantorsDto>;
    id: number;
    issueDate?: string;
    issueDateId?: number;
    issuelicenseId?: number;
    issuerGoalId?: number;
    issuerId?: number;
    margin?: string;
    marketMakers?: Array<UpdateMarketMakerDto>;
    marketMakingRate?: number;
    maturityDate?: string;
    name?: string;
    nationalId?: string;
    par?: number;
    paymentDay?: string;
    paymentPeriod?: number;
    putRate?: number;
    rate?: number;
    registerNumber?: number;
    sponsor?: string;
    ticker: string;
    underlyingAsset?: string;
    underwriters?: Array<UpdateUnderwriterDto>;
    value?: string;
    volume?: string;
}
