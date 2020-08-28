import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    // TODO
    const transactions = await this.find();

    const totalIncome = transactions
      .map(item => {
        return { ...item, value: Number(item.value) };
      })
      .filter(item => item.type === 'income')
      .map(item => item.value)
      .reduce((a, b) => a + b, 0);

    const totalOutcome = transactions
      .map(item => {
        return { ...item, value: Number(item.value) };
      })
      .filter(item => item.type === 'outcome')
      .map(item => item.value)
      .reduce((a, b) => a + b, 0);

    return {
      income: totalIncome,
      outcome: totalOutcome,
      total: totalIncome - totalOutcome,
    };
  }
}

export default TransactionsRepository;
