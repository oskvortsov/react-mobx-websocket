const BINARY_WEBSOCKET_URI = 'wss://ws.binaryws.com/websockets/v3?app_id=1089';

export enum BinarySocketMsgType {
    PAYOUT_CURRENCIES = "payout_currencies",
    EXCHANGE_RATES = "exchange_rates",
}

type HandlerSocketMessage = Map<BinarySocketMsgType, Array<(response: any) => void>>
type MessageData = {
    "msg_type": BinarySocketMsgType;
    [name: string]: any;
}

export type ExchageRatesData = {
    "base_currency": string;
    "rates": Record<string, number>
}
export type PayoutCurrencies = string[];

export class BinarySocketService {
    public isConnect: boolean;

    private socket: WebSocket | null;
    private mapHandlersMessage: HandlerSocketMessage;

    constructor() {
        this.socket = null;
        this.isConnect = false;
        this.mapHandlersMessage = new Map();
    }

    openConnection(callback?: () => void) {
        if (this.socket || this.isConnect) return;

        this.socket = new WebSocket(BINARY_WEBSOCKET_URI);

        this.socket.onopen = () => {
            if (this.socket) {
                this.socket.onmessage = this.onMessageHandler;
                this.isConnect = true;

                if (callback) {
                    callback();
                }
            }
        }
    }

    closeConnection(callback?: () => void) {
        if (!this.socket) return;

        this.socket.close();

        this.socket.onclose = () => {
            this.isConnect = false;

            if (callback) {
                callback();
            }
        }
    }

    sendMessage(event: Record<string, any>) {
        if (this.socket && this.isConnect) {
            this.socket.send(JSON.stringify(event));
        }
    }

    onMessageHandler = (msg: any) => {
        try {
            const data: MessageData = JSON.parse(msg.data);
            const msgType: BinarySocketMsgType = data.msg_type;

            this.mapHandlersMessage.get(msgType)?.forEach(handler => {
                if (data[msgType]) {
                    handler(data[msgType])
                }
            });

        } catch(err) {
            console.log("Parse message error: ", err);
        }
    }

    addMessageHandler(msgType: BinarySocketMsgType, handler: (response: any) => void) {
        const handlers = this.mapHandlersMessage.get(msgType) || [];
        handlers.push(handler);

        this.mapHandlersMessage.set(msgType, handlers);
    }

    requestExchangeRate(currency: string) {
        if (!currency) return;

        this.sendMessage({
            "exchange_rates": 1,
            "base_currency": currency
        })
    }

    requestPayoutCurrency() {
        this.sendMessage({
            "payout_currencies": 1
        })
    }
}