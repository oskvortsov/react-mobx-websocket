import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { InputNumber, Select } from 'antd';

import { useCurrencyStore } from '../stores/CurrencyStore';

import style from './CurrencyPanel.module.scss';
import { currencyFormatter } from '../shared/utils/formater';

const { Option } = Select;

const MIN_NUMBER = 1;
const MAX_NUMBER = 99999999;

const BITCOINS_SET = new Set(["BTC"]);

export const CurrencyPanel = observer(function CurrencyPanel() {
    const {
        isSocketConnect, rates, payoutCurrencies, baseCurrency,
        openConnection, getPayoutsRates, setBaseCurrency
    } = useCurrencyStore();
    const [count, setCount] = useState<number>(1);

    useEffect(() => {
       if (isSocketConnect) {
           getPayoutsRates();
           setBaseCurrency(baseCurrency);
       } else {
           openConnection();
       }
    }, [isSocketConnect, baseCurrency, getPayoutsRates, setBaseCurrency, openConnection])

    function onHandlerCount(value: number) {
        setCount(value || 1);
    }

    function renderCurrencyControls() {
        return <div className={style.controls}>
            <InputNumber
                className={style.controlNumber}
                value={count}
                onChange={onHandlerCount}
                min={MIN_NUMBER} max={MAX_NUMBER}
                addonAfter={
                    <Select value={baseCurrency} onChange={setBaseCurrency}>
                        {payoutCurrencies.map(currency => (
                            <Option key={currency} value={currency}>{currency}</Option>
                        ))}
                    </Select>
                }
            />
        </div>
    }

    function renderList() {
        return <div className={style.table}>
            <div className={style.tableHeader}>
                <span>Currency</span>
                <span>Rate</span>
            </div>
            <div className={style.tableBody}>
                {rates.map(([cur, rate]) => (
                    <div key={cur} className={style.tableItem}>
                        <span>{cur}</span>
                        <span>{currencyFormatter(cur, rate * count, BITCOINS_SET)}</span>
                    </div>
                ))}
            </div>
        </div>
    }

    return <div className={style.container}>
        {renderCurrencyControls()}
        {renderList()}
    </div>
})