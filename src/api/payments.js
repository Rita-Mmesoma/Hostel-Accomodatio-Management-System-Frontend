import { request } from './client'

export const makePayment = (rrr, amount) =>
  request('/user/make/payment', {
    method: 'POST',
    body: JSON.stringify({ rrr, amount }),
})

export const getTransactions = () => request('/user/transaction')