import {BeastTypes} from './BeastTypes';
export type WildOutcome='captured'|'defeated'|'escaped'|'retreated'|'lost';
export type WildPhase='combat'|'duel'|'resolved';
export interface WildCheckpoint {
 player:{hp:number;stamina:number;posture:number;rage:number;x:number};
 beast:{hp:number;will:number;x:number};
 elapsed:number;rejections:number;phase:WildPhase;seals:number[];needleTime:number;
 rngState:number;outcome:WildOutcome|null;
}
export interface WildTicket {
 id:string;serial:number;region:string;species:string;individual:BeastTypes.Individual;
 level:number;openedAt:number;checkpoint:WildCheckpoint|null;
}
export interface WildResolution {ticketId:string;outcome:WildOutcome;checkpoint:WildCheckpoint;}
export interface WildJournalEntry {id:string;region:string;species:string;outcome:WildOutcome;at:number;name:string;}
export interface WildProgress {
 version:1;serial:number;successes:number;captures:number;defeats:number;
 pending:WildTicket|null;history:WildJournalEntry[];
}
