// app 作為「辨識符」的屬性 必須是「字串字面量類型 (string literal types)

// 時時即時監測用途
// 化學頻道
interface BasicWsData {
  ID: string;
  version: string;
}

export interface PhWsData extends BasicWsData {
  app: 'real-time';
  mv: number;
  ph: number;
  temperature: number;
}

export interface OrpWsData extends BasicWsData {
  app: 'real-time';
  mv: number;
}

export interface Nh3nWsData extends BasicWsData {
  app: 'real-time';
  ppm: number;
}

export interface FlourideWsData extends BasicWsData {
  app: 'real-time';
  ppm: number;
}

// 操作頻道
export interface ActionWsData extends BasicWsData {
  app: 'action';
  status: 'finish' | 'running';
}

// 同一支 WebSocket 訂閱了很多主題 所以用 Union
// 單一來源、多種訊息結構」情境的最佳實踐 - Union
export type WsData = PhWsData | OrpWsData | Nh3nWsData | FlourideWsData | ActionWsData;
