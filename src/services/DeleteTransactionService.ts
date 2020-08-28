import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import { getRepository } from 'typeorm';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    // TODO
    const transactionRepository = getRepository(Transaction);
    const foundTransaction = await transactionRepository.findOne({
      where: { id },
    });

    if (!foundTransaction) throw new AppError('Invalid id!', 400);

    await transactionRepository.remove(foundTransaction);
  }
}

export default DeleteTransactionService;
