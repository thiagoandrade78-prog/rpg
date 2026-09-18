export namespace AssimilationTypes {
 export interface ResonanceRecord {beastId:string;bestScore:number;firstLinkedAt:number;lastLinkedAt:number;}
 export interface Model {activeBeastId:string|null;resonance:ResonanceRecord[];slots:number;}
}
