import { DateTime } from 'luxon';

// adattípus, adatbázis sémának megfelelően
export interface Waste {
  manufacturingDate: string; // gyártás dátuma
  releaseDate: string; // kitárolás dátuma
  displayDate: string; // pultba kerülés dátuma
  flavor: string; // íz
  releasedQuantity: number; // kitárolt mennyiség
  manufacturingWasteQuantity: number; // gyártási selejt mennyisége
  manufacturingWasteReason?: string;
  shippingWasteQuantity: number; // szállítási selejt mennyisége
}

// az űrlap adat típus eltérhet az adatbázistól, ezért külön kezeljük
export interface WasteFieldValues {
  manufacturingDate: DateTime | null; // gyártás dátuma
  releaseDate: DateTime; // kitárolás dátuma
  displayDate: DateTime | null; // pultba kerülés dátuma
  flavor: string; // íz
  releasedQuantity: number; // kitárolt mennyiség
  manufacturingWasteQuantity: number; // gyártási selejt mennyisége
  manufacturingWasteReason?: string[]; // gyártási hiba típusa
  shippingWasteQuantity: number; // szállítási selejt mennyisége
}
