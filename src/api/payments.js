import { request } from './client'

export const getBankAccount = () => request('/user/get-user/bank-account')

export const createBankAccount = (accountNumber) =>
  request('/user/bank-account/create', {
    method: 'POST',
    body: JSON.stringify({ accountNumber }),
  })

export const makePayment = (rrr, amount) =>
  request('/user/make/payment', {
    method: 'POST',
    body: JSON.stringify({ rrr, amount }),
})

export const getTransactions = () => request('/user/transaction')
