// Redux store for trading strategies
import { createStore, Reducer } from "redux";

export interface Trade {
  id: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  pnl?: number;
  symbol?: string;
}

export interface Strategy {
  id: string;
  name: string;
  symbol: string;
  status: "running" | "paused" | "stopped";
  trades: number;
  pnl: number;
  pnlPercent: number;
  startedAt: number;
}

export interface TradingState {
  strategies: Strategy[];
  trades: Trade[];
  isConnected: boolean;
}

const initialState: TradingState = {
  strategies: [],
  trades: [],
  isConnected: false,
};

type TradingAction =
  | { type: "UPDATE_STRATEGIES"; payload: Strategy[] }
  | { type: "ADD_TRADE"; payload: Trade }
  | { type: "SET_CONNECTION_STATUS"; payload: boolean }
  | { type: "CLEAR_TRADES" };

const rootReducer: Reducer<TradingState, TradingAction> = (
  state = initialState,
  action,
) => {
  switch (action.type) {
    case "UPDATE_STRATEGIES":
      return { ...state, strategies: action.payload };
    case "ADD_TRADE":
      return { ...state, trades: [...state.trades, action.payload] };
    case "SET_CONNECTION_STATUS":
      return { ...state, isConnected: action.payload };
    case "CLEAR_TRADES":
      return { ...state, trades: [] };
    default:
      return state;
  }
};

export const store = createStore(rootReducer);
