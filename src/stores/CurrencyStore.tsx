import React from 'react';
import { makeAutoObservable, runInAction } from 'mobx';
import { useLocalObservable } from 'mobx-react';
import {
    BinarySocketMsgType,
    BinarySocketService,
    ExchageRatesData,
    PayoutCurrencies
} from '../services/BinarySocketService';

const CurrencyStoreContext = React.createContext<CurrencyStore | null>(null);

export const CurrencyStoreProvider = ({ children }: { children: React.ReactNode }) => {
    const store = useLocalObservable(() => new CurrencyStore());

    return (
        <CurrencyStoreContext.Provider value={store}>
            {children}
        </CurrencyStoreContext.Provider>
    );
}

export const useCurrencyStore = () => {
    const store = React.useContext(CurrencyStoreContext);

    if (!store) {
        throw new Error('CurrencyStore must be used within CurrencyStoreProvider.');
    }

    return store;
}

export class CurrencyStore {
    baseCurrency: string = "USD";
    exchangeRates: Record<string, number> = {};
    payoutCurrencies: string[] = [];
    isSocketConnect: boolean = false;

    private binarySocketService: BinarySocketService;

    constructor() {
        makeAutoObservable(this);

        // initial socket service
        this.binarySocketService = new BinarySocketService();
        this.binarySocketService.addMessageHandler(BinarySocketMsgType.EXCHANGE_RATES, this.onExchangeRatesHandler);
        this.binarySocketService.addMessageHandler(BinarySocketMsgType.PAYOUT_CURRENCIES, this.onPayoutCurrency);
    }

    get rates(): [string, number][] {
        return Object.keys(this.exchangeRates).map(cur => ([
            cur,
            this.exchangeRates[cur]
        ]))
    }

    openConnection = () => {
        this.binarySocketService.openConnection(
            () => runInAction(() => this.isSocketConnect = true)
        )
    }

    closeConnection = () => {
        this.binarySocketService.closeConnection(
            () => runInAction(() => this.isSocketConnect = true)
        );
    }

    setBaseCurrency = (currency: string) => {
        if (!currency) return;
        this.baseCurrency = currency;
        this.binarySocketService.requestExchangeRate(currency);
    }

    getPayoutsRates = () => {
        this.binarySocketService.requestPayoutCurrency();
    }

    private onExchangeRatesHandler = (data: ExchageRatesData) => {
        runInAction(() => {
            this.exchangeRates = data.rates;
        })
    }

    private onPayoutCurrency = (data: PayoutCurrencies) => {
        runInAction(() => {
            this.payoutCurrencies = data;
        })
    }

}