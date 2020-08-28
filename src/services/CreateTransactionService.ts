import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import { getCustomRepository, getRepository } from 'typeorm';

import TransactionRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    // TODO
    const transactionsRepository = getCustomRepository(TransactionRepository);
    const categoriesRepository = getRepository(Category);

    if (type === 'outcome') {
      const balance = await transactionsRepository.getBalance();
      const { total } = balance;
      if (value > total) {
        throw new AppError('No enough income!', 400);
      }
    }

    let foundCategory = await categoriesRepository.findOne({
      where: { title: category },
    });

    if (!foundCategory) {
      const categoryToSave = categoriesRepository.create({
        title: category,
      });
      foundCategory = await categoriesRepository.save(categoryToSave);
    }

    const category_id = foundCategory.id;

    const transactionToSave = transactionsRepository.create({
      title,
      value,
      category_id,
      type,
    });

    const transaction = await transactionsRepository.save(transactionToSave);

    return transaction;
  }
}

export default CreateTransactionService;
