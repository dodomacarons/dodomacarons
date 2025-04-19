// adattípus, adatbázis sémának megfelelően
export interface Waste {
  _id: string;
  manufacturingDate: string; // gyártás dátuma
  releaseDate: string; // kitárolás dátuma
  displayDate: string; // pultba kerülés dátuma
  flavor: string; // íz
  displayedQuantity: number; // pultba került mennyiség
  manufacturingWasteQuantity: number; // gyártási selejt mennyisége
  manufacturingWasteReason?: { reason: string }[];
  shippingWasteQuantity: number; // szállítási selejt mennyisége
  createdAt: string;
}

// az űrlap adat típus eltérhet az adatbázistól, ezért külön kezeljük
export interface WasteFieldValues {
  _id?: string;
  manufacturingDate: string; // gyártás dátuma
  releaseDate: string; // kitárolás dátuma
  displayDate: string; // pultba kerülés dátuma
  flavor: string; // íz
  displayedQuantity: number; // pultba került mennyiség
  manufacturingWasteQuantity: number; // gyártási selejt mennyisége
  manufacturingWasteReason?: { reason: string }[]; // gyártási hiba típusa
  shippingWasteQuantity: number; // szállítási selejt mennyisége
  createdAt?: string;
}

export interface Aggregate1ApiResponse {
  flavor: string;
  totalDisplayed: number;
  totalManufacturingWaste: number;
  totalShippingWaste: number;
  totalWaste: number;
  wasteRatio: number;
}

export interface Aggregate2ApiResponse {
  manufacturingDate: string;
  totalManufacturingWaste: number;
  totalShippingWaste: number;
  totalWaste: number;
}
